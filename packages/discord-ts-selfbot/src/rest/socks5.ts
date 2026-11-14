import type { AnySocket, FetchFn, FetchInit, ParsedProxy } from './proxySocket';
import {
  attachReader,
  connectTcp,
  upgradeTls,
  withRedirects,
} from './proxySocket';
import { readHttpResponse, sendRequest } from './proxyResponse';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function socksHandshake(
  socket: AnySocket,
  proxy: ParsedProxy
): Promise<void> {
  const reader = attachReader(socket);
  try {
    const needsAuth = Boolean(proxy.username);
    socket.write(Buffer.from([0x05, 0x01, needsAuth ? 0x02 : 0x00]));
    const methodReply = await reader.read(2);
    if (methodReply[0] !== 0x05) {
      throw new Error('Unsupported SOCKS version');
    }
    if (methodReply[1] === 0x02) {
      if (!proxy.username) {
        throw new Error('Proxy asked for auth but no username was set');
      }
      const user = Buffer.from(proxy.username, 'utf-8');
      const pass = Buffer.from(proxy.password ?? '', 'utf-8');
      socket.write(
        Buffer.concat([
          Buffer.from([0x01, user.length]),
          user,
          Buffer.from([pass.length]),
          pass,
        ])
      );
      const authReply = await reader.read(2);
      if (authReply[1] !== 0x00) {
        throw new Error('Proxy auth failed');
      }
    } else if (methodReply[1] !== 0x00) {
      throw new Error('Proxy needs an unsupported auth method');
    }
  } finally {
    reader.detach();
  }
}

async function socksConnect(
  socket: AnySocket,
  targetHost: string,
  targetPort: number
): Promise<void> {
  const reader = attachReader(socket);
  try {
    const hostBuffer = Buffer.from(targetHost, 'utf-8');
    socket.write(
      Buffer.concat([
        Buffer.from([0x05, 0x01, 0x00, 0x03, hostBuffer.length]),
        hostBuffer,
        Buffer.from([(targetPort >> 8) & 0xff, targetPort & 0xff]),
      ])
    );
    const reply = await reader.read(10);
    if (reply[1] !== 0x00) {
      throw new Error(`Proxy connect failed with code ${reply[1]}`);
    }
  } finally {
    reader.detach();
  }
}

function socksBodyText(body: FetchInit['body']): string {
  if (typeof body === 'string') {
    return body;
  }
  if (body !== undefined && body !== null) {
    if (isRecord(body) && typeof body.entries === 'function') {
      throw new Error(
        'File upload through a SOCKS proxy needs a custom http.fetch. See the proxies guide.'
      );
    }
    return String(body);
  }
  return '';
}

async function socksFetchOnce(
  proxy: ParsedProxy,
  url: string,
  init: FetchInit = {}
): Promise<globalThis.Response> {
  const target = new URL(url);
  const secure = target.protocol === 'https:';
  let targetPort: number;
  if (target.port) {
    targetPort = Number(target.port);
  } else if (secure) {
    targetPort = 443;
  } else {
    targetPort = 80;
  }
  const raw = await connectTcp(proxy.host, proxy.port);
  try {
    await socksHandshake(raw, proxy);
    await socksConnect(raw, target.hostname, targetPort);
    const stream = secure ? await upgradeTls(raw, target.hostname) : raw;
    const method = (init.method ?? 'GET').toUpperCase();
    const path = `${target.pathname}${target.search}`;
    const headers = new Headers(init.headers);
    if (!headers.has('host')) {
      headers.set('host', target.host);
    }
    if (!headers.has('connection')) {
      headers.set('connection', 'close');
    }
    const bodyText = socksBodyText(init.body);
    if (bodyText && !headers.has('content-length')) {
      headers.set('content-length', String(Buffer.byteLength(bodyText)));
    }
    sendRequest(stream, method, path, headers, bodyText);
    return await readHttpResponse(stream, init.signal);
  } catch (error) {
    raw.destroy();
    throw error;
  }
}

function createSocksFetch(proxy: ParsedProxy): FetchFn {
  return withRedirects((url, init) => socksFetchOnce(proxy, url, init));
}

export { createSocksFetch };
