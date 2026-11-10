# SessionManager

Manages API methods for users and stores their cache.

```ts

class SessionManager extends CachedManager<string, Session, any>

```

## Properties

### `cache`

The cache of Sessions

**Type:** `Collection<string, Session>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `currentSession`

Get the current session of the client.
You must call `fetch()` first to populate the cache.

**Type:** `Session | null` · **Modifiers:** readonly

### `currentSessionIdHash`

The current session ID hash of the client.

**Type:** `string | null`

### `holds`

**Type:** `Constructable<Session>` · **Modifiers:** readonly

## Methods

### `fetch`

Fetch all sessions of the client.

```ts

fetch(): Promise<Collection<string, Session>>

```

**Returns:** `Promise<Collection<string, Session>>`

### `logoutAllDevices`

Logout all client (remote).

```ts

logoutAllDevices(): Promise<void>

```

**Returns:** `Promise<void>`

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: Session): Session

```

- `resolvable: Session`

**Returns:** `Session`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: any): Session | null

```

- `resolvable: any`

**Returns:** `Session | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | Session): string

```

- `resolvable: string | Session`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: any): string | null

```

- `resolvable: any`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Session>

```

**Returns:** `Collection<string, Session>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/SessionManager.ts#L11
