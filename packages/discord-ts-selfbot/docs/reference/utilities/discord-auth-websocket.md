# DiscordAuthWebsocket

Discord Auth QR

```ts

class DiscordAuthWebsocket extends EventEmitter

```

## Constructor

### `constructor`

```ts

constructor(): DiscordAuthWebsocket

```

**Returns:** `DiscordAuthWebsocket`

## Properties

### `AuthURL`

**Type:** `string` · **Modifiers:** readonly

### `exprire`

**Type:** `Date` · **Modifiers:** readonly

### `user`

**Type:** `{ avatar: string; discriminator: number; id: string; username: string }` · **Modifiers:** readonly

## Methods

### `connect`

Connect WS

```ts

connect(client?: Client<boolean>): Promise<void>

```

- `client?: Client<boolean>` — DiscordJS Client

**Returns:** `Promise<void>`

### `destroy`

Destroy client

```ts

destroy(): void

```

**Returns:** `void`

### `generateQR`

Generate QR code for user to scan (Terminal)

```ts

generateQR(): void

```

**Returns:** `void`

## Events

### `closed`

Emitted whenever a connection is closed.

### `error`

WS Error

- `error` — Error

### `debug`

Debug Event

- `msg` — Debug msg

### `ready`

Ready Event

- `client` — WS

### `cancel`

Cancel

- `client` — WS

### `pending`

Emitted whenever a user is scan QR Code.

- `user` — Discord User Raw

### `finish`

Emitted whenever a real token is found.

- `token` — Discord Token

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/RemoteAuth.ts#L52
