# InteractionCollector

Collects interactions.
Will automatically stop if the message (Client#event:messageDelete messageDelete or
Client#event:messageDeleteBulk messageDeleteBulk),
channel (Client#event:channelDelete channelDelete), or
guild (Client#event:guildDelete guildDelete) is deleted.
Interaction collectors that do not specify `time` or `idle` may be prone to always running.
Ensure your interaction collectors end via either of these options or manual cancellation.

```ts

class InteractionCollector extends Collector<Snowflake, T>

```

## Constructor

### `constructor`

```ts

constructor<T extends Interaction<CacheType>>(client: Client, options?: InteractionCollectorOptions<T, CacheType>): InteractionCollector<T>

```

- `client: Client` — The client on which to collect interactions
- `options?: InteractionCollectorOptions<T, CacheType>` — The options to apply to this collector

**Returns:** `InteractionCollector<T>`

## Properties

### `channelId`

The channel from which to collect interactions, if provided

**Type:** `string | null`

### `client`

The client that instantiated this Collector

**Type:** `Client` · **Modifiers:** readonly

### `collected`

The items collected by this collector

**Type:** `Collection<string, T>`

### `componentType`

The type of component to collect

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

### `ended`

Whether this collector has finished collecting

**Type:** `boolean`

### `endReason`

The reason this collector has ended with, or null if it hasn't ended yet

**Type:** `string | null` · **Modifiers:** readonly

### `filter`

The filter applied to this collector

**Type:** `CollectorFilter<[T]>`

### `guildId`

The guild from which to collect interactions, if provided

**Type:** `string | null`

### `interactionType`

The type of interaction to collect

**Type:** `"PING" | "APPLICATION_COMMAND" | "MESSAGE_COMPONENT" | "APPLICATION_COMMAND_AUTOCOMPLETE" | "MODAL_SUBMIT" | null`

### `messageId`

The message from which to collect interactions, if provided

**Type:** `string | null`

### `next`

Returns a promise that resolves with the next collected element;
rejects with collected elements if the collector finishes without receiving a next element

**Type:** `Promise<T>` · **Modifiers:** readonly

### `options`

The options of this collector

**Type:** `InteractionCollectorOptions<T>`

### `total`

The total number of interactions collected

**Type:** `number`

### `users`

The users that have interacted with this collector

**Type:** `Collection<string, User>`

## Methods

### `[asyncIterator]`

```ts

[asyncIterator](): AsyncIterableIterator<T>

```

**Returns:** `AsyncIterableIterator<T>`

### `checkEnd`

Checks whether the collector should end, and if so, ends it.

```ts

checkEnd(): boolean

```

**Returns:** `boolean`

### `collect`

```ts

collect(interaction: Interaction): string

```

- `interaction: Interaction`

**Returns:** `string`

### `dispose`

Handles an interaction for possible disposal.

```ts

dispose(interaction: Interaction): string

```

- `interaction: Interaction` — The interaction that could be disposed of

**Returns:** `string`

### `empty`

Empties this interaction collector.

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

Emitted whenever an interaction is collected.

- `interaction` — The interaction that was collected

### `dispose`

Emitted whenever an interaction is disposed of.

- `interaction` — The interaction that was disposed of

### `end`

Emitted when the collector is finished collecting.

- `collected` — The elements collected by the collector
- `reason` — The reason the collector ended

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/InteractionCollector.ts#L20
