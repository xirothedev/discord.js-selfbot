# GuildChannelManager

Manages API methods for GuildChannels and stores their cache.

```ts

class GuildChannelManager extends CachedManager<Snowflake, GuildBasedChannel, GuildChannelResolvable>

```

## Properties

### `cache`

The cache of this Manager

**Type:** `Collection<string, GuildBasedChannel>` · **Modifiers:** readonly

### `channelCountWithoutThreads`

The number of channels in this managers cache excluding thread channels
that do not count towards a guild's maximum channels restriction.

**Type:** `number` · **Modifiers:** readonly

### `client`

The client that instantiated this Manager

**Type:** `Client` · **Modifiers:** readonly

### `guild`

The guild this Manager belongs to

**Type:** `Guild`

### `holds`

**Type:** `Constructable<GuildBasedChannel>` · **Modifiers:** readonly

## Methods

### `addFollower`

Adds the target channel to a channel's followers.

```ts

addFollower(channel: string | NewsChannel, targetChannel: TextChannelResolvable, reason?: string): Promise<string>

```

- `channel: string | NewsChannel` — The channel to follow
- `targetChannel: TextChannelResolvable` — The channel where published announcements will be posted at
- `reason?: string` — Reason for creating the webhook

**Returns:** `Promise<string>`

### `create`

Creates a new channel in the guild.

```ts

create<T extends "GUILD_FORUM" | "GUILD_MEDIA" | "GUILD_NEWS" | "GUILD_STAGE_VOICE" | "GUILD_TEXT" | "GUILD_VOICE" | "GUILD_CATEGORY" | GUILD_TEXT | GUILD_VOICE | GUILD_CATEGORY | GUILD_NEWS | GUILD_STAGE_VOICE | GUILD_FORUM | GUILD_MEDIA>(name: string, options: GuildChannelCreateOptions & { type: T }): Promise<MappedGuildChannelTypes[T]>

```

- `name: string` — The name of the new channel
- `options: GuildChannelCreateOptions & { type: T }` — Options for creating the new channel

**Returns:** `Promise<MappedGuildChannelTypes[T]>`

```ts
// Create a new text channel
guild.channels.create('new-general', { reason: 'Needed a cool new channel' })
  .then(console.log)
  .catch(console.error);
```

```ts
// Create a new channel with permission overwrites
guild.channels.create('new-voice', {
  type: 'GUILD_VOICE',
  permissionOverwrites: [
     {
       id: message.author.id,
       deny: [Permissions.FLAGS.VIEW_CHANNEL],
    },
  ],
})
```

Creates a new channel in the guild.

> **Deprecated.** See [Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/6309018858647) for more information

```ts

create(name: string, options: GuildChannelCreateOptions & { type: "GUILD_STORE" | GUILD_STORE }): Promise<StoreChannel>

```

- `name: string` — The name of the new channel
- `options: GuildChannelCreateOptions & { type: "GUILD_STORE" | GUILD_STORE }` — Options for creating the new channel

**Returns:** `Promise<StoreChannel>`

```ts
// Create a new text channel
guild.channels.create('new-general', { reason: 'Needed a cool new channel' })
  .then(console.log)
  .catch(console.error);
```

```ts
// Create a new channel with permission overwrites
guild.channels.create('new-voice', {
  type: 'GUILD_VOICE',
  permissionOverwrites: [
     {
       id: message.author.id,
       deny: [Permissions.FLAGS.VIEW_CHANNEL],
    },
  ],
})
```

Creates a new channel in the guild.

```ts

create(name: string, options?: GuildChannelCreateOptions): Promise<TextChannel>

```

- `name: string` — The name of the new channel
- `options?: GuildChannelCreateOptions` — Options for creating the new channel

**Returns:** `Promise<TextChannel>`

```ts
// Create a new text channel
guild.channels.create('new-general', { reason: 'Needed a cool new channel' })
  .then(console.log)
  .catch(console.error);
```

```ts
// Create a new channel with permission overwrites
guild.channels.create('new-voice', {
  type: 'GUILD_VOICE',
  permissionOverwrites: [
     {
       id: message.author.id,
       deny: [Permissions.FLAGS.VIEW_CHANNEL],
    },
  ],
})
```

### `createWebhook`

Creates a webhook for the channel.

```ts

createWebhook(channel: GuildChannelResolvable, name: string, options?: string | NewsChannel | StageChannel | TextChannel | VoiceChannel | ForumChannel | MediaChannel): Promise<Webhook>

```

- `channel: GuildChannelResolvable` — The channel to create the webhook for
- `name: string` — The name of the webhook
- `options?: string | NewsChannel | StageChannel | TextChannel | VoiceChannel | ForumChannel | MediaChannel` — Options for creating the webhook

**Returns:** `Promise<Webhook>`

```ts
// Create a webhook for the current channel
guild.channels.createWebhook('222197033908436994', 'Snek', {
  avatar: 'https://i.imgur.com/mI8XcpG.jpg',
  reason: 'Needed a cool new Webhook'
})
  .then(console.log)
  .catch(console.error)
```

### `delete`

Deletes the channel.

```ts

delete(channel: GuildChannelResolvable, reason?: string): Promise<void>

```

- `channel: GuildChannelResolvable` — The channel to delete
- `reason?: string` — Reason for deleting this channel

**Returns:** `Promise<void>`

```ts
// Delete the channel
guild.channels.delete('858850993013260338', 'making room for new channels')
  .then(console.log)
  .catch(console.error);
```

### `edit`

Edits the channel.

```ts

edit(channel: GuildChannelResolvable, data: ChannelData, reason?: string): Promise<GuildChannel>

```

- `channel: GuildChannelResolvable` — The channel to edit
- `data: ChannelData` — The new data for the channel
- `reason?: string` — Reason for editing this channel

**Returns:** `Promise<GuildChannel>`

```ts
// Edit a channel
guild.channels.edit('222197033908436994', { name: 'new-channel' })
  .then(console.log)
  .catch(console.error);
```

### `fetch`

```ts

fetch(id: string, options?: BaseFetchOptions): Promise<GuildBasedChannel | null>

```

- `id: string`
- `options?: BaseFetchOptions`

**Returns:** `Promise<GuildBasedChannel | null>`

```ts

fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<string, NonThreadGuildBasedChannel | null>>

```

- `id?: undefined`
- `options?: BaseFetchOptions`

**Returns:** `Promise<Collection<string, NonThreadGuildBasedChannel | null>>`

### `fetchWebhooks`

Fetches all webhooks for the channel.

```ts

fetchWebhooks(channel: GuildChannelResolvable): Promise<Collection<string, Webhook>>

```

- `channel: GuildChannelResolvable` — The channel to fetch webhooks for

**Returns:** `Promise<Collection<string, Webhook>>`

```ts
// Fetch webhooks
guild.channels.fetchWebhooks('769862166131245066')
  .then(hooks => console.log(`This channel has ${hooks.size} hooks`))
  .catch(console.error);
```

### `resolve`

Resolves a GuildChannelResolvable to a Channel object.

```ts

resolve(resolvable: GuildBasedChannel): GuildBasedChannel

```

- `resolvable: GuildBasedChannel`

**Returns:** `GuildBasedChannel`

Resolves a GuildChannelResolvable to a Channel object.

```ts

resolve(resolvable: GuildChannelResolvable): GuildBasedChannel | null

```

- `resolvable: GuildChannelResolvable`

**Returns:** `GuildBasedChannel | null`

### `resolveId`

Resolves a GuildChannelResolvable to a channel id.

```ts

resolveId(resolvable: string | GuildBasedChannel): string

```

- `resolvable: string | GuildBasedChannel`

**Returns:** `string`

Resolves a GuildChannelResolvable to a channel id.

```ts

resolveId(resolvable: GuildChannelResolvable): string | null

```

- `resolvable: GuildChannelResolvable`

**Returns:** `string | null`

### `setPosition`

Sets a new position for the guild channel.

```ts

setPosition(channel: GuildChannelResolvable, position: number, options?: SetChannelPositionOptions): Promise<GuildChannel>

```

- `channel: GuildChannelResolvable` — The channel to set the position for
- `position: number` — The new position for the guild channel
- `options?: SetChannelPositionOptions` — Options for setting position

**Returns:** `Promise<GuildChannel>`

```ts
// Set a new channel position
guild.channels.setPosition('222078374472843266', 2)
  .then(newChannel => console.log(`Channel's new position is ${newChannel.position}`))
  .catch(console.error);
```

### `setPositions`

Batch-updates the guild's channels' positions.
Only one channel's parent can be changed at a time

```ts

setPositions(channelPositions: readonly ChannelPosition[]): Promise<Guild>

```

- `channelPositions: readonly ChannelPosition[]` — Channel positions to update

**Returns:** `Promise<Guild>`

```ts
guild.channels.setPositions([{ channel: channelId, position: newChannelIndex }])
  .then(guild => console.log(`Updated channel positions for ${guild}`))
  .catch(console.error);
```

### `valueOf`

Returns the primitive value of the specified object.

```ts

valueOf(): Collection<string, GuildBasedChannel>

```

**Returns:** `Collection<string, GuildBasedChannel>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/managers/GuildChannelManager.ts#L27
