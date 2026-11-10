# ThumbnailComponent

```ts

class ThumbnailComponent extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor(data?: ThumbnailComponent | APIThumbnailComponent): ThumbnailComponent

```

- `data?: ThumbnailComponent | APIThumbnailComponent` — The data

**Returns:** `ThumbnailComponent`

## Properties

### `data`

**Type:** `MessageComponentOptions`

### `description`

Alt text for the media, max 1024 characters

**Type:** `string | null`

### `id`

**Type:** `number` · **Modifiers:** readonly

### `media`

A url or attachment

**Type:** `UnfurledMediaItem`

### `spoiler`

Whether the thumbnail should be a spoiler (or blurred out). Defaults to false

**Type:** `boolean`

### `type`

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/ThumbnailComponent.ts#L17
