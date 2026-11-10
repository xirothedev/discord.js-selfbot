# ReactionUserManager

Manages API methods for users who reacted to a reaction and stores their cache.

```ts

class ReactionUserManager extends CachedManager<Snowflake, User, UserResolvable>

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

### `reaction`

The reaction that this manager belongs to

**Type:** `MessageReaction`

## Methods

### `fetch`

Fetches all the users that gave this reaction. Resolves with a collection of users, mapped by their ids.

```ts

fetch(options?: FetchReactionUsersOptions): Promise<Collection<string, User>>

```

- `options?: FetchReactionUsersOptions` — Options for fetching the users

**Returns:** `Promise<Collection<string, User>>`

### `remove`

Removes a user from this reaction.

```ts

remove(user?: UserResolvable): Promise<MessageReaction>

```

- `user?: UserResolvable` — The user to remove the reaction of

**Returns:** `Promise<MessageReaction>`

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: User): User

```

- `resolvable: User`

**Returns:** `User`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: UserResolvable): User | null

```

- `resolvable: UserResolvable`

**Returns:** `User | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | User): string

```

- `resolvable: string | User`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: UserResolvable): string | null

```

- `resolvable: UserResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, User>

```

**Returns:** `Collection<string, User>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/ReactionUserManager.ts#L16
