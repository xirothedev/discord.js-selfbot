# GuildScheduledEventManager

Manages API methods for GuildScheduledEvents and stores their cache.

```ts

class GuildScheduledEventManager extends CachedManager<Snowflake, GuildScheduledEvent, GuildScheduledEventResolvable>

```

## Properties

### `cache`

The cache of this manager

**Type:** `Collection<string, GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">>` · **Modifiers:** readonly

## Methods

### `create`

Creates a new guild scheduled event.

```ts

create(options: GuildScheduledEventCreateOptions): Promise<GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">>

```

- `options: GuildScheduledEventCreateOptions` — Options for creating the guild scheduled event

**Returns:** `Promise<GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">>`

### `delete`

Deletes a guild scheduled event.

```ts

delete(guildScheduledEvent: GuildScheduledEventResolvable): Promise<void>

```

- `guildScheduledEvent: GuildScheduledEventResolvable` — The guild scheduled event to delete

**Returns:** `Promise<void>`

### `edit`

Edits a guild scheduled event.

```ts

edit<S extends "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED", T extends "ACTIVE" | "COMPLETED" | "CANCELED">(guildScheduledEvent: GuildScheduledEventResolvable, options: GuildScheduledEventEditOptions<S, T>): Promise<GuildScheduledEvent<T>>

```

- `guildScheduledEvent: GuildScheduledEventResolvable` — The guild scheduled event to edit
- `options: GuildScheduledEventEditOptions<S, T>` — Options to edit the guild scheduled event

**Returns:** `Promise<GuildScheduledEvent<T>>`

### `fetch`

```ts

fetch(): Promise<Collection<string, GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">>>

```

**Returns:** `Promise<Collection<string, GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">>>`

```ts

fetch<T extends GuildScheduledEventResolvable | FetchGuildScheduledEventOptions | FetchGuildScheduledEventsOptions>(options?: T): Promise<GuildScheduledEventManagerFetchResult<T>>

```

- `options?: T`

**Returns:** `Promise<GuildScheduledEventManagerFetchResult<T>>`

### `fetchSubscribers`

Fetches subscribers of a guild scheduled event.

```ts

fetchSubscribers<T extends FetchGuildScheduledEventSubscribersOptions>(guildScheduledEvent: GuildScheduledEventResolvable, options?: T): Promise<GuildScheduledEventManagerFetchSubscribersResult<T>>

```

- `guildScheduledEvent: GuildScheduledEventResolvable` — The guild scheduled event to fetch subscribers of
- `options?: T` — Options for fetching the subscribers

**Returns:** `Promise<GuildScheduledEventManagerFetchSubscribersResult<T>>`

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: GuildScheduledEvent): GuildScheduledEvent

```

- `resolvable: GuildScheduledEvent`

**Returns:** `GuildScheduledEvent`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: GuildScheduledEventResolvable): GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED"> | null

```

- `resolvable: GuildScheduledEventResolvable`

**Returns:** `GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED"> | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">): string

```

- `resolvable: string | GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: GuildScheduledEventResolvable): string | null

```

- `resolvable: GuildScheduledEventResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">>

```

**Returns:** `Collection<string, GuildScheduledEvent<"SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELED">>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildScheduledEventManager.ts#L25
