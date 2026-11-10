# MediaGalleryItem

```ts

class MediaGalleryItem

```

## Constructor

### `constructor`

```ts

constructor(data?: MediaGalleryItem | APIMediaGalleryItem): MediaGalleryItem

```

- `data?: MediaGalleryItem | APIMediaGalleryItem` — The data

**Returns:** `MediaGalleryItem`

## Properties

### `description`

Alt text for the media, max 1024 characters

**Type:** `string | null`

### `media`

A url or attachment

**Type:** `UnfurledMediaItem`

### `spoiler`

Whether the media should be a spoiler (or blurred out). Defaults to false

**Type:** `boolean`

## Methods

### `toJSON`

```ts

toJSON(): APIMediaGalleryItem

```

**Returns:** `APIMediaGalleryItem`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MediaGalleryItem.ts#L16
