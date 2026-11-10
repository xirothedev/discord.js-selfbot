# WelcomeChannel

Represents a channel link in a guild's welcome screen.

```ts

class WelcomeChannel extends Base

```

## Properties

### `channel`

The channel of this welcome channel

**Type:** `NewsChannel | StoreChannel | TextChannel | ForumChannel | MediaChannel | null` · **Modifiers:** readonly

### `channelId`

The id of this welcome channel

**Type:** `string`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `description`

The description of this welcome channel

**Type:** `string`

### `emoji`

The emoji of this welcome channel

**Type:** `GuildEmoji | Emoji` · **Modifiers:** readonly

### `guild`

The guild for this welcome channel

**Type:** `Guild | InviteGuild`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/WelcomeChannel.ts#L12
