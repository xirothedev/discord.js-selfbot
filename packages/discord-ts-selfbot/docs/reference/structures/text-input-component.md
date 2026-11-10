# TextInputComponent

Represents a text input component in a modal

```ts

class TextInputComponent extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor(data?: TextInputComponent | TextInputComponentOptions): TextInputComponent

```

- `data?: TextInputComponent | TextInputComponentOptions` — TextInputComponent to clone or raw data

**Returns:** `TextInputComponent`

## Properties

### `customId`

A unique string to be sent in the interaction when submitted

**Type:** `string | null`

### `data`

The data for this component

**Type:** `MessageComponentOptions`

### `id`

The id of this component

**Type:** `number` · **Modifiers:** readonly

### `label`

The text to be displayed above this text input component

**Type:** `string | null`

### `maxLength`

Maximum length of text that can be entered

**Type:** `number | null`

### `minLength`

Minimum length of text required to be entered

**Type:** `number | null`

### `placeholder`

Custom placeholder text to display when no text is entered

**Type:** `string | null`

### `required`

Whether or not this text input component is required

**Type:** `boolean`

### `style`

**Type:** `"SHORT" | "PARAGRAPH"`

### `type`

The type of this component

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

### `value`

Value of this text input component

**Type:** `string | null`

## Methods

### `resolveStyle`

```ts

static resolveStyle(style: TextInputStyleResolvable): "SHORT" | "PARAGRAPH"

```

- `style: TextInputStyleResolvable`

**Returns:** `"SHORT" | "PARAGRAPH"`

### `setValue`

Sets the value of this text input component

```ts

setValue(value: string): this

```

- `value: string` — Value of this text input component

**Returns:** `this`

### `toJSON`

Transforms the text input component into a plain object

```ts

toJSON(): APITextInputComponent

```

**Returns:** `APITextInputComponent`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/TextInputComponent.ts#L19
