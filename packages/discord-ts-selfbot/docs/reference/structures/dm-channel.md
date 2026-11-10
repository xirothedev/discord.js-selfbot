# DMChannel

Represents a direct message channel between two users.

```ts

class DMChannel extends Channel<this> & Omit<TextBasedChannelFields, "createWebhook" | "setRateLimitPerUser" | "setNSFW" | "fetchWebhooks">

```

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

### `lastMessage`

The Message object of the last message in the channel, if one was sent

**Type:** `Message<boolean> | null` · **Modifiers:** readonly

### `lastMessageId`

The channel's last message id, if one was sent

**Type:** `string | null`

### `lastPinAt`

The date when the last pinned message was pinned, if there was one

**Type:** `Date | null` · **Modifiers:** readonly

### `lastPinTimestamp`

The timestamp when the last pinned message was pinned, if there was one

**Type:** `number | null`

### `messageRequest`

Whether the channel is a message request

**Type:** `boolean`

### `messageRequestTimestamp`

The timestamp when the message request was created

**Type:** `number | null`

### `messages`

A manager of the messages belonging to this channel

**Type:** `MessageManager`

### `partial`

Whether this DMChannel is a partial

**Type:** `false` · **Modifiers:** readonly

### `recipient`

The recipient on the other end of the DM

**Type:** `User`

### `shard`

Get current shard

**Type:** `WebSocketShard` · **Modifiers:** readonly

### `type`

The type of the channel

**Type:** `"DM"`

### `voiceAdapterCreator`

The voice state adapter for this client that can be used with @discordjs/voice to play audio in DM / Group DM channels.

**Type:** `InternalDiscordGatewayAdapterCreator` · **Modifiers:** readonly

### `voiceUsers`

The user in this voice-based channel

**Type:** `Collection<string, User>` · **Modifiers:** readonly

## Methods

### `acceptMessageRequest`

Accept this DMChannel.

```ts

acceptMessageRequest(): Promise<DMChannel>

```

**Returns:** `Promise<DMChannel>`

### `awaitMessages`

Similar to createMessageCollector but in promise form.
Resolves with a collection of messages that pass the specified filter.

```ts

awaitMessages(options?: AwaitMessagesOptions): Promise<Collection<string, Message<boolean>>>

```

- `options?: AwaitMessagesOptions` — Optional options to pass to the internal collector

**Returns:** `Promise<Collection<string, Message<boolean>>>`

```ts
// Await !vote messages
const filter = m => m.content.startsWith('!vote');
// Errors: ['time'] treats ending because of the time limit as an error
channel.awaitMessages({ filter, max: 4, time: 60_000, errors: ['time'] })
  .then(collected => console.log(collected.size))
  .catch(collected => console.log(`After a minute, only ${collected.size} out of 4 voted.`));
```

### `cancelMessageRequest`

Cancel this DMChannel.

```ts

cancelMessageRequest(): Promise<DMChannel>

```

**Returns:** `Promise<DMChannel>`

### `createMessageCollector`

Creates a Message Collector.

```ts

createMessageCollector(options?: MessageCollectorOptions): MessageCollector

```

- `options?: MessageCollectorOptions` — The options to pass to the collector

**Returns:** `MessageCollector`

```ts
// Create a message collector
const filter = m => m.content.includes('discord');
const collector = channel.createMessageCollector({ filter, time: 15_000 });
collector.on('collect', m => console.log(`Collected ${m.content}`));
collector.on('end', collected => console.log(`Collected ${collected.size} items`));
```

### `delete`

Deletes this channel.

```ts

delete(): Promise<DMChannel>

```

**Returns:** `Promise<DMChannel>`

```ts
// Delete the channel
channel.delete()
  .then(console.log)
  .catch(console.error);
```

### `fetch`

Fetch this DMChannel.

```ts

fetch(force?: boolean): Promise<DMChannel>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<DMChannel>`

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

### `ring`

Ring the user's phone / PC (call)

```ts

ring(): Promise<void>

```

**Returns:** `Promise<void>`

### `send`

```ts

send(options: string | MessageOptions | MessagePayload): Promise<Message<boolean>>

```

- `options: string | MessageOptions | MessagePayload`

**Returns:** `Promise<Message<boolean>>`

### `sendSlash`

```ts

sendSlash(target: UserResolvable, commandName: string, args: unknown[]): Promise<Modal | Message<boolean>>

```

- `target: UserResolvable`
- `commandName: string`
- `args: unknown[]`

**Returns:** `Promise<Modal | Message<boolean>>`

### `sendTyping`

Sends a typing indicator in the channel.

```ts

sendTyping(): Promise<{ message_send_cooldown_ms: number; thread_create_cooldown_ms: number } | undefined>

```

**Returns:** `Promise<{ message_send_cooldown_ms: number; thread_create_cooldown_ms: number } | undefined>`

```ts
// Start typing in a channel
channel.sendTyping();
```

### `sync`

Sync VoiceState of this DMChannel.

```ts

sync(): void

```

**Returns:** `void`

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
// Logs: Hello from <@123456789012345678>!
console.log(`Hello from ${channel}!`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/DMChannel.ts#L17
