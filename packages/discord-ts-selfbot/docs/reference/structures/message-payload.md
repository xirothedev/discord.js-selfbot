# MessagePayload

Represents a message to be sent to the API.

```ts

class MessagePayload

```

## Constructor

### `constructor`

```ts

constructor(target: MessageTarget, options: WebhookMessageOptions | MessageOptions): MessagePayload

```

- `target: MessageTarget` — The target for this message to be sent to
- `options: WebhookMessageOptions | MessageOptions` — Options passed in from send

**Returns:** `MessagePayload`

## Properties

### `data`

Data sendable to the API

**Type:** `RawMessagePayloadData | null`

### `files`

Files sendable to the API

**Type:** `HTTPAttachmentData[] | null`

### `isInteraction`

Whether or not the target is an Interaction or an InteractionWebhook

**Type:** `boolean` · **Modifiers:** readonly

### `isMessage`

Whether or not the target is a Message

**Type:** `boolean` · **Modifiers:** readonly

### `isMessageManager`

Whether or not the target is a MessageManager

**Type:** `boolean` · **Modifiers:** readonly

### `isUser`

Whether or not the target is a User

**Type:** `boolean` · **Modifiers:** readonly

### `isWebhook`

Whether or not the target is a Webhook or a WebhookClient

**Type:** `boolean` · **Modifiers:** readonly

### `options`

Options passed in from send

**Type:** `WebhookMessageOptions | MessageOptions`

### `target`

The target for this message to be sent to

**Type:** `MessageTarget`

## Methods

### `create`

Creates a MessagePayload from user-level arguments.

```ts

static create(target: MessageTarget, options: string | WebhookMessageOptions | MessageOptions, extra?: WebhookMessageOptions | MessageOptions): MessagePayload

```

- `target: MessageTarget` — Target to send to
- `options: string | WebhookMessageOptions | MessageOptions` — Options or content to use
- `extra?: WebhookMessageOptions | MessageOptions` — Extra options to add onto specified options

**Returns:** `MessagePayload`

### `makeContent`

Makes the content of this message.

```ts

makeContent(): string | undefined

```

**Returns:** `string | undefined`

### `resolveData`

Resolves data.

```ts

resolveData(): this

```

**Returns:** `this`

### `resolveFile`

Resolves a single file into an object sendable to the API.

```ts

static resolveFile(fileLike: BufferResolvable | Stream | MessageAttachment | FileOptions): Promise<HTTPAttachmentData>

```

- `fileLike: BufferResolvable | Stream | MessageAttachment | FileOptions` — Something that could be resolved to a file

**Returns:** `Promise<HTTPAttachmentData>`

### `resolveFiles`

Resolves files.

```ts

resolveFiles(): Promise<MessagePayload>

```

**Returns:** `Promise<MessagePayload>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessagePayload.ts#L59
