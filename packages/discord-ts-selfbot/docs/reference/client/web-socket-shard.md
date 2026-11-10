# WebSocketShard

Represents a Shard's WebSocket connection

```ts

class WebSocketShard extends EventEmitter

```

## Properties

### `id`

The shard's id

**Type:** `number`

### `manager`

The WebSocketManager of the shard

**Type:** `WebSocketManager`

### `ping`

The previous heartbeat ping of the shard

**Type:** `number`

### `status`

The current status of the shard

**Type:** `number`

## Methods

### `send`

Adds a packet to the queue to be sent to the gateway.
If you use this method, make sure you understand that you need to provide
a full [Payload](https://discord.com/developers/docs/topics/gateway-events#payload-structure).
Do not use this method if you don't know what you're doing.

```ts

send(data: unknown, important?: boolean): void

```

- `data: unknown` — The full packet to send
- `important?: boolean` — If this packet should be added first in queue

**Returns:** `void`

## Events

### `close`

Emitted when a shard's WebSocket closes.

- `event` — The received event

### `ready`

Emitted when the shard receives the READY payload and is now waiting for guilds

### `resumed`

Emitted when the shard resumes successfully

### `invalidSession`

Emitted when the session has been invalidated.

### `allReady`

Emitted when the shard is fully ready.
This event is emitted if:
* all guilds were received by this shard
* the ready timeout expired, and some guilds are unavailable

- `unavailableGuilds` — Set of unavailable guilds, if any

### `destroyed`

Emitted when a shard is destroyed, but no WebSocket connection was present.

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/client/websocket/WebSocketShard.ts#L42
