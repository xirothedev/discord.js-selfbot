# TextDisplayComponent

```ts

class TextDisplayComponent extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor(data?: TextDisplayComponent | APITextDisplayComponent): TextDisplayComponent

```

- `data?: TextDisplayComponent | APITextDisplayComponent` — The data

**Returns:** `TextDisplayComponent`

## Properties

### `content`

Text that will be displayed similar to a message

**Type:** `string | null`

### `data`

**Type:** `MessageComponentOptions`

### `id`

**Type:** `number` · **Modifiers:** readonly

### `type`

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

## Methods

### `toJSON`

```ts

toJSON(): APITextDisplayComponent

```

**Returns:** `APITextDisplayComponent`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/TextDisplayComponent.ts#L14
