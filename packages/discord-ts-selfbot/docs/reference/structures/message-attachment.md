# MessageAttachment

Represents an attachment in a message.

```ts

class MessageAttachment

```

## Constructor

### `constructor`

```ts

constructor(attachment: BufferResolvable | Stream, name?: string, data?: RawMessageAttachmentData): MessageAttachment

```

- `attachment: BufferResolvable | Stream` — The file
- `name?: string` — The name of the file, if any
- `data?: RawMessageAttachmentData` — Extra data

**Returns:** `MessageAttachment`

## Properties

### `attachment`

**Type:** `BufferResolvable | Stream`

### `contentType`

The media (MIME) type of this attachment

**Type:** `string | null`

### `description`

The description (alt text) of this attachment

**Type:** `string | null`

### `duration`

The duration of this attachment in seconds
This will only be available if the attachment is an audio file.

**Type:** `number | null`

### `ephemeral`

Whether this attachment is ephemeral

**Type:** `boolean`

### `flags`

The flags of this attachment

**Type:** `Readonly<AttachmentFlags>`

### `height`

The height of this attachment (if an image or video)

**Type:** `number | null`

### `id`

The attachment's id

**Type:** `string`

### `name`

The name of this attachment

**Type:** `string | null`

### `proxyURL`

The Proxy URL to this attachment

**Type:** `string`

### `size`

The size of this attachment in bytes

**Type:** `number`

### `spoiler`

Whether or not this attachment has been marked as a spoiler

**Type:** `boolean` · **Modifiers:** readonly

### `title`

The title of this attachment
This will only be available if the attachment name contains special characters.

**Type:** `string | null`

### `url`

The URL to this attachment

**Type:** `string`

### `waveform`

The base64 encoded byte array representing a sampled waveform
This will only be available if the attachment is an audio file.

**Type:** `string | null`

### `width`

The width of this attachment (if an image or video)

**Type:** `number | null`

## Methods

### `setDescription`

Sets the description of this attachment.

```ts

setDescription(description: string): this

```

- `description: string` — The description of the file

**Returns:** `this`

### `setFile`

Sets the file of this attachment.

```ts

setFile(attachment: BufferResolvable | Stream, name?: string): this

```

- `attachment: BufferResolvable | Stream` — The file
- `name?: string` — The name of the file

**Returns:** `this`

### `setName`

Sets the name of this attachment.

```ts

setName(name: string): this

```

- `name: string` — The name of the file

**Returns:** `this`

### `setSpoiler`

Sets whether this attachment is a spoiler

```ts

setSpoiler(spoiler?: boolean): this

```

- `spoiler?: boolean` — Whether the attachment should be marked as a spoiler

**Returns:** `this`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessageAttachment.ts#L10
