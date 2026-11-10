# ThreadManager

Manages API methods for ThreadChannel objects and stores their cache.

```ts

class ThreadManager extends CachedManager<Snowflake, ThreadChannel, ThreadChannelResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, ThreadChannel>` · **Modifiers:** readonly

### `channel`

The channel this Manager belongs to

**Type:** `NewsChannel | TextChannel`

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<ThreadChannel>` · **Modifiers:** readonly

## Methods

### `fetch`

Obtains a thread from Discord, or the channel cache if it's already available.

```ts

fetch(options: ThreadChannelResolvable, cacheOptions?: BaseFetchOptions): Promise<ThreadChannel | null>

```

- `options: ThreadChannelResolvable` — The options to fetch threads. If it is a ThreadChannelResolvable then the specified thread will be fetched. Fetches all active threads if `undefined`
- `cacheOptions?: BaseFetchOptions` — Additional options for this fetch. The `force` field gets ignored if `options` is not a ThreadChannelResolvable

**Returns:** `Promise<ThreadChannel | null>`

```ts
// Fetch a thread by its id
channel.threads.fetch('831955138126104859')
  .then(channel => console.log(channel.name))
  .catch(console.error);
```

Obtains a thread from Discord, or the channel cache if it's already available.

```ts

fetch(options?: FetchChannelThreadsOptions, cacheOptions?: { cache?: boolean }): Promise<FetchedThreads>

```

- `options?: FetchChannelThreadsOptions` — The options to fetch threads. If it is a ThreadChannelResolvable then the specified thread will be fetched. Fetches all active threads if `undefined`
- `cacheOptions?: { cache?: boolean }` — Additional options for this fetch. The `force` field gets ignored if `options` is not a ThreadChannelResolvable

**Returns:** `Promise<FetchedThreads>`

```ts
// Fetch a thread by its id
channel.threads.fetch('831955138126104859')
  .then(channel => console.log(channel.name))
  .catch(console.error);
```

### `fetchActive`

Obtains the accessible active threads from Discord, requires `READ_MESSAGE_HISTORY` in the parent channel.

```ts

fetchActive(cache?: boolean, options?: FetchChannelThreadsOptions): Promise<FetchedThreads>

```

- `cache?: boolean` — Whether to cache the new thread objects if they aren't already
- `options?: FetchChannelThreadsOptions` — Options for self-bots where advanced users can specify further options

**Returns:** `Promise<FetchedThreads>`

### `fetchArchived`

Obtains a set of archived threads from Discord, requires `READ_MESSAGE_HISTORY` in the parent channel.

```ts

fetchArchived(options?: FetchChannelThreadsOptions, cache?: boolean): Promise<FetchedThreads>

```

- `options?: FetchChannelThreadsOptions` — The options to fetch archived threads
- `cache?: boolean` — Whether to cache the new thread objects if they aren't already

**Returns:** `Promise<FetchedThreads>`

### `resolve`

Resolves a ThreadChannelResolvable to a ThreadChannel object.

```ts

resolve(resolvable: ThreadChannel): ThreadChannel

```

- `resolvable: ThreadChannel`

**Returns:** `ThreadChannel`

Resolves a ThreadChannelResolvable to a ThreadChannel object.

```ts

resolve(resolvable: ThreadChannelResolvable): ThreadChannel | null

```

- `resolvable: ThreadChannelResolvable`

**Returns:** `ThreadChannel | null`

### `resolveId`

Resolves a ThreadChannelResolvable to a ThreadChannel id.

```ts

resolveId(resolvable: string | ThreadChannel): string

```

- `resolvable: string | ThreadChannel`

**Returns:** `string`

Resolves a ThreadChannelResolvable to a ThreadChannel id.

```ts

resolveId(resolvable: ThreadChannelResolvable): string | null

```

- `resolvable: ThreadChannelResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, ThreadChannel>

```

**Returns:** `Collection<string, ThreadChannel>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/ThreadManager.ts#L13
