# WelcomeScreen

Represents a welcome screen.

```ts

class WelcomeScreen extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `description`

The description of this welcome screen

**Type:** `string | null`

### `enabled`

Whether the welcome screen is enabled on the guild or not

**Type:** `boolean` · **Modifiers:** readonly

### `guild`

The guild for this welcome screen

**Type:** `Guild | InviteGuild`

### `welcomeChannels`

Collection of welcome channels belonging to this welcome screen

**Type:** `Collection<string, WelcomeChannel>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/WelcomeScreen.ts#L13
