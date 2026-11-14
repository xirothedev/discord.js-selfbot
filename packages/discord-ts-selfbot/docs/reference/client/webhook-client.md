# WebhookClient

The webhook client.

```ts

class WebhookClient extends BaseClient<this> & WebhookFields

```

## Constructor

### `constructor`

```ts

constructor(data: WebhookClientData, options?: WebhookClientOptions): WebhookClient

```

- `data: WebhookClientData` — The data of the webhook
- `options?: WebhookClientOptions` — Options for the client

**Returns:** `WebhookClient`

## Properties

### `api`

**Type:** `ApiRouter` · **Modifiers:** readonly

### `client`

**Type:** `WebhookClient`

### `createdAt`

The time the webhook was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the webhook was created at

**Type:** `number` · **Modifiers:** readonly

### `id`

The webhook's id

**Type:** `string`

### `options`

The options the client was instantiated with

**Type:** `WebhookClientOptions`

### `rest`

**Type:** `RESTManager`

### `url`

The URL of this webhook

**Type:** `string` · **Modifiers:** readonly

## Methods

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

### `destroy`

Destroys all assets used by the base client.

```ts

destroy(): void

```

**Returns:** `void`

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

editMessage(message: MessageResolvable, options: string | MessagePayload | WebhookEditMessageOptions): Promise<APIMessage>

```

- `message: MessageResolvable` — The message to edit
- `options: string | MessagePayload | WebhookEditMessageOptions` — The options to provide

**Returns:** `Promise<APIMessage>`

### `fetchMessage`

Gets a message that was sent by this webhook.

```ts

fetchMessage(message: string, options?: WebhookFetchMessageOptions): Promise<APIMessage>

```

- `message: string` — The id of the message to fetch
- `options?: WebhookFetchMessageOptions`

**Returns:** `Promise<APIMessage>`

Gets a message that was sent by this webhook.

> **Deprecated.** This API is deprecated.

```ts

fetchMessage(message: string, cache?: boolean): Promise<APIMessage>

```

- `message: string` — The id of the message to fetch
- `cache?: boolean`

**Returns:** `Promise<APIMessage>`

### `send`

Sends a message with this webhook.

```ts

send(options: string | WebhookMessageOptions | MessagePayload): Promise<APIMessage>

```

- `options: string | WebhookMessageOptions | MessagePayload` — The options to provide

**Returns:** `Promise<APIMessage>`

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

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

## Events

### `debug`

Emitted for general debugging information.

- `info` — The debug information

### `rateLimit`

Emitted when the client hits a rate limit while making a request

- `rateLimitData` — Object containing the rate limit info

### `apiRequest`

Emitted before every API request.
This event can emit several times for the same request, e.g. when hitting a rate limit.
This is an informational event that is emitted quite frequently,
it is highly recommended to check `request.path` to filter the data.

- `request` — The request that is about to be sent

### `apiResponse`

Emitted after every API request has received a response.
This event does not necessarily correlate to completion of the request, e.g. when hitting a rate limit.
This is an informational event that is emitted quite frequently,
it is highly recommended to check `request.path` to filter the data.

- `request` — The request that triggered this response
- `response` — The response received from the Discord API

### `invalidRequestWarning`

Emitted periodically when the process sends invalid requests to let users avoid the
10k invalid requests in 10 minutes threshold that causes a ban

- `invalidRequestWarningData` — Object containing the invalid request info

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/client/WebhookClient.ts#L15
