# GuildEmojiRoleManager

Manages API methods for roles belonging to emojis and stores their cache.

```ts

class GuildEmojiRoleManager extends DataManager<Snowflake, Role, RoleResolvable>

```

## Properties

### `cache`

The cache of roles belonging to this emoji

**Type:** `Collection<string, Role>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `emoji`

The emoji belonging to this manager

**Type:** `GuildEmoji`

### `guild`

The guild belonging to this manager

**Type:** `Guild`

### `holds`

**Type:** `Constructable<Role>` · **Modifiers:** readonly

## Methods

### `add`

Adds a role (or multiple roles) to the list of roles that can use this emoji.

```ts

add(roleOrRoles: RoleResolvable | Collection<string, Role> | readonly RoleResolvable[]): Promise<GuildEmoji>

```

- `roleOrRoles: RoleResolvable | Collection<string, Role> | readonly RoleResolvable[]` — The role or roles to add

**Returns:** `Promise<GuildEmoji>`

### `remove`

Removes a role (or multiple roles) from the list of roles that can use this emoji.

```ts

remove(roleOrRoles: RoleResolvable | Collection<string, Role> | readonly RoleResolvable[]): Promise<GuildEmoji>

```

- `roleOrRoles: RoleResolvable | Collection<string, Role> | readonly RoleResolvable[]` — The role or roles to remove

**Returns:** `Promise<GuildEmoji>`

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

Sets the role(s) that can use this emoji.

```ts

set(roles: Collection<string, Role> | readonly RoleResolvable[]): Promise<GuildEmoji>

```

- `roles: Collection<string, Role> | readonly RoleResolvable[]` — The roles or role ids to apply

**Returns:** `Promise<GuildEmoji>`

```ts
// Set the emoji's roles to a single role
guildEmoji.roles.set(['391156570408615936'])
  .then(console.log)
  .catch(console.error);
```

```ts
// Remove all roles from an emoji
guildEmoji.roles.set([])
   .then(console.log)
   .catch(console.error);
```

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, Role>

```

**Returns:** `Collection<string, Role>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildEmojiRoleManager.ts#L15
