# BaseGuild

The base class for Guild, OAuth2Guild and InviteGuild.

```ts

abstract class BaseGuild extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time this guild was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp this guild was created at

**Type:** `number` · **Modifiers:** readonly

### `features`

An array of features available to this guild

**Type:** `GuildFeature[]`

### `icon`

The icon hash of this guild

**Type:** `string | null`

### `id`

The guild's id

**Type:** `string`

### `name`

The name of this guild

**Type:** `string`

### `nameAcronym`

The acronym that shows up in place of a guild icon

**Type:** `string` · **Modifiers:** readonly

### `partnered`

Whether this guild is partnered

**Type:** `boolean` · **Modifiers:** readonly

### `verified`

Whether this guild is verified

**Type:** `boolean` · **Modifiers:** readonly

## Methods

### `fetch`

Fetches this guild.

```ts

fetch(): Promise<Guild>

```

**Returns:** `Promise<Guild>`

### `iconURL`

The URL to this guild's icon.

```ts

iconURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): string

```

**Returns:** `string`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/BaseGuild.ts#L13
