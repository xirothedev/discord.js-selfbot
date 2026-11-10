# DiscordAPIError

Represents an error from the Discord API.

```ts

class DiscordAPIError extends Error

```

## Properties

### `captcha`

Captcha response data if the request requires a captcha

**Type:** `Captcha | null`

### `code`

HTTP error code returned by Discord

**Type:** `number`

### `httpStatus`

The HTTP status code

**Type:** `number`

### `isBlockedByCloudflare`

A special `40333` JSON error code is returned if your request is blocked by Cloudflare.
This may be due to a malformed request or improper user agent.
The response resembles a normal error structure:

**Type:** `boolean` · **Modifiers:** readonly

### `method`

The HTTP method used for the request

**Type:** `string`

### `path`

The path of the request relative to the HTTP endpoint

**Type:** `string`

### `requestData`

The data associated with the request that caused this error

**Type:** `HTTPErrorData`

### `retries`

The number of times this request has been retried

**Type:** `number`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/rest/DiscordAPIError.ts#L8
