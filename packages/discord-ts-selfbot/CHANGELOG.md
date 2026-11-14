# @discord-selfbot/core

## 14.0.3

### Patch Changes

- 092548a: Bound the REST-only path for Bun. Typed `RESTManager.request()` and `RequestOptions`, added `createRestClient({ token })` for gateway-free use, and documented direct token assignment. Added an `http.fetch` override plus built-in HTTP/SOCKS5 proxy transport (Bun ignores the undici dispatcher, so proxying no longer relies on it). Bounded 429 retries with `maxRateLimitRetries` (default 2) and added exact `retryAfter`, `remaining`, `reset`, and `scope` to `RateLimitError`. Split `HTTPError.status` from `code`, added `cause` and `retryable`, preserved `res.status` on parse fail, and added terminal `MissingTokenError` for empty or missing tokens. Bun-only exports map, `RESTManager.destroy()` closes the dispatcher and clears handlers, per-request `version` override, path-derived rate-limit routes. New guides for rest-only use, proxies, rate limits, and errors.

## 14.0.2

### Patch Changes

- 9269373: Fix README warning block rendering on npm package page.

## 14.0.1

### Patch Changes

- f56920e: Initial npm release of the Bun + Turborepo monorepo.
