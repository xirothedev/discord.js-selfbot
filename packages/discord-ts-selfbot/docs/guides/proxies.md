# Proxies

All proxy settings live on one client. Set `http.agent` once. Every REST
request on that client uses the same proxy.

## Supported values

```ts
const client = new Client({
  http: { agent: 'http://proxy.local:8080' },
});
```

`http.agent` accepts a string, a `URL`, or `{ uri: string }`. The scheme
selects the transport:

| Scheme | Transport |
| --- | --- |
| `http://`, `https://` | HTTP proxy. Absolute-form forward, plus `CONNECT` for `https` targets. |
| `socks5://`, `socks5h://` | SOCKS5 proxy. Built-in `CONNECT` transport. |

Put credentials in the URI when the proxy needs auth:

```ts
http: { agent: 'http://user:pass@proxy.local:8080' },
```

## Socket transport (Bun and Node)

HTTP and SOCKS5 proxies run on the package's own socket transport built on
`node:net` and `node:tls`, on both runtimes. The package never relies on
undici's `dispatcher` option (which Bun ignores) or on Bun's `proxy` option
(which Bun bypasses for loopback hosts), so loopback fakes and real hosts
behave the same way in Bun and on Node 22+.

Limits:

- File upload through a SOCKS5 proxy is not supported. The request
  throws a clear error. Use direct transport or an `http.fetch`
  override for uploads.
- `socks5h` resolves the target host through the proxy. `socks5`
  behaves the same in this package.

## Custom fetch

Set `http.fetch` to replace the transport. The package wraps it with the
cookie jar. Use this seam to capture rate-limit headers or to plug a
custom SOCKS stack:

```ts
const client = new Client({
  http: {
    agent: 'http://proxy.local:8080',
    fetch: async (url, init) => {
      console.log('out:', init?.method, url);
      const res = await fetch(url, init);
      console.log('rate-limit remaining:', res.headers.get('x-ratelimit-remaining'));
      return res;
    },
  },
});
```

The override receives the plain request. Proxying stays inside the
package transport unless your fetch does it. Direct use without a proxy
calls your fetch unchanged.

## Check the active proxy

```ts
console.log(client.rest.getProxyUri());
```

It returns the proxy URI string or `null` when direct.

## Next

- [REST-only use](rest-only.md)
- [Rate limits](rate-limits.md)
- [Errors](errors.md)
