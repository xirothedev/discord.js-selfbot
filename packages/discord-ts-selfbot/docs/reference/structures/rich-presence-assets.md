# RichPresenceAssets

Assets for a rich presence

```ts

class RichPresenceAssets

```

## Properties

### `activity`

The activity of the RichPresenceAssets

**Type:** `Activity` · **Modifiers:** readonly

### `largeImage`

The large image asset's id

**Type:** `string | null`

### `largeText`

Hover text for the large image

**Type:** `string | null`

### `smallImage`

The small image asset's id

**Type:** `string | null`

### `smallText`

Hover text for the small image

**Type:** `string | null`

## Methods

### `largeImageURL`

Gets the URL of the large image asset

```ts

largeImageURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the image URL

**Returns:** `string | null`

### `parseImage`

```ts

static parseImage(image: string): string | null

```

- `image: string`

**Returns:** `string | null`

### `setLargeImage`

Set the large image of this activity

```ts

setLargeImage(image?: string): this

```

- `image?: string` — The large image asset's id

**Returns:** `this`

### `setLargeText`

Hover text for the large image

```ts

setLargeText(text?: string): this

```

- `text?: string` — Assets text

**Returns:** `this`

### `setSmallImage`

Set the small image of this activity

```ts

setSmallImage(image?: string): this

```

- `image?: string` — The small image asset's id

**Returns:** `this`

### `setSmallText`

Hover text for the small image

```ts

setSmallText(text?: string): this

```

- `text?: string` — Assets text

**Returns:** `this`

### `smallImageURL`

Gets the URL of the small image asset

```ts

smallImageURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the image URL

**Returns:** `string | null`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Presence.ts#L393
