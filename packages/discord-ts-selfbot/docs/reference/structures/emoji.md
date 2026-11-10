# Emoji

Represents an emoji, see GuildEmoji and ReactionEmoji.

```ts

class Emoji extends Base

```

## Properties

### `animated`

Whether or not the emoji is animated

**Type:** `boolean | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the emoji was created at, or null if unicode

**Type:** `Date | null` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the emoji was created at, or null if unicode

**Type:** `number | null` · **Modifiers:** readonly

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `id`

The emoji's id

**Type:** `string | null`

### `identifier`

The identifier of this emoji, used for message reactions

**Type:** `string` · **Modifiers:** readonly

### `name`

The emoji's name

**Type:** `string | null`

### `url`

The URL to the emoji file if it's a custom emoji

**Type:** `string | null` · **Modifiers:** readonly

## Methods

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Emoji.ts#L27
