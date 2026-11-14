import { connect } from 'node:tls';
import { createConnection } from 'node:net';
import type { Socket as NetSocket } from 'node:net';
import type { TLSSocket } from 'node:tls';

type AnySocket = NetSocket;
type AnyTLSSocket = TLSSocket;

type FetchInput = string | URL;
type FetchInit = RequestInit & {
  body?: BodyInit | null | undefined;
  dispatcher?: unknown;
  proxy?: string;
};
type FetchFn = (
  url: FetchInput,
  init?: FetchInit
) => Promise<globalThis.Response>;

type ProxyProtocol = 'http' | 'https' | 'socks5' | 'socks5h';

interface ParsedProxy {
  protocol: ProxyProtocol;
  host: string;
  port: number;
  username?: string;
  password?: string;
  uri: string;
}

function connectTcp(
  host: string,
  port: number,
  timeoutMs = 10_000
): Promise<AnySocket> {
  const { promise, reject, resolve } = Promise.withResolvers<AnySocket>();
  const socket = createConnection({ host, port });
  const timer = setTimeout(() => {
    socket.destroy();
    reject(new Error('Proxy connect timed out'));
  }, timeoutMs);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
  socket.once('connect', () => {
    clearTimeout(timer);
    resolve(socket);
  });
  socket.once('error', (error) => {
    clearTimeout(timer);
    reject(error);
  });
  return promise;
}

function upgradeTls(
  socket: AnySocket,
  servername: string
): Promise<AnyTLSSocket> {
  const { promise, reject, resolve } = Promise.withResolvers<AnyTLSSocket>();
  const secured = connect({ servername, socket }, () => resolve(secured));
  secured.once('error', (error: unknown) => reject(error));
  return promise;
}

interface SocketReader {
  read: (length: number, timeoutMs?: number) => Promise<Buffer>;
  readHead: (timeoutMs?: number) => Promise<{ head: string; rest: Buffer }>;
  takeRest: () => Buffer;
  detach: () => void;
}

function attachReader(socket: AnySocket): SocketReader {
  let buffer = Buffer.alloc(0);
  let failed: unknown = null;
  const waiters: (() => void)[] = [];

  function flush() {
    const pending = waiters.splice(0);
    for (const wake of pending) {
      wake();
    }
  }

  function onData(chunk: Buffer) {
    buffer = Buffer.concat([buffer, chunk]);
    flush();
  }

  function onError(error: unknown) {
    failed = error;
    flush();
  }

  function onClose() {
    if (!failed) {
      failed = new Error('Proxy socket closed');
    }
    flush();
  }

  socket.on('data', onData);
  socket.once('error', onError);
  socket.once('close', onClose);

  function take(length: number): Buffer | null {
    if (buffer.length < length) {
      return null;
    }
    const out = buffer.subarray(0, length);
    buffer = buffer.subarray(length);
    return out;
  }

  function waitForData(timeoutMs: number): Promise<void> {
    const { promise, reject, resolve } = Promise.withResolvers<undefined>();
    const state: { timer?: ReturnType<typeof setTimeout> } = {};
    function wake() {
      if (state.timer) {
        clearTimeout(state.timer);
      }
      if (failed) {
        reject(failed);
      } else {
        resolve(undefined);
      }
    }
    state.timer = setTimeout(() => {
      const index = waiters.indexOf(wake);
      if (index !== -1) {
        waiters.splice(index, 1);
      }
      reject(new Error('Proxy read timed out'));
    }, timeoutMs);
    if (typeof state.timer.unref === 'function') {
      state.timer.unref();
    }
    waiters.push(wake);
    return promise;
  }

  async function read(length: number, timeoutMs = 10_000): Promise<Buffer> {
    const ready = take(length);
    if (ready) {
      return ready;
    }
    if (failed) {
      throw failed;
    }
    await waitForData(timeoutMs);
    return read(length, timeoutMs);
  }

  async function readHead(
    timeoutMs = 10_000
  ): Promise<{ head: string; rest: Buffer }> {
    const index = buffer.indexOf('\r\n\r\n');
    if (index !== -1) {
      const head = buffer.subarray(0, index).toString('latin1');
      const rest = buffer.subarray(index + 4);
      buffer = Buffer.alloc(0);
      return { head, rest };
    }
    if (failed) {
      throw failed;
    }
    await waitForData(timeoutMs);
    return readHead(timeoutMs);
  }

  function takeRest(): Buffer {
    const rest = buffer;
    buffer = Buffer.alloc(0);
    return rest;
  }

  function detach() {
    socket.off('data', onData);
    socket.off('error', onError);
    socket.off('close', onClose);
  }

  return { detach, read, readHead, takeRest };
}

function withRedirects(
  once: (url: string, init: FetchInit) => Promise<globalThis.Response>
): FetchFn {
  async function follow(
    current: string,
    options: FetchInit,
    hops: number
  ): Promise<globalThis.Response> {
    if (hops >= 5) {
      throw new Error('Too many redirects through the proxy');
    }
    const response = await once(current, options);
    const location = response.headers.get('location');
    if (
      options.redirect !== 'manual' &&
      location &&
      [301, 302, 303, 307, 308].includes(response.status)
    ) {
      const next = new URL(location, current).toString();
      return follow(
        next,
        { ...options, body: undefined, method: 'GET' },
        hops + 1
      );
    }
    return response;
  }
  return (url: FetchInput, init?: FetchInit) =>
    follow(String(url), init ?? {}, 0);
}

export { attachReader, connectTcp, upgradeTls, withRedirects };
export type {
  AnySocket,
  AnyTLSSocket,
  FetchFn,
  FetchInit,
  FetchInput,
  ParsedProxy,
  ProxyProtocol,
  SocketReader,
};
