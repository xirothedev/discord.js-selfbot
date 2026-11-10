# ApplicationCommandPermissionsManager

Manages API methods for permissions of Application Commands.

```ts

class ApplicationCommandPermissionsManager extends BaseManager

```

## Properties

### `client`

The client that instantiated this Manager

**Type:** `Client`

### `commandId`

**Type:** `CommandIdType`

### `guild`

The guild that this manager acts on

**Type:** `GuildType`

### `guildId`

The id of the guild that this manager acts on

**Type:** `string | null`

## Methods

### `add`

Add permissions to a command.

```ts

add(options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] }): Promise<ApplicationCommandPermissions[]>

```

- `options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] }` — Options used to add permissions

**Returns:** `Promise<ApplicationCommandPermissions[]>`

```ts
// Block a role from the command permissions
guild.commands.permissions.add({ command: '123456789012345678', permissions: [
  {
    id: '876543211234567890',
    type: 'ROLE',
    permission: false
  },
]})
  .then(console.log)
  .catch(console.error);
```

### `fetch`

```ts

fetch(options: FetchSingleOptions): Promise<ApplicationCommandPermissions[]>

```

- `options: FetchSingleOptions`

**Returns:** `Promise<ApplicationCommandPermissions[]>`

```ts

fetch(options: BaseOptions): Promise<Collection<string, ApplicationCommandPermissions[]>>

```

- `options: BaseOptions`

**Returns:** `Promise<Collection<string, ApplicationCommandPermissions[]>>`

### `has`

Check whether a permission exists for a user or role

```ts

has(options: FetchSingleOptions & { permissionId: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean> }): Promise<boolean>

```

- `options: FetchSingleOptions & { permissionId: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean> }` — Options used to check permissions

**Returns:** `Promise<boolean>`

```ts
// Check whether a user has permission to use a command
guild.commands.permissions.has({ command: '123456789012345678', permissionId: '876543210123456789' })
 .then(console.log)
 .catch(console.error);
```

### `remove`

Remove permissions from a command.

```ts

remove(options: FetchSingleOptions & { roles?: RoleResolvable | RoleResolvable[]; users: UserResolvable | UserResolvable[] } | FetchSingleOptions & { roles: RoleResolvable | RoleResolvable[]; users?: UserResolvable | UserResolvable[] }): Promise<ApplicationCommandPermissions[]>

```

- `options: FetchSingleOptions & { roles?: RoleResolvable | RoleResolvable[]; users: UserResolvable | UserResolvable[] } | FetchSingleOptions & { roles: RoleResolvable | RoleResolvable[]; users?: UserResolvable | UserResolvable[] }` — Options used to remove permissions

**Returns:** `Promise<ApplicationCommandPermissions[]>`

```ts
// Remove a user permission from this command
guild.commands.permissions.remove({ command: '123456789012345678', users: '876543210123456789' })
  .then(console.log)
  .catch(console.error);
```

```ts
// Remove multiple roles from this command
guild.commands.permissions.remove({
  command: '123456789012345678', roles: ['876543210123456789', '765432101234567890']
})
   .then(console.log)
   .catch(console.error);
```

### `set`

```ts

set(options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] }): Promise<ApplicationCommandPermissions[]>

```

- `options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] }`

**Returns:** `Promise<ApplicationCommandPermissions[]>`

```ts

set(options: FullPermissionsOptions & { fullPermissions: GuildApplicationCommandPermissionData[] }): Promise<Collection<string, ApplicationCommandPermissions[]>>

```

- `options: FullPermissionsOptions & { fullPermissions: GuildApplicationCommandPermissionData[] }`

**Returns:** `Promise<Collection<string, ApplicationCommandPermissions[]>>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/ApplicationCommandPermissionsManager.ts#L15
