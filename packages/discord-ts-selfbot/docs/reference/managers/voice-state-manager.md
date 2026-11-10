# VoiceStateManager

Manages API methods for VoiceStates and stores their cache.

```ts

class VoiceStateManager extends CachedManager<Snowflake, VoiceState, typeof VoiceState>

```

## Properties

### `cache`

The cache of this manager

**Type:** `Collection<string, VoiceState>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<VoiceState>` · **Modifiers:** readonly

## Methods

### `fetch`

Obtains a user's voice state from discord or from the cache if it's already available.

```ts

fetch(member: GuildMemberResolvable, options?: BaseFetchOptions): Promise<VoiceState>

```

- `member: GuildMemberResolvable` — The member whose voice state is to be fetched
- `options?: BaseFetchOptions` — Additional options for this fetch

**Returns:** `Promise<VoiceState>`

```ts
// Fetch a member's voice state
guild.voiceStates.fetch("66564597481480192")
   .then(console.log)
   .catch(console.error);
```

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: VoiceState): VoiceState

```

- `resolvable: VoiceState`

**Returns:** `VoiceState`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: typeof VoiceState): VoiceState | null

```

- `resolvable: typeof VoiceState`

**Returns:** `VoiceState | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | VoiceState): string

```

- `resolvable: string | VoiceState`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: typeof VoiceState): string | null

```

- `resolvable: typeof VoiceState`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, VoiceState>

```

**Returns:** `Collection<string, VoiceState>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/VoiceStateManager.ts#L11
