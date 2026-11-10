# Session

Represents a Client OAuth2 Application Team.

```ts

class Session extends Base

```

## Constructor

### `constructor`

```ts

constructor(client: Client): Session

```

- `client: Client`

**Returns:** `Session`

## Properties

### `approxLastUsedTime`

The approximate last used time

**Type:** `string`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `clientInfo`

The client info

**Type:** `SessionClientInfo`

### `createdAt`

The time the client was last used at.

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the client was last used at.

**Type:** `number` · **Modifiers:** readonly

### `id`

The session hash id

**Type:** `string`

## Methods

### `logout`

Logout the client (remote).

```ts

logout(): Promise<void>

```

**Returns:** `Promise<void>`

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Session.ts#L16
