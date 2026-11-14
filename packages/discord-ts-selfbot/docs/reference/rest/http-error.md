# HTTPError

Represents an HTTP error from a request.

```ts

class HTTPError extends Error

```

## Properties

### `code`

The Discord JSON error code, or a synthetic 500 when no JSON body exists. See status for the HTTP status.

**Type:** `number`

### `method`

The HTTP method used for the request

**Type:** `string`

### `path`

The path of the request relative to the HTTP endpoint

**Type:** `string`

### `requestData`

The data associated with the request that caused this error

**Type:** `HTTPErrorData`

### `retryable`

Whether retrying the request is safe. False for 4xx and parse failures.

**Type:** `boolean`

### `status`

The HTTP status of the response, or 0 when no response arrived.

**Type:** `number`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/rest/HTTPError.ts#L8
