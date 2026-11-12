# BaseGuildEmoji

Parent class for GuildEmoji and GuildPreviewEmoji.

```ts

class BaseGuildEmoji extends Emoji

```

## Properties

### `animated`

Whether or not the emoji is animated

**Type:** `boolean | null`

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

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `guild`

The guild this emoji is a part of

**Type:** `Guild | GuildPreview`

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

### `url`

The URL to the emoji file if it's a custom emoji

**Type:** `string | null` · **Modifiers:** readonly

## Methods

### `fetchGuild`

```ts

fetchGuild(): Promise<DiscoverableGuild>

```

**Returns:** `Promise<DiscoverableGuild>`

### `fetchSource`

```ts

fetchSource(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/BaseGuildEmoji.ts#L12
