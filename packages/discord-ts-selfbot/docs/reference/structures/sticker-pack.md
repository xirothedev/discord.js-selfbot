# StickerPack

Represents a pack of standard stickers.

```ts

class StickerPack extends Base

```

## Properties

### `bannerId`

The id of the sticker pack's banner image

**Type:** `string | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `coverSticker`

The sticker which is shown as the pack's icon

**Type:** `Sticker | null` · **Modifiers:** readonly

### `coverStickerId`

The id of a sticker in the pack which is shown as the pack's icon

**Type:** `string | null`

### `createdAt`

The time the sticker was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the sticker was created at

**Type:** `number` · **Modifiers:** readonly

### `description`

The description of the sticker pack

**Type:** `string`

### `id`

The Sticker pack's id

**Type:** `string`

### `name`

The name of the sticker pack

**Type:** `string`

### `skuId`

The id of the pack's SKU

**Type:** `string`

### `stickers`

The stickers in the pack

**Type:** `Collection<string, Sticker>`

## Methods

### `bannerURL`

The URL to this sticker pack's banner.

```ts

bannerURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/StickerPack.ts#L14
