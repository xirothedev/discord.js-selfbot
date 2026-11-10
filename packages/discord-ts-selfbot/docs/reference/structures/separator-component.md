# SeparatorComponent

```ts

class SeparatorComponent extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor(data?: SeparatorComponent | APISeparatorComponent): SeparatorComponent

```

- `data?: SeparatorComponent | APISeparatorComponent` — The data

**Returns:** `SeparatorComponent`

## Properties

### `data`

**Type:** `MessageComponentOptions`

### `divider`

Whether a visual divider should be displayed in the component. Defaults to true

**Type:** `boolean`

### `id`

**Type:** `number` · **Modifiers:** readonly

### `spacing`

Size of separator padding — SeparatorSpacingSizes.SMALL for small padding, SeparatorSpacingSizes.LARGE for large padding. Defaults to SeparatorSpacingSizes.SMALL

**Type:** `SeparatorSpacingSizes`

### `type`

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

## Methods

### `toJSON`

```ts

toJSON(): APISeparatorComponent

```

**Returns:** `APISeparatorComponent`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/SeparatorComponent.ts#L15
