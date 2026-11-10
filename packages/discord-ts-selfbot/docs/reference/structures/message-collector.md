# MessageCollector

Collects messages on a channel.
Will automatically stop if the channel (Client#event:channelDelete channelDelete),
thread (Client#event:threadDelete threadDelete), or
guild (Client#event:guildDelete guildDelete) is deleted.

```ts

class MessageCollector extends Collector<Snowflake, Message>

```

## Constructor

### `constructor`

```ts

constructor(channel: TextBasedChannel, options?: MessageCollectorOptions): MessageCollector

```

- `channel: TextBasedChannel` — The channel
- `options?: MessageCollectorOptions` — The options to be applied to this collector

**Returns:** `MessageCollector`

## Properties

### `channel`

The channel

**Type:** `TextBasedChannel`

### `client`

The client that instantiated this Collector

**Type:** `Client` · **Modifiers:** readonly

### `collected`

The items collected by this collector

**Type:** `Collection<string, Message<boolean>>`

### `ended`

Whether this collector has finished collecting

**Type:** `boolean`

### `endReason`

The reason this collector has ended with, or null if it hasn't ended yet

**Type:** `string | null` · **Modifiers:** readonly

### `filter`

The filter applied to this collector

**Type:** `CollectorFilter<[Message<boolean>]>`

### `next`

Returns a promise that resolves with the next collected element;
rejects with collected elements if the collector finishes without receiving a next element

**Type:** `Promise<Message<boolean>>` · **Modifiers:** readonly

### `options`

The options of this collector

**Type:** `MessageCollectorOptions`

### `received`

Total number of messages that were received in the channel during message collection

**Type:** `number`

## Methods

### `[asyncIterator]`

```ts

[asyncIterator](): AsyncIterableIterator<Message<boolean>>

```

**Returns:** `AsyncIterableIterator<Message<boolean>>`

### `checkEnd`

Checks whether the collector should end, and if so, ends it.

```ts

checkEnd(): boolean

```

**Returns:** `boolean`

### `collect`

```ts

collect(message: Message): string | null

```

- `message: Message`

**Returns:** `string | null`

### `dispose`

Handles a message for possible disposal.

```ts

dispose(message: Message): string | null

```

- `message: Message` — The message that could be disposed of

**Returns:** `string | null`

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

### `collect`

Emitted whenever a message is collected.

- `message` — The message that was collected

### `dispose`

Emitted whenever a message is disposed of.

- `message` — The message that was disposed of

### `end`

Emitted when the collector is finished collecting.

- `collected` — The elements collected by the collector
- `reason` — The reason the collector ended

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessageCollector.ts#L20
