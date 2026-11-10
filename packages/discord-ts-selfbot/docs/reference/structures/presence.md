# Presence

```ts

class Presence extends Base

```

## Properties

### `activities`

**Type:** `(RichPresence | Activity | SpotifyRPC | CustomStatus)[]`

### `client`

**Type:** `Client` · **Modifiers:** readonly

### `clientStatus`

**Type:** `ClientPresenceStatusData | null`

### `guild`

**Type:** `Guild | null`

### `lastModified`

**Type:** `number | null`

### `member`

**Type:** `GuildMember | null` · **Modifiers:** readonly

### `status`

**Type:** `PresenceStatus`

### `user`

**Type:** `User | null` · **Modifiers:** readonly

### `userId`

**Type:** `string`

## Methods

### `equals`

```ts

equals(presence: Presence): boolean

```

- `presence: Presence`

**Returns:** `boolean`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Presence.ts#L1
