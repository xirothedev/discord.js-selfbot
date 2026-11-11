# TextChannel

Represents a guild text channel on Discord.

```ts

class TextChannel extends BaseGuildTextChannel

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

### `defaultAutoArchiveDuration`

The default auto archive duration for newly created threads in this channel

**Type:** `ThreadAutoArchiveDuration`

### `defaultThreadRateLimitPerUser`

The initial rate limit per user (slowmode) to set on newly created threads in a channel.

**Type:** `number | null`

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

### `lastMessage`

The Message object of the last message in the channel, if one was sent

**Type:** `Message<boolean> | null` · **Modifiers:** readonly

### `lastMessageId`

The last message id sent in the channel, if one was sent

**Type:** `string | null`

### `lastPinAt`

The date when the last pinned message was pinned, if there was one

**Type:** `Date | null` · **Modifiers:** readonly

### `lastPinTimestamp`

The timestamp when the last pinned message was pinned, if there was one

**Type:** `number | null`

### `manageable`

Whether the channel is manageable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `members`

A collection of cached members of this channel, mapped by their ids.
Members that can view this channel, if the channel is text-based.
Members in the channel, if the channel is voice-based.

**Type:** `Collection<string, GuildMember>` · **Modifiers:** readonly

### `messages`

A manager of the messages sent to this channel

**Type:** `MessageManager`

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

### `rateLimitPerUser`

The rate limit per user (slowmode) for this channel in seconds

**Type:** `number`

### `rawPosition`

The raw position of the channel from Discord

**Type:** `number`

### `threads`

A manager of the threads belonging to this channel

**Type:** `GuildTextThreadManager<AllowedThreadTypeForTextChannel>`

### `topic`

The topic of the text channel

**Type:** `string | null`

### `type`

The type of the channel

**Type:** `"GUILD_TEXT"`

### `viewable`

Whether the channel is viewable by the client user

**Type:** `boolean` · **Modifiers:** readonly

## Methods

### `awaitMessages`

Similar to createMessageCollector but in promise form.
Resolves with a collection of messages that pass the specified filter.

```ts

awaitMessages(options?: AwaitMessagesOptions): Promise<Collection<string, Message<boolean>>>

```

- `options?: AwaitMessagesOptions` — Optional options to pass to the internal collector

**Returns:** `Promise<Collection<string, Message<boolean>>>`

```ts
// Await !vote messages
const filter = m => m.content.startsWith('!vote');
// Errors: ['time'] treats ending because of the time limit as an error
channel.awaitMessages({ filter, max: 4, time: 60_000, errors: ['time'] })
  .then(collected => console.log(collected.size))
  .catch(collected => console.log(`After a minute, only ${collected.size} out of 4 voted.`));
```

### `clone`

Clones this channel.

```ts

clone(options?: GuildChannelCloneOptions): Promise<TextChannel>

```

- `options?: GuildChannelCloneOptions` — The options for cloning this channel

**Returns:** `Promise<TextChannel>`

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

### `createMessageCollector`

Creates a Message Collector.

```ts

createMessageCollector(options?: MessageCollectorOptions): MessageCollector

```

- `options?: MessageCollectorOptions` — The options to pass to the collector

**Returns:** `MessageCollector`

```ts
// Create a message collector
const filter = m => m.content.includes('discord');
const collector = channel.createMessageCollector({ filter, time: 15_000 });
collector.on('collect', m => console.log(`Collected ${m.content}`));
collector.on('end', collected => console.log(`Collected ${collected.size} items`));
```

### `createWebhook`

Creates a webhook for the channel.

```ts

createWebhook(name: string, options?: ChannelWebhookCreateOptions): Promise<Webhook>

```

- `name: string` — The name of the webhook
- `options?: ChannelWebhookCreateOptions` — Options for creating the webhook

**Returns:** `Promise<Webhook>`

```ts
// Create a webhook for the current channel
channel.createWebhook('Snek', {
  avatar: 'https://i.imgur.com/mI8XcpG.jpg',
  reason: 'Needed a cool new Webhook'
})
  .then(console.log)
  .catch(console.error)
```

### `delete`

Deletes this channel.

```ts

delete(reason?: string): Promise<TextChannel>

```

- `reason?: string` — Reason for deleting this channel

**Returns:** `Promise<TextChannel>`

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

edit(data: ChannelData, reason?: string): Promise<TextChannel>

```

- `data: ChannelData`
- `reason?: string`

**Returns:** `Promise<TextChannel>`

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

fetch(force?: boolean): Promise<TextChannel>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<TextChannel>`

### `fetchInvites`

Fetches a collection of invites to this guild channel.
Resolves with a collection mapping invites by their codes.

```ts

fetchInvites(cache?: boolean): Promise<Collection<string, Invite>>

```

- `cache?: boolean` — Whether or not to cache the fetched invites

**Returns:** `Promise<Collection<string, Invite>>`

### `fetchWebhooks`

Fetches all webhooks for the channel.

```ts

fetchWebhooks(): Promise<Collection<string, Webhook>>

```

**Returns:** `Promise<Collection<string, Webhook>>`

```ts
// Fetch webhooks
channel.fetchWebhooks()
  .then(hooks => console.log(`This channel has ${hooks.size} hooks`))
  .catch(console.error);
```

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

lockPermissions(): Promise<TextChannel>

```

**Returns:** `Promise<TextChannel>`

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

### `send`

```ts

send(options: string | MessageOptions | MessagePayload): Promise<Message<boolean>>

```

- `options: string | MessageOptions | MessagePayload`

**Returns:** `Promise<Message<boolean>>`

### `sendSlash`

```ts

sendSlash(target: UserResolvable, commandName: string, args: unknown[]): Promise<Modal | Message<boolean>>

```

- `target: UserResolvable`
- `commandName: string`
- `args: unknown[]`

**Returns:** `Promise<Modal | Message<boolean>>`

### `sendTyping`

Sends a typing indicator in the channel.

```ts

sendTyping(): Promise<{ message_send_cooldown_ms: number; thread_create_cooldown_ms: number } | undefined>

```

**Returns:** `Promise<{ message_send_cooldown_ms: number; thread_create_cooldown_ms: number } | undefined>`

```ts
// Start typing in a channel
channel.sendTyping();
```

### `setDefaultAutoArchiveDuration`

Sets the default auto archive duration for all newly created threads in this channel.

```ts

setDefaultAutoArchiveDuration(defaultAutoArchiveDuration: ThreadAutoArchiveDuration | "MAX", reason?: string): Promise<TextChannel>

```

- `defaultAutoArchiveDuration: ThreadAutoArchiveDuration | "MAX"` — The new default auto archive duration
- `reason?: string` — Reason for changing the channel's default auto archive duration

**Returns:** `Promise<TextChannel>`

### `setName`

Sets a new name for the guild channel.

```ts

setName(name: string, reason?: string): Promise<TextChannel>

```

- `name: string` — The new name for the guild channel
- `reason?: string` — Reason for changing the guild channel's name

**Returns:** `Promise<TextChannel>`

```ts
// Set a new channel name
channel.setName('not_general')
  .then(newChannel => console.log(`Channel's new name is ${newChannel.name}`))
  .catch(console.error);
```

### `setNSFW`

Sets whether this channel is flagged as NSFW.

```ts

setNSFW(nsfw?: boolean, reason?: string): Promise<TextBasedChannelFields>

```

- `nsfw?: boolean` — Whether the channel should be considered NSFW
- `reason?: string` — Reason for changing the channel's NSFW flag

**Returns:** `Promise<TextBasedChannelFields>`

### `setParent`

Sets the parent of this channel.

```ts

setParent(channel: CategoryChannelResolvable | null, options?: SetParentOptions): Promise<TextChannel>

```

- `channel: CategoryChannelResolvable | null` — The category channel to set as the parent
- `options?: SetParentOptions` — The options for setting the parent

**Returns:** `Promise<TextChannel>`

```ts
// Add a parent to a channel
message.channel.setParent('355908108431917066', { lockPermissions: false })
  .then(channel => console.log(`New parent of ${message.channel.name}: ${channel.name}`))
  .catch(console.error);
```

### `setPosition`

Sets a new position for the guild channel.

```ts

setPosition(position: number, options?: SetChannelPositionOptions): Promise<TextChannel>

```

- `position: number` — The new position for the guild channel
- `options?: SetChannelPositionOptions` — Options for setting position

**Returns:** `Promise<TextChannel>`

```ts
// Set a new channel position
channel.setPosition(2)
  .then(newChannel => console.log(`Channel's new position is ${newChannel.position}`))
  .catch(console.error);
```

### `setRateLimitPerUser`

Sets the rate limit per user (slowmode) for this channel.

```ts

setRateLimitPerUser(rateLimitPerUser: number, reason?: string): Promise<TextBasedChannelFields>

```

- `rateLimitPerUser: number` — The new rate limit in seconds
- `reason?: string` — Reason for changing the channel's rate limit

**Returns:** `Promise<TextBasedChannelFields>`

### `setTopic`

Sets a new topic for the guild channel.

```ts

setTopic(topic: string | null, reason?: string): Promise<TextChannel>

```

- `topic: string | null` — The new topic for the guild channel
- `reason?: string` — Reason for changing the guild channel's topic

**Returns:** `Promise<TextChannel>`

```ts
// Set a new channel topic
channel.setTopic('needs more rate limiting')
  .then(newChannel => console.log(`Channel's new topic is ${newChannel.topic}`))
  .catch(console.error);
```

### `setType`

Sets the type of this channel (only conversion between text and news is supported)

```ts

setType(type: Pick<typeof ChannelTypes, "GUILD_TEXT">, reason?: string): Promise<TextChannel>

```

- `type: Pick<typeof ChannelTypes, "GUILD_TEXT">` — The new channel type
- `reason?: string` — Reason for changing the channel's type

**Returns:** `Promise<TextChannel>`

Sets the type of this channel (only conversion between text and news is supported)

```ts

setType(type: Pick<typeof ChannelTypes, "GUILD_NEWS">, reason?: string): Promise<NewsChannel>

```

- `type: Pick<typeof ChannelTypes, "GUILD_NEWS">` — The new channel type
- `reason?: string` — Reason for changing the channel's type

**Returns:** `Promise<NewsChannel>`

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

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/TextChannel.ts#L10
