# Webhook

Represents a webhook.

```ts

class Webhook extends WebhookFields

```

## Properties

### `avatar`

The avatar for the webhook

**Type:** `string | null`

### `channel`

The channel the webhook belongs to

**Type:** `NewsChannel | TextChannel | VoiceChannel | ForumChannel | MediaChannel | null` · **Modifiers:** readonly

### `channelId`

The id of the channel the webhook belongs to

**Type:** `string | null`

### `client`

The client that instantiated the webhook

**Type:** `Client`

### `createdAt`

The time the webhook was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the webhook was created at

**Type:** `number` · **Modifiers:** readonly

### `guildId`

The guild the webhook belongs to

**Type:** `string | null`

### `id`

The webhook's id

**Type:** `string`

### `name`

The name of the webhook

**Type:** `string | null`

### `owner`

**Type:** `APIUser | User | null`

### `sourceChannel`

**Type:** `NewsChannel | APIPartialChannel | null`

### `sourceGuild`

**Type:** `APIPartialGuild | Guild | null`

### `type`

**Type:** `"Incoming" | "Channel Follower" | "Application"`

### `url`

The URL of this webhook

**Type:** `string` · **Modifiers:** readonly

## Methods

### `avatarURL`

A link to the webhook's avatar.

```ts

avatarURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `delete`

Deletes the webhook.

```ts

delete(reason?: string): Promise<void>

```

- `reason?: string` — Reason for deleting this webhook

**Returns:** `Promise<void>`

### `deleteMessage`

Delete a message that was sent by this webhook.

```ts

deleteMessage(message: APIMessage | MessageResolvable, threadId?: string): Promise<void>

```

- `message: APIMessage | MessageResolvable` — The message to delete
- `threadId?: string` — The id of the thread this message belongs to

**Returns:** `Promise<void>`

### `edit`

Edits this webhook.

```ts

edit(options: WebhookEditData, reason?: string): Promise<Webhook>

```

- `options: WebhookEditData` — Options for editing the webhook
- `reason?: string` — Reason for editing the webhook

**Returns:** `Promise<Webhook>`

### `editMessage`

Edits a message that was sent by this webhook.

```ts

editMessage(message: MessageResolvable, options: string | MessagePayload | WebhookEditMessageOptions): Promise<APIMessage | Message<boolean>>

```

- `message: MessageResolvable` — The message to edit
- `options: string | MessagePayload | WebhookEditMessageOptions` — The options to provide

**Returns:** `Promise<APIMessage | Message<boolean>>`

### `fetchMessage`

Gets a message that was sent by this webhook.

```ts

fetchMessage(message: string, options?: WebhookFetchMessageOptions): Promise<APIMessage | Message<boolean>>

```

- `message: string` — The id of the message to fetch
- `options?: WebhookFetchMessageOptions`

**Returns:** `Promise<APIMessage | Message<boolean>>`

Gets a message that was sent by this webhook.

> **Deprecated.** This API is deprecated.

```ts

fetchMessage(message: string, cache?: boolean): Promise<APIMessage | Message<boolean>>

```

- `message: string` — The id of the message to fetch
- `cache?: boolean`

**Returns:** `Promise<APIMessage | Message<boolean>>`

### `isChannelFollower`

Whether or not this webhook is a channel follower webhook.

```ts

isChannelFollower(): this

```

**Returns:** `this`

### `isIncoming`

Whether or not this webhook is an incoming webhook.

```ts

isIncoming(): this

```

**Returns:** `this`

### `send`

Sends a message with this webhook.

```ts

send(options: string | MessagePayload | Omit<WebhookMessageOptions, "flags">): Promise<APIMessage | Message<boolean>>

```

- `options: string | MessagePayload | Omit<WebhookMessageOptions, "flags">` — The options to provide

**Returns:** `Promise<APIMessage | Message<boolean>>`

```ts
// Send a basic message
webhook.send('hello!')
  .then(message => console.log(`Sent message: ${message.content}`))
  .catch(console.error);
```

```ts
// Send a basic message in a thread
webhook.send({ content: 'hello!', threadId: '836856309672348295' })
  .then(message => console.log(`Sent message: ${message.content}`))
  .catch(console.error);
```

```ts
// Send a remote file
webhook.send({
  files: ['https://cdn.discordapp.com/icons/222078108977594368/6e1019b3179d71046e463a75915e7244.png?size=2048']
})
  .then(console.log)
  .catch(console.error);
```

```ts
// Send a local file
webhook.send({
  files: [{
    attachment: 'entire/path/to/file.jpg',
    name: 'file.jpg'
  }]
})
  .then(console.log)
  .catch(console.error);
```

```ts
// Send an embed with a local image inside
webhook.send({
  content: 'This is an embed',
  embeds: [{
    thumbnail: {
         url: 'attachment://file.jpg'
      }
   }],
   files: [{
      attachment: 'entire/path/to/file.jpg',
      name: 'file.jpg'
   }]
})
  .then(console.log)
  .catch(console.error);
```

### `sendSlackMessage`

Sends a raw slack message with this webhook.

```ts

sendSlackMessage(body: unknown): Promise<boolean>

```

- `body: unknown` — The raw body to send

**Returns:** `Promise<boolean>`

```ts
// Send a slack message
webhook.sendSlackMessage({
  'username': 'Wumpus',
  'attachments': [{
    'pretext': 'this looks pretty cool',
    'color': '#F0F',
    'footer_icon': 'http://snek.s3.amazonaws.com/topSnek.png',
    'footer': 'Powered by sneks',
    'ts': Date.now() / 1_000
  }]
}).catch(console.error);
```

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Webhook.ts#L19
