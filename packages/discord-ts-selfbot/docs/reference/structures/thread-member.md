# ThreadMember

Represents a Member for a Thread.

```ts

class ThreadMember extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `flags`

The flags for this thread member

**Type:** `Readonly<ThreadMemberFlags>`

### `guildMember`

The guild member associated with this thread member

**Type:** `HasMemberData extends true ? GuildMember : GuildMember | null` · **Modifiers:** readonly

### `id`

The id of the thread member

**Type:** `string`

### `joinedAt`

The last time this member joined the thread

**Type:** `Date | null` · **Modifiers:** readonly

### `joinedTimestamp`

The timestamp the member last joined the thread at

**Type:** `number | null`

### `manageable`

Whether the client user can manage this thread member

**Type:** `boolean` · **Modifiers:** readonly

### `thread`

The thread that this member is a part of

**Type:** `ThreadChannel`

### `user`

The user associated with this thread member

**Type:** `User | null` · **Modifiers:** readonly

## Methods

### `remove`

Removes this member from the thread.

```ts

remove(reason?: string): Promise<ThreadMember<boolean>>

```

- `reason?: string` — Reason for removing the member

**Returns:** `Promise<ThreadMember<boolean>>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/ThreadMember.ts#L11
