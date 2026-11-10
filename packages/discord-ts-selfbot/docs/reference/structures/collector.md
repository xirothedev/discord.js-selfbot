# Collector

Abstract class for defining a new Collector.

```ts

abstract class Collector extends EventEmitter

```

## Properties

### `client`

The client that instantiated this Collector

**Type:** `Client` · **Modifiers:** readonly

### `collected`

The items collected by this collector

**Type:** `Collection<K, V>`

### `ended`

Whether this collector has finished collecting

**Type:** `boolean`

### `endReason`

The reason this collector has ended with, or null if it hasn't ended yet

**Type:** `string | null` · **Modifiers:** readonly

### `filter`

The filter applied to this collector

**Type:** `CollectorFilter<[V, ...F[]]>`

### `next`

Returns a promise that resolves with the next collected element;
rejects with collected elements if the collector finishes without receiving a next element

**Type:** `Promise<V>` · **Modifiers:** readonly

### `options`

The options of this collector

**Type:** `CollectorOptions<[V, ...F[]]>`

## Methods

### `[asyncIterator]`

```ts

[asyncIterator](): AsyncIterableIterator<V>

```

**Returns:** `AsyncIterableIterator<V>`

### `checkEnd`

Checks whether the collector should end, and if so, ends it.

```ts

checkEnd(): boolean

```

**Returns:** `boolean`

### `collect`

Handles incoming events from the `handleCollect` function. Returns null if the event should not
be collected, or returns an object describing the data that should be stored.

```ts

collect(args: unknown[]): K | Promise<K | null> | null

```

- `args: unknown[]` — Any args the event listener emits

**Returns:** `K | Promise<K | null> | null`

### `dispose`

Handles incoming events from the `handleDispose`. Returns null if the event should not
be disposed, or returns the key that should be removed.

```ts

dispose(args: unknown[]): K | null

```

- `args: unknown[]` — Any args the event listener emits

**Returns:** `K | null`

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

Emitted whenever an element is collected.

- `args` — The arguments emitted by the listener

### `dispose`

Emitted whenever an element is disposed of.

- `args` — The arguments emitted by the listener

### `end`

Emitted when the collector is finished collecting.

- `collected` — The elements collected by the collector
- `reason` — The reason the collector ended

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/interfaces/Collector.ts#L31
