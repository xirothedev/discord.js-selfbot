# Widget

Represents a Widget.

```ts

class Widget extends Base

```

## Properties

### `channels`

The list of channels in the guild.

**Type:** `Collection<string, WidgetChannel>`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `id`

**Type:** `string`

### `instantInvite`

The invite of the guild.

**Type:** `string`

### `members`

The list of members in the guild.
These strings are just arbitrary numbers, they aren't Snowflakes.

**Type:** `Collection<string, WidgetMember>`

### `name`

The name of the guild.

**Type:** `string`

### `presenceCount`

The number of members online.

**Type:** `number`

## Methods

### `fetch`

Update the Widget.

```ts

fetch(): Promise<Widget>

```

**Returns:** `Promise<Widget>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Widget.ts#L12
