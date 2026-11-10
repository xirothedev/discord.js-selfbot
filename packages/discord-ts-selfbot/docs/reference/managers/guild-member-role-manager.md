# GuildMemberRoleManager

Manages API methods for roles of a GuildMember and stores their cache.

```ts

class GuildMemberRoleManager extends DataManager<Snowflake, Role, RoleResolvable>

```

## Properties

### `botRole`

The managed role this member created when joining the guild, if any
Only ever available on bots

**Type:** `Role | null` · **Modifiers:** readonly

### `cache`

The roles of this member

**Type:** `Collection<string, Role>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `color`

The role of the member used to set their color

**Type:** `Role | null` · **Modifiers:** readonly

### `guild`

The Guild this manager belongs to

**Type:** `Guild`

### `highest`

The role of the member with the highest position

**Type:** `Role` · **Modifiers:** readonly

### `hoist`

The role of the member used to hoist them in a separate category in the users list

**Type:** `Role | null` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<Role>` · **Modifiers:** readonly

### `icon`

The role of the member used to set their role icon

**Type:** `Role | null` · **Modifiers:** readonly

### `member`

The GuildMember this manager belongs to

**Type:** `GuildMember`

### `premiumSubscriberRole`

The premium subscriber role of the guild, if present on the member

**Type:** `Role | null` · **Modifiers:** readonly

## Methods

### `add`

Adds a role (or multiple roles) to the member.

Uses the idempotent PUT route for singular roles, otherwise PATCHes the underlying guild member

```ts

add(roleOrRoles: RoleResolvable | Collection<string, Role> | readonly RoleResolvable[], reason?: string): Promise<GuildMember>

```

- `roleOrRoles: RoleResolvable | Collection<string, Role> | readonly RoleResolvable[]` — The role or roles to add
- `reason?: string` — Reason for adding the role(s)

**Returns:** `Promise<GuildMember>`

### `remove`

Removes a role (or multiple roles) from the member.

Uses the idempotent DELETE route for singular roles, otherwise PATCHes the underlying guild member

```ts

remove(roleOrRoles: RoleResolvable | Collection<string, Role> | readonly RoleResolvable[], reason?: string): Promise<GuildMember>

```

- `roleOrRoles: RoleResolvable | Collection<string, Role> | readonly RoleResolvable[]` — The role or roles to remove
- `reason?: string` — Reason for removing the role(s)

**Returns:** `Promise<GuildMember>`

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: Role): Role

```

- `resolvable: Role`

**Returns:** `Role`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: RoleResolvable): Role | null

```

- `resolvable: RoleResolvable`

**Returns:** `Role | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | Role): string

```

- `resolvable: string | Role`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: RoleResolvable): string | null

```

- `resolvable: RoleResolvable`

**Returns:** `string | null`

### `set`

Sets the roles applied to the member.

```ts

set(roles: Collection<string, Role> | readonly RoleResolvable[], reason?: string): Promise<GuildMember>

```

- `roles: Collection<string, Role> | readonly RoleResolvable[]` — The roles or role ids to apply
- `reason?: string` — Reason for applying the roles

**Returns:** `Promise<GuildMember>`

```ts
// Set the member's roles to a single role
guildMember.roles.set(['391156570408615936'])
  .then(console.log)
  .catch(console.error);
```

```ts
// Remove all the roles from a member
guildMember.roles.set([])
  .then(member => console.log(`Member roles is now of ${member.roles.cache.size} size`))
  .catch(console.error);
```

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Role>

```

**Returns:** `Collection<string, Role>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildMemberRoleManager.ts#L15
