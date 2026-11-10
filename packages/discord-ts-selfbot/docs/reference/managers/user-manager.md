# UserManager

Manages API methods for users and stores their cache.

```ts

class UserManager extends CachedManager<Snowflake, User, UserResolvable>

```

## Properties

### `cache`

The cache of this manager

**Type:** `Collection<string, User>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<User>` · **Modifiers:** readonly

## Methods

### `createDM`

Creates a DMChannel between the client and a user.

```ts

createDM(user: UserResolvable, options?: BaseFetchOptions): Promise<DMChannel>

```

- `user: UserResolvable` — The UserResolvable to identify
- `options?: BaseFetchOptions` — Additional options for this fetch

**Returns:** `Promise<DMChannel>`

### `deleteDM`

Deletes a DMChannel (if one exists) between the client and a user. Resolves with the channel if successful.

```ts

deleteDM(user: UserResolvable): Promise<DMChannel>

```

- `user: UserResolvable` — The UserResolvable to identify

**Returns:** `Promise<DMChannel>`

### `fetch`

Obtains a user from Discord, or the user cache if it's already available.

```ts

fetch(user: UserResolvable, options?: BaseFetchOptions): Promise<User>

```

- `user: UserResolvable` — The user to fetch
- `options?: BaseFetchOptions` — Additional options for this fetch

**Returns:** `Promise<User>`

### `resolve`

Resolves a UserResolvable to a User object.

```ts

resolve(resolvable: User): User

```

- `resolvable: User`

**Returns:** `User`

Resolves a UserResolvable to a User object.

```ts

resolve(resolvable: UserResolvable): User | null

```

- `resolvable: UserResolvable`

**Returns:** `User | null`

### `resolveId`

Resolves a UserResolvable to a User id.

```ts

resolveId(resolvable: string | User): string

```

- `resolvable: string | User`

**Returns:** `string`

Resolves a UserResolvable to a User id.

```ts

resolveId(resolvable: UserResolvable): string | null

```

- `resolvable: UserResolvable`

**Returns:** `string | null`

### `send`

Sends a message to a user.

```ts

send(user: UserResolvable, options: string | MessageOptions | MessagePayload): Promise<Message<boolean>>

```

- `user: UserResolvable` — The UserResolvable to identify
- `options: string | MessageOptions | MessagePayload` — The options to provide

**Returns:** `Promise<Message<boolean>>`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, User>

```

**Returns:** `Collection<string, User>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/UserManager.ts#L19
