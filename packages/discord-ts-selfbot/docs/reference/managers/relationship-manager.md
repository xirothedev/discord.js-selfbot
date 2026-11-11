# RelationshipManager

Manages API methods for Relationships and stores their cache.

```ts

class RelationshipManager extends BaseManager

```

## Constructor

### `constructor`

```ts

constructor(client: Client, data: { id: string; nickname: string | null | undefined; since?: string; type: RelationshipTypes; user: RawUserData }[]): RelationshipManager

```

- `client: Client`
- `data: { id: string; nickname: string | null | undefined; since?: string; type: RelationshipTypes; user: RawUserData }[]`

**Returns:** `RelationshipManager`

## Properties

### `blockedCache`

Get all blocked users

**Type:** `Collection<string, User>` · **Modifiers:** readonly

### `cache`

A collection of users this manager is caching. (Type: Number)

**Type:** `Collection<string, RelationshipTypes>`

### `client`

**Type:** `Client` · **Modifiers:** readonly

### `friendCache`

Get all friends

**Type:** `Collection<string, User>` · **Modifiers:** readonly

### `friendNicknames`

**Type:** `Collection<string, string | null>`

### `incomingCache`

Get all incoming friend requests

**Type:** `Collection<string, User>` · **Modifiers:** readonly

### `outgoingCache`

Get all outgoing friend requests

**Type:** `Collection<string, User>` · **Modifiers:** readonly

### `sinceCache`

**Type:** `Collection<string, Date>`

## Methods

### `addBlocked`

Blocks a user.
This method is not implemented for safety. It always rejects and makes no REST request.

> **Deprecated.** Risky relationship mutation that can trigger Discord ToS enforcement. Always rejects with `Risky action, not finished yet.` and makes no REST request. Placeholder kept for a future opt-in design; do not use.

```ts

addBlocked(user: UserResolvable): Promise<boolean>

```

- `user: UserResolvable` — User to block

**Returns:** `Promise<boolean>`

### `addFriend`

Accepts a friend request.
This method is not implemented for safety. It always rejects and makes no REST request.

> **Deprecated.** Risky relationship mutation that can trigger Discord ToS enforcement. Always rejects with `Risky action, not finished yet.` and makes no REST request. Placeholder kept for a future opt-in design; do not use.

```ts

addFriend(user: UserResolvable): Promise<boolean>

```

- `user: UserResolvable` — The user to add as a friend

**Returns:** `Promise<boolean>`

### `bulkAddRelationships`

```ts

bulkAddRelationships(userIds: string[]): Promise<unknown>

```

- `userIds: string[]`

**Returns:** `Promise<unknown>`

### `bulkRemoveRelationships`

```ts

bulkRemoveRelationships(userIds: string[]): Promise<unknown>

```

- `userIds: string[]`

**Returns:** `Promise<unknown>`

### `createGameRelationship`

```ts

createGameRelationship(userId: string): Promise<unknown>

```

- `userId: string`

**Returns:** `Promise<unknown>`

### `createGameRelationshipByApplication`

```ts

createGameRelationshipByApplication(userId: string, applicationId: string): Promise<unknown>

```

- `userId: string`
- `applicationId: string`

**Returns:** `Promise<unknown>`

### `deleteRelationship`

Deletes a friend / blocked relationship with a client user or cancels a friend request.
This method is not implemented for safety. It always rejects and makes no REST request.

> **Deprecated.** Risky relationship mutation that can trigger Discord ToS enforcement. Always rejects with `Risky action, not finished yet.` and makes no REST request. Placeholder kept for a future opt-in design; do not use.

```ts

deleteRelationship(user: UserResolvable): Promise<boolean>

```

- `user: UserResolvable` — Target

**Returns:** `Promise<boolean>`

### `fetch`

Obtains a user from Discord, or the user cache if it's already available.

```ts

fetch(user?: UserResolvable, options?: BaseFetchOptions): Promise<RelationshipManager | RelationshipTypes>

```

- `user?: UserResolvable` — The user to fetch
- `options?: BaseFetchOptions` — Additional options for this fetch

**Returns:** `Promise<RelationshipManager | RelationshipTypes>`

### `fetchFriendSuggestions`

```ts

fetchFriendSuggestions(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchGameRelationships`

```ts

fetchGameRelationships(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `ignoreUser`

```ts

ignoreUser(userId: string): Promise<unknown>

```

- `userId: string`

**Returns:** `Promise<unknown>`

### `removeFriendSuggestion`

```ts

removeFriendSuggestion(userId: string): Promise<unknown>

```

- `userId: string`

**Returns:** `Promise<unknown>`

### `removeGameRelationship`

```ts

removeGameRelationship(userId: string): Promise<unknown>

```

- `userId: string`

**Returns:** `Promise<unknown>`

### `removeGameRelationshipByApplication`

```ts

removeGameRelationshipByApplication(userId: string, applicationId: string): Promise<unknown>

```

- `userId: string`
- `applicationId: string`

**Returns:** `Promise<unknown>`

### `resolveId`

Resolves a UserResolvable to a User id.

```ts

resolveId(user: UserResolvable): string | undefined

```

- `user: UserResolvable` — The UserResolvable to identify

**Returns:** `string | undefined`

### `sendFriendRequest`

Sends a friend request.
This method is not implemented for safety. It always rejects and makes no REST request.

> **Deprecated.** Risky relationship mutation that can trigger Discord ToS enforcement. Always rejects with `Risky action, not finished yet.` and makes no REST request. Placeholder kept for a future opt-in design; do not use.

```ts

sendFriendRequest(options: UserResolvable): Promise<boolean>

```

- `options: UserResolvable` — Target (User Object, Username, User Id)

**Returns:** `Promise<boolean>`

### `sendGameFriendRequest`

```ts

sendGameFriendRequest(userId: string): Promise<unknown>

```

- `userId: string`

**Returns:** `Promise<unknown>`

### `setNickname`

Changes the nickname of a friend.

```ts

setNickname(user: UserResolvable, nickname: string | null | undefined): Promise<boolean>

```

- `user: UserResolvable` — The user to change the nickname
- `nickname: string | null | undefined` — New nickname

**Returns:** `Promise<boolean>`

### `toJSON`

Return array of cache

```ts

toJSON(): { id: string; nickname: string | null | undefined; since: string; type: RelationshipTypes }[]

```

**Returns:** `{ id: string; nickname: string | null | undefined; since: string; type: RelationshipTypes }[]`

### `unignoreUser`

```ts

unignoreUser(userId: string): Promise<unknown>

```

- `userId: string`

**Returns:** `Promise<unknown>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/RelationshipManager.ts#L18
