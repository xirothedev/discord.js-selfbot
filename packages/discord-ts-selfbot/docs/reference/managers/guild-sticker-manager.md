# GuildStickerManager

Manages API methods for Guild Stickers and stores their cache.

```ts

class GuildStickerManager extends CachedManager<Snowflake, Sticker, StickerResolvable>

```

## Properties

### `cache`

The cache of Guild Stickers

**Type:** `Collection<string, Sticker>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<Sticker>` · **Modifiers:** readonly

## Methods

### `create`

Creates a new custom sticker in the guild.

```ts

create(file: BufferResolvable | Stream | MessageAttachment | FileOptions, name: string, tags: string, options?: GuildStickerCreateOptions): Promise<Sticker>

```

- `file: BufferResolvable | Stream | MessageAttachment | FileOptions` — The file for the sticker
- `name: string` — The name for the sticker
- `tags: string` — The Discord name of a unicode emoji representing the sticker's expression
- `options?: GuildStickerCreateOptions` — Options

**Returns:** `Promise<Sticker>`

```ts
// Create a new sticker from a URL
guild.stickers.create('https://i.imgur.com/w3duR07.png', 'rip', 'headstone')
  .then(sticker => console.log(`Created new sticker with name ${sticker.name}!`))
  .catch(console.error);
```

```ts
// Create a new sticker from a file on your computer
guild.stickers.create('./memes/banana.png', 'banana', 'banana')
  .then(sticker => console.log(`Created new sticker with name ${sticker.name}!`))
  .catch(console.error);
```

### `delete`

Deletes a sticker.

```ts

delete(sticker: StickerResolvable, reason?: string): Promise<void>

```

- `sticker: StickerResolvable` — The sticker to delete
- `reason?: string` — Reason for deleting this sticker

**Returns:** `Promise<void>`

### `edit`

Edits a sticker.

```ts

edit(sticker: StickerResolvable, data?: GuildStickerEditData, reason?: string): Promise<Sticker>

```

- `sticker: StickerResolvable` — The sticker to edit
- `data?: GuildStickerEditData` — The new data for the sticker
- `reason?: string` — Reason for editing this sticker

**Returns:** `Promise<Sticker>`

### `fetch`

```ts

fetch(id: string, options?: BaseFetchOptions): Promise<Sticker>

```

- `id: string`
- `options?: BaseFetchOptions`

**Returns:** `Promise<Sticker>`

```ts

fetch(id?: string, options?: BaseFetchOptions): Promise<Collection<string, Sticker>>

```

- `id?: string`
- `options?: BaseFetchOptions`

**Returns:** `Promise<Collection<string, Sticker>>`

### `fetchUser`

Fetches the user who uploaded this sticker, if this is a guild sticker.

```ts

fetchUser(sticker: StickerResolvable): Promise<User | null>

```

- `sticker: StickerResolvable` — The sticker to fetch the user for

**Returns:** `Promise<User | null>`

### `resolve`

Resolves a StickerResolvable to a Sticker object.

```ts

resolve(resolvable: Sticker): Sticker

```

- `resolvable: Sticker`

**Returns:** `Sticker`

Resolves a StickerResolvable to a Sticker object.

```ts

resolve(resolvable: StickerResolvable): Sticker | null

```

- `resolvable: StickerResolvable`

**Returns:** `Sticker | null`

### `resolveId`

Resolves a StickerResolvable to a Sticker id string.

```ts

resolveId(resolvable: string | Sticker): string

```

- `resolvable: string | Sticker`

**Returns:** `string`

Resolves a StickerResolvable to a Sticker id string.

```ts

resolveId(resolvable: StickerResolvable): string | null

```

- `resolvable: StickerResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Sticker>

```

**Returns:** `Collection<string, Sticker>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildStickerManager.ts#L16
