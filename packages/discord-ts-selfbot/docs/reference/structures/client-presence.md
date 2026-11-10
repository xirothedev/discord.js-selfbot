# ClientPresence

Represents the client's presence.

```ts

class ClientPresence extends Presence

```

## Properties

### `activities`

The activities of this presence (Always `Activity[]` if not ClientUser)

**Type:** `(RichPresence | Activity | SpotifyRPC | CustomStatus)[]`

### `client`

**Type:** `Client` · **Modifiers:** readonly

### `clientStatus`

**Type:** `ClientPresenceStatusData | null`

### `guild`

The guild this presence is in

**Type:** `Guild | null`

### `lastModified`

The timestamp this presence was last updated

**Type:** `number | null`

### `member`

The member of this presence

**Type:** `GuildMember | null` · **Modifiers:** readonly

### `status`

The status of this presence

**Type:** `PresenceStatus`

### `user`

The user of this presence

**Type:** `User | null` · **Modifiers:** readonly

### `userId`

The presence's user id

**Type:** `string`

## Methods

### `equals`

Whether this presence is equal to another.

```ts

equals(presence: Presence): boolean

```

- `presence: Presence` — The presence to compare with

**Returns:** `boolean`

### `set`

Sets the client's presence

```ts

set(presence: PresenceData): ClientPresence

```

- `presence: PresenceData` — The data to set the presence to

**Returns:** `ClientPresence`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/ClientPresence.ts#L37
