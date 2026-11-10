# ReactionCollector

Collects reactions on messages.
Will automatically stop if the message (Client#event:messageDelete messageDelete or
Client#event:messageDeleteBulk messageDeleteBulk),
channel (Client#event:channelDelete channelDelete),
thread (Client#event:threadDelete threadDelete), or
guild (Client#event:guildDelete guildDelete) is deleted.

```ts

class ReactionCollector extends Collector<Snowflake | string, MessageReaction, [User]>

```

## Constructor

### `constructor`

```ts

constructor(message: Message, options?: ReactionCollectorOptions): ReactionCollector

```

- `message: Message` — The message upon which to collect reactions
- `options?: ReactionCollectorOptions` — The options to apply to this collector

**Returns:** `ReactionCollector`

## Properties

### `client`

The client that instantiated this Collector

**Type:** `Client` · **Modifiers:** readonly

### `collected`

The items collected by this collector

**Type:** `Collection<string, MessageReaction>`

### `ended`

Whether this collector has finished collecting

**Type:** `boolean`

### `endReason`

The reason this collector has ended with, or null if it hasn't ended yet

**Type:** `string | null` · **Modifiers:** readonly

### `filter`

The filter applied to this collector

**Type:** `CollectorFilter<[MessageReaction, User]>`

### `message`

The message upon which to collect reactions

**Type:** `Message`

### `next`

Returns a promise that resolves with the next collected element;
rejects with collected elements if the collector finishes without receiving a next element

**Type:** `Promise<MessageReaction>` · **Modifiers:** readonly

### `options`

The options of this collector

**Type:** `ReactionCollectorOptions`

### `total`

The total number of reactions collected

**Type:** `number`

### `users`

The users that have reacted to this message

**Type:** `Collection<string, User>`

## Methods

### `[asyncIterator]`

```ts

[asyncIterator](): AsyncIterableIterator<MessageReaction>

```

**Returns:** `AsyncIterableIterator<MessageReaction>`

### `checkEnd`

Checks whether the collector should end, and if so, ends it.

```ts

checkEnd(): boolean

```

**Returns:** `boolean`

### `collect`

```ts

collect(reaction: MessageReaction, user: User): string | null

```

- `reaction: MessageReaction`
- `user: User`

**Returns:** `string | null`

### `dispose`

Handles a reaction deletion for possible disposal.

```ts

dispose(reaction: MessageReaction, user: User): string | null

```

- `reaction: MessageReaction` — The reaction to possibly dispose of
- `user: User` — The user that removed the reaction

**Returns:** `string | null`

### `empty`

Empties this reaction collector.

```ts

empty(): void

```

**Returns:** `void`

### `handleCollect`

Call this to handle an event as a collectable element. Accepts any event data as parameters.

```ts

handleCollect(args: unknown[]): Promise<void>

```

- `args: unknown[]` — The arguments emitted by the listener

**Returns:** `Promise<void>`

### `handleDispose`

Call this to remove an element from the collection. Accepts any event data as parameters.

```ts

handleDispose(args: unknown[]): Promise<void>

```

- `args: unknown[]` — The arguments emitted by the listener

**Returns:** `Promise<void>`

### `key`

Gets the collector key for a reaction.

```ts

static key(reaction: MessageReaction): string

```

- `reaction: MessageReaction` — The message reaction to get the key for

**Returns:** `string`

### `resetTimer`

Resets the collector's timeout and idle timer.

```ts

resetTimer(options?: CollectorResetTimerOptions): void

```

- `options?: CollectorResetTimerOptions` — Options for resetting

**Returns:** `void`

### `stop`

Stops this collector and emits the `end` event.

```ts

stop(reason?: string): void

```

- `reason?: string` — The reason this collector is ending

**Returns:** `void`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

## Events

### `create`

Emitted whenever a reaction is newly created on a message. Will emit only when a new reaction is
added to the message, as opposed to Collector#collect which will
be emitted even when a reaction has already been added to the message.

- `reaction` — The reaction that was added
- `user` — The user that added the reaction

### `collect`

Emitted whenever a reaction is collected.

- `reaction` — The reaction that was collected
- `user` — The user that added the reaction

### `dispose`

Emitted when the reaction had all the users removed and the `dispose` option is set to true.

- `reaction` — The reaction that was disposed of
- `user` — The user that removed the reaction

### `remove`

Emitted when the reaction had one user removed and the `dispose` option is set to true.

- `reaction` — The reaction that was removed
- `user` — The user that removed the reaction

### `end`

Emitted when the collector is finished collecting.

- `collected` — The elements collected by the collector
- `reason` — The reason the collector ended

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/ReactionCollector.ts#L24
