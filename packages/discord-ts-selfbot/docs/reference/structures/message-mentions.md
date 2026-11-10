# MessageMentions

```ts

class MessageMentions

```

## Properties

### `channels`

**Type:** `Collection<string, AnyChannel>` · **Modifiers:** readonly

### `CHANNELS_PATTERN`

**Type:** `RegExp` · **Modifiers:** static

### `client`

**Type:** `Client` · **Modifiers:** readonly

### `crosspostedChannels`

**Type:** `Collection<string, CrosspostedChannel>`

### `everyone`

**Type:** `boolean`

### `EVERYONE_PATTERN`

**Type:** `RegExp` · **Modifiers:** static

### `guild`

**Type:** `Guild` · **Modifiers:** readonly

### `members`

**Type:** `Collection<string, GuildMember> | null` · **Modifiers:** readonly

### `parsedUsers`

**Type:** `Collection<string, User>` · **Modifiers:** readonly

### `repliedUser`

**Type:** `User | null`

### `roles`

**Type:** `Collection<string, Role>`

### `ROLES_PATTERN`

**Type:** `RegExp` · **Modifiers:** static

### `users`

**Type:** `Collection<string, User>`

### `USERS_PATTERN`

**Type:** `RegExp` · **Modifiers:** static

## Methods

### `has`

```ts

has(data: string | CategoryChannel | DMChannel | PartialDMChannel | GroupDMChannel | NewsChannel | StageChannel | StoreChannel | TextChannel | ThreadChannel | VoiceChannel | ForumChannel | MediaChannel | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>, options?: MessageMentionsHasOptions): boolean

```

- `data: string | CategoryChannel | DMChannel | PartialDMChannel | GroupDMChannel | NewsChannel | StageChannel | StoreChannel | TextChannel | ThreadChannel | VoiceChannel | ForumChannel | MediaChannel | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>`
- `options?: MessageMentionsHasOptions`

**Returns:** `boolean`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/MessageMentions.ts#L1
