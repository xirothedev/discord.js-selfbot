# MessageReaction

Represents a reaction to a message.

```ts

class MessageReaction

```

## Properties

### `burstColors`

Hexadecimal colors used for this super reaction

**Type:** `string[] | null`

### `client`

The client that instantiated this message reaction

**Type:** `Client<true>` · **Modifiers:** readonly

### `count`

**Type:** `number`

### `countDetails`

The reaction count details object contains information about super and normal reaction counts.

**Type:** `ReactionCountDetailsData`

### `emoji`

The emoji of this reaction. Either a GuildEmoji object for known custom emojis, or a ReactionEmoji
object which has fewer properties. Whatever the prototype of the emoji, it will still have
`name`, `id`, `identifier` and `toString()`

**Type:** `GuildEmoji | ReactionEmoji` · **Modifiers:** readonly

### `me`

Whether the client has given this reaction

**Type:** `boolean`

### `meBurst`

Whether the client has super-reacted using this emoji

**Type:** `boolean`

### `message`

The message that this reaction refers to

**Type:** `Message<boolean> | PartialMessage`

### `partial`

Whether or not this reaction is a partial

**Type:** `false` · **Modifiers:** readonly

### `users`

A manager of the users that have given this reaction

**Type:** `ReactionUserManager`

## Methods

### `fetch`

Fetch this reaction.

```ts

fetch(): Promise<MessageReaction>

```

**Returns:** `Promise<MessageReaction>`

### `remove`

Removes all users from this reaction.

```ts

remove(): Promise<MessageReaction>

```

**Returns:** `Promise<MessageReaction>`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessageReaction.ts#L20
