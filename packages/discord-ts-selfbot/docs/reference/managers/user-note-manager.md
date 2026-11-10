# UserNoteManager

Manages API methods for Client and stores their cache.

```ts

class UserNoteManager extends BaseManager

```

## Constructor

### `constructor`

```ts

constructor(client: Client, users: Record<string, string>[]): UserNoteManager

```

- `client: Client`
- `users: Record<string, string>[]`

**Returns:** `UserNoteManager`

## Properties

### `cache`

Cache User Note

**Type:** `Collection<string, string>`

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

## Methods

### `fetch`

Obtains a user from Discord, or the user cache if it's already available.

```ts

fetch(user: UserResolvable, options?: BaseFetchOptions): Promise<string>

```

- `user: UserResolvable` — The user to fetch
- `options?: BaseFetchOptions` — Additional options for this fetch

**Returns:** `Promise<string>`

### `updateNote`

```ts

updateNote(id: string, note: string | null | undefined): Promise<UserNoteManager>

```

- `id: string`
- `note: string | null | undefined`

**Returns:** `Promise<UserNoteManager>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/UserNoteManager.ts#L11
