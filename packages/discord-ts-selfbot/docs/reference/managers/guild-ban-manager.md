# GuildBanManager

Manages API methods for GuildBans and stores their cache.

```ts

class GuildBanManager extends CachedManager<Snowflake, GuildBan, GuildBanResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, GuildBan>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this Manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<GuildBan>` · **Modifiers:** readonly

## Methods

### `bulkCreate`

Bulk ban users from a guild, and optionally delete previous messages sent by them.

> **Deprecated.** This method will not be usable until an effective MFA implementation is in place.

```ts

bulkCreate(users: Collection<string, UserResolvable> | readonly UserResolvable[], options?: BulkBanOptions): Promise<BulkBanResult>

```

- `users: Collection<string, UserResolvable> | readonly UserResolvable[]` — The users to ban
- `options?: BulkBanOptions` — The options for bulk banning users

**Returns:** `Promise<BulkBanResult>`

```ts
// Bulk ban users by ids (or with user/guild member objects) and delete all their messages from the past 7 days
guild.bans.bulkCreate(['84484653687267328'], { deleteMessageSeconds: 7 * 24 * 60 * 60 })
  .then(result => {
    console.log(`Banned ${result.bannedUsers.length} users, failed to ban ${result.failedUsers.length} users.`)
  })
  .catch(console.error);
```

### `create`

Bans a user from the guild.

```ts

create(user: UserResolvable, options?: BanOptions): Promise<string | GuildMember | User>

```

- `user: UserResolvable` — The user to ban
- `options?: BanOptions` — Options for the ban

**Returns:** `Promise<string | GuildMember | User>`

```ts
// Ban a user by id (or with a user/guild member object)
guild.bans.create('84484653687267328')
  .then(banInfo => console.log(`Banned ${banInfo.user?.tag ?? banInfo.tag ?? banInfo}`))
  .catch(console.error);
```

### `fetch`

```ts

fetch(options: UserResolvable | FetchBanOptions): Promise<GuildBan>

```

- `options: UserResolvable | FetchBanOptions`

**Returns:** `Promise<GuildBan>`

```ts

fetch(options?: FetchBansOptions): Promise<Collection<string, GuildBan>>

```

- `options?: FetchBansOptions`

**Returns:** `Promise<Collection<string, GuildBan>>`

### `remove`

Unbans a user from the guild.

```ts

remove(user: UserResolvable, reason?: string): Promise<User | null>

```

- `user: UserResolvable` — The user to unban
- `reason?: string` — Reason for unbanning user

**Returns:** `Promise<User | null>`

```ts
// Unban a user by id (or with a user/guild member object)
guild.bans.remove('84484653687267328')
  .then(user => console.log(`Unbanned ${user.username} from ${guild.name}`))
  .catch(console.error);
```

### `resolve`

Resolves a GuildBanResolvable to a GuildBan object.

```ts

resolve(resolvable: GuildBan): GuildBan

```

- `resolvable: GuildBan`

**Returns:** `GuildBan`

Resolves a GuildBanResolvable to a GuildBan object.

```ts

resolve(resolvable: GuildBanResolvable): GuildBan | null

```

- `resolvable: GuildBanResolvable`

**Returns:** `GuildBan | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | GuildBan): string

```

- `resolvable: string | GuildBan`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: GuildBanResolvable): string | null

```

- `resolvable: GuildBanResolvable`

**Returns:** `string | null`

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, GuildBan>

```

**Returns:** `Collection<string, GuildBan>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildBanManager.ts#L27
