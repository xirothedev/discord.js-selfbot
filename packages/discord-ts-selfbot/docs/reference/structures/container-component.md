# ContainerComponent

```ts

class ContainerComponent extends BaseMessageComponent

```

## Constructor

### `constructor`

```ts

constructor(data?: ComponentInContainer | APIContainerComponent): ContainerComponent

```

- `data?: ComponentInContainer | APIContainerComponent` — The data

**Returns:** `ContainerComponent`

## Properties

### `accentColor`

Color for the accent on the container as RGB from 0x000000 to 0xFFFFFF

**Type:** `number | null`

### `components`

Components of the type action row, text display, section, media gallery, separator, or file

**Type:** `ComponentInContainer[]`

### `data`

**Type:** `MessageComponentOptions`

### `hexAccentColor`

The hex accent color of this container

**Type:** ``${string}` | null` · **Modifiers:** readonly

### `id`

**Type:** `number` · **Modifiers:** readonly

### `spoiler`

Whether the container should be a spoiler (or blurred out). Defaults to false.

**Type:** `boolean`

### `type`

**Type:** `"ACTION_ROW" | "BUTTON" | "STRING_SELECT" | "TEXT_INPUT" | "USER_SELECT" | "ROLE_SELECT" | "MENTIONABLE_SELECT" | "CHANNEL_SELECT" | "SECTION" | "TEXT_DISPLAY" | "THUMBNAIL" | "MEDIA_GALLERY" | "FILE" | "SEPARATOR" | "CONTAINER" | null`

## Methods

### `toJSON`

```ts

toJSON(): APIContainerComponent

```

**Returns:** `APIContainerComponent`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/ContainerComponent.ts#L20
