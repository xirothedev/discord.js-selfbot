# Message

Represents a message on Discord.

```ts

class Message extends Base

```

## Properties

### `activity`

Group activity

**Type:** `MessageActivity | null`

### `applicationId`

The id of the application of the interaction that sent this message, if any

**Type:** `string | null`

### `attachments`

A collection of attachments in the message - e.g. Pictures - mapped by their ids

**Type:** `Collection<string, MessageAttachment>`

### `author`

The author of the message

**Type:** `User`

### `bulkDeletable`

Whether the message is bulk deletable by the client user

**Type:** `unknown`

### `call`

The call associated with the message

**Type:** `MessageCall | null`

### `channel`

The channel that the message was sent in

**Type:** `If<Cached, GuildTextBasedChannel, TextBasedChannel>` · **Modifiers:** readonly

### `channelId`

The id of the channel the message was sent in

**Type:** `string`

### `cleanContent`

The message contents with all mentions replaced by the equivalent text.
If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.

**Type:** `string` · **Modifiers:** readonly

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `components`

An array of components in the message

**Type:** `TopLevelComponent[]`

### `content`

The content of the message

**Type:** `string`

### `createdAt`

The time the message was sent at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp the message was sent at

**Type:** `number`

### `crosspostable`

Whether the message is crosspostable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `deletable`

Whether the message is deletable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `editable`

Whether the message is editable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `editedAt`

The time the message was last edited at (if applicable)

**Type:** `Date | null` · **Modifiers:** readonly

### `editedTimestamp`

The timestamp the message was last edited at (if applicable)

**Type:** `number | null`

### `embeds`

A list of embeds in the message - e.g. YouTube Player

**Type:** `MessageEmbed[]`

### `flags`

Flags that are applied to the message

**Type:** `Readonly<MessageFlags>`

### `groupActivityApplication`

Supplemental application information for group activities

**Type:** `Application | null`

### `guild`

The guild the message was sent in (if in a guild channel)

**Type:** `If<Cached, Guild>` · **Modifiers:** readonly

### `guildId`

**Type:** `If<Cached, string>`

### `hasThread`

Whether this message has a thread associated with it

**Type:** `boolean` · **Modifiers:** readonly

### `id`

The message's id

**Type:** `string`

### `interaction`

**Type:** `MessageInteraction | null`

### `interactionMetadata`

Partial data of the interaction that this message is a result of

**Type:** `MessageInteractionMetadata | null`

### `isMessage`

Check data

**Type:** `true` · **Modifiers:** readonly

### `member`

Represents the author of the message as a guild member.
Only available if the message comes from a guild where the author is still a member

**Type:** `GuildMember | null` · **Modifiers:** readonly

### `mentions`

All valid mentions that the message contains

**Type:** `MessageMentions`

### `messageSnapshots`

The message snapshots associated with the message reference

**Type:** `Collection<string, MessageSnapshot>`

### `nonce`

A random number or string used for checking message delivery
This is only received after the message was sent successfully, and
lost if re-fetched

**Type:** `string | number | null`

### `partial`

Whether or not this message is a partial

**Type:** `false` · **Modifiers:** readonly

### `pinnable`

Whether the message is pinnable by the client user

**Type:** `boolean` · **Modifiers:** readonly

### `pinned`

Whether or not this message is pinned

**Type:** `boolean | null`

### `poll`

The poll that was sent with the message

**Type:** `Poll | null`

### `position`

A generally increasing integer (there may be gaps or duplicates) that represents
the approximate position of the message in a thread.

**Type:** `number | null`

### `reactions`

A manager of the reactions belonging to this message

**Type:** `ReactionManager`

### `reference`

Message reference data

**Type:** `MessageReference | null`

### `resolved`

**Type:** `CommandInteractionResolvedData<CacheType> | null`

### `roleSubscriptionData`

The data of the role subscription purchase or renewal.
This is present on role subscription purchase messages.

**Type:** `RoleSubscriptionData | null`

### `sharedClientTheme`

The shared client theme sent with this message

**Type:** `SharedClientTheme | null`

### `stickers`

A collection of stickers in the message

**Type:** `Collection<string, Sticker>`

### `system`

Whether or not this message was sent by Discord, not actually a user (e.g. pin notifications)

**Type:** `boolean`

### `thread`

The thread started by this message
This property is not suitable for checking whether a message has a thread,
use Message#hasThread instead.

**Type:** `ThreadChannel | null` · **Modifiers:** readonly

### `tts`

Whether or not the message was Text-To-Speech

**Type:** `boolean`

### `type`

The type of the message

**Type:** `"DEFAULT" | "APPLICATION_COMMAND" | "RECIPIENT_ADD" | "RECIPIENT_REMOVE" | "CALL" | "CHANNEL_NAME_CHANGE" | "CHANNEL_ICON_CHANGE" | "CHANNEL_PINNED_MESSAGE" | "GUILD_MEMBER_JOIN" | "USER_PREMIUM_GUILD_SUBSCRIPTION" | "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1" | "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2" | "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3" | "CHANNEL_FOLLOW_ADD" | "GUILD_DISCOVERY_DISQUALIFIED" | "GUILD_DISCOVERY_REQUALIFIED" | "GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING" | "GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING" | "THREAD_CREATED" | "REPLY" | "THREAD_STARTER_MESSAGE" | "GUILD_INVITE_REMINDER" | "CONTEXT_MENU_COMMAND" | "AUTO_MODERATION_ACTION" | "ROLE_SUBSCRIPTION_PURCHASE" | "INTERACTION_PREMIUM_UPSELL" | "STAGE_START" | "STAGE_END" | "STAGE_SPEAKER" | "STAGE_RAISE_HAND" | "STAGE_TOPIC" | "GUILD_APPLICATION_PREMIUM_SUBSCRIPTION" | "PREMIUM_REFERRAL" | "GUILD_INCIDENT_ALERT_MODE_ENABLED" | "GUILD_INCIDENT_ALERT_MODE_DISABLED" | "GUILD_INCIDENT_REPORT_RAID" | "GUILD_INCIDENT_REPORT_FALSE_ALARM" | "GUILD_DEADCHAT_REVIVE_PROMPT" | "CUSTOM_GIFT" | "GUILD_GAMING_STATS_PROMPT" | "PURCHASE_NOTIFICATION" | "POLL_RESULT" | "CHANGELOG" | "NITRO_NOTIFICATION"`

### `url`

The URL to jump to this message

**Type:** `string` · **Modifiers:** readonly

### `webhookId`

The id of the webhook that sent the message, if applicable

**Type:** `string | null`

## Methods

### `awaitMessageComponent`

Collects a single component interaction that passes the filter.
The Promise will reject if the time expires.

```ts

awaitMessageComponent<T extends MessageComponentInteractableResolvable>(options?: AwaitMessageCollectorOptionsParams<T, Cached>): Promise<MappedInteractionTypes<Cached>[T]>

```

- `options?: AwaitMessageCollectorOptionsParams<T, Cached>` — Options to pass to the internal collector

**Returns:** `Promise<MappedInteractionTypes<Cached>[T]>`

```ts
// Collect a message component interaction
const filter = (interaction) => interaction.customId === 'button' && interaction.user.id === 'someId';
message.awaitMessageComponent({ filter, time: 15_000 })
  .then(interaction => console.log(`${interaction.customId} was clicked!`))
  .catch(console.error);
```

### `awaitReactions`

Similar to createReactionCollector but in promise form.
Resolves with a collection of reactions that pass the specified filter.

```ts

awaitReactions(options?: AwaitReactionsOptions): Promise<Collection<string, MessageReaction>>

```

- `options?: AwaitReactionsOptions` — Optional options to pass to the internal collector

**Returns:** `Promise<Collection<string, MessageReaction>>`

```ts
// Create a reaction collector
const filter = (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someId'
message.awaitReactions({ filter, time: 15_000 })
  .then(collected => console.log(`Collected ${collected.size} reactions`))
  .catch(console.error);
```

### `clickButton`

Click a specified button in the message based on the button's CustomID

```ts

clickButton(button: string): Promise<Modal | Message<boolean>>

```

- `button: string`

**Returns:** `Promise<Modal | Message<boolean>>`

### `createMessageComponentCollector`

Creates a message component interaction collector.

```ts

createMessageComponentCollector<T extends MessageComponentInteractableResolvable>(options?: MessageCollectorOptionsParams<T, Cached>): InteractionCollector<MappedInteractionTypes<Cached>[T]>

```

- `options?: MessageCollectorOptionsParams<T, Cached>` — Options to send to the collector

**Returns:** `InteractionCollector<MappedInteractionTypes<Cached>[T]>`

```ts
// Create a message component interaction collector
const filter = (interaction) => interaction.customId === 'button' && interaction.user.id === 'someId';
const collector = message.createMessageComponentCollector({ filter, time: 15_000 });
collector.on('collect', i => console.log(`Collected ${i.customId}`));
collector.on('end', collected => console.log(`Collected ${collected.size} items`));
```

### `createReactionCollector`

Creates a reaction collector.

```ts

createReactionCollector(options?: ReactionCollectorOptions): ReactionCollector

```

- `options?: ReactionCollectorOptions` — Options to send to the collector

**Returns:** `ReactionCollector`

```ts
// Create a reaction collector
const filter = (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someId';
const collector = message.createReactionCollector({ filter, time: 15_000 });
collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
collector.on('end', collected => console.log(`Collected ${collected.size} items`));
```

### `crosspost`

Publishes a message in an announcement channel to all channels following it.

```ts

crosspost(): Promise<Message<boolean>>

```

**Returns:** `Promise<Message<boolean>>`

```ts
// Crosspost a message
if (message.channel.type === 'GUILD_NEWS') {
  message.crosspost()
    .then(() => console.log('Crossposted message'))
    .catch(console.error);
}
```

### `delete`

Deletes the message.

```ts

delete(): Promise<Message<boolean>>

```

**Returns:** `Promise<Message<boolean>>`

```ts
// Delete a message
message.delete()
  .then(msg => console.log(`Deleted message from ${msg.author.username}`))
  .catch(console.error);
```

### `edit`

Edits the content of the message.

```ts

edit(content: string | MessagePayload | MessageEditOptions): Promise<Message<boolean>>

```

- `content: string | MessagePayload | MessageEditOptions`

**Returns:** `Promise<Message<boolean>>`

```ts
// Update the content of a message
message.edit('This is my new content!')
  .then(msg => console.log(`Updated the content of a message to ${msg.content}`))
  .catch(console.error);
```

### `endPoll`

```ts

endPoll(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `equals`

Used mainly internally. Whether two messages are identical in properties. If you want to compare messages
without checking all the properties, use `message.id === message2.id`, which is much more efficient. This
method allows you to see if there are differences in content, embeds, attachments, nonce and tts properties.

```ts

equals(message: Message, rawData: unknown): boolean

```

- `message: Message` — The message to compare it to
- `rawData: unknown` — Raw data passed through the WebSocket about this message

**Returns:** `boolean`

### `fetch`

Fetch this message.

```ts

fetch(force?: boolean): Promise<Message<boolean>>

```

- `force?: boolean` — Whether to skip the cache check and request the API

**Returns:** `Promise<Message<boolean>>`

### `fetchInteractionData`

```ts

fetchInteractionData(): Promise<Record<string, unknown>>

```

**Returns:** `Promise<Record<string, unknown>>`

### `fetchPollAnswerVoters`

```ts

fetchPollAnswerVoters(answerId: string): Promise<unknown>

```

- `answerId: string`

**Returns:** `Promise<unknown>`

### `fetchReference`

Fetches the Message this crosspost/reply/pin-add references, if available to the client

```ts

fetchReference(): Promise<Message<boolean>>

```

**Returns:** `Promise<Message<boolean>>`

### `fetchWebhook`

Fetches the webhook used to create this message.

```ts

fetchWebhook(): Promise<Webhook>

```

**Returns:** `Promise<Webhook>`

### `forward`

Forwards this message

```ts

forward(channel: TextBasedChannelResolvable): Promise<Message<boolean>>

```

- `channel: TextBasedChannelResolvable` — The channel to forward this message to.

**Returns:** `Promise<Message<boolean>>`

### `hideFromGuildFeed`

```ts

hideFromGuildFeed(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `inGuild`

Whether this message is from a guild.

```ts

inGuild(): this

```

**Returns:** `this`

### `markRead`

Marks the message as read.

```ts

markRead(): Promise<void>

```

**Returns:** `Promise<void>`

### `markUnread`

Marks the message as unread.

```ts

markUnread(): Promise<void>

```

**Returns:** `Promise<void>`

### `pin`

Pins this message to the channel's pinned messages.

```ts

pin(reason?: string): Promise<Message<boolean>>

```

- `reason?: string` — Reason for pinning

**Returns:** `Promise<Message<boolean>>`

```ts
// Pin a message
message.pin()
  .then(console.log)
  .catch(console.error)
```

### `react`

Adds a reaction to the message.

```ts

react(emoji: EmojiIdentifierResolvable, burst?: boolean): Promise<MessageReaction>

```

- `emoji: EmojiIdentifierResolvable` — The emoji to react with
- `burst?: boolean` — Super Reactions

**Returns:** `Promise<MessageReaction>`

```ts
// React to a message with a unicode emoji
message.react('🤔')
  .then(console.log)
  .catch(console.error);
```

```ts
// React to a message with a custom emoji
message.react(message.guild.emojis.cache.get('123456789012345678'))
  .then(console.log)
  .catch(console.error);
```

### `removeAttachments`

Removes the attachments from this message.

```ts

removeAttachments(): Promise<Message<boolean>>

```

**Returns:** `Promise<Message<boolean>>`

### `reply`

Send an inline reply to this message.

```ts

reply(options: string | MessagePayload | ReplyMessageOptions): Promise<Message<boolean>>

```

- `options: string | MessagePayload | ReplyMessageOptions` — The options to provide

**Returns:** `Promise<Message<boolean>>`

```ts
// Reply to a message
message.reply('This is a reply!')
  .then(() => console.log(`Replied to message "${message.content}"`))
  .catch(console.error);
```

### `report`

Report Message

```ts

report(breadcrumbs: number[], elements?: Record<string, unknown>): Promise<{ report_id: string }>

```

- `breadcrumbs: number[]` — Options for reporting
- `elements?: Record<string, unknown>` — Metadata

**Returns:** `Promise<{ report_id: string }>`

```ts
// GET https://discord.com/api/v9/reporting/menu/message?variant=4
// Report Category
// - <hidden>MESSAGE_WELCOME (3)</hidden>
// - Something else (28)
// - Hacks, cheats, phishing or malicious links (72)
message.report([3, 28, 72]).then(console.log);
// { "report_id": "1199663489988440124" }
```

### `resolveComponent`

Resolves a component by a custom id.

```ts

resolveComponent(customId: string): MessageActionRowComponent | null

```

- `customId: string` — The custom id to resolve against

**Returns:** `MessageActionRowComponent | null`

### `selectMenu`

Select specific menu

```ts

selectMenu(menu: string | 0 | 1 | 2 | 3 | 4, vales: (string | CategoryChannel | DMChannel | PartialDMChannel | GroupDMChannel | NewsChannel | StageChannel | StoreChannel | TextChannel | ThreadChannel | VoiceChannel | ForumChannel | MediaChannel | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>)[]): Promise<Modal | Message<boolean>>

```

- `menu: string | 0 | 1 | 2 | 3 | 4` — Target
- `vales: (string | CategoryChannel | DMChannel | PartialDMChannel | GroupDMChannel | NewsChannel | StageChannel | StoreChannel | TextChannel | ThreadChannel | VoiceChannel | ForumChannel | MediaChannel | GuildMember | Role | User | Message<boolean> | ThreadMember<boolean>)[]`

**Returns:** `Promise<Modal | Message<boolean>>`

### `startThread`

Create a new public thread from this message

```ts

startThread(options: StartThreadOptions): Promise<ThreadChannel>

```

- `options: StartThreadOptions` — Options for starting a thread on this message

**Returns:** `Promise<ThreadChannel>`

### `suppressEmbeds`

Suppresses or unsuppresses embeds on a message.

```ts

suppressEmbeds(suppress?: boolean): Promise<Message<boolean>>

```

- `suppress?: boolean` — If the embeds should be suppressed or not

**Returns:** `Promise<Message<boolean>>`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `toString`

Returns a string representation of an object.

```ts

toString(): string

```

**Returns:** `string`

```ts
// Logs: Message: This is a message!
console.log(`Message: ${message}`);
```

### `unhideFromGuildFeed`

```ts

unhideFromGuildFeed(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `unpin`

Unpins this message from the channel's pinned messages.

```ts

unpin(reason?: string): Promise<Message<boolean>>

```

- `reason?: string` — Reason for unpinning

**Returns:** `Promise<Message<boolean>>`

```ts
// Unpin a message
message.unpin()
  .then(console.log)
  .catch(console.error)
```

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

### `vote`

Submits a poll vote for the current user. Returns a 204 empty response on success.

```ts

vote(ids: number[]): Promise<void>

```

- `ids: number[]` — ID of the answer

**Returns:** `Promise<void>`

```ts
// Vote multi choices
message.vote(1,2);
// Remove vote
message.vote();
```

### `votePoll`

```ts

votePoll(answerIds: string[]): Promise<unknown>

```

- `answerIds: string[]`

**Returns:** `Promise<unknown>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Message.ts#L140
