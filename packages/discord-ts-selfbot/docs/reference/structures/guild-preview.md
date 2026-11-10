# GuildPreview

Represents the data about the guild any bot can preview, connected to the specified guild.

```ts

class GuildPreview extends Base

```

## Properties

### `approximateMemberCount`

The approximate count of members in this guild

**Type:** `number`

### `approximatePresenceCount`

The approximate count of online members in this guild

**Type:** `number`

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

The description for this guild

**Type:** `string | null`

### `discoverySplash`

The discovery splash icon of this guild

**Type:** `string | null`

### `emojis`

Collection of emojis belonging to this guild

**Type:** `Collection<string, GuildPreviewEmoji>`

### `features`

An array of enabled guild features

**Type:** `GuildFeature[]`

### `icon`

The icon of this guild

**Type:** `string | null`

### `id`

**Type:** `string`

### `name`

The name of this guild

**Type:** `string`

### `splash`

The splash icon of this guild

**Type:** `string | null`

### `stickers`

Collection of stickers belonging to this guild

**Type:** `Collection<string, Sticker>`

## Methods

### `discoverySplashURL`

The URL to this guild's discovery splash.

```ts

discoverySplashURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `fetch`

Fetches this guild.

```ts

fetch(): Promise<GuildPreview>

```

**Returns:** `Promise<GuildPreview>`

### `iconURL`

The URL to this guild's icon.

```ts

iconURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `splashURL`

The URL to this guild's splash.

```ts

splashURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): string

```

**Returns:** `string`

```ts
// Logs: Hello from My Guild!
console.log(`Hello from ${previewGuild}!`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/GuildPreview.ts#L15
