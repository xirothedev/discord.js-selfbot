# FileComponent

```ts

class FileComponent extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor(data?: FileComponent | APIFileComponent): FileComponent

```

- `data?: FileComponent | APIFileComponent` — The data

**Returns:** `FileComponent`

## Properties

### `data`

**Type:** `MessageComponentOptions`

### `file`

This unfurled media item is unique in that it only supports attachment references using the attachment://<filename> syntax

**Type:** `UnfurledMediaItem`

### `id`

**Type:** `number` · **Modifiers:** readonly

### `spoiler`

Whether the container should be a spoiler (or blurred out). Defaults to false.

**Type:** `boolean`

### `type`

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

## Methods

### `toJSON`

```ts

toJSON(): APIFileComponent

```

**Returns:** `APIFileComponent`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/FileComponent.ts#L16
