# PresenceManager

Manages API methods for Presences and holds their cache.

```ts

class PresenceManager extends CachedManager<Snowflake, Presence, PresenceResolvable>

```

## Properties

### `cache`

The cache of Presences

**Type:** `Collection<string, Presence>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<Presence>` · **Modifiers:** readonly

## Methods

### `fetch`

Fetches the overall user presence for all of the user's non-offline friends and implicit relationships.

```ts

fetch(): Promise<Collection<string, Presence>>

```

**Returns:** `Promise<Collection<string, Presence>>`

### `resolve`

Resolves a PresenceResolvable to a Presence object.

```ts

resolve(resolvable: Presence): Presence

```

- `resolvable: Presence`

**Returns:** `Presence`

Resolves a PresenceResolvable to a Presence object.

```ts

resolve(resolvable: PresenceResolvable): Presence | null

```

- `resolvable: PresenceResolvable`

**Returns:** `Presence | null`

### `resolveId`

Resolves a PresenceResolvable to a Presence id.

```ts

resolveId(resolvable: string | Presence): string

```

- `resolvable: string | Presence`

**Returns:** `string`

Resolves a PresenceResolvable to a Presence id.

```ts

resolveId(resolvable: PresenceResolvable): string | null

```

- `resolvable: PresenceResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Presence>

```

**Returns:** `Collection<string, Presence>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/PresenceManager.ts#L12
