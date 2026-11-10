# ReactionManager

Manages API methods for reactions and holds their cache.

```ts

class ReactionManager extends CachedManager<Snowflake | string, MessageReaction, MessageReactionResolvable>

```

## Properties

### `cache`

The reaction cache of this manager

**Type:** `Collection<string, MessageReaction>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<MessageReaction>` · **Modifiers:** readonly

### `message`

The message that this manager belongs to

**Type:** `Message`

## Methods

### `removeAll`

Removes all reactions from a message.

```ts

removeAll(): Promise<Message<boolean>>

```

**Returns:** `Promise<Message<boolean>>`

### `resolve`

Resolves a MessageReactionResolvable to a MessageReaction object.

```ts

resolve(resolvable: MessageReaction): MessageReaction

```

- `resolvable: MessageReaction`

**Returns:** `MessageReaction`

Resolves a MessageReactionResolvable to a MessageReaction object.

```ts

resolve(resolvable: MessageReactionResolvable): MessageReaction | null

```

- `resolvable: MessageReactionResolvable`

**Returns:** `MessageReaction | null`

### `resolveId`

Resolves a MessageReactionResolvable to a MessageReaction id.

```ts

resolveId(resolvable: string | MessageReaction): string

```

- `resolvable: string | MessageReaction`

**Returns:** `string`

Resolves a MessageReactionResolvable to a MessageReaction id.

```ts

resolveId(resolvable: MessageReactionResolvable): string | null

```

- `resolvable: MessageReactionResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, MessageReaction>

```

**Returns:** `Collection<string, MessageReaction>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/ReactionManager.ts#L11
