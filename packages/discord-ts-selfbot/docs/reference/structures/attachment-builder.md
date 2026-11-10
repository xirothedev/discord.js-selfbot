# AttachmentBuilder

Represents an attachment builder.

```ts

class AttachmentBuilder

```

## Constructor

### `constructor`

```ts

constructor(attachment: BufferResolvable | Stream, data?: AttachmentData): AttachmentBuilder

```

- `attachment: BufferResolvable | Stream` — The file
- `data?: AttachmentData` — Extra data

**Returns:** `AttachmentBuilder`

## Properties

### `attachment`

The file associated with this attachment.

**Type:** `BufferResolvable | Stream`

### `description`

The description of the attachment.

**Type:** `string | null`

### `duration`

The duration of the attachment in seconds.
This is only for voice message attachments.

**Type:** `number | null`

### `name`

The name of this attachment.

**Type:** `string | null`

### `spoiler`

Whether or not this attachment has been marked as a spoiler.

**Type:** `boolean` · **Modifiers:** readonly

### `title`

The title of the attachment.

**Type:** `string | null`

### `waveform`

The base64 encoded byte array representing a sampled waveform.
This is only for voice message attachments.

**Type:** `string | null`

## Methods

### `from`

Makes a new builder instance from a preexisting attachment structure.

```ts

static from(other: AttachmentBuilder | MessageAttachment | AttachmentPayload): AttachmentBuilder

```

- `other: AttachmentBuilder | MessageAttachment | AttachmentPayload` — The builder to construct a new instance from

**Returns:** `AttachmentBuilder`

### `setDescription`

Sets the description of this attachment.

```ts

setDescription(description: string): this

```

- `description: string` — The description of the file

**Returns:** `this`

### `setDuration`

Sets the duration of this attachment.
This is only for voice message attachments.

```ts

setDuration(duration: number): this

```

- `duration: number` — The duration of the attachment in seconds

**Returns:** `this`

### `setFile`

Sets the file of this attachment.

```ts

setFile(attachment: BufferResolvable | Stream): this

```

- `attachment: BufferResolvable | Stream` — The file

**Returns:** `this`

### `setName`

Sets the name of this attachment.

```ts

setName(name: string): this

```

- `name: string` — The name of the file

**Returns:** `this`

### `setSpoiler`

Sets whether this attachment is a spoiler.

```ts

setSpoiler(spoiler?: boolean): this

```

- `spoiler?: boolean` — Whether the attachment should be marked as a spoiler

**Returns:** `this`

### `setTitle`

Sets the title of this attachment.

```ts

setTitle(title: string): this

```

- `title: string` — The title of the file

**Returns:** `this`

### `setWaveform`

Sets the waveform of this attachment.
This is only for voice message attachments.

```ts

setWaveform(waveform: string): this

```

- `waveform: string` — The base64 encoded byte array representing a sampled waveform

**Returns:** `this`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/AttachmentBuilder.ts#L9
