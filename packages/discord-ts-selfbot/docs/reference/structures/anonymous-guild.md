# AnonymousGuild

Bundles common attributes and methods between Guild and InviteGuild

```ts

abstract class AnonymousGuild extends BaseGuild

```

## Properties

### `banner`

The hash of the guild banner

**Type:** `string | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time this guild was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp this guild was created at

**Type:** `number` · **Modifiers:** readonly

### `description`

The description of the guild, if any

**Type:** `string | null`

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

### `nsfwLevel`

The NSFW level of this guild

**Type:** `"DEFAULT" | "EXPLICIT" | "SAFE" | "AGE_RESTRICTED"`

### `partnered`

Whether this guild is partnered

**Type:** `boolean` · **Modifiers:** readonly

### `premiumSubscriptionCount`

The total number of boosts for this server

**Type:** `number | null`

### `splash`

The hash of the guild invite splash image

**Type:** `string | null`

### `vanityURLCode`

The vanity invite code of the guild, if any

**Type:** `string | null`

### `verificationLevel`

The verification level of the guild

**Type:** `"NONE" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"`

### `verified`

Whether this guild is verified

**Type:** `boolean` · **Modifiers:** readonly

## Methods

### `bannerURL`

The URL to this guild's banner.

```ts

bannerURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

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

### `splashURL`

The URL to this guild's invite splash image.

```ts

splashURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/AnonymousGuild.ts#L13
