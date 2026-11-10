# PermissionOverwrites

Represents a permission overwrite for a role or member in a guild channel.

```ts

class PermissionOverwrites extends Base

```

## Properties

### `allow`

The permissions that are allowed for the user or role.

**Type:** `Readonly<Permissions>`

### `channel`

The GuildChannel this overwrite is for

**Type:** `NonThreadGuildBasedChannel` · **Modifiers:** readonly

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `deny`

The permissions that are denied for the user or role.

**Type:** `Readonly<Permissions>`

### `id`

The overwrite's id, either a User or a Role id

**Type:** `string`

### `type`

**Type:** `OverwriteType`

## Methods

### `delete`

Deletes this Permission Overwrite.

```ts

delete(reason?: string): Promise<PermissionOverwrites>

```

- `reason?: string` — Reason for deleting this overwrite

**Returns:** `Promise<PermissionOverwrites>`

### `edit`

Edits this Permission Overwrite.

```ts

edit(options: PermissionOverwriteOptions, reason?: string): Promise<PermissionOverwrites>

```

- `options: PermissionOverwriteOptions` — The options for the update
- `reason?: string` — Reason for creating/editing this overwrite

**Returns:** `Promise<PermissionOverwrites>`

```ts
// Update permission overwrites
permissionOverwrites.edit({
  SEND_MESSAGES: false
})
  .then(channel => console.log(channel.permissionOverwrites.get(message.author.id)))
  .catch(console.error);
```

### `resolve`

Resolves an overwrite into RawOverwriteData.

```ts

static resolve(overwrite: OverwriteResolvable, guild: Guild): APIOverwrite

```

- `overwrite: OverwriteResolvable` — The overwrite-like data to resolve
- `guild: Guild` — The guild to resolve from

**Returns:** `APIOverwrite`

### `resolveOverwriteOptions`

Resolves bitfield permissions overwrites from an object.

```ts

static resolveOverwriteOptions(options: PermissionOverwriteOptions, initialPermissions: { allow?: PermissionResolvable; deny?: PermissionResolvable }): ResolvedOverwriteOptions

```

- `options: PermissionOverwriteOptions` — The options for the update
- `initialPermissions: { allow?: PermissionResolvable; deny?: PermissionResolvable }` — The initial permissions

**Returns:** `ResolvedOverwriteOptions`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/PermissionOverwrites.ts#L17
