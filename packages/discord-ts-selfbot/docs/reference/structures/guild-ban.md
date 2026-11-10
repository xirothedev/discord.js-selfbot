# GuildBan

Represents a ban in a guild on Discord.

```ts

class GuildBan extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild in which the ban is

**Type:** `Guild`

### `partial`

Whether this GuildBan is partial. If the reason is not provided the value is null

**Type:** `boolean` · **Modifiers:** readonly

### `reason`

The reason for the ban

**Type:** `string | null`

### `user`

The user this ban applies to

**Type:** `User`

## Methods

### `fetch`

Fetches this GuildBan.

```ts

fetch(force?: boolean): Promise<GuildBan>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<GuildBan>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/GuildBan.ts#L10
