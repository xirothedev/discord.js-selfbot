# Recorder

Represents a FFmpeg handler

```ts

class Recorder extends EventEmitter

```

## Constructor

### `constructor`

```ts

constructor<Ready extends boolean = boolean, T = any>(receiver: T, options: { channels: number; ffmpegArgs: string[]; frameDuration: number }): Recorder<Ready, T>

```

- `receiver: T`
- `options: { channels: number; ffmpegArgs: string[]; frameDuration: number }`

**Returns:** `Recorder<Ready, T>`

## Properties

### `output`

The output of the stream

**Type:** `string | Writable`

### `portUdpH264`

**Type:** `number`

### `portUdpOpus`

**Type:** `number`

### `ready`

The FFmpeg process is ready or not

**Type:** `Ready`

### `receiver`

**Type:** `T` · **Modifiers:** readonly

### `socket`

**Type:** `Socket`

### `stream`

The FFmpeg process

**Type:** `If<Ready, ChildProcessWithoutNullStreams>`

### `userId`

The user ID

**Type:** `string`

## Methods

### `destroy`

```ts

destroy(): void

```

**Returns:** `void`

### `feed`

Send a payload to FFmpeg via UDP

```ts

feed(payload: BufferResolvable | RtpPacket): void

```

- `payload: BufferResolvable | RtpPacket` — The payload

**Returns:** `void`

### `stop`

Stops FFmpeg and flushes the recording output.

```ts

stop(): void

```

**Returns:** `void`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/client/voice/receiver/Recorder.ts#L22
