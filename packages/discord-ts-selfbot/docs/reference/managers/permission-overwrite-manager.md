# PermissionOverwriteManager

Manages API methods for guild channel permission overwrites and stores their cache.

```ts

class PermissionOverwriteManager extends CachedManager<Snowflake, PermissionOverwrites, PermissionOverwriteResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, PermissionOverwrites>` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `holds`

**Type:** `Constructable<PermissionOverwrites>` · **Modifiers:** readonly

## Methods

### `create`

Creates permission overwrites for a user or role in this channel, or replaces them if already present.

```ts

create(userOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>, options: PermissionOverwriteOptions, overwriteOptions?: GuildChannelOverwriteOptions): Promise<NonThreadGuildBasedChannel>

```

- `userOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>` — The user or role to update
- `options: PermissionOverwriteOptions` — The options for the update
- `overwriteOptions?: GuildChannelOverwriteOptions` — The extra information for the update

**Returns:** `Promise<NonThreadGuildBasedChannel>`

```ts
// Create or Replace permission overwrites for a message author
message.channel.permissionOverwrites.create(message.author, {
  SEND_MESSAGES: false
})
  .then(channel => console.log(channel.permissionOverwrites.cache.get(message.author.id)))
  .catch(console.error);
```

### `delete`

Deletes permission overwrites for a user or role in this channel.

```ts

delete(userOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>, reason?: string): Promise<NonThreadGuildBasedChannel>

```

- `userOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>` — The user or role to delete
- `reason?: string` — The reason for deleting the overwrite

**Returns:** `Promise<NonThreadGuildBasedChannel>`

### `edit`

Edits permission overwrites for a user or role in this channel, or creates an entry if not already present.

```ts

edit(userOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>, options: PermissionOverwriteOptions, overwriteOptions?: GuildChannelOverwriteOptions): Promise<NonThreadGuildBasedChannel>

```

- `userOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>` — The user or role to update
- `options: PermissionOverwriteOptions` — The options for the update
- `overwriteOptions?: GuildChannelOverwriteOptions` — The extra information for the update

**Returns:** `Promise<NonThreadGuildBasedChannel>`

```ts
// Edit or Create permission overwrites for a message author
message.channel.permissionOverwrites.edit(message.author, {
  SEND_MESSAGES: false
})
  .then(channel => console.log(channel.permissionOverwrites.cache.get(message.author.id)))
  .catch(console.error);
```

### `resolve`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: PermissionOverwrites): PermissionOverwrites

```

- `resolvable: PermissionOverwrites`

**Returns:** `PermissionOverwrites`

Resolves a data entry to a data Object.

```ts

resolve(resolvable: PermissionOverwriteResolvable): PermissionOverwrites | null

```

- `resolvable: PermissionOverwriteResolvable`

**Returns:** `PermissionOverwrites | null`

### `resolveId`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: string | PermissionOverwrites): string

```

- `resolvable: string | PermissionOverwrites`

**Returns:** `string`

Resolves a data entry to an instance id.

```ts

resolveId(resolvable: PermissionOverwriteResolvable): string | null

```

- `resolvable: PermissionOverwriteResolvable`

**Returns:** `string | null`

### `set`

Replaces the permission overwrites in this channel.

```ts

set(overwrites: readonly OverwriteResolvable[] | Collection<string, OverwriteResolvable>, reason?: string): Promise<NonThreadGuildBasedChannel>

```

- `overwrites: readonly OverwriteResolvable[] | Collection<string, OverwriteResolvable>` — Permission overwrites the channel gets updated with
- `reason?: string` — Reason for updating the channel overwrites

**Returns:** `Promise<NonThreadGuildBasedChannel>`

```ts
message.channel.permissionOverwrites.set([
  {
     id: message.author.id,
     deny: [Permissions.FLAGS.VIEW_CHANNEL],
  },
], 'Needed to change permissions');
```

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, PermissionOverwrites>

```

**Returns:** `Collection<string, PermissionOverwrites>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/PermissionOverwriteManager.ts#L20
