# MissingTokenError

Thrown before any HTTP is sent when no usable token is set. Never retried.

```ts

class MissingTokenError extends Error

```

## Constructor

### `constructor`

```ts

constructor(message?: string): MissingTokenError

```

- `message?: string`

**Returns:** `MissingTokenError`

```ts

constructor(message?: string, options?: ErrorOptions): MissingTokenError

```

- `message?: string`
- `options?: ErrorOptions`

**Returns:** `MissingTokenError`

## Properties

### `code`

Always TOKEN_MISSING

**Type:** `"TOKEN_MISSING"`

### `retryable`

Always false. Fix the stored token instead of retrying.

**Type:** `false`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/rest/MissingTokenError.ts#L1
