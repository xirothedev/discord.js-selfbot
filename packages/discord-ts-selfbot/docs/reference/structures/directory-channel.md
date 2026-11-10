# DirectoryChannel

Represents a channel that displays a directory of guilds.

```ts

class DirectoryChannel extends Channel

```

## Constructor

### `constructor`

```ts

constructor(client: Client, data?: RawChannelData, immediatePatch?: boolean): DirectoryChannel

```

- `client: Client`
- `data?: RawChannelData`
- `immediatePatch?: boolean`

**Returns:** `DirectoryChannel`

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the channel was created at

**Type:** `Date | null` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the channel was created at

**Type:** `number | null` · **Modifiers:** readonly

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `flags`

The flags that are applied to the channel.

**Type:** `Readonly<ChannelFlags>`

### `id`

The channel's id

**Type:** `string`

### `partial`

Whether this Channel is a partial
This is always false outside of DM channels.

**Type:** `false` · **Modifiers:** readonly

### `type`

The type of the channel

**Type:** `"GUILD_FORUM" | "GUILD_MEDIA" | "DM" | "GROUP_DM" | "GUILD_NEWS" | "GUILD_STAGE_VOICE" | "GUILD_TEXT" | "GUILD_NEWS_THREAD" | "GUILD_PUBLIC_THREAD" | "GUILD_PRIVATE_THREAD" | "GUILD_VOICE" | "GUILD_CATEGORY" | "GUILD_STORE" | "UNKNOWN" | "GUILD_DIRECTORY"`

## Methods

### `delete`

Deletes this channel.

```ts

delete(): Promise<DirectoryChannel>

```

**Returns:** `Promise<DirectoryChannel>`

```ts
// Delete the channel
channel.delete()
  .then(console.log)
  .catch(console.error);
```

### `fetch`

Fetches this channel.

```ts

fetch(force?: boolean): Promise<DirectoryChannel>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<DirectoryChannel>`

### `isDirectory`

Indicates whether this channel is a DirectoryChannel

```ts

isDirectory(): this

```

**Returns:** `this`

### `isText`

Indicates whether this channel is TextBasedChannels text-based.

```ts

isText(): this

```

**Returns:** `this`

### `isThread`

Indicates whether this channel is a ThreadChannel.

```ts

isThread(): this

```

**Returns:** `this`

### `isThreadOnly`

Indicates whether this channel is ThreadOnlyChannel.

```ts

isThreadOnly(): this

```

**Returns:** `this`

### `isVoice`

Indicates whether this channel is BaseGuildVoiceChannel voice-based.

```ts

isVoice(): this

```

**Returns:** `this`

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): `${string}`

```

**Returns:** ``${string}``

```ts
// Logs: Hello from <#123456789012345678>!
console.log(`Hello from ${channel}!`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/DirectoryChannel.ts#L11
