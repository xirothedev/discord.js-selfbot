import { createHttpProxyFetch } from './httpProxy';
import { createSocksFetch } from './socks5';
import type { FetchFn, ParsedProxy, ProxyProtocol } from './proxySocket';

function parseProxyUrl(data: unknown): ParsedProxy | false {
  let raw: string | null = null;
  if (typeof data === 'string') {
    raw = data;
  } else if (data instanceof URL) {
    raw = data.toString();
  } else if (
    typeof data === 'object' &&
    data !== null &&
    'uri' in data &&
    typeof data.uri === 'string'
  ) {
    raw = data.uri;
  }
  if (!raw) {
    return false;
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  const scheme = url.protocol.toLowerCase();
  let protocol: ProxyProtocol;
  if (scheme === 'http:') {
    protocol = 'http';
  } else if (scheme === 'https:') {
    protocol = 'https';
  } else if (scheme === 'socks5:') {
    protocol = 'socks5';
  } else if (scheme === 'socks5h:') {
    protocol = 'socks5h';
  } else {
    return false;
  }
  let port: number;
  if (url.port) {
    port = Number(url.port);
  } else if (protocol === 'http') {
    port = 8080;
  } else if (protocol === 'https') {
    port = 8443;
  } else {
    port = 1080;
  }
  const parsed: ParsedProxy = {
    host: url.hostname,
    port,
    protocol,
    uri: raw,
  };
  if (url.username) {
    parsed.username = decodeURIComponent(url.username);
  }
  if (url.password) {
    parsed.password = decodeURIComponent(url.password);
  }
  return parsed;
}

function createProxyFetch(baseFetch: FetchFn, proxySource: unknown): FetchFn {
  const proxy = parseProxyUrl(proxySource);
  if (!proxy) {
    return baseFetch;
  }
  if (proxy.protocol === 'http' || proxy.protocol === 'https') {
    return createHttpProxyFetch(proxy);
  }
  return createSocksFetch(proxy);
}

export { createProxyFetch, parseProxyUrl };
