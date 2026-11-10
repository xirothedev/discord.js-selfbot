# Role

Represents a role on Discord.

```ts

class Role extends Base

```

## Properties

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `color`

The base 10 color of the role

**Type:** `number`

### `colors`

**Type:** `RoleColors`

### `createdAt`

The time the role was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the role was created at

**Type:** `number` · **Modifiers:** readonly

### `deleted`

Whether or not the role has been deleted

**Type:** `boolean`

### `editable`

Whether the role is editable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `flags`

The flags of this role

**Type:** `Readonly<RoleFlags>`

### `guild`

The guild that the role belongs to

**Type:** `Guild`

### `hexColor`

The hexadecimal version of the role color, with a leading hashtag

**Type:** ``${string}`` · **Modifiers:** readonly

### `hoist`

If true, users that are part of this role will appear in a separate category in the users list

**Type:** `boolean`

### `icon`

The icon hash of the role

**Type:** `string | null`

### `id`

The role's id (unique to the guild it is part of)

**Type:** `string`

### `managed`

Whether or not the role is managed by an external service

**Type:** `boolean`

### `members`

The cached guild members that have this role

**Type:** `Collection<string, GuildMember>` · **Modifiers:** readonly

### `mentionable`

Whether or not the role can be mentioned by anyone

**Type:** `boolean`

### `name`

The name of the role

**Type:** `string`

### `permissions`

The permissions of the role

**Type:** `Readonly<Permissions>`

### `position`

The position of the role in the role manager

**Type:** `number` · **Modifiers:** readonly

### `rawPosition`

The raw position of the role from the API

**Type:** `number`

### `tags`

**Type:** `RoleTagData | null`

### `unicodeEmoji`

The unicode emoji for the role

**Type:** `string | null`

## Methods

### `comparePositions`

Compares the positions of two roles.

> **Deprecated.** Use RoleManager.comparePositions instead.

```ts

static comparePositions(role1: Role, role2: Role): number

```

- `role1: Role` — First role to compare
- `role2: Role` — Second role to compare

**Returns:** `number`

### `comparePositionTo`

Compares this role's position to another role's.

```ts

comparePositionTo(role: RoleResolvable): number

```

- `role: RoleResolvable` — Role to compare to this one

**Returns:** `number`

```ts
// Compare the position of a role to another
const roleCompare = role.comparePositionTo(otherRole);
if (roleCompare >= 1) console.log(`${role.name} is higher than ${otherRole.name}`);
```

### `delete`

Deletes the role.

```ts

delete(reason?: string): Promise<Role>

```

- `reason?: string` — Reason for deleting this role

**Returns:** `Promise<Role>`

```ts
// Delete a role
role.delete('The role needed to go')
  .then(deleted => console.log(`Deleted role ${deleted.name}`))
  .catch(console.error);
```

### `edit`

Edits the role.

```ts

edit(data: RoleData, reason?: string): Promise<Role>

```

- `data: RoleData` — The new data for the role
- `reason?: string` — Reason for editing this role

**Returns:** `Promise<Role>`

```ts
// Edit a role
role.edit({ name: 'new role' })
  .then(updated => console.log(`Edited role name to ${updated.name}`))
  .catch(console.error);
```

### `equals`

Whether this role equals another role. It compares all properties, so for most operations
it is advisable to just compare `role.id === role2.id` as it is much faster and is often
what most users need.

```ts

equals(role: Role): boolean

```

- `role: Role` — Role to compare with

**Returns:** `boolean`

### `fetchMemberIds`

Fetches the member ids for this role in the guild.
This only returns 100 member ids

```ts

fetchMemberIds(): Promise<string[]>

```

**Returns:** `Promise<string[]>`

### `iconURL`

A link to the role's icon

```ts

iconURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the image URL

**Returns:** `string | null`

### `permissionsIn`

Returns `channel.permissionsFor(role)`. Returns permissions for a role in a guild channel,
taking into account permission overwrites.

```ts

permissionsIn(channel: string | NonThreadGuildBasedChannel, checkAdmin?: boolean): Readonly<Permissions>

```

- `channel: string | NonThreadGuildBasedChannel` — The guild channel to use as context
- `checkAdmin?: boolean` — Whether having `ADMINISTRATOR` will return all permissions

**Returns:** `Readonly<Permissions>`

### `setColor`

Sets a new color for the role.

> **Deprecated.** Use Role.setColors instead.

```ts

setColor(color: ColorResolvable, reason?: string): Promise<Role>

```

- `color: ColorResolvable` — The color of the role
- `reason?: string` — Reason for changing the role's color

**Returns:** `Promise<Role>`

### `setColors`

Sets new colors for the role.

```ts

setColors(colors: RoleColorsResolvable, reason?: string): Promise<Role>

```

- `colors: RoleColorsResolvable` — The colors of the role
- `reason?: string` — Reason for changing the role's colors

**Returns:** `Promise<Role>`

```ts
// Set the colors of a role
role.setColors({ primaryColor: '#FF0000', secondaryColor: '#00FF00', tertiaryColor: '#0000FF' })
  .then(updated => console.log(`Set colors of role to ${updated.colors}`))
  .catch(console.error);
```

```ts
// Set holographic colors using constants
role.setColors({
  primaryColor: Constants.HolographicStyle.Primary,
  secondaryColor: Constants.HolographicStyle.Secondary,
  tertiaryColor: Constants.HolographicStyle.Tertiary,
})
  .then(updated => console.log(`Set holographic colors for role ${updated.name}`))
  .catch(console.error);
```

### `setHoist`

Sets whether or not the role should be hoisted.

```ts

setHoist(hoist?: boolean, reason?: string): Promise<Role>

```

- `hoist?: boolean` — Whether or not to hoist the role
- `reason?: string` — Reason for setting whether or not the role should be hoisted

**Returns:** `Promise<Role>`

```ts
// Set the hoist of the role
role.setHoist(true)
  .then(updated => console.log(`Role hoisted: ${updated.hoist}`))
  .catch(console.error);
```

### `setIcon`

Sets a new icon for the role.

```ts

setIcon(icon: string | GuildEmoji | ReactionEmoji | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null, reason?: string): Promise<Role>

```

- `icon: string | GuildEmoji | ReactionEmoji | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The icon for the role The `EmojiResolvable` should belong to the same guild as the role. If not, pass the emoji's URL directly
- `reason?: string` — Reason for changing the role's icon

**Returns:** `Promise<Role>`

### `setMentionable`

Sets whether this role is mentionable.

```ts

setMentionable(mentionable?: boolean, reason?: string): Promise<Role>

```

- `mentionable?: boolean` — Whether this role should be mentionable
- `reason?: string` — Reason for setting whether or not this role should be mentionable

**Returns:** `Promise<Role>`

```ts
// Make the role mentionable
role.setMentionable(true)
  .then(updated => console.log(`Role updated ${updated.name}`))
  .catch(console.error);
```

### `setName`

Sets a new name for the role.

```ts

setName(name: string, reason?: string): Promise<Role>

```

- `name: string` — The new name of the role
- `reason?: string` — Reason for changing the role's name

**Returns:** `Promise<Role>`

```ts
// Set the name of the role
role.setName('new role')
  .then(updated => console.log(`Updated role name to ${updated.name}`))
  .catch(console.error);
```

### `setPermissions`

Sets the permissions of the role.

```ts

setPermissions(permissions: PermissionResolvable, reason?: string): Promise<Role>

```

- `permissions: PermissionResolvable` — The permissions of the role
- `reason?: string` — Reason for changing the role's permissions

**Returns:** `Promise<Role>`

```ts
// Set the permissions of the role
role.setPermissions([Permissions.FLAGS.KICK_MEMBERS, Permissions.FLAGS.BAN_MEMBERS])
  .then(updated => console.log(`Updated permissions to ${updated.permissions.bitfield}`))
  .catch(console.error);
```

```ts
// Remove all permissions from a role
role.setPermissions(0n)
  .then(updated => console.log(`Updated permissions to ${updated.permissions.bitfield}`))
  .catch(console.error);
```

### `setPosition`

Sets the new position of the role.

```ts

setPosition(position: number, options?: SetRolePositionOptions): Promise<Role>

```

- `position: number` — The new position for the role
- `options?: SetRolePositionOptions` — Options for setting the position

**Returns:** `Promise<Role>`

```ts
// Set the position of the role
role.setPosition(1)
  .then(updated => console.log(`Role position: ${updated.position}`))
  .catch(console.error);
```

### `setUnicodeEmoji`

Sets a new unicode emoji for the role.

```ts

setUnicodeEmoji(unicodeEmoji: string | null, reason?: string): Promise<Role>

```

- `unicodeEmoji: string | null` — The new unicode emoji for the role
- `reason?: string` — Reason for changing the role's unicode emoji

**Returns:** `Promise<Role>`

```ts
// Set a new unicode emoji for the role
role.setUnicodeEmoji('🤖')
  .then(updated => console.log(`Set unicode emoji for the role to ${updated.unicodeEmoji}`))
  .catch(console.error);
```

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): RoleMention

```

**Returns:** `RoleMention`

```ts
// Logs: Role: <@&123456789012345678>
console.log(`Role: ${role}`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Role.ts#L25
