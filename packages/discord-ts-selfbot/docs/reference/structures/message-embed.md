# MessageEmbed

Represents an embed in a message (image/video preview, rich embed, etc.)

```ts

class MessageEmbed

```

## Constructor

### `constructor`

```ts

constructor(data?: APIEmbed | MessageEmbed | MessageEmbedOptions): MessageEmbed

```

- `data?: APIEmbed | MessageEmbed | MessageEmbedOptions` — MessageEmbed to clone or raw embed data

**Returns:** `MessageEmbed`

## Properties

### `author`

The author of this embed (if there is one)

**Type:** `MessageEmbedAuthor | null`

### `color`

The color of this embed

**Type:** `number | null`

### `createdAt`

The date displayed on this embed

**Type:** `Date | null` · **Modifiers:** readonly

### `description`

The description of this embed

**Type:** `string | null`

### `fields`

The fields of this embed

**Type:** `EmbedField[]`

### `footer`

The footer of this embed

**Type:** `MessageEmbedFooter | null`

### `hexColor`

The hexadecimal version of the embed color, with a leading hash

**Type:** ``${string}` | null` · **Modifiers:** readonly

### `image`

The image of this embed, if there is one

**Type:** `MessageEmbedImage | null`

### `length`

The accumulated length for the embed title, description, fields, footer text, and author name

**Type:** `number` · **Modifiers:** readonly

### `provider`

The provider of this embed (if there is one)

**Type:** `MessageEmbedProvider | null`

### `thumbnail`

The thumbnail of this embed (if there is one)

**Type:** `MessageEmbedThumbnail | null`

### `timestamp`

The timestamp of this embed

**Type:** `number | null`

### `title`

The title of this embed

**Type:** `string | null`

### `type`

The type of this embed, either:
* `rich` - a generic embed rendered from embed attributes
* `image` - an image embed
* `video` - a video embed
* `gifv` - an animated gif image embed rendered as a video embed
* `article` - an article embed
* `link` - a link embed

**Type:** `string`

### `url`

The URL of this embed

**Type:** `string | null`

### `video`

The video of this embed (if there is one)

**Type:** `MessageEmbedVideo | null` · **Modifiers:** readonly

## Methods

### `addField`

Adds a field to the embed (max 25).

> **Deprecated.** This method is a wrapper for MessageEmbed#addFields. Use that instead.

```ts

addField(name: string, value: string, inline?: boolean): this

```

- `name: string` — The name of this field
- `value: string` — The value of this field
- `inline?: boolean` — If this field will be displayed inline

**Returns:** `this`

### `addFields`

Adds fields to the embed (max 25).

```ts

addFields(fields: EmbedFieldData[] | EmbedFieldData[][]): this

```

- `fields: EmbedFieldData[] | EmbedFieldData[][]` — The fields to add

**Returns:** `this`

### `equals`

Checks if this embed is equal to another one by comparing every single one of their properties.

```ts

equals(embed: APIEmbed | MessageEmbed): boolean

```

- `embed: APIEmbed | MessageEmbed` — The embed to compare with

**Returns:** `boolean`

### `normalizeField`

Normalizes field input and verifies strings.

```ts

static normalizeField(name: string, value: string, inline?: boolean): Required<EmbedFieldData>

```

- `name: string` — The name of the field
- `value: string` — The value of the field
- `inline?: boolean` — Set the field to display inline

**Returns:** `Required<EmbedFieldData>`

### `normalizeFields`

Normalizes field input and resolves strings.

```ts

static normalizeFields(fields: EmbedFieldData[] | EmbedFieldData[][]): Required<EmbedFieldData>[]

```

- `fields: EmbedFieldData[] | EmbedFieldData[][]` — Fields to normalize

**Returns:** `Required<EmbedFieldData>[]`

### `setAuthor`

Sets the author of this embed.

```ts

setAuthor(options: EmbedAuthorData | null): this

```

- `options: EmbedAuthorData | null` — The options to provide for the author. Provide `null` to remove the author data.

**Returns:** `this`

Sets the author of this embed.

> **Deprecated.** Supply a lone object of interface EmbedAuthorData instead.

```ts

setAuthor(name: string, iconURL?: string, url?: string): this

```

- `name: string`
- `iconURL?: string`
- `url?: string`

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

- `description: string` — The description

**Returns:** `this`

### `setFields`

Sets the embed's fields (max 25).

```ts

setFields(fields: EmbedFieldData[] | EmbedFieldData[][]): this

```

- `fields: EmbedFieldData[] | EmbedFieldData[][]` — The fields to set

**Returns:** `this`

### `setFooter`

Sets the footer of this embed.

```ts

setFooter(options: EmbedFooterData | null): this

```

- `options: EmbedFooterData | null` — The options to provide for the footer. Provide `null` to remove the footer data.

**Returns:** `this`

Sets the footer of this embed.

> **Deprecated.** Supply a lone object of interface EmbedFooterData instead.

```ts

setFooter(text: string, iconURL?: string): this

```

- `text: string`
- `iconURL?: string`

**Returns:** `this`

### `setImage`

Sets the image of this embed.

```ts

setImage(url: string): this

```

- `url: string` — The URL of the image

**Returns:** `this`

### `setThumbnail`

Sets the thumbnail of this embed.

```ts

setThumbnail(url: string): this

```

- `url: string` — The URL of the thumbnail

**Returns:** `this`

### `setTimestamp`

Sets the timestamp of this embed.

```ts

setTimestamp(timestamp?: number | Date | null): this

```

- `timestamp?: number | Date | null` — The timestamp or date. If `null` then the timestamp will be unset (i.e. when editing an existing MessageEmbed)

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

### `spliceFields`

Removes, replaces, and inserts fields in the embed (max 25).

```ts

spliceFields(index: number, deleteCount: number, fields: EmbedFieldData[] | EmbedFieldData[][]): this

```

- `index: number` — The index to start at
- `deleteCount: number` — The number of fields to remove
- `fields: EmbedFieldData[] | EmbedFieldData[][]` — The replacing field objects

**Returns:** `this`

### `toJSON`

Transforms the embed to a plain object.

```ts

toJSON(): APIEmbed

```

**Returns:** `APIEmbed`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessageEmbed.ts#L28
