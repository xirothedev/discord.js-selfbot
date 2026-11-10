# Activity

```ts

class Activity

```

## Constructor

### `constructor`

```ts

constructor(presence: Presence, data?: GatewayActivity): Activity

```

- `presence: Presence`
- `data?: GatewayActivity`

**Returns:** `Activity`

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

### `toJSON`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Presence.ts#L1
