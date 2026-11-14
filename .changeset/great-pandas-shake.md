---
'@discord-selfbot/core': patch
---

Bound the REST-only path for Bun. Typed `RESTManager.request()` and `RequestOptions`, added `createRestClient({ token })` for gateway-free use, and documented direct token assignment. Added an `http.fetch` override plus built-in HTTP/SOCKS5 proxy transport (Bun ignores the undici dispatcher, so proxying no longer relies on it). Bounded 429 retries with `maxRateLimitRetries` (default 2) and added exact `retryAfter`, `remaining`, `reset`, and `scope` to `RateLimitError`. Split `HTTPError.status` from `code`, added `cause` and `retryable`, preserved `res.status` on parse fail, and added terminal `MissingTokenError` for empty or missing tokens. Bun-only exports map, `RESTManager.destroy()` closes the dispatcher and clears handlers, per-request `version` override, path-derived rate-limit routes. New guides for rest-only use, proxies, rate limits, and errors.
