# CustomStatus

```ts

class CustomStatus extends Activity

```

## Constructor

### `constructor`

```ts

constructor(client: Client, data?: object): CustomStatus

```

- `client: Client` — Discord Client
- `data?: object` — CustomStatus to clone or raw data

**Returns:** `CustomStatus`

## Properties

### `applicationId`

**Type:** `string | null`

### `assets`

**Type:** `RichPresenceAssets`

### `buttons`

**Type:** `string[]`

### `createdAt`

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

**Type:** `number`

### `details`

**Type:** `string | null`

### `emoji`

**Type:** `APIPartialEmoji | null`

### `flags`

**Type:** `Readonly<ActivityFlags>`

### `id`

**Type:** `string`

### `name`

**Type:** `string`

### `party`

**Type:** `{ id: string | null; size: [number, number] } | null`

### `platform`

**Type:** `ActivityPlatform | null`

### `presence`

**Type:** `Presence` · **Modifiers:** readonly

### `sessionId`

**Type:** `string | null`

### `state`

**Type:** `string | null`

### `syncId`

**Type:** `string | null`

### `timestamps`

**Type:** `{ end: number | null; start: number | null } | null`

### `type`

**Type:** `"PLAYING" | "STREAMING" | "LISTENING" | "WATCHING" | "CUSTOM" | "COMPETING" | "HANG"`

### `url`

**Type:** `string | null`

## Methods

### `equals`

```ts

equals(activity: Activity): boolean

```

- `activity: Activity`

**Returns:** `boolean`

### `setEmoji`

Set the emoji of this activity

```ts

setEmoji(emoji?: EmojiIdentifierResolvable): this

```

- `emoji?: EmojiIdentifierResolvable` — The emoji to be displayed

**Returns:** `this`

### `setState`

Set state of this activity

```ts

setState(state: string): this

```

- `state: string` — The state to be displayed

**Returns:** `this`

### `toJSON`

Returns an object that can be used to set the status

```ts

toJSON(): ActivityOptions

```

**Returns:** `ActivityOptions`

### `toString`

```ts

toString(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Presence.ts#L598
