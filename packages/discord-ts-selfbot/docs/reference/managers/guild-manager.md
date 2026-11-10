# GuildManager

Manages API methods for Guilds and stores their cache.

```ts

class GuildManager extends CachedManager<Snowflake, Guild, GuildResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, Guild>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<Guild>` · **Modifiers:** readonly

## Methods

### `create`

Creates a guild.

```ts

create(name: string, options?: GuildCreateOptions): Promise<Guild>

```

- `name: string` — The name of the guild
- `options?: GuildCreateOptions` — Options for creating the guild

**Returns:** `Promise<Guild>`

### `fetch`

```ts

fetch(options: string | FetchGuildOptions): Promise<Guild>

```

- `options: string | FetchGuildOptions`

**Returns:** `Promise<Guild>`

```ts

fetch(options?: FetchGuildsOptions): Promise<Collection<string, OAuth2Guild>>

```

- `options?: FetchGuildsOptions`

**Returns:** `Promise<Collection<string, OAuth2Guild>>`

### `resolve`

Resolves a GuildResolvable to a Guild object.

```ts

resolve(resolvable: Guild): Guild

```

- `resolvable: Guild`

**Returns:** `Guild`

Resolves a GuildResolvable to a Guild object.

```ts

resolve(resolvable: GuildResolvable): Guild | null

```

- `resolvable: GuildResolvable`

**Returns:** `Guild | null`

### `resolveId`

Resolves a GuildResolvable to a Guild id string.

```ts

resolveId(resolvable: string | Guild): string

```

- `resolvable: string | Guild`

**Returns:** `string`

Resolves a GuildResolvable to a Guild id string.

```ts

resolveId(resolvable: GuildResolvable): string | null

```

- `resolvable: GuildResolvable`

**Returns:** `string | null`

### `setIncidentActions`

Sets the incident actions for a guild.

```ts

setIncidentActions(guild: GuildResolvable, incidentActions: IncidentActionsEditOptions): Promise<IncidentActions>

```

- `guild: GuildResolvable` — The guild
- `incidentActions: IncidentActionsEditOptions` — The incident actions to set

**Returns:** `Promise<IncidentActions>`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Guild>

```

**Returns:** `Collection<string, Guild>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildManager.ts#L35
