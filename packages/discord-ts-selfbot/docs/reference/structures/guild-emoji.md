# GuildEmoji

Represents a custom emoji.

```ts

class GuildEmoji extends BaseGuildEmoji

```

## Properties

### `animated`

Whether or not the emoji is animated

**Type:** `boolean | null`

### `author`

The user who created this emoji

**Type:** `User | null`

### `available`

Whether this emoji is available

**Type:** `boolean | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the emoji was created at, or null if unicode

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the emoji was created at, or null if unicode

**Type:** `number` · **Modifiers:** readonly

### `deletable`

Whether the emoji is deletable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `guild`

The guild this emoji is part of

**Type:** `Guild`

### `id`

The emoji's id

**Type:** `string`

### `identifier`

The identifier of this emoji, used for message reactions

**Type:** `string` · **Modifiers:** readonly

### `managed`

Whether this emoji is managed by an external service

**Type:** `boolean | null`

### `name`

The emoji's name

**Type:** `string | null`

### `requiresColons`

Whether or not this emoji requires colons surrounding it

**Type:** `boolean | null`

### `roles`

A manager for roles this emoji is active for.

**Type:** `GuildEmojiRoleManager` · **Modifiers:** readonly

### `url`

The URL to the emoji file if it's a custom emoji

**Type:** `string` · **Modifiers:** readonly

## Methods

### `delete`

Deletes the emoji.

```ts

delete(reason?: string): Promise<GuildEmoji>

```

- `reason?: string` — Reason for deleting the emoji

**Returns:** `Promise<GuildEmoji>`

### `edit`

Edits the emoji.

```ts

edit(data: GuildEmojiEditData, reason?: string): Promise<GuildEmoji>

```

- `data: GuildEmojiEditData` — The new data for the emoji
- `reason?: string` — Reason for editing this emoji

**Returns:** `Promise<GuildEmoji>`

```ts
// Edit an emoji
emoji.edit({ name: 'newemoji' })
  .then(e => console.log(`Edited emoji ${e}`))
  .catch(console.error);
```

### `equals`

Whether this emoji is the same as another one.

```ts

equals(other: unknown): boolean

```

- `other: unknown` — The emoji to compare it to

**Returns:** `boolean`

### `fetchAuthor`

Fetches the author for this emoji

```ts

fetchAuthor(): Promise<User>

```

**Returns:** `Promise<User>`

### `setName`

Sets the name of the emoji.

```ts

setName(name: string, reason?: string): Promise<GuildEmoji>

```

- `name: string` — The new name for the emoji
- `reason?: string` — Reason for changing the emoji's name

**Returns:** `Promise<GuildEmoji>`

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
// Send a custom emoji from a guild:
const emoji = guild.emojis.cache.first();
msg.channel.send(`Hello! ${emoji}`);
```

```ts
// Send the emoji used in a reaction to the channel the reaction is part of
reaction.message.channel.send(`The emoji used was: ${reaction.emoji}`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/GuildEmoji.ts#L14
