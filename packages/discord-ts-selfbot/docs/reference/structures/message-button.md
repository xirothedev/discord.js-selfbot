# MessageButton

Represents a button message component.

```ts

class MessageButton extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor(data?: MessageButtonOptions | MessageButton | APIButtonComponent): MessageButton

```

- `data?: MessageButtonOptions | MessageButton | APIButtonComponent` — MessageButton to clone or raw data

**Returns:** `MessageButton`

## Properties

### `customId`

A unique string to be sent in the interaction when clicked

**Type:** `string | null`

### `data`

The data for this component

**Type:** `MessageComponentOptions`

### `disabled`

Whether this button is currently disabled

**Type:** `boolean`

### `emoji`

Emoji for this button

**Type:** `APIPartialEmoji | null`

### `id`

The id of this component

**Type:** `number` · **Modifiers:** readonly

### `label`

The text to be displayed on this button

**Type:** `string | null`

### `style`

The style of this button

**Type:** `"PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER" | "LINK" | null`

### `type`

The type of this component

**Type:** `"BUTTON"`

### `url`

The URL this button links to, if it is a Link style button

**Type:** `string | null`

## Methods

### `setCustomId`

Sets the custom id for this button

```ts

setCustomId(customId: string): this

```

- `customId: string` — A unique string to be sent in the interaction when clicked

**Returns:** `this`

### `setDisabled`

Sets the interactive status of the button

```ts

setDisabled(disabled?: boolean): this

```

- `disabled?: boolean` — Whether this button should be disabled

**Returns:** `this`

### `setEmoji`

Set the emoji of this button

```ts

setEmoji(emoji: EmojiIdentifierResolvable): this

```

- `emoji: EmojiIdentifierResolvable` — The emoji to be displayed on this button

**Returns:** `this`

### `setLabel`

Sets the label of this button

```ts

setLabel(label: string): this

```

- `label: string` — The text to be displayed on this button

**Returns:** `this`

### `setStyle`

Sets the style of this button

```ts

setStyle(style: MessageButtonStyleResolvable): this

```

- `style: MessageButtonStyleResolvable` — The style of this button

**Returns:** `this`

### `setURL`

Sets the URL of this button.
MessageButton#style must be LINK when setting a URL

```ts

setURL(url: string): this

```

- `url: string` — The URL of this button

**Returns:** `this`

### `toJSON`

Transforms the button to a plain object.

```ts

toJSON(): APIButtonComponent

```

**Returns:** `APIButtonComponent`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessageButton.ts#L16
