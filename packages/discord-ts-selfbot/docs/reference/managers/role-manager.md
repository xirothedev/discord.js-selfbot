# RoleManager

Manages API methods for roles and stores their cache.

```ts

class RoleManager extends CachedManager<Snowflake, Role, RoleResolvable>

```

## Properties

### `cache`

The role cache of this manager

**Type:** `Collection<string, Role>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `everyone`

The `@everyone` role of the guild

**Type:** `Role` · **Modifiers:** readonly

### `guild`

The guild belonging to this manager

**Type:** `Guild`

### `highest`

The role with the highest position in the cache

**Type:** `Role` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<Role>` · **Modifiers:** readonly

### `premiumSubscriberRole`

The premium subscriber role of the guild, if any

**Type:** `Role | null` · **Modifiers:** readonly

## Methods

### `botRoleFor`

Gets the managed role a user created when joining the guild, if any
Only ever available for bots

```ts

botRoleFor(user: UserResolvable): Role | null

```

- `user: UserResolvable` — The user to access the bot role for

**Returns:** `Role | null`

### `comparePositions`

Compares the positions of two roles.

```ts

comparePositions(role1: RoleResolvable, role2: RoleResolvable): number

```

- `role1: RoleResolvable` — First role to compare
- `role2: RoleResolvable` — Second role to compare

**Returns:** `number`

### `create`

Creates a new role in the guild with given information.
The position will silently reset to 1 if an invalid one is provided, or none.

```ts

create(options?: CreateRoleOptions): Promise<Role>

```

- `options?: CreateRoleOptions` — Options for creating the new role

**Returns:** `Promise<Role>`

```ts
// Create a new role
guild.roles.create()
  .then(console.log)
  .catch(console.error);
```

```ts
// Create a new role with data and a reason
guild.roles.create({
  name: 'Super Cool Blue People',
  colors: {
    primaryColor: 'BLUE',
  },
  reason: 'we needed a role for Super Cool People',
})
  .then(console.log)
  .catch(console.error);
```

```ts
// Create a role with holographic colors
guild.roles.create({
  name: 'Holographic Role',
  reason: 'Creating a role with holographic effect',
  colors: {
    primaryColor: Constants.HolographicStyles.PRIMARY,
    secondaryColor: Constants.HolographicStyles.SECONDARY,
    tertiaryColor: Constants.HolographicStyles.TERTIARY,
  },
})
  .then(console.log)
  .catch(console.error);
```

### `delete`

Deletes a role.

```ts

delete(role: RoleResolvable, reason?: string): Promise<void>

```

- `role: RoleResolvable` — The role to delete
- `reason?: string` — Reason for deleting the role

**Returns:** `Promise<void>`

```ts
// Delete a role
guild.roles.delete('222079219327434752', 'The role needed to go')
  .then(() => console.log('Deleted the role.'))
  .catch(console.error);
```

### `edit`

Edits a role of the guild.

```ts

edit(role: RoleResolvable, options: RoleData, reason?: string): Promise<Role>

```

- `role: RoleResolvable` — The role to edit
- `options: RoleData`
- `reason?: string` — Reason for editing this role

**Returns:** `Promise<Role>`

```ts
// Edit a role
guild.roles.edit('222079219327434752', { name: 'buddies' })
  .then(updated => console.log(`Edited role name to ${updated.name}`))
  .catch(console.error);
```

### `fetch`

```ts

fetch(id: string, options?: BaseFetchOptions): Promise<Role | null>

```

- `id: string`
- `options?: BaseFetchOptions`

**Returns:** `Promise<Role | null>`

```ts

fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<string, Role>>

```

- `id?: undefined`
- `options?: BaseFetchOptions`

**Returns:** `Promise<Collection<string, Role>>`

### `fetchMemberCounts`

Fetches the member counts for each role in the guild.

```ts

fetchMemberCounts(): Promise<Record<string, number>>

```

**Returns:** `Promise<Record<string, number>>`

### `fetchMemberIds`

Fetches the member ids for a role in the guild.
This only returns 100 member ids

```ts

fetchMemberIds(role: RoleResolvable): Promise<string[]>

```

- `role: RoleResolvable` — The role to fetch member ids for

**Returns:** `Promise<string[]>`

### `resolve`

Resolves a RoleResolvable to a Role object.

```ts

resolve(resolvable: Role): Role

```

- `resolvable: Role`

**Returns:** `Role`

Resolves a RoleResolvable to a Role object.

```ts

resolve(resolvable: RoleResolvable): Role | null

```

- `resolvable: RoleResolvable`

**Returns:** `Role | null`

### `resolveId`

Resolves a RoleResolvable to a Role id.

```ts

resolveId(resolvable: string | Role): string

```

- `resolvable: string | Role`

**Returns:** `string`

Resolves a RoleResolvable to a Role id.

```ts

resolveId(resolvable: RoleResolvable): string | null

```

- `resolvable: RoleResolvable`

**Returns:** `string | null`

### `setPosition`

Sets the new position of the role.

```ts

setPosition(role: RoleResolvable, position: number, options?: SetRolePositionOptions): Promise<Role>

```

- `role: RoleResolvable` — The role to change the position of
- `position: number` — The new position for the role
- `options?: SetRolePositionOptions` — Options for setting the position

**Returns:** `Promise<Role>`

```ts
// Set the position of the role
guild.roles.setPosition('222197033908436994', 1)
  .then(updated => console.log(`Role position: ${updated.position}`))
  .catch(console.error);
```

### `setPositions`

Batch-updates the guild's role positions

```ts

setPositions(rolePositions: readonly RolePosition[]): Promise<Guild>

```

- `rolePositions: readonly RolePosition[]` — Role positions to update

**Returns:** `Promise<Guild>`

```ts
guild.roles.setPositions([{ role: roleId, position: updatedRoleIndex }])
 .then(guild => console.log(`Role positions updated for ${guild}`))
 .catch(console.error);
```

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Role>

```

**Returns:** `Collection<string, Role>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/RoleManager.ts#L24
