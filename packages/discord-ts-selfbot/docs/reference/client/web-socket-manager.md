# WebSocketManager

The WebSocket manager for this client.
This class forwards raw dispatch events,
read more about it here https://discord.com/developers/docs/topics/gateway

```ts

class WebSocketManager extends EventEmitter

```

## Properties

### `client`

The client that instantiated this WebSocketManager

**Type:** `Client` · **Modifiers:** readonly

### `gateway`

The gateway this manager uses

**Type:** `string | null`

### `ping`

The average ping of all WebSocketShards

**Type:** `number` · **Modifiers:** readonly

### `shards`

A collection of all shards this manager handles

**Type:** `Collection<number, WebSocketShard>`

### `status`

The current status of this WebSocketManager

**Type:** `number`

## Methods

### `broadcast`

```ts

broadcast(packet: unknown): void

```

- `packet: unknown`

**Returns:** `void`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/client/websocket/WebSocketManager.ts#L40
