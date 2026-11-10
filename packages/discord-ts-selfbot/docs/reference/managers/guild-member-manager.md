# GuildMemberManager

Manages API methods for GuildMembers and stores their cache.

```ts

class GuildMemberManager extends CachedManager<Snowflake, GuildMember, GuildMemberResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, GuildMember>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<GuildMember>` · **Modifiers:** readonly

### `me`

The client user as a GuildMemberType of this guild

**Type:** `unknown`

## Methods

### `add`

Adds a user to the guild using OAuth2. Requires the `CREATE_INSTANT_INVITE` permission.

```ts

add(user: UserResolvable, options: AddGuildMemberOptions & { fetchWhenExisting: false }): Promise<GuildMember | null>

```

- `user: UserResolvable` — The user to add to the guild
- `options: AddGuildMemberOptions & { fetchWhenExisting: false }` — Options for adding the user to the guild

**Returns:** `Promise<GuildMember | null>`

Adds a user to the guild using OAuth2. Requires the `CREATE_INSTANT_INVITE` permission.

```ts

add(user: UserResolvable, options: AddGuildMemberOptions): Promise<GuildMember>

```

- `user: UserResolvable` — The user to add to the guild
- `options: AddGuildMemberOptions` — Options for adding the user to the guild

**Returns:** `Promise<GuildMember>`

### `addRole`

Adds a role to a member.

```ts

addRole(user: UserResolvable, role: RoleResolvable, reason?: string): Promise<string | GuildMember | User>

```

- `user: UserResolvable` — The user to add the role from
- `role: RoleResolvable` — The role to add
- `reason?: string` — Reason for adding the role

**Returns:** `Promise<string | GuildMember | User>`

### `ban`

Bans a user from the guild.

```ts

ban(user: UserResolvable, options?: BanOptions): Promise<string | GuildMember | User>

```

- `user: UserResolvable` — The user to ban
- `options?: BanOptions` — Options for the ban

**Returns:** `Promise<string | GuildMember | User>`

```ts
// Ban a user by id (or with a user/guild member object)
guild.members.ban('84484653687267328')
  .then(banInfo => console.log(`Banned ${banInfo.user?.tag ?? banInfo.tag ?? banInfo}`))
  .catch(console.error);
```

### `bulkBan`

Bulk ban users from a guild, and optionally delete previous messages sent by them.

> **Deprecated.** This method will not be usable until an effective MFA implementation is in place.

```ts

bulkBan(users: Collection<string, UserResolvable> | readonly UserResolvable[], options?: BulkBanOptions): Promise<BulkBanResult>

```

- `users: Collection<string, UserResolvable> | readonly UserResolvable[]` — The users to ban
- `options?: BulkBanOptions` — The options for bulk banning users

**Returns:** `Promise<BulkBanResult>`

```ts
// Bulk ban users by ids (or with user/guild member objects) and delete all their messages from the past 7 days
guild.members.bulkBan(['84484653687267328'], { deleteMessageSeconds: 7 * 24 * 60 * 60 })
  .then(result => {
    console.log(`Banned ${result.bannedUsers.length} users, failed to ban ${result.failedUsers.length} users.`)
  })
  .catch(console.error);
```

### `edit`

Edits a member of the guild.
The user must be a member of the guild

```ts

edit(user: UserResolvable, data: GuildMemberEditData, reason?: string): Promise<GuildMember>

```

- `user: UserResolvable` — The member to edit
- `data: GuildMemberEditData` — The data to edit the member with
- `reason?: string` — Reason for editing this user

**Returns:** `Promise<GuildMember>`

### `fetch`

```ts

fetch(options: UserResolvable | FetchMemberOptions | FetchMembersOptions & { user: UserResolvable }): Promise<GuildMember>

```

- `options: UserResolvable | FetchMemberOptions | FetchMembersOptions & { user: UserResolvable }`

**Returns:** `Promise<GuildMember>`

```ts

fetch(options?: FetchMembersOptions): Promise<Collection<string, GuildMember>>

```

- `options?: FetchMembersOptions`

**Returns:** `Promise<Collection<string, GuildMember>>`

### `fetchByMemberSafety`

Experimental method to fetch members from the guild.
Lists up to 10000 members of the guild.

```ts

fetchByMemberSafety(timeout?: number): Promise<Collection<string, GuildMember>>

```

- `timeout?: number` — Timeout for receipt of members in ms

**Returns:** `Promise<Collection<string, GuildMember>>`

### `fetchMe`

Fetches the client user as a GuildMemberType of the guild.

```ts

fetchMe(options?: BaseFetchOptions): Promise<GuildMember>

```

- `options?: BaseFetchOptions` — The options for fetching the member

**Returns:** `Promise<GuildMember>`

### `kick`

Kicks a user from the guild.
The user must be a member of the guild

```ts

kick(user: UserResolvable, reason?: string): Promise<string | GuildMember | User>

```

- `user: UserResolvable` — The member to kick
- `reason?: string` — Reason for kicking

**Returns:** `Promise<string | GuildMember | User>`

```ts
// Kick a user by id (or with a user/guild member object)
guild.members.kick('84484653687267328')
  .then(kickInfo => console.log(`Kicked ${kickInfo.user?.tag ?? kickInfo.tag ?? kickInfo}`))
  .catch(console.error);
```

### `prune`

Prunes members from the guild based on how long they have been inactive.

```ts

prune(options: GuildPruneMembersOptions & { count: false; dry?: false }): Promise<null>

```

- `options: GuildPruneMembersOptions & { count: false; dry?: false }` — Options for pruning

**Returns:** `Promise<null>`

```ts
// See how many members will be pruned
guild.members.prune({ dry: true })
  .then(pruned => console.log(`This will prune ${pruned} people!`))
  .catch(console.error);
```

```ts
// Actually prune the members
guild.members.prune({ days: 1, reason: 'too many people!' })
  .then(pruned => console.log(`I just pruned ${pruned} people!`))
  .catch(console.error);
```

```ts
// Include members with a specified role
guild.members.prune({ days: 7, roles: ['657259391652855808'] })
   .then(pruned => console.log(`I just pruned ${pruned} people!`))
   .catch(console.error);
```

Prunes members from the guild based on how long they have been inactive.

```ts

prune(options?: GuildPruneMembersOptions): Promise<number>

```

- `options?: GuildPruneMembersOptions` — Options for pruning

**Returns:** `Promise<number>`

```ts
// See how many members will be pruned
guild.members.prune({ dry: true })
  .then(pruned => console.log(`This will prune ${pruned} people!`))
  .catch(console.error);
```

```ts
// Actually prune the members
guild.members.prune({ days: 1, reason: 'too many people!' })
  .then(pruned => console.log(`I just pruned ${pruned} people!`))
  .catch(console.error);
```

```ts
// Include members with a specified role
guild.members.prune({ days: 7, roles: ['657259391652855808'] })
   .then(pruned => console.log(`I just pruned ${pruned} people!`))
   .catch(console.error);
```

### `removeRole`

Removes a role from a member.

```ts

removeRole(user: UserResolvable, role: RoleResolvable, reason?: string): Promise<string | GuildMember | User>

```

- `user: UserResolvable` — The user to remove the role from
- `role: RoleResolvable` — The role to remove
- `reason?: string` — Reason for removing the role

**Returns:** `Promise<string | GuildMember | User>`

### `resolve`

Resolves a GuildMemberResolvable to a GuildMemberType object.

```ts

resolve(resolvable: GuildMember): GuildMember

```

- `resolvable: GuildMember`

**Returns:** `GuildMember`

Resolves a GuildMemberResolvable to a GuildMemberType object.

```ts

resolve(resolvable: GuildMemberResolvable): GuildMember | null

```

- `resolvable: GuildMemberResolvable`

**Returns:** `GuildMember | null`

### `resolveId`

Resolves a GuildMemberResolvable to a member id.

```ts

resolveId(resolvable: string | GuildMember): string

```

- `resolvable: string | GuildMember`

**Returns:** `string`

Resolves a GuildMemberResolvable to a member id.

```ts

resolveId(resolvable: GuildMemberResolvable): string | null

```

- `resolvable: GuildMemberResolvable`

**Returns:** `string | null`

### `search`

Searches for members in the guild based on a query.

```ts

search(options: GuildSearchMembersOptions): Promise<Collection<string, GuildMember>>

```

- `options: GuildSearchMembersOptions` — Options for searching members

**Returns:** `Promise<Collection<string, GuildMember>>`

### `unban`

Unbans a user from the guild. Internally calls the GuildBanManager#remove method.

```ts

unban(user: UserResolvable, reason?: string): Promise<User | null>

```

- `user: UserResolvable` — The user to unban
- `reason?: string` — Reason for unbanning user

**Returns:** `Promise<User | null>`

```ts
// Unban a user by id (or with a user/guild member object)
guild.members.unban('84484653687267328')
  .then(user => console.log(`Unbanned ${user.username} from ${guild.name}`))
  .catch(console.error);
```

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, GuildMember>

```

**Returns:** `Collection<string, GuildMember>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildMemberManager.ts#L30
