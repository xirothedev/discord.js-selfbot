# BaseGuildEmojiManager

Holds methods to resolve GuildEmojis and stores their cache.

```ts

class BaseGuildEmojiManager extends CachedManager<Snowflake, GuildEmoji, EmojiResolvable>

```

## Properties

### `cache`

The cache of GuildEmojis

**Type:** `Collection<string, GuildEmoji>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<GuildEmoji>` · **Modifiers:** readonly

## Methods

### `resolve`

Resolves an EmojiResolvable to an Emoji object.

```ts

resolve(resolvable: GuildEmoji): GuildEmoji

```

- `resolvable: GuildEmoji`

**Returns:** `GuildEmoji`

Resolves an EmojiResolvable to an Emoji object.

```ts

resolve(resolvable: EmojiResolvable): GuildEmoji | null

```

- `resolvable: EmojiResolvable`

**Returns:** `GuildEmoji | null`

### `resolveId`

Resolves an EmojiResolvable to an Emoji id string.

```ts

resolveId(resolvable: string | GuildEmoji): string

```

- `resolvable: string | GuildEmoji`

**Returns:** `string`

Resolves an EmojiResolvable to an Emoji id string.

```ts

resolveId(resolvable: EmojiResolvable): string | null

```

- `resolvable: EmojiResolvable`

**Returns:** `string | null`

### `resolveIdentifier`

Resolves an EmojiResolvable to an emoji identifier.

```ts

resolveIdentifier(emoji: EmojiIdentifierResolvable): string | null

```

- `emoji: EmojiIdentifierResolvable` — The emoji resolvable to resolve

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, GuildEmoji>

```

**Returns:** `Collection<string, GuildEmoji>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/BaseGuildEmojiManager.ts#L14
