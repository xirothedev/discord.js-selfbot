# Typing

Represents a typing state for a user in a channel.

```ts

class Typing extends Base

```

## Properties

### `channel`

The channel the status is from

**Type:** `TextBasedChannel`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild the status is from

**Type:** `Guild | null` · **Modifiers:** readonly

### `member`

The member who is typing

**Type:** `GuildMember | null` · **Modifiers:** readonly

### `startedAt`

The time the user started typing at

**Type:** `Date` · **Modifiers:** readonly

### `startedTimestamp`

The UNIX timestamp in milliseconds the user started typing at

**Type:** `number`

### `user`

The user who is typing

**Type:** `PartialUser`

## Methods

### `inGuild`

Indicates whether the status is received from a guild.

```ts

inGuild(): this

```

**Returns:** `this`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Typing.ts#L10
