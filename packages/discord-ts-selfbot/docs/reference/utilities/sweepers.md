# Sweepers

```ts

class Sweepers

```

## Constructor

### `constructor`

```ts

constructor(client: Client, options: SweeperOptions): Sweepers

```

- `client: Client`
- `options: SweeperOptions`

**Returns:** `Sweepers`

## Properties

### `client`

**Type:** `Client` · **Modifiers:** readonly

### `intervals`

**Type:** `Record<SweeperKey, NodeJS.Timeout | null>`

### `options`

**Type:** `SweeperOptions`

## Methods

### `archivedThreadSweepFilter`

```ts

static archivedThreadSweepFilter(lifetime?: number): GlobalSweepFilter<string, ThreadChannel>

```

- `lifetime?: number`

**Returns:** `GlobalSweepFilter<string, ThreadChannel>`

### `expiredInviteSweepFilter`

```ts

static expiredInviteSweepFilter(lifetime?: number): GlobalSweepFilter<string, Invite>

```

- `lifetime?: number`

**Returns:** `GlobalSweepFilter<string, Invite>`

### `filterByLifetime`

```ts

static filterByLifetime<K, V>(options?: LifetimeFilterOptions<K, V>): GlobalSweepFilter<K, V>

```

- `options?: LifetimeFilterOptions<K, V>`

**Returns:** `GlobalSweepFilter<K, V>`

### `outdatedMessageSweepFilter`

```ts

static outdatedMessageSweepFilter(lifetime?: number): GlobalSweepFilter<string, Message<boolean>>

```

- `lifetime?: number`

**Returns:** `GlobalSweepFilter<string, Message<boolean>>`

### `sweepApplicationCommands`

```ts

sweepApplicationCommands(filter: CollectionSweepFilter<string, ApplicationCommand<unknown>>): number

```

- `filter: CollectionSweepFilter<string, ApplicationCommand<unknown>>`

**Returns:** `number`

### `sweepBans`

```ts

sweepBans(filter: CollectionSweepFilter<string, GuildBan>): number

```

- `filter: CollectionSweepFilter<string, GuildBan>`

**Returns:** `number`

### `sweepEmojis`

```ts

sweepEmojis(filter: CollectionSweepFilter<string, GuildEmoji>): number

```

- `filter: CollectionSweepFilter<string, GuildEmoji>`

**Returns:** `number`

### `sweepGuildMembers`

```ts

sweepGuildMembers(filter: CollectionSweepFilter<string, GuildMember>): number

```

- `filter: CollectionSweepFilter<string, GuildMember>`

**Returns:** `number`

### `sweepInvites`

```ts

sweepInvites(filter: CollectionSweepFilter<string, Invite>): number

```

- `filter: CollectionSweepFilter<string, Invite>`

**Returns:** `number`

### `sweepMessages`

```ts

sweepMessages(filter: CollectionSweepFilter<string, Message<boolean>>): number

```

- `filter: CollectionSweepFilter<string, Message<boolean>>`

**Returns:** `number`

### `sweepPresences`

```ts

sweepPresences(filter: CollectionSweepFilter<string, Presence>): number

```

- `filter: CollectionSweepFilter<string, Presence>`

**Returns:** `number`

### `sweepReactions`

```ts

sweepReactions(filter: CollectionSweepFilter<string, MessageReaction>): number

```

- `filter: CollectionSweepFilter<string, MessageReaction>`

**Returns:** `number`

### `sweepStageInstances`

```ts

sweepStageInstances(filter: CollectionSweepFilter<string, StageInstance>): number

```

- `filter: CollectionSweepFilter<string, StageInstance>`

**Returns:** `number`

### `sweepStickers`

```ts

sweepStickers(filter: CollectionSweepFilter<string, Sticker>): number

```

- `filter: CollectionSweepFilter<string, Sticker>`

**Returns:** `number`

### `sweepThreadMembers`

```ts

sweepThreadMembers(filter: CollectionSweepFilter<string, ThreadMember<boolean>>): number

```

- `filter: CollectionSweepFilter<string, ThreadMember<boolean>>`

**Returns:** `number`

### `sweepThreads`

```ts

sweepThreads(filter: CollectionSweepFilter<string, ThreadChannel>): number

```

- `filter: CollectionSweepFilter<string, ThreadChannel>`

**Returns:** `number`

### `sweepUsers`

```ts

sweepUsers(filter: CollectionSweepFilter<string, User>): number

```

- `filter: CollectionSweepFilter<string, User>`

**Returns:** `number`

### `sweepVoiceStates`

```ts

sweepVoiceStates(filter: CollectionSweepFilter<string, VoiceState>): number

```

- `filter: CollectionSweepFilter<string, VoiceState>`

**Returns:** `number`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/Sweepers.ts#L1
