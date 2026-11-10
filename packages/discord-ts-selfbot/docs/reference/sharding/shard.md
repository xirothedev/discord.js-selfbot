# Shard

A self-contained shard created by the ShardingManager. Each one has a ChildProcess that contains
an instance of the bot and its Client. When its child process/worker exits for any reason, the shard will
spawn a new one to replace it as necessary.

> **Deprecated.** This will be removed in the next major version

```ts

class Shard extends EventEmitter

```

## Properties

### `args`

Arguments for the shard's process (only when ShardingManager#mode is `process`)

**Type:** `string[]`

### `env`

Environment variables for the shard's process, or workerData for the shard's worker

**Type:** `unknown`

### `execArgv`

Arguments for the shard's process executable (only when ShardingManager#mode is `process`)

**Type:** `string[]`

### `id`

The shard's id in the manager

**Type:** `number`

### `manager`

Manager that created the shard

**Type:** `ShardingManager`

### `process`

Process of the shard (if ShardingManager#mode is `process`)

**Type:** `ChildProcess | null`

### `ready`

Whether the shard's Client is ready

**Type:** `boolean`

### `worker`

Worker of the shard (if ShardingManager#mode is `worker`)

**Type:** `Worker | null`

## Methods

### `eval`

```ts

eval(script: string): Promise<unknown>

```

- `script: string`

**Returns:** `Promise<unknown>`

```ts

eval<T>(fn: unknown): Promise<T>

```

- `fn: unknown`

**Returns:** `Promise<T>`

```ts

eval<T, P>(fn: unknown, context: P): Promise<T>

```

- `fn: unknown`
- `context: P`

**Returns:** `Promise<T>`

### `fetchClientValue`

Fetches a client property value of the shard.

```ts

fetchClientValue(prop: string): Promise<unknown>

```

- `prop: string` — Name of the client property to get, using periods for nesting

**Returns:** `Promise<unknown>`

```ts
shard.fetchClientValue('guilds.cache.size')
  .then(count => console.log(`${count} guilds in shard ${shard.id}`))
  .catch(console.error);
```

### `kill`

Immediately kills the shard's process/worker and does not restart it.

```ts

kill(): void

```

**Returns:** `void`

### `respawn`

Kills and restarts the shard's process/worker.

```ts

respawn(options?: { delay?: number; timeout?: number }): Promise<ChildProcess>

```

- `options?: { delay?: number; timeout?: number }` — Options for respawning the shard

**Returns:** `Promise<ChildProcess>`

### `send`

Sends a message to the shard's process/worker.

```ts

send(message: unknown): Promise<Shard>

```

- `message: unknown` — Message to send to the shard

**Returns:** `Promise<Shard>`

### `spawn`

Forks a child process or creates a worker thread for the shard.
You should not need to call this manually.

```ts

spawn(timeout?: number): Promise<ChildProcess>

```

- `timeout?: number` — The amount in milliseconds to wait until the Client has become ready before resolving (`-1` or `Infinity` for no wait)

**Returns:** `Promise<ChildProcess>`

## Events

### `spawn`

Emitted upon the creation of the shard's child process/worker.

- `process` — Child process/worker that was created

### `ready`

Emitted upon the shard's Client#event:shardReady event.

### `disconnect`

Emitted upon the shard's Client#event:shardDisconnect event.

### `reconnecting`

Emitted upon the shard's Client#event:shardReconnecting event.

### `message`

Emitted upon receiving a message from the child process/worker.

- `message` — Message that was received

### `death`

Emitted upon the shard's child process/worker exiting.

- `process` — Child process/worker that exited

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/sharding/Shard.ts#L24
