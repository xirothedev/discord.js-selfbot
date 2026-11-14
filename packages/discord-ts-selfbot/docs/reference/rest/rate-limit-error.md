# RateLimitError

Represents a RateLimit error from a request.

```ts

class RateLimitError extends RateLimitData extends Error

```

## Properties

### `global`

Whether this rate limit is global

**Type:** `boolean`

### `limit`

The maximum amount of requests of this endpoint

**Type:** `number`

### `method`

The HTTP method used for the request

**Type:** `string`

### `path`

The path of the request relative to the HTTP endpoint

**Type:** `string`

### `remaining`

Requests left in the bucket, when known.

**Type:** `number`

### `reset`

Bucket reset time in epoch milliseconds, when known.

**Type:** `number`

### `retryAfter`

Exact backoff for this hit, in milliseconds.

**Type:** `number`

### `route`

The route of the request relative to the HTTP endpoint

**Type:** `string`

### `scope`

Which bucket was hit: global, route, or sublimit.

**Type:** `RateLimitScope`

### `timeout`

Time until this rate limit ends, in milliseconds

**Type:** `number`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/rest/RateLimitError.ts#L8
