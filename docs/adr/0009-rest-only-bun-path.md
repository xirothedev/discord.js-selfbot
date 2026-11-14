# Bound REST-only path for Bun

**Status:** Accepted

Version review `@discord-selfbot/core 14.0.2` found five gaps at the REST seam.
Every REST-only consumer wrote the same adapter code for token setup, typed
requests, proxy transport, rate-limit headers, and error sorting.

## Decision

- Type `RESTManager.request()` and `api`. Add `RequestOptions`. Add
  `createRestClient({ token })` for REST-only use. Keep `login()` gateway-only.
- Add `http.fetch` override. Keep `http.agent` for proxy strings. Support
  `http://`, `https://`, `socks5://`, and `socks5h://` on Bun. State the Bun
  limit: undici `dispatcher` is ignored on Bun, so the package routes the
  proxy through `fetch`.
- Bound 429 retries with `maxRateLimitRetries` (default `2`). Add
  `retryAfter` in ms, plus `remaining`, `reset`, and `scope` to
  `RateLimitError`. Document `timeout` in ms.
- Split `HTTPError.status` (HTTP) from `HTTPError.code` (Discord code or
  synthetic `500`). Add `cause` and `retryable`. Add `MissingTokenError`
  before the HTTP layer. Preserve `res.status` on parse fail.
- Keep the Bun-only contract. Expose `exports` with `bun` and `types`
  conditions. Keep `main` on the TypeScript source. Do not market `dist`
  as a Node entry until `Bun.sleep` is gone from `RequestHandler` and `Client`.

## Consequences

- REST-only use needs no cast and no local declare block.
- A 429 cannot retry without a bound. Exact backoff comes from `retryAfter`.
- A 401 from a proxy HTML page no longer looks like a 500 upstream error.
- An empty token fails fast as terminal, not retried as upstream.
- `REST dispatcher` names the undici part. `REST transport` names the whole
  HTTP path. The voice player stays `voice dispatcher`.

## References

- `packages/discord-ts-selfbot/src/rest/RESTManager.ts`
- `packages/discord-ts-selfbot/src/rest/RequestHandler.ts`
- `GLOSSARY.md` — REST transport, REST dispatcher, voice dispatcher
