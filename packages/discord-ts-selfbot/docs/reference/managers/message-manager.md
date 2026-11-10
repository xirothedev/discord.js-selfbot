# MessageManager

Manages API methods for Messages and holds their cache.

```ts

class MessageManager extends CachedManager<Snowflake, Message, MessageResolvable>

```

## Properties

### `cache`

The cache of Messages

**Type:** `Collection<string, Message<boolean>>`

### `channel`

The channel that the messages belong to

**Type:** `TextBasedChannel`

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<Message<boolean>>` · **Modifiers:** readonly

## Methods

### `crosspost`

Publishes a message in an announcement channel to all channels following it, even if it's not cached.

```ts

crosspost(message: MessageResolvable): Promise<Message<boolean>>

```

- `message: MessageResolvable` — The message to publish

**Returns:** `Promise<Message<boolean>>`

### `delete`

Deletes a message, even if it's not cached.

```ts

delete(message: MessageResolvable): Promise<void>

```

- `message: MessageResolvable` — The message to delete

**Returns:** `Promise<void>`

### `edit`

Edits a message, even if it's not cached.

```ts

edit(message: MessageResolvable, options: string | MessagePayload | MessageEditOptions): Promise<Message<boolean>>

```

- `message: MessageResolvable` — The message to edit
- `options: string | MessagePayload | MessageEditOptions` — The options to edit the message

**Returns:** `Promise<Message<boolean>>`

### `endPoll`

Ends a poll.

```ts

endPoll(messageId: string): Promise<Message<boolean>>

```

- `messageId: string` — The id of the message

**Returns:** `Promise<Message<boolean>>`

### `fetch`

```ts

fetch(message: string, options?: BaseFetchOptions): Promise<Message<boolean>>

```

- `message: string`
- `options?: BaseFetchOptions`

**Returns:** `Promise<Message<boolean>>`

```ts

fetch(options?: ChannelLogsQueryOptions, cacheOptions?: BaseFetchOptions): Promise<Collection<string, Message<boolean>>>

```

- `options?: ChannelLogsQueryOptions`
- `cacheOptions?: BaseFetchOptions`

**Returns:** `Promise<Collection<string, Message<boolean>>>`

### `fetchPinned`

Fetches the pinned messages of this channel and returns a collection of them.
The returned Collection does not contain any reaction data of the messages.
Those need to be fetched separately.

```ts

fetchPinned(cache?: boolean): Promise<Collection<string, Message<boolean>>>

```

- `cache?: boolean` — Whether to cache the message(s)

**Returns:** `Promise<Collection<string, Message<boolean>>>`

```ts
// Get pinned messages
channel.messages.fetchPinned()
  .then(messages => console.log(`Received ${messages.size} messages`))
  .catch(console.error);
```

### `fetchPollAnswerVoters`

Fetches the users that voted for a poll answer.

```ts

fetchPollAnswerVoters(options: FetchPollAnswerVotersOptions): Promise<Collection<string, User>>

```

- `options: FetchPollAnswerVotersOptions` — The options for fetching the poll answer voters

**Returns:** `Promise<Collection<string, User>>`

### `pin`

Pins a message to the channel's pinned messages, even if it's not cached.

```ts

pin(message: MessageResolvable, reason?: string): Promise<void>

```

- `message: MessageResolvable` — The message to pin
- `reason?: string` — Reason for pinning

**Returns:** `Promise<void>`

### `react`

Adds a reaction to a message, even if it's not cached.

```ts

react(message: MessageResolvable, emoji: EmojiIdentifierResolvable, burst?: boolean): Promise<void>

```

- `message: MessageResolvable` — The message to react to
- `emoji: EmojiIdentifierResolvable` — The emoji to react with
- `burst?: boolean` — Super Reactions (Discord Nitro only)

**Returns:** `Promise<void>`

### `resolve`

Resolves a MessageResolvable to a Message object.

```ts

resolve(resolvable: Message): Message

```

- `resolvable: Message`

**Returns:** `Message`

Resolves a MessageResolvable to a Message object.

```ts

resolve(resolvable: MessageResolvable): Message<boolean> | null

```

- `resolvable: MessageResolvable`

**Returns:** `Message<boolean> | null`

### `resolveId`

Resolves a MessageResolvable to a Message id.

```ts

resolveId(resolvable: string | Message<boolean>): string

```

- `resolvable: string | Message<boolean>`

**Returns:** `string`

Resolves a MessageResolvable to a Message id.

```ts

resolveId(resolvable: MessageResolvable): string | null

```

- `resolvable: MessageResolvable`

**Returns:** `string | null`

### `search`

Search Messages in the channel.

```ts

search(options?: MessageSearchOptions): Promise<MessageSearchResult>

```

- `options?: MessageSearchOptions` — Performs a search within the channel.

**Returns:** `Promise<MessageSearchResult>`

### `unpin`

Unpins a message from the channel's pinned messages, even if it's not cached.

```ts

unpin(message: MessageResolvable, reason?: string): Promise<void>

```

- `message: MessageResolvable` — The message to unpin
- `reason?: string` — Reason for unpinning

**Returns:** `Promise<void>`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Message<boolean>>

```

**Returns:** `Collection<string, Message<boolean>>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/MessageManager.ts#L17
