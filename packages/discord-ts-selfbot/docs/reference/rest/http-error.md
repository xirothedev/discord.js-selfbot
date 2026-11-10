# HTTPError

Represents an HTTP error from a request.

```ts

class HTTPError extends Error

```

## Properties

### `code`

HTTP error code returned from the request

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

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/rest/HTTPError.ts#L8
