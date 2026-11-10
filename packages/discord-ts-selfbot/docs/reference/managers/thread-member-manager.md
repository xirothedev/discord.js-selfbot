# ThreadMemberManager

Manages API methods for GuildMembers and stores their cache.

```ts

class ThreadMemberManager extends CachedManager<Snowflake, ThreadMember, ThreadMemberResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, ThreadMember<boolean>>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<ThreadMember<boolean>>` · **Modifiers:** readonly

### `me`

The client user as a ThreadMember of this ThreadChannel

**Type:** `unknown`

### `thread`

The thread this manager belongs to

**Type:** `ThreadChannel`

## Methods

### `add`

Adds a member to the thread.

```ts

add(member: UserResolvable, reason?: string): Promise<string>

```

- `member: UserResolvable` — The member to add
- `reason?: string` — The reason for adding this member

**Returns:** `Promise<string>`

### `fetch`

```ts

fetch(options?: FetchThreadMembersWithoutGuildMemberDataOptions): Promise<Collection<string, ThreadMember<boolean>>>

```

- `options?: FetchThreadMembersWithoutGuildMemberDataOptions`

**Returns:** `Promise<Collection<string, ThreadMember<boolean>>>`

```ts

fetch(member: ThreadMember<true>, options?: FetchMemberOptions): Promise<ThreadMember<true>>

```

- `member: ThreadMember<true>`
- `options?: FetchMemberOptions`

**Returns:** `Promise<ThreadMember<true>>`

```ts

fetch(member: string, options: FetchThreadMemberOptions & { withMember: true }): Promise<ThreadMember<true>>

```

- `member: string`
- `options: FetchThreadMemberOptions & { withMember: true }`

**Returns:** `Promise<ThreadMember<true>>`

```ts

fetch(options: FetchThreadMembersWithGuildMemberDataOptions): Promise<Collection<string, ThreadMember<true>>>

```

- `options: FetchThreadMembersWithGuildMemberDataOptions`

**Returns:** `Promise<Collection<string, ThreadMember<true>>>`

```ts

fetch(member: UserResolvable, options?: FetchThreadMemberOptions): Promise<ThreadMember<boolean>>

```

- `member: UserResolvable`
- `options?: FetchThreadMemberOptions`

**Returns:** `Promise<ThreadMember<boolean>>`

> **Deprecated.** Use `fetch(options)` instead.

```ts

fetch(cache: boolean, options?: FetchThreadMembersOptions): Promise<Collection<string, ThreadMember<boolean>>>

```

- `cache: boolean`
- `options?: FetchThreadMembersOptions`

**Returns:** `Promise<Collection<string, ThreadMember<boolean>>>`

```ts

fetch(x: undefined, options: FetchThreadMembersWithGuildMemberDataOptions): Promise<Collection<string, ThreadMember<true>>>

```

- `x: undefined`
- `options: FetchThreadMembersWithGuildMemberDataOptions`

**Returns:** `Promise<Collection<string, ThreadMember<true>>>`

```ts

fetch(x: undefined, options?: FetchThreadMembersWithoutGuildMemberDataOptions): Promise<Collection<string, ThreadMember<boolean>>>

```

- `x: undefined`
- `options?: FetchThreadMembersWithoutGuildMemberDataOptions`

**Returns:** `Promise<Collection<string, ThreadMember<boolean>>>`

### `fetchMe`

Fetches the client user as a ThreadMember of the thread.

```ts

fetchMe(options?: BaseFetchOptions): Promise<ThreadMember<boolean>>

```

- `options?: BaseFetchOptions` — The options for fetching the member

**Returns:** `Promise<ThreadMember<boolean>>`

### `remove`

Remove a user from the thread.

```ts

remove(id: string, reason?: string): Promise<string>

```

- `id: string` — The id of the member to remove
- `reason?: string` — The reason for removing this member from the thread

**Returns:** `Promise<string>`

### `resolve`

Resolves a ThreadMemberResolvable to a ThreadMember object.

```ts

resolve(resolvable: ThreadMember): ThreadMember

```

- `resolvable: ThreadMember`

**Returns:** `ThreadMember`

Resolves a ThreadMemberResolvable to a ThreadMember object.

```ts

resolve(resolvable: ThreadMemberResolvable): ThreadMember<boolean> | null

```

- `resolvable: ThreadMemberResolvable`

**Returns:** `ThreadMember<boolean> | null`

### `resolveId`

Resolves a ThreadMemberResolvable to a ThreadMember id string.

```ts

resolveId(resolvable: string | ThreadMember<boolean>): string

```

- `resolvable: string | ThreadMember<boolean>`

**Returns:** `string`

Resolves a ThreadMemberResolvable to a ThreadMember id string.

```ts

resolveId(resolvable: ThreadMemberResolvable): string | null

```

- `resolvable: ThreadMemberResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, ThreadMember<boolean>>

```

**Returns:** `Collection<string, ThreadMember<boolean>>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/ThreadMemberManager.ts#L21
