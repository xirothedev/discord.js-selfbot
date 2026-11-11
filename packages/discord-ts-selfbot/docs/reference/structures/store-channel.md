# StoreChannel

Represents a guild store channel on Discord.
Store channels have been removed from Discord. See
[Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/6309018858647)
for more information.

> **Deprecated.** See [Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/6309018858647) for more information

```ts

class StoreChannel extends GuildChannel

```

## Properties

### `calculatedPosition`

**Type:** `number` · **Modifiers:** readonly

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the channel was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the channel was created at

**Type:** `number` · **Modifiers:** readonly

### `deletable`

Whether the channel is deletable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `flags`

The flags that are applied to the channel.

**Type:** `Readonly<ChannelFlags>`

### `guild`

The guild the channel is in

**Type:** `Guild`

### `guildId`

The id of the guild the channel is in

**Type:** `string`

### `id`

The channel's id

**Type:** `string`

### `manageable`

Whether the channel is manageable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `members`

A collection of cached members of this channel, mapped by their ids.
Members that can view this channel, if the channel is text-based.
Members in the channel, if the channel is voice-based.

**Type:** `Collection<string, GuildMember>` · **Modifiers:** readonly

### `name`

The name of the guild channel

**Type:** `string`

### `nsfw`

If the guild considers this channel NSFW

**Type:** `boolean`

### `parent`

The category parent of this channel

**Type:** `CategoryChannel | null` · **Modifiers:** readonly

### `parentId`

The id of the category parent of this channel

**Type:** `string | null`

### `partial`

Whether this Channel is a partial
This is always false outside of DM channels.

**Type:** `false` · **Modifiers:** readonly

### `permissionOverwrites`

A manager of permission overwrites that belong to this channel

**Type:** `PermissionOverwriteManager`

### `permissionsLocked`

If the permissionOverwrites match the parent channel, null if no parent

**Type:** `boolean | null` · **Modifiers:** readonly

### `position`

The position of the channel

**Type:** `number` · **Modifiers:** readonly

### `rawPosition`

The raw position of the channel from Discord

**Type:** `number`

### `type`

The type of the channel

**Type:** `"GUILD_STORE"`

### `viewable`

Whether the channel is viewable by the client user

**Type:** `boolean` · **Modifiers:** readonly

## Methods

### `clone`

Clones this channel.

> **Deprecated.** See [Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/6309018858647) for more information

```ts

clone(options?: GuildChannelCloneOptions): Promise<StoreChannel>

```

- `options?: GuildChannelCloneOptions` — The options for cloning this channel

**Returns:** `Promise<StoreChannel>`

### `createForumTag`

```ts

createForumTag(data?: Record<string, unknown>): Promise<unknown>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `createInvite`

Creates an invite to this guild channel.

```ts

createInvite(options?: CreateInviteOptions): Promise<Invite>

```

- `options?: CreateInviteOptions` — The options for creating the invite

**Returns:** `Promise<Invite>`

```ts
// Create an invite to a channel
channel.createInvite()
  .then(invite => console.log(`Created an invite with a code of ${invite.code}`))
  .catch(console.error);
```

### `delete`

Deletes this channel.

```ts

delete(reason?: string): Promise<StoreChannel>

```

- `reason?: string` — Reason for deleting this channel

**Returns:** `Promise<StoreChannel>`

```ts
// Delete the channel
channel.delete('making room for new channels')
  .then(console.log)
  .catch(console.error);
```

### `deleteForumTag`

```ts

deleteForumTag(tagId: string): Promise<unknown>

```

- `tagId: string`

**Returns:** `Promise<unknown>`

### `edit`

```ts

edit(data: ChannelData, reason?: string): Promise<StoreChannel>

```

- `data: ChannelData`
- `reason?: string`

**Returns:** `Promise<StoreChannel>`

### `equals`

Checks if this channel has the same type, topic, position, name, overwrites, and id as another channel.
In most cases, a simple `channel.id === channel2.id` will do, and is much faster too.

```ts

equals(channel: GuildChannel): boolean

```

- `channel: GuildChannel` — Channel to compare with

**Returns:** `boolean`

### `fetch`

Fetches this channel.

```ts

fetch(force?: boolean): Promise<StoreChannel>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<StoreChannel>`

### `fetchInvites`

Fetches a collection of invites to this guild channel.
Resolves with a collection mapping invites by their codes.

```ts

fetchInvites(cache?: boolean): Promise<Collection<string, Invite>>

```

- `cache?: boolean` — Whether or not to cache the fetched invites

**Returns:** `Promise<Collection<string, Invite>>`

### `followAnnouncementChannel`

```ts

followAnnouncementChannel(targetChannelId: string): Promise<unknown>

```

- `targetChannelId: string`

**Returns:** `Promise<unknown>`

### `isDirectory`

Indicates whether this channel is a DirectoryChannel

```ts

isDirectory(): this

```

**Returns:** `this`

### `isText`

Indicates whether this channel is TextBasedChannels text-based.

```ts

isText(): this

```

**Returns:** `this`

### `isThread`

Indicates whether this channel is a ThreadChannel.

```ts

isThread(): this

```

**Returns:** `this`

### `isThreadOnly`

Indicates whether this channel is ThreadOnlyChannel.

```ts

isThreadOnly(): this

```

**Returns:** `this`

### `isVoice`

Indicates whether this channel is BaseGuildVoiceChannel voice-based.

```ts

isVoice(): this

```

**Returns:** `this`

### `lockPermissions`

Locks in the permission overwrites from the parent channel.

```ts

lockPermissions(): Promise<StoreChannel>

```

**Returns:** `Promise<StoreChannel>`

### `modifyForumTag`

```ts

modifyForumTag(tagId: string, data?: Record<string, unknown>): Promise<unknown>

```

- `tagId: string`
- `data?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `permissionsFor`

Gets the overall set of permissions for a member or role in this channel, taking into account channel overwrites.

```ts

permissionsFor(memberOrRole: GuildMember | Role, checkAdmin?: boolean): Readonly<Permissions>

```

- `memberOrRole: GuildMember | Role` — The member or role to obtain the overall permissions for
- `checkAdmin?: boolean` — Whether having `ADMINISTRATOR` will return all permissions

**Returns:** `Readonly<Permissions>`

Gets the overall set of permissions for a member or role in this channel, taking into account channel overwrites.

```ts

permissionsFor(memberOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>, checkAdmin?: boolean): Readonly<Permissions> | null

```

- `memberOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>` — The member or role to obtain the overall permissions for
- `checkAdmin?: boolean` — Whether having `ADMINISTRATOR` will return all permissions

**Returns:** `Readonly<Permissions> | null`

### `removeLobbyLink`

```ts

removeLobbyLink(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `searchThreads`

```ts

searchThreads(query: string, options?: Record<string, unknown>): Promise<unknown>

```

- `query: string`
- `options?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `setName`

Sets a new name for the guild channel.

```ts

setName(name: string, reason?: string): Promise<StoreChannel>

```

- `name: string` — The new name for the guild channel
- `reason?: string` — Reason for changing the guild channel's name

**Returns:** `Promise<StoreChannel>`

```ts
// Set a new channel name
channel.setName('not_general')
  .then(newChannel => console.log(`Channel's new name is ${newChannel.name}`))
  .catch(console.error);
```

### `setParent`

Sets the parent of this channel.

```ts

setParent(channel: CategoryChannelResolvable | null, options?: SetParentOptions): Promise<StoreChannel>

```

- `channel: CategoryChannelResolvable | null` — The category channel to set as the parent
- `options?: SetParentOptions` — The options for setting the parent

**Returns:** `Promise<StoreChannel>`

```ts
// Add a parent to a channel
message.channel.setParent('355908108431917066', { lockPermissions: false })
  .then(channel => console.log(`New parent of ${message.channel.name}: ${channel.name}`))
  .catch(console.error);
```

### `setPosition`

Sets a new position for the guild channel.

```ts

setPosition(position: number, options?: SetChannelPositionOptions): Promise<StoreChannel>

```

- `position: number` — The new position for the guild channel
- `options?: SetChannelPositionOptions` — Options for setting position

**Returns:** `Promise<StoreChannel>`

```ts
// Set a new channel position
channel.setPosition(2)
  .then(newChannel => console.log(`Channel's new position is ${newChannel.position}`))
  .catch(console.error);
```

### `toJSON`

```ts

toJSON(props: Record<string, string | boolean>[]): unknown

```

- `props: Record<string, string | boolean>[]`

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): `${string}`

```

**Returns:** ``${string}``

```ts
// Logs: Hello from <#123456789012345678>!
console.log(`Hello from ${channel}!`);
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/StoreChannel.ts#L13
