# WebEmbed

Send Embedlink to Discord
Only works with Discord Web and Discord Client (no custom theme installed)
- No Timestamp, Footer, Fields, Author iconURL
- Video with Embed working
- Can only choose between image and thumbnail
- Description limit 350 characters

```ts

class WebEmbed

```

## Constructor

### `constructor`

```ts

constructor(data?: WebEmbedOptions): WebEmbed

```

- `data?: WebEmbedOptions` — Raw data

**Returns:** `WebEmbed`

## Properties

### `author`

The author of this embed (if there is one)

**Type:** `MessageEmbedAuthor | null`

### `baseURL`

**Type:** `string | undefined`

### `color`

The color of this embed

**Type:** `number | null`

### `description`

The description of this embed

**Type:** `string | null`

### `hiddenEmbed`

**Type:** `string` · **Modifiers:** static

### `image`

The image of this embed, if there is one

**Type:** `MessageEmbedImage | null`

### `imageType`

Type image of this embed

**Type:** `"thumbnail" | "image"`

### `provider`

The provider of this embed (if there is one)

**Type:** `MessageEmbedProvider | null`

### `redirect`

Redirect URL

**Type:** `string`

### `title`

The title of this embed

**Type:** `string | null`

### `url`

The URL of this embed

**Type:** `string | null`

### `video`

The video of this embed (if there is one)

**Type:** `MessageEmbedVideo | null`

## Methods

### `setAuthor`

Sets the author of this embed.

```ts

setAuthor(options: EmbedAuthorData | null): this

```

- `options: EmbedAuthorData | null` — The options to provide for the author. Provide `null` to remove the author data.

**Returns:** `this`

### `setColor`

Sets the color of this embed.

```ts

setColor(color: ColorResolvable): this

```

- `color: ColorResolvable` — The color of the embed

**Returns:** `this`

### `setDescription`

Sets the description of this embed.

```ts

setDescription(description: string): this

```

- `description: string` — The description (Limit 350 characters)

**Returns:** `this`

### `setImage`

Sets the image of this embed.

```ts

setImage(url: string): this

```

- `url: string` — The URL of the image

**Returns:** `this`

### `setProvider`

Sets the provider of this embed.

```ts

setProvider(options: MessageEmbedProvider | null): this

```

- `options: MessageEmbedProvider | null` — The options to provide for the provider. Provide `null` to remove the provider data.

**Returns:** `this`

### `setRedirect`

Sets the redirect URL of this embed.

```ts

setRedirect(url: string): this

```

- `url: string` — The URL

**Returns:** `this`

### `setThumbnail`

Sets the thumbnail of this embed.

```ts

setThumbnail(url: string): this

```

- `url: string` — The URL of the image

**Returns:** `this`

### `setTitle`

Sets the title of this embed.

```ts

setTitle(title: string): this

```

- `title: string` — The title

**Returns:** `this`

### `setURL`

Sets the URL of this embed.

```ts

setURL(url: string): this

```

- `url: string` — The URL

**Returns:** `this`

### `setVideo`

Sets the video of this embed.

```ts

setVideo(url: string): this

```

- `url: string` — The URL of the video

**Returns:** `this`

### `toString`

```ts

toString(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/WebEmbed.ts#L18
