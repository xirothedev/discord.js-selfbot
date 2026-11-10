# SectionComponent

```ts

class SectionComponent extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor<AccessoryType extends MessageButton | ThumbnailComponent = MessageButton | ThumbnailComponent>(data?: SectionComponent<AccessoryType> | APISectionComponent): SectionComponent<AccessoryType>

```

- `data?: SectionComponent<AccessoryType> | APISectionComponent` — The data

**Returns:** `SectionComponent<AccessoryType>`

## Properties

### `accessory`

**Type:** `AccessoryType[]`

### `components`

One to three text components

**Type:** `TextDisplayComponent[]`

### `data`

**Type:** `MessageComponentOptions`

### `id`

**Type:** `number` · **Modifiers:** readonly

### `type`

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

## Methods

### `toJSON`

```ts

toJSON(): APISectionComponent

```

**Returns:** `APISectionComponent`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/SectionComponent.ts#L18
