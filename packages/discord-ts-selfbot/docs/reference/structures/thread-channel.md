# ThreadChannel

Represents a thread channel on Discord.

```ts

class ThreadChannel extends Channel<this> & Omit<TextBasedChannelFields, "createWebhook" | "setNSFW" | "fetchWebhooks">

```

## Properties

### `appliedTags`

The tags applied to this thread

**Type:** `string[]`

### `archived`

Whether the thread is archived

**Type:** `boolean | null`

### `archivedAt`

The time at which this thread's archive status was last changed
If the thread was never archived or unarchived, this is the time at which the thread was created

**Type:** `Date | null` · **Modifiers:** readonly

### `archiveTimestamp`

The timestamp when the thread's archive status was last changed
If the thread was never archived or unarchived, this is the timestamp at which the thread was
created

**Type:** `number | null`

### `autoArchiveDuration`

The amount of time (in minutes) after which the thread will automatically archive in case of no recent activity

**Type:** `ThreadAutoArchiveDuration | null`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time the thread was created at

**Type:** `Date | null` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp when this thread was created. This isn't available for threads
created before 2022-01-09

**Type:** `number | null` · **Modifiers:** readonly

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `editable`

Whether the thread is editable by the client user (name, archived, autoArchiveDuration)

**Type:** `boolean` · **Modifiers:** readonly

### `flags`

The flags that are applied to the channel.

**Type:** `Readonly<ChannelFlags>`

### `guild`

The guild the thread is in

**Type:** `Guild`

### `guildId`

The id of the guild the channel is in

**Type:** `string`

### `guildMembers`

A collection of associated guild member objects of this thread's members

**Type:** `Collection<string, GuildMember>` · **Modifiers:** readonly

### `id`

The channel's id

**Type:** `string`

### `invitable`

Whether members without `MANAGE_THREADS` can invite other members without `MANAGE_THREADS`
Always `null` in public threads

**Type:** `boolean | null`

### `joinable`

Whether the thread is joinable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `joined`

Whether the client user is a member of the thread.

**Type:** `boolean` · **Modifiers:** readonly

### `lastMessage`

The Message object of the last message in the channel, if one was sent

**Type:** `Message<boolean> | null` · **Modifiers:** readonly

### `lastMessageId`

The last message id sent in this thread, if one was sent

**Type:** `string | null`

### `lastPinAt`

The date when the last pinned message was pinned, if there was one

**Type:** `Date | null` · **Modifiers:** readonly

### `lastPinTimestamp`

The timestamp when the last pinned message was pinned, if there was one

**Type:** `number | null`

### `locked`

Whether the thread is locked

**Type:** `boolean | null`

### `manageable`

Whether the thread is manageable by the client user, for deleting or editing rateLimitPerUser or locked.

**Type:** `boolean` · **Modifiers:** readonly

### `memberCount`

The approximate count of users in this thread
This stops counting at 50. If you need an approximate value higher than that, use
`ThreadChannel#members.cache.size`

**Type:** `number | null`

### `members`

A manager of the members that are part of this thread

**Type:** `ThreadMemberManager`

### `messageCount`

Threads created before July 1, 2022 may have an inaccurate count.
If you need an approximate value higher than that, use `ThreadChannel#messages.cache.size`

**Type:** `number | null`

### `messages`

A manager of the messages sent to this thread

**Type:** `MessageManager`

### `name`

The name of the thread

**Type:** `string`

### `ownerId`

The id of the member who created this thread

**Type:** `string`

### `parent`

The parent channel of this thread

**Type:** `NewsChannel | TextChannel | ForumChannel | MediaChannel | null` · **Modifiers:** readonly

### `parentId`

The id of the parent channel of this thread

**Type:** `string | null`

### `partial`

Whether this Channel is a partial
This is always false outside of DM channels.

**Type:** `false` · **Modifiers:** readonly

### `rateLimitPerUser`

The rate limit per user (slowmode) for this thread in seconds

**Type:** `number | null`

### `sendable`

Whether the client user can send messages in this thread

**Type:** `boolean` · **Modifiers:** readonly

### `totalMessageSent`

The number of messages ever sent in a thread, similar to ThreadChannel#messageCount except it
will not decrement whenever a message is deleted

**Type:** `number | null`

### `type`

The type of the channel

**Type:** `ThreadChannelTypes`

### `unarchivable`

Whether the thread is unarchivable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `viewable`

Whether the thread is viewable by the client user

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

### `delete`

Deletes this thread.

```ts

delete(reason?: string): Promise<ThreadChannel>

```

- `reason?: string` — Reason for deleting this thread

**Returns:** `Promise<ThreadChannel>`

```ts
// Delete the thread
thread.delete('cleaning out old threads')
  .then(deletedThread => console.log(deletedThread))
  .catch(console.error);
```

### `edit`

Edits this thread.

```ts

edit(data: ThreadEditData, reason?: string): Promise<ThreadChannel>

```

- `data: ThreadEditData` — The new data for this thread
- `reason?: string` — Reason for editing this thread

**Returns:** `Promise<ThreadChannel>`

```ts
// Edit a thread
thread.edit({ name: 'new-thread' })
  .then(editedThread => console.log(editedThread))
  .catch(console.error);
```

### `fetch`

Fetches this channel.

```ts

fetch(force?: boolean): Promise<ThreadChannel>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<ThreadChannel>`

### `fetchOwner`

Fetches the owner of this thread. If the thread member object isn't needed,
use ThreadChannel#ownerId instead.

```ts

fetchOwner(options?: BaseFetchOptions): Promise<ThreadMember<boolean> | null>

```

- `options?: BaseFetchOptions` — The options for fetching the member

**Returns:** `Promise<ThreadMember<boolean> | null>`

### `fetchStarterMessage`

Fetches the message that started this thread, if any.
The `Promise` will reject if the original message in a forum post is deleted
or when the original message in the parent channel is deleted.
If you just need the id of that message, use ThreadChannel#id instead.

```ts

fetchStarterMessage(options?: BaseFetchOptions): Promise<Message<boolean> | null>

```

- `options?: BaseFetchOptions` — Additional options for this fetch

**Returns:** `Promise<Message<boolean> | null>`

### `isDirectory`

Indicates whether this channel is a DirectoryChannel

```ts

isDirectory(): this

```

**Returns:** `this`

### `isPrivate`

Whether this thread is a private thread

```ts

isPrivate(): this

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

### `join`

Makes the client user join the thread.

```ts

join(): Promise<ThreadChannel>

```

**Returns:** `Promise<ThreadChannel>`

### `leave`

Makes the client user leave the thread.

```ts

leave(): Promise<ThreadChannel>

```

**Returns:** `Promise<ThreadChannel>`

### `permissionsFor`

Gets the overall set of permissions for a member or role in this thread's parent channel, taking overwrites into
account.

```ts

permissionsFor(memberOrRole: GuildMember | Role, checkAdmin?: boolean): Readonly<Permissions>

```

- `memberOrRole: GuildMember | Role` — The member or role to obtain the overall permissions for
- `checkAdmin?: boolean` — Whether having `ADMINISTRATOR` will return all permissions

**Returns:** `Readonly<Permissions>`

Gets the overall set of permissions for a member or role in this thread's parent channel, taking overwrites into
account.

```ts

permissionsFor(memberOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>, checkAdmin?: boolean): Readonly<Permissions> | null

```

- `memberOrRole: string | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>` — The member or role to obtain the overall permissions for
- `checkAdmin?: boolean` — Whether having `ADMINISTRATOR` will return all permissions

**Returns:** `Readonly<Permissions> | null`

### `pin`

Pins this thread from the forum channel.

```ts

pin(reason?: string): Promise<ThreadChannel>

```

- `reason?: string` — Reason for pinning

**Returns:** `Promise<ThreadChannel>`

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

### `setAppliedTags`

Set the applied tags for this channel (only applicable to forum threads)

```ts

setAppliedTags(appliedTags: string[], reason?: string): Promise<ThreadChannel>

```

- `appliedTags: string[]` — The tags to set for this channel
- `reason?: string` — Reason for changing the thread's applied tags

**Returns:** `Promise<ThreadChannel>`

### `setArchived`

Sets whether the thread is archived.

```ts

setArchived(archived?: boolean, reason?: string): Promise<ThreadChannel>

```

- `archived?: boolean` — Whether the thread is archived
- `reason?: string` — Reason for archiving or unarchiving

**Returns:** `Promise<ThreadChannel>`

```ts
// Archive the thread
thread.setArchived(true)
  .then(newThread => console.log(`Thread is now ${newThread.archived ? 'archived' : 'active'}`))
  .catch(console.error);
```

### `setAutoArchiveDuration`

Sets the duration after which the thread will automatically archive in case of no recent activity.

```ts

setAutoArchiveDuration(autoArchiveDuration: ThreadAutoArchiveDuration | "MAX", reason?: string): Promise<ThreadChannel>

```

- `autoArchiveDuration: ThreadAutoArchiveDuration | "MAX"` — The amount of time (in minutes) after which the thread should automatically archive in case of no recent activity
- `reason?: string` — Reason for changing the auto archive duration

**Returns:** `Promise<ThreadChannel>`

```ts
// Set the thread's auto archive time to 1 hour
thread.setAutoArchiveDuration(60)
  .then(newThread => {
    console.log(`Thread will now archive after ${newThread.autoArchiveDuration} minutes of inactivity`);
   });
  .catch(console.error);
```

### `setInvitable`

Sets whether members without the `MANAGE_THREADS` permission can invite other members without the
`MANAGE_THREADS` permission to this thread.

```ts

setInvitable(invitable?: boolean, reason?: string): Promise<ThreadChannel>

```

- `invitable?: boolean` — Whether non-moderators can invite non-moderators to this thread
- `reason?: string` — Reason for changing invite

**Returns:** `Promise<ThreadChannel>`

### `setLocked`

Sets whether the thread can be **unarchived** by anyone with `SEND_MESSAGES` permission.
When a thread is locked only members with `MANAGE_THREADS` can unarchive it.

```ts

setLocked(locked?: boolean, reason?: string): Promise<ThreadChannel>

```

- `locked?: boolean` — Whether the thread is locked
- `reason?: string` — Reason for locking or unlocking the thread

**Returns:** `Promise<ThreadChannel>`

```ts
// Set the thread to locked
thread.setLocked(true)
  .then(newThread => console.log(`Thread is now ${newThread.locked ? 'locked' : 'unlocked'}`))
  .catch(console.error);
```

### `setName`

Sets a new name for this thread.

```ts

setName(name: string, reason?: string): Promise<ThreadChannel>

```

- `name: string` — The new name for the thread
- `reason?: string` — Reason for changing the thread's name

**Returns:** `Promise<ThreadChannel>`

```ts
// Change the thread's name
thread.setName('not_general')
  .then(newThread => console.log(`Thread's new name is ${newThread.name}`))
  .catch(console.error);
```

### `setRateLimitPerUser`

Sets the rate limit per user (slowmode) for this thread.

```ts

setRateLimitPerUser(rateLimitPerUser: number, reason?: string): Promise<TextBasedChannelFields>

```

- `rateLimitPerUser: number` — The new rate limit in seconds
- `reason?: string` — Reason for changing the thread's rate limit

**Returns:** `Promise<TextBasedChannelFields>`

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

### `unpin`

Unpins this thread from the forum channel.

```ts

unpin(reason?: string): Promise<ThreadChannel>

```

- `reason?: string` — Reason for unpinning

**Returns:** `Promise<ThreadChannel>`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/ThreadChannel.ts#L22
