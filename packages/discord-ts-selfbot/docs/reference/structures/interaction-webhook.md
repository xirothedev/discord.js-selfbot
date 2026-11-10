# InteractionWebhook

Represents a webhook for an Interaction

```ts

class InteractionWebhook extends PartialWebhookFields

```

## Constructor

### `constructor`

```ts

constructor(client: Client, id: string, token: string): InteractionWebhook

```

- `client: Client` — The instantiating client
- `id: string` — The application's id
- `token: string` — The interaction's token

**Returns:** `InteractionWebhook`

## Properties

### `client`

The client that instantiated the interaction webhook

**Type:** `Client`

### `id`

The webhook's id

**Type:** `string`

### `url`

The URL of this webhook

**Type:** `string` · **Modifiers:** readonly

## Methods

### `deleteMessage`

Delete a message that was sent by this webhook.

```ts

deleteMessage(message: APIMessage | MessageResolvable, threadId?: string): Promise<void>

```

- `message: APIMessage | MessageResolvable` — The message to delete
- `threadId?: string` — The id of the thread this message belongs to

**Returns:** `Promise<void>`

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

### `send`

Sends a message with this webhook.

```ts

send(options: string | InteractionReplyOptions | MessagePayload): Promise<APIMessage | Message<boolean>>

```

- `options: string | InteractionReplyOptions | MessagePayload` — The content for the reply

**Returns:** `Promise<APIMessage | Message<boolean>>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/InteractionWebhook.ts#L10
