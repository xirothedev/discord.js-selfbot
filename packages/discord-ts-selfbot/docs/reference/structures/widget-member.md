# WidgetMember

Represents a WidgetMember.

```ts

class WidgetMember extends Base

```

## Properties

### `activity`

The activity of the member.

**Type:** `WidgetActivity | null`

### `avatar`

The avatar of the member.

**Type:** `string | null`

### `avatarURL`

The avatar URL of the member.

**Type:** `string`

### `channelId`

The id of the voice channel the member is in, if any

**Type:** `string | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `deaf`

If the member is server deafened

**Type:** `boolean | null`

### `discriminator`

The discriminator of the member.

**Type:** `string`

### `id`

The id of the user. It's an arbitrary number.

**Type:** `string`

### `mute`

If the member is server muted

**Type:** `boolean | null`

### `selfDeaf`

If the member is self deafened

**Type:** `boolean | null`

### `selfMute`

If the member is self muted

**Type:** `boolean | null`

### `status`

The status of the member.

**Type:** `PresenceStatus`

### `suppress`

If the member is suppressed

**Type:** `boolean | null`

### `username`

The username of the member.

**Type:** `string`

## Methods

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/WidgetMember.ts#L10
