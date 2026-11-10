# CategoryChannel

Represents a guild category channel on Discord.

```ts

class CategoryChannel extends GuildChannel

```

## Constructor

### `constructor`

```ts

constructor(guild: Guild, data?: RawGuildChannelData, client?: Client<boolean>, immediatePatch?: boolean): CategoryChannel

```

- `guild: Guild`
- `data?: RawGuildChannelData`
- `client?: Client<boolean>`
- `immediatePatch?: boolean`

**Returns:** `CategoryChannel`

## Properties

### `calculatedPosition`

**Type:** `number` · **Modifiers:** readonly

### `children`

Channels that are a part of this category

**Type:** `Collection<string, NewsChannel | StageChannel | StoreChannel | TextChannel | VoiceChannel | ForumChannel | MediaChannel>` · **Modifiers:** readonly

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

### `parent`

**Type:** `null` · **Modifiers:** static

### `parentId`

The id of the parent of this channel.

**Type:** `null`

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

**Type:** `"GUILD_CATEGORY"`

### `viewable`

Whether the channel is viewable by the client user

**Type:** `boolean` · **Modifiers:** readonly

## Methods

### `clone`

Clones this channel.

```ts

clone(options?: GuildChannelCloneOptions): Promise<CategoryChannel>

```

- `options?: GuildChannelCloneOptions` — The options for cloning this channel

**Returns:** `Promise<CategoryChannel>`

### `createChannel`

Creates a new channel within this category.
You cannot create a channel of type `GUILD_CATEGORY` inside a CategoryChannel.

```ts

createChannel<T extends "GUILD_FORUM" | "GUILD_MEDIA" | "GUILD_NEWS" | "GUILD_STAGE_VOICE" | "GUILD_TEXT" | "GUILD_VOICE" | GUILD_TEXT | GUILD_VOICE | GUILD_NEWS | GUILD_STAGE_VOICE | GUILD_FORUM | GUILD_MEDIA>(name: string, options: CategoryCreateChannelOptions & { type: T }): Promise<MappedChannelCategoryTypes[T]>

```

- `name: string` — The name of the new channel
- `options: CategoryCreateChannelOptions & { type: T }` — Options for creating the new channel

**Returns:** `Promise<MappedChannelCategoryTypes[T]>`

Creates a new channel within this category.
You cannot create a channel of type `GUILD_CATEGORY` inside a CategoryChannel.

> **Deprecated.** See [Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/6309018858647) for more information

```ts

createChannel(name: string, options: CategoryCreateChannelOptions & { type: "GUILD_STORE" | GUILD_STORE }): Promise<StoreChannel>

```

- `name: string` — The name of the new channel
- `options: CategoryCreateChannelOptions & { type: "GUILD_STORE" | GUILD_STORE }` — Options for creating the new channel

**Returns:** `Promise<StoreChannel>`

Creates a new channel within this category.
You cannot create a channel of type `GUILD_CATEGORY` inside a CategoryChannel.

```ts

createChannel(name: string, options?: CategoryCreateChannelOptions): Promise<TextChannel>

```

- `name: string` — The name of the new channel
- `options?: CategoryCreateChannelOptions` — Options for creating the new channel

**Returns:** `Promise<TextChannel>`

### `delete`

Deletes this channel.

```ts

delete(reason?: string): Promise<CategoryChannel>

```

- `reason?: string` — Reason for deleting this channel

**Returns:** `Promise<CategoryChannel>`

```ts
// Delete the channel
channel.delete('making room for new channels')
  .then(console.log)
  .catch(console.error);
```

### `edit`

```ts

edit(data: ChannelData, reason?: string): Promise<CategoryChannel>

```

- `data: ChannelData`
- `reason?: string`

**Returns:** `Promise<CategoryChannel>`

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

fetch(force?: boolean): Promise<CategoryChannel>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<CategoryChannel>`

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

lockPermissions(): Promise<CategoryChannel>

```

**Returns:** `Promise<CategoryChannel>`

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

### `setName`

Sets a new name for the guild channel.

```ts

setName(name: string, reason?: string): Promise<CategoryChannel>

```

- `name: string` — The new name for the guild channel
- `reason?: string` — Reason for changing the guild channel's name

**Returns:** `Promise<CategoryChannel>`

```ts
// Set a new channel name
channel.setName('not_general')
  .then(newChannel => console.log(`Channel's new name is ${newChannel.name}`))
  .catch(console.error);
```

### `setParent`

Sets the category parent of this channel.
It is not possible to set the parent of a CategoryChannel.

```ts

setParent(channel: CategoryChannelResolvable | null, options?: SetParentOptions): Promise<CategoryChannel>

```

- `channel: CategoryChannelResolvable | null` — The channel to set as parent
- `options?: SetParentOptions` — The options for setting the parent

**Returns:** `Promise<CategoryChannel>`

### `setPosition`

Sets a new position for the guild channel.

```ts

setPosition(position: number, options?: SetChannelPositionOptions): Promise<CategoryChannel>

```

- `position: number` — The new position for the guild channel
- `options?: SetChannelPositionOptions` — Options for setting position

**Returns:** `Promise<CategoryChannel>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/CategoryChannel.ts#L10
