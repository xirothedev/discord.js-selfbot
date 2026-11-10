# ShardingManager

This is a utility class that makes multi-process sharding of a bot an easy and painless experience.
It works by spawning a self-contained ChildProcess or Worker for each individual shard, each
containing its own instance of your bot's Client. They all have a line of communication with the master
process, and there are several useful methods that utilize it in order to simplify tasks that are normally difficult
with sharding. It can spawn a specific number of shards or the amount that Discord suggests for the bot, and takes a
path to your main bot script to launch for each one.

> **Deprecated.** This will be removed in the next major version

```ts

class ShardingManager extends EventEmitter

```

## Constructor

### `constructor`

```ts

constructor(file: string, options?: ShardingManagerOptions): ShardingManager

```

- `file: string` — Path to your shard script file
- `options?: ShardingManagerOptions` — Options for the sharding manager

**Returns:** `ShardingManager`

## Properties

### `file`

Path to the shard script file

**Type:** `string`

### `respawn`

Whether shards should automatically respawn upon exiting

**Type:** `boolean`

### `shardArgs`

An array of arguments to pass to shards (only when ShardingManager#mode is `process`)

**Type:** `string[]`

### `shardList`

List of shards this sharding manager spawns

**Type:** `number[] | "auto"`

### `shards`

A collection of shards that this manager has spawned

**Type:** `Collection<number, Shard>`

### `totalShards`

Amount of shards that all sharding managers spawn in total

**Type:** `number | "auto"`

## Methods

### `broadcast`

Sends a message to all shards.

```ts

broadcast(message: unknown): Promise<Shard[]>

```

- `message: unknown` — Message to be sent to the shards

**Returns:** `Promise<Shard[]>`

### `broadcastEval`

```ts

broadcastEval<T>(fn: unknown): Promise<Serialized<T>[]>

```

- `fn: unknown`

**Returns:** `Promise<Serialized<T>[]>`

```ts

broadcastEval<T>(fn: unknown, options: { shard: number }): Promise<Serialized<T>>

```

- `fn: unknown`
- `options: { shard: number }`

**Returns:** `Promise<Serialized<T>>`

```ts

broadcastEval<T, P>(fn: unknown, options: { context: P }): Promise<Serialized<T>[]>

```

- `fn: unknown`
- `options: { context: P }`

**Returns:** `Promise<Serialized<T>[]>`

```ts

broadcastEval<T, P>(fn: unknown, options: { context: P; shard: number }): Promise<Serialized<T>>

```

- `fn: unknown`
- `options: { context: P; shard: number }`

**Returns:** `Promise<Serialized<T>>`

### `createShard`

Creates a single shard.
Using this method is usually not necessary if you use the spawn method.

```ts

createShard(id: number): Shard

```

- `id: number` — Id of the shard to create This is usually not necessary to manually specify.

**Returns:** `Shard`

### `fetchClientValues`

```ts

fetchClientValues(prop: string): Promise<unknown[]>

```

- `prop: string`

**Returns:** `Promise<unknown[]>`

```ts

fetchClientValues(prop: string, shard: number): Promise<unknown>

```

- `prop: string`
- `shard: number`

**Returns:** `Promise<unknown>`

### `respawnAll`

Kills all running shards and respawns them.

```ts

respawnAll(options?: MultipleShardRespawnOptions): Promise<Collection<number, Shard>>

```

- `options?: MultipleShardRespawnOptions` — Options for respawning shards

**Returns:** `Promise<Collection<number, Shard>>`

### `spawn`

Spawns multiple shards.

```ts

spawn(options?: MultipleShardSpawnOptions): Promise<Collection<number, Shard>>

```

- `options?: MultipleShardSpawnOptions` — Options for spawning shards

**Returns:** `Promise<Collection<number, Shard>>`

## Events

### `shardCreate`

Emitted upon creating a shard.

- `shard` — Shard that was created

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/sharding/ShardingManager.ts#L24
