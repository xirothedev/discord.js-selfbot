# ShardClientUtil

Helper class for sharded clients spawned as a child process/worker, such as from a ShardingManager.
Utilizes IPC to send and receive data to/from the master process and other shards.

> **Deprecated.** This will be removed in the next major version

```ts

class ShardClientUtil

```

## Properties

### `client`

Client for the shard

**Type:** `Client`

### `count`

Total number of shards

**Type:** `number` · **Modifiers:** readonly

### `ids`

Array of shard ids of this client

**Type:** `number[]` · **Modifiers:** readonly

### `mode`

Mode the shard was spawned with

**Type:** `ShardingManagerMode`

### `parentPort`

Message port for the master process (only when ShardClientUtil#mode is `worker`)

**Type:** `MessagePort | null`

## Methods

### `broadcastEval`

Evaluates a script or function on all shards, or a given shard, in the context of the Clients.

```ts

broadcastEval<T>(fn: unknown): Promise<Serialized<T>[]>

```

- `fn: unknown`

**Returns:** `Promise<Serialized<T>[]>`

```ts
client.shard.broadcastEval(client => client.guilds.cache.size)
  .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
  .catch(console.error);
```

Evaluates a script or function on all shards, or a given shard, in the context of the Clients.

```ts

broadcastEval<T>(fn: unknown, options: { shard: number }): Promise<Serialized<T>>

```

- `fn: unknown`
- `options: { shard: number }` — The options for the broadcast

**Returns:** `Promise<Serialized<T>>`

```ts
client.shard.broadcastEval(client => client.guilds.cache.size)
  .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
  .catch(console.error);
```

Evaluates a script or function on all shards, or a given shard, in the context of the Clients.

```ts

broadcastEval<T, P>(fn: unknown, options: { context: P }): Promise<Serialized<T>[]>

```

- `fn: unknown`
- `options: { context: P }` — The options for the broadcast

**Returns:** `Promise<Serialized<T>[]>`

```ts
client.shard.broadcastEval(client => client.guilds.cache.size)
  .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
  .catch(console.error);
```

Evaluates a script or function on all shards, or a given shard, in the context of the Clients.

```ts

broadcastEval<T, P>(fn: unknown, options: { context: P; shard: number }): Promise<Serialized<T>>

```

- `fn: unknown`
- `options: { context: P; shard: number }` — The options for the broadcast

**Returns:** `Promise<Serialized<T>>`

```ts
client.shard.broadcastEval(client => client.guilds.cache.size)
  .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
  .catch(console.error);
```

### `fetchClientValues`

Fetches a client property value of each shard, or a given shard.

```ts

fetchClientValues(prop: string): Promise<unknown[]>

```

- `prop: string` — Name of the client property to get, using periods for nesting

**Returns:** `Promise<unknown[]>`

```ts
client.shard.fetchClientValues('guilds.cache.size')
  .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
  .catch(console.error);
```

Fetches a client property value of each shard, or a given shard.

```ts

fetchClientValues(prop: string, shard: number): Promise<unknown>

```

- `prop: string` — Name of the client property to get, using periods for nesting
- `shard: number` — Shard to fetch property from, all if undefined

**Returns:** `Promise<unknown>`

```ts
client.shard.fetchClientValues('guilds.cache.size')
  .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
  .catch(console.error);
```

### `respawnAll`

Requests a respawn of all shards.

```ts

respawnAll(options?: MultipleShardRespawnOptions): Promise<void>

```

- `options?: MultipleShardRespawnOptions` — Options for respawning shards

**Returns:** `Promise<void>`

### `send`

Sends a message to the master process.

```ts

send(message: unknown): Promise<void>

```

- `message: unknown` — Message to send

**Returns:** `Promise<void>`

### `shardIdForGuildId`

Get the shard id for a given guild id.

```ts

static shardIdForGuildId(guildId: string, shardCount: number): number

```

- `guildId: string` — Snowflake guild id to get shard id for
- `shardCount: number` — Number of shards

**Returns:** `number`

### `singleton`

Creates/gets the singleton of this class.

```ts

static singleton(client: Client, mode: ShardingManagerMode): ShardClientUtil

```

- `client: Client` — The client to use
- `mode: ShardingManagerMode` — Mode the shard was spawned with

**Returns:** `ShardClientUtil`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/sharding/ShardClientUtil.ts#L27
