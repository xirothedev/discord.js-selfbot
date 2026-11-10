# GuildEmojiManager

Manages API methods for GuildEmojis and stores their cache.

```ts

class GuildEmojiManager extends BaseGuildEmojiManager

```

## Properties

### `cache`

The cache of GuildEmojis

**Type:** `Collection<string, GuildEmoji>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<GuildEmoji>` · **Modifiers:** readonly

## Methods

### `create`

Creates a new custom emoji in the guild.

```ts

create(attachment: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>, name: string, options?: GuildEmojiCreateOptions): Promise<GuildEmoji>

```

- `attachment: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike>` — The image for the emoji
- `name: string` — The name for the emoji
- `options?: GuildEmojiCreateOptions` — Options for creating the emoji

**Returns:** `Promise<GuildEmoji>`

```ts
// Create a new emoji from a URL
guild.emojis.create('https://i.imgur.com/w3duR07.png', 'rip')
  .then(emoji => console.log(`Created new emoji with name ${emoji.name}!`))
  .catch(console.error);
```

```ts
// Create a new emoji from a file on your computer
guild.emojis.create('./memes/banana.png', 'banana')
  .then(emoji => console.log(`Created new emoji with name ${emoji.name}!`))
  .catch(console.error);
```

### `delete`

Deletes an emoji.

```ts

delete(emoji: EmojiResolvable, reason?: string): Promise<void>

```

- `emoji: EmojiResolvable` — The Emoji resolvable to delete
- `reason?: string` — Reason for deleting the emoji

**Returns:** `Promise<void>`

### `edit`

Edits an emoji.

```ts

edit(emoji: EmojiResolvable, data: GuildEmojiEditData, reason?: string): Promise<GuildEmoji>

```

- `emoji: EmojiResolvable` — The Emoji resolvable to edit
- `data: GuildEmojiEditData` — The new data for the emoji
- `reason?: string` — Reason for editing this emoji

**Returns:** `Promise<GuildEmoji>`

### `fetch`

```ts

fetch(id: string, options?: BaseFetchOptions): Promise<GuildEmoji>

```

- `id: string`
- `options?: BaseFetchOptions`

**Returns:** `Promise<GuildEmoji>`

```ts

fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<string, GuildEmoji>>

```

- `id?: undefined`
- `options?: BaseFetchOptions`

**Returns:** `Promise<Collection<string, GuildEmoji>>`

### `fetchAuthor`

Fetches the author for this emoji

```ts

fetchAuthor(emoji: EmojiResolvable): Promise<User>

```

- `emoji: EmojiResolvable` — The emoji to fetch the author of

**Returns:** `Promise<User>`

### `resolve`

Resolves an EmojiResolvable to an Emoji object.

```ts

resolve(resolvable: GuildEmoji): GuildEmoji

```

- `resolvable: GuildEmoji`

**Returns:** `GuildEmoji`

Resolves an EmojiResolvable to an Emoji object.

```ts

resolve(resolvable: EmojiResolvable): GuildEmoji | null

```

- `resolvable: EmojiResolvable`

**Returns:** `GuildEmoji | null`

### `resolveId`

Resolves an EmojiResolvable to an Emoji id string.

```ts

resolveId(resolvable: string | GuildEmoji): string

```

- `resolvable: string | GuildEmoji`

**Returns:** `string`

Resolves an EmojiResolvable to an Emoji id string.

```ts

resolveId(resolvable: EmojiResolvable): string | null

```

- `resolvable: EmojiResolvable`

**Returns:** `string | null`

### `resolveIdentifier`

Resolves an EmojiResolvable to an emoji identifier.

```ts

resolveIdentifier(emoji: EmojiIdentifierResolvable): string | null

```

- `emoji: EmojiIdentifierResolvable` — The emoji resolvable to resolve

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, GuildEmoji>

```

**Returns:** `Collection<string, GuildEmoji>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildEmojiManager.ts#L15
