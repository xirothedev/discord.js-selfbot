import {
  attachReader,
  connectTcp,
  upgradeTls,
  withRedirects,
} from './proxySocket';
import { readHttpResponse, sendRequest } from './proxyResponse';
import type {
  AnySocket,
  AnyTLSSocket,
  FetchFn,
  FetchInit,
  ParsedProxy,
} from './proxySocket';

function proxyAuthValue(proxy: ParsedProxy): string | null {
  if (!proxy.username) {
    return null;
  }
  return Buffer.from(
    `${proxy.username}:${proxy.password ?? ''}`,
    'utf-8'
  ).toString('base64');
}

function httpsStatusOk(head: string): boolean {
  const code = Number(head.split(' ')[1] ?? 0);
  return code >= 200 && code < 300;
}

async function openProxySocket(
  proxy: ParsedProxy
): Promise<AnySocket | AnyTLSSocket> {
  const raw = await connectTcp(proxy.host, proxy.port);
  if (proxy.protocol === 'https') {
    try {
      return await upgradeTls(raw, proxy.host);
    } catch (error) {
      raw.destroy();
      throw error;
    }
  }
  return raw;
}

async function sendOverSocket(
  socket: AnySocket | AnyTLSSocket,
  target: URL,
  init: FetchInit,
  absoluteForm: boolean,
  proxy?: ParsedProxy
): Promise<globalThis.Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const path = absoluteForm
    ? target.toString()
    : `${target.pathname}${target.search}`;
  const headers = new Headers(init.headers);
  if (!headers.has('host')) {
    headers.set('host', target.host);
  }
  if (!headers.has('connection')) {
    headers.set('connection', 'close');
  }
  const auth = proxy ? proxyAuthValue(proxy) : null;
  if (absoluteForm && auth && !headers.has('proxy-authorization')) {
    headers.set('proxy-authorization', `Basic ${auth}`);
  }
  let bodyText = '';
  if (typeof init.body === 'string') {
    bodyText = init.body;
  } else if (init.body !== undefined && init.body !== null) {
    bodyText = String(init.body);
  }
  if (bodyText && !headers.has('content-length')) {
    headers.set('content-length', String(Buffer.byteLength(bodyText)));
  }
  sendRequest(socket, method, path, headers, bodyText);
  return await readHttpResponse(socket, init.signal);
}

async function httpProxyFetchOnce(
  proxy: ParsedProxy,
  url: string,
  init: FetchInit = {}
): Promise<globalThis.Response> {
  const target = new URL(url);
  const secure = target.protocol === 'https:';
  const socket = await openProxySocket(proxy);
  try {
    if (secure) {
      const reader = attachReader(socket);
      try {
        const auth = proxyAuthValue(proxy);
        socket.write(
          `CONNECT ${target.host} HTTP/1.1\r\nhost: ${target.host}\r\n${auth ? `proxy-authorization: Basic ${auth}\r\n` : ''}connection: close\r\n\r\n`
        );
        const { head, rest } = await reader.readHead();
        if (!httpsStatusOk(head)) {
          throw new Error(
            `Proxy CONNECT failed: ${head.split('\r\n')[0] ?? head}`
          );
        }
        if (rest.length) {
          socket.unshift(rest);
        }
      } finally {
        reader.detach();
      }
      const secured = await upgradeTls(socket, target.hostname);
      try {
        return await sendOverSocket(secured, target, init, false);
      } catch (error) {
        secured.destroy();
        throw error;
      }
    }
    return await sendOverSocket(socket, target, init, true, proxy);
  } catch (error) {
    socket.destroy();
    throw error;
  }
}

function createHttpProxyFetch(proxy: ParsedProxy): FetchFn {
  return withRedirects((url, init) => httpProxyFetchOnce(proxy, url, init));
}

export { createHttpProxyFetch };
