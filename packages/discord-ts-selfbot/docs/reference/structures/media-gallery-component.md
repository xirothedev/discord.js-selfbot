# MediaGalleryComponent

```ts

class MediaGalleryComponent extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor(data?: MediaGalleryComponent | APIMediaGalleryComponent): MediaGalleryComponent

```

- `data?: MediaGalleryComponent | APIMediaGalleryComponent` — The data

**Returns:** `MediaGalleryComponent`

## Properties

### `data`

**Type:** `MessageComponentOptions`

### `id`

**Type:** `number` · **Modifiers:** readonly

### `items`

1 to 10 media gallery items

**Type:** `MediaGalleryItem[]`

### `type`

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

## Methods

### `toJSON`

```ts

toJSON(): APIMediaGalleryComponent

```

**Returns:** `APIMediaGalleryComponent`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MediaGalleryComponent.ts#L15
