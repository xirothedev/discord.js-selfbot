# Sticker

Represents a Sticker.

```ts

class Sticker extends Base

```

## Properties

### `available`

Whether or not the guild sticker is available

**Type:** `boolean | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the sticker was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the sticker was created at

**Type:** `number` · **Modifiers:** readonly

### `deleted`

Whether or not the sticker has been deleted

**Type:** `boolean`

### `description`

The description of the sticker

**Type:** `string | null`

### `format`

**Type:** `"PNG" | "APNG" | "LOTTIE" | "GIF"`

### `guild`

The guild that owns this sticker

**Type:** `Guild | null` · **Modifiers:** readonly

### `guildId`

The id of the guild that owns this sticker

**Type:** `string | null`

### `id`

The sticker's id

**Type:** `string`

### `name`

**Type:** `string`

### `packId`

The id of the pack the sticker is from, for standard stickers

**Type:** `string | null`

### `partial`

Whether this sticker is partial

**Type:** `boolean` · **Modifiers:** readonly

### `sortValue`

The standard sticker's sort order within its pack

**Type:** `number | null`

### `tags`

**Type:** `string[] | null`

### `type`

**Type:** `"GUILD" | "STANDARD" | null`

### `url`

A link to the sticker
If the sticker's format is LOTTIE, it returns the URL of the Lottie JSON file.

**Type:** `string` · **Modifiers:** readonly

### `user`

The user that uploaded the guild sticker

**Type:** `User | null`

## Methods

### `delete`

Deletes the sticker.

```ts

delete(reason?: string): Promise<Sticker>

```

- `reason?: string` — Reason for deleting this sticker

**Returns:** `Promise<Sticker>`

```ts
// Delete a message
sticker.delete()
  .then(s => console.log(`Deleted sticker ${s.name}`))
  .catch(console.error);
```

### `edit`

Edits the sticker.

```ts

edit(data?: GuildStickerEditData, reason?: string): Promise<Sticker>

```

- `data?: GuildStickerEditData` — The new data for the sticker
- `reason?: string` — Reason for editing this sticker

**Returns:** `Promise<Sticker>`

```ts
// Update the name of a sticker
sticker.edit({ name: 'new name' })
  .then(s => console.log(`Updated the name of the sticker to ${s.name}`))
  .catch(console.error);
```

### `equals`

Whether this sticker is the same as another one.

```ts

equals(other: unknown): boolean

```

- `other: unknown` — The sticker to compare it to

**Returns:** `boolean`

### `fetch`

Fetches this sticker.

```ts

fetch(): Promise<Sticker>

```

**Returns:** `Promise<Sticker>`

### `fetchPack`

Fetches the pack this sticker is part of from Discord, if this is a Nitro sticker.

```ts

fetchPack(): Promise<StickerPack | null>

```

**Returns:** `Promise<StickerPack | null>`

### `fetchUser`

Fetches the user who uploaded this sticker, if this is a guild sticker.

```ts

fetchUser(): Promise<User | null>

```

**Returns:** `Promise<User | null>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Sticker.ts#L24
