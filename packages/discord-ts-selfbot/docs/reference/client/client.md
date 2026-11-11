# Client

The main hub for interacting with the Discord API, and the starting point for any bot.

```ts

class Client extends BaseClient

```

## Constructor

### `constructor`

```ts

constructor<Ready extends boolean = boolean>(options?: ClientOptions): Client<Ready>

```

- `options?: ClientOptions` — Options for the client

**Returns:** `Client<Ready>`

## Properties

### `api`

**Type:** `unknown` · **Modifiers:** readonly

### `application`

The application of this client

**Type:** `Application`

### `billing`

Manages the API methods

**Type:** `BillingManager`

### `channels`

All of the Channels that the client is currently handling -
as long as sharding isn't being used, this will be *every* channel in *every* guild the bot
is a member of. Note that DM channels will not be initially cached, and thus not be present
in the Manager without their explicit fetching or use.

**Type:** `ChannelManager`

### `emojis`

A manager of all the custom emojis that the client has access to

**Type:** `BaseGuildEmojiManager` · **Modifiers:** readonly

### `guilds`

A manager of all the guilds the client is currently handling -
as long as sharding isn't being used, this will be *every* guild the bot is a member of

**Type:** `GuildManager`

### `notes`

All of the note that have been cached at any point, mapped by their ids

**Type:** `UserNoteManager`

### `options`

The options the client was instantiated with

**Type:** `ClientOptions`

### `presences`

A manager of the presences belonging to this client

**Type:** `PresenceManager`

### `readyAt`

Time at which the client was last regarded as being in the `READY` state
(each time the client disconnects and successfully reconnects, this will be overwritten)

**Type:** `If<Ready, Date>`

### `readyTimestamp`

Timestamp of the time the client was last `READY` at

**Type:** `If<Ready, number>` · **Modifiers:** readonly

### `relationships`

All of the relationships User

**Type:** `RelationshipManager`

### `rest`

**Type:** `RESTManager`

### `sessionId`

The current session id of the shard

**Type:** `If<Ready, string, undefined>` · **Modifiers:** readonly

### `sessions`

All of the sessions of the client

**Type:** `SessionManager`

### `settings`

All of the settings Object

**Type:** `ClientUserSettingManager`

### `shard`

**Type:** `ShardClientUtil | null`

### `sweepers`

The sweeping functions and their intervals used to periodically sweep caches

**Type:** `Sweepers`

### `uptime`

How long it has been since the client last entered the `READY` state in milliseconds

**Type:** `If<Ready, number>`

### `user`

User that the client is logged in as

**Type:** `If<Ready, ClientUser>`

### `users`

The user manager of this client

**Type:** `UserManager`

### `voice`

The voice manager of the client

**Type:** `ClientVoiceManager`

### `voiceStates`

A manager of the voice states of this client (Support DM / Group DM)

**Type:** `VoiceStateManager`

### `widgets`

**Type:** `WidgetManager`

### `ws`

The WebSocket manager of the client

**Type:** `WebSocketManager`

## Methods

### `acceptInvite`

Join this Guild / GroupDMChannel using this invite

```ts

acceptInvite(invite: string, options?: AcceptInviteOptions): Promise<Guild | DMChannel | GroupDMChannel>

```

- `invite: string` — Invite code or URL
- `options?: AcceptInviteOptions` — Options

**Returns:** `Promise<Guild | DMChannel | GroupDMChannel>`

```ts
await client.acceptInvite('https://discord.gg/genshinimpact', { bypassOnboarding: true, bypassVerify: true })
```

### `authorizedApplications`

Retrieves the list of authorized applications (OAuth2 tokens).

```ts

authorizedApplications(): Promise<Collection<string, { application: Application; authorizedApplicationId: string; deauthorize: unknown; scopes: string[] }>>

```

**Returns:** `Promise<Collection<string, { application: Application; authorizedApplicationId: string; deauthorize: unknown; scopes: string[] }>>`

### `authorizeURL`

Authorize an application.

```ts

authorizeURL(urlOAuth2: string, options?: OAuth2AuthorizeOptions): Promise<{ location: string }>

```

- `urlOAuth2: string` — Discord Auth URL
- `options?: OAuth2AuthorizeOptions` — Oauth2 options

**Returns:** `Promise<{ location: string }>`

```ts
client.authorizeURL(`https://discord.com/api/oauth2/authorize?client_id=botID&permissions=8&scope=applications.commands%20bot`, {
        guild_id: "guildID",
      })
```

### `deauthorize`

Deauthorizes an application or token.

```ts

deauthorize(id: string, type?: "application" | "token"): Promise<void>

```

- `id: string` — The ID of the Discord Application or Token.
- `type?: "application" | "token"` — The type of the ID provided. Defaults to 'application'.

**Returns:** `Promise<void>`

### `deleteWebhook`

Deletes a webhook from Discord.

```ts

deleteWebhook(id: string, options?: WebhookDeleteOptions): Promise<void>

```

- `id: string` — The webhook's id
- `options?: WebhookDeleteOptions` — Options for deleting the webhook

**Returns:** `Promise<void>`

```ts
client.deleteWebhook('id', { token: 'token' })
  .then(() => console.log('Deleted the webhook'))
  .catch(console.error);
```

### `destroy`

Logs out, terminates the connection to Discord, and destroys the client.

```ts

destroy(): void

```

**Returns:** `void`

### `fetchGuildPreview`

Obtains a guild preview from Discord, available for all guilds the bot is in and all Discoverable guilds.

```ts

fetchGuildPreview(guild: GuildResolvable): Promise<GuildPreview>

```

- `guild: GuildResolvable` — The guild to fetch the preview for

**Returns:** `Promise<GuildPreview>`

### `fetchGuildTemplate`

Obtains a template from Discord.

```ts

fetchGuildTemplate(template: string): Promise<GuildTemplate>

```

- `template: string` — Template code or URL

**Returns:** `Promise<GuildTemplate>`

```ts
client.fetchGuildTemplate('https://discord.new/FKvmczH2HyUf')
  .then(template => console.log(`Obtained template with code: ${template.code}`))
  .catch(console.error);
```

### `fetchGuildWidget`

Obtains the widget data of a guild from Discord, available for guilds with the widget enabled.

```ts

fetchGuildWidget(guild: GuildResolvable): Promise<Widget>

```

- `guild: GuildResolvable` — The guild to fetch the widget data for

**Returns:** `Promise<Widget>`

### `fetchInvite`

Obtains an invite from Discord.

```ts

fetchInvite(invite: string, options?: ClientFetchInviteOptions): Promise<Invite>

```

- `invite: string` — Invite code or URL
- `options?: ClientFetchInviteOptions` — Options for fetching the invite

**Returns:** `Promise<Invite>`

```ts
client.fetchInvite('https://discord.gg/djs')
  .then(invite => console.log(`Obtained invite with code: ${invite.code}`))
  .catch(console.error);
```

### `fetchPremiumStickerPacks`

Obtains the list of sticker packs available to Nitro subscribers from Discord.

> **Deprecated.** Use Client#fetchStickerPacks instead.

```ts

fetchPremiumStickerPacks(): Promise<Collection<string, StickerPack>>

```

**Returns:** `Promise<Collection<string, StickerPack>>`

```ts
client.fetchPremiumStickerPacks()
  .then(packs => console.log(`Available sticker packs are: ${packs.map(pack => pack.name).join(', ')}`))
  .catch(console.error);
```

### `fetchSticker`

Obtains a sticker from Discord.

```ts

fetchSticker(id: string): Promise<Sticker>

```

- `id: string` — The sticker's id

**Returns:** `Promise<Sticker>`

```ts
client.fetchSticker('id')
  .then(sticker => console.log(`Obtained sticker with name: ${sticker.name}`))
  .catch(console.error);
```

### `fetchStickerPacks`

```ts

fetchStickerPacks(options: { packId: string }): Promise<StickerPack>

```

- `options: { packId: string }`

**Returns:** `Promise<StickerPack>`

```ts

fetchStickerPacks(options?: StickerPackFetchOptions): Promise<Collection<string, StickerPack>>

```

- `options?: StickerPackFetchOptions`

**Returns:** `Promise<Collection<string, StickerPack>>`

### `fetchVoiceRegions`

Obtains the available voice regions from Discord.

```ts

fetchVoiceRegions(): Promise<Collection<string, VoiceRegion>>

```

**Returns:** `Promise<Collection<string, VoiceRegion>>`

```ts
client.fetchVoiceRegions()
  .then(regions => console.log(`Available regions are: ${regions.map(region => region.name).join(', ')}`))
  .catch(console.error);
```

### `fetchWebhook`

Obtains a webhook from Discord.

```ts

fetchWebhook(id: string, token?: string): Promise<Webhook>

```

- `id: string` — The webhook's id
- `token?: string` — Token for the webhook

**Returns:** `Promise<Webhook>`

```ts
client.fetchWebhook('id', 'token')
  .then(webhook => console.log(`Obtained webhook with name: ${webhook.name}`))
  .catch(console.error);
```

### `generateInvite`

Generates an invite link for the client.

```ts

generateInvite(options?: InviteGenerationOptions): string

```

- `options?: InviteGenerationOptions` — Options for the invite

**Returns:** `string`

```ts
const link = client.generateInvite({
  scopes: ['applications.commands', 'bot'],
  permissions: ['MANAGE_GUILD'],
});
console.log(link);
```

### `installUserApps`

Install User Apps

```ts

installUserApps(applicationId: string): Promise<false | { location: string }>

```

- `applicationId: string` — Discord Application id

**Returns:** `Promise<false | { location: string }>`

### `isReady`

Returns whether the client has logged in, indicative of being able to access
properties such as `user` and `application`.

```ts

isReady(): this

```

**Returns:** `this`

### `login`

Logs the client in, establishing a WebSocket connection to Discord.

```ts

login(token?: string): Promise<string>

```

- `token?: string` — Token of the account to log in with

**Returns:** `Promise<string>`

```ts
client.login('my token');
```

### `logout`

Logs out, terminates the connection to Discord, destroys the client and destroys the token.

```ts

logout(): Promise<void>

```

**Returns:** `Promise<void>`

### `passLogin`

Logs the client in, establishing a WebSocket connection to Discord.

> **Deprecated.** This method will not be updated until I find the most convenient way to implement MFA.

```ts

passLogin(email: string, password: string): Promise<string | null>

```

- `email: string` — The email associated with the account
- `password: string` — The password assicated with the account

**Returns:** `Promise<string | null>`

```ts
client.passLogin("test@gmail.com", "SuperSecretPa$$word", 1234)
```

### `QRLogin`

```ts

QRLogin(): Promise<void>

```

**Returns:** `Promise<void>`

### `redeemNitro`

Redeem nitro from code or url.

```ts

redeemNitro(nitro: string, channel?: TextChannelResolvable, paymentSourceId?: string): false | Promise<any>

```

- `nitro: string` — Nitro url or code
- `channel?: TextChannelResolvable` — Channel that the code was sent in
- `paymentSourceId?: string` — Payment source id

**Returns:** `false | Promise<any>`

### `refreshAttachmentURL`

Refresh the Discord CDN links with hashes so they can be usable.

```ts

refreshAttachmentURL(urls: string[]): Promise<{ original: string; refreshed: string }[]>

```

- `urls: string[]` — Discord CDN URLs

**Returns:** `Promise<{ original: string; refreshed: string }[]>`

### `sleep`

The sleep function in JavaScript returns a promise that resolves after a specified timeout.

```ts

sleep(timeout: number): Promise<void>

```

- `timeout: number` — The timeout parameter is the amount of time, in milliseconds, that the sleep function will wait before resolving the promise and continuing execution.

**Returns:** `Promise<void>`

### `sweepMessages`

Sweeps all text-based channels' messages and removes the ones older than the max message lifetime.
If the message has been edited, the time of the edit is used rather than the time of the original message.

> **Deprecated.** Use Sweepers#sweepMessages instead

```ts

sweepMessages(lifetime?: number): number

```

- `lifetime?: number` — Messages that are older than this (in seconds) will be removed from the caches. The default is based on ClientOptions#messageCacheLifetime

**Returns:** `number`

```ts
// Remove all messages older than 1800 seconds from the messages cache
const amount = client.sweepMessages(1800);
console.log(`Successfully removed ${amount} messages from the cache.`);
```

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

## Events

### `applicationCommandPermissionsUpdate`

Emitted whenever permissions for an application command in a guild were updated.
This includes permission updates for other applications in addition to the logged in client,
check `data.applicationId` to verify which application the update is for

- `data` — The updated permissions

### `autoModerationActionExecution`

Emitted whenever an auto moderation rule is triggered.
This event requires the Permissions.FLAGS.MANAGE_GUILD permission.

- `autoModerationActionExecution` — The data of the execution

### `autoModerationRuleCreate`

Emitted whenever an auto moderation rule is created.
This event requires the Permissions.FLAGS.MANAGE_GUILD permission.

- `autoModerationRule` — The created auto moderation rule

### `autoModerationRuleDelete`

Emitted whenever an auto moderation rule is deleted.
This event requires the Permissions.FLAGS.MANAGE_GUILD permission.

- `autoModerationRule` — The deleted auto moderation rule

### `autoModerationRuleUpdate`

Emitted whenever an auto moderation rule gets updated.
This event requires the Permissions.FLAGS.MANAGE_GUILD permission.

- `oldAutoModerationRule` — The auto moderation rule before the update
- `newAutoModerationRule` — The auto moderation rule after the update

### `channelCreate`

Emitted whenever a guild channel is created.

- `channel` — The channel that was created

### `channelDelete`

Emitted whenever a channel is deleted.

- `channel` — The channel that was deleted

### `guildAuditLogEntryCreate`

Emitted whenever a guild audit log entry is created.

- `auditLogEntry` — The entry that was created
- `guild` — The guild where the entry was created

### `guildBanAdd`

Emitted whenever a member is banned from a guild.

- `ban` — The ban that occurred

### `guildBanRemove`

Emitted whenever a member is unbanned from a guild.

- `ban` — The ban that was removed

### `guildUnavailable`

Emitted whenever a guild becomes unavailable, likely due to a server outage.

- `guild` — The guild that has become unavailable

### `guildDelete`

Emitted whenever a guild kicks the client or the guild is deleted/left.

- `guild` — The guild that was deleted

### `emojiCreate`

Emitted whenever a custom emoji is created in a guild.

- `emoji` — The emoji that was created

### `emojiDelete`

Emitted whenever a custom emoji is deleted in a guild.

- `emoji` — The emoji that was deleted

### `emojiUpdate`

Emitted whenever a custom emoji is updated in a guild.

- `oldEmoji` — The old emoji
- `newEmoji` — The new emoji

### `guildIntegrationsUpdate`

Emitted whenever a guild integration is updated

- `guild` — The guild whose integrations were updated

### `guildMemberRemove`

Emitted whenever a member leaves a guild, or is kicked.

- `member` — The member that has left/been kicked from the guild

### `guildMemberUpdate`

Emitted whenever a guild member changes - i.e. new role, removed role, nickname.

- `oldMember` — The member before the update
- `newMember` — The member after the update

### `guildMemberAvailable`

Emitted whenever a member becomes available.

- `member` — The member that became available

### `roleCreate`

Emitted whenever a role is created.

- `role` — The role that was created

### `roleDelete`

Emitted whenever a guild role is deleted.

- `role` — The role that was deleted

### `roleUpdate`

Emitted whenever a guild role is updated.

- `oldRole` — The role before the update
- `newRole` — The role after the update

### `guildScheduledEventCreate`

Emitted whenever a guild scheduled event is created.

- `guildScheduledEvent` — The created guild scheduled event

### `guildScheduledEventDelete`

Emitted whenever a guild scheduled event is deleted.

- `guildScheduledEvent` — The deleted guild scheduled event

### `guildScheduledEventUpdate`

Emitted whenever a guild scheduled event gets updated.

- `oldGuildScheduledEvent` — The guild scheduled event object before the update
- `newGuildScheduledEvent` — The guild scheduled event object after the update

### `guildScheduledEventUserAdd`

Emitted whenever a user subscribes to a guild scheduled event

- `guildScheduledEvent` — The guild scheduled event
- `user` — The user who subscribed

### `guildScheduledEventUserRemove`

Emitted whenever a user unsubscribes from a guild scheduled event

- `guildScheduledEvent` — The guild scheduled event
- `user` — The user who unsubscribed

### `stickerCreate`

Emitted whenever a custom sticker is created in a guild.

- `sticker` — The sticker that was created

### `stickerDelete`

Emitted whenever a custom sticker is deleted in a guild.

- `sticker` — The sticker that was deleted

### `stickerUpdate`

Emitted whenever a custom sticker is updated in a guild.

- `oldSticker` — The old sticker
- `newSticker` — The new sticker

### `guildUpdate`

Emitted whenever a guild is updated - e.g. name change.

- `oldGuild` — The guild before the update
- `newGuild` — The guild after the update

### `inviteCreate`

Emitted when an invite is created.
 This event only triggers if the client has `MANAGE_GUILD` permissions for the guild,
or `MANAGE_CHANNELS` permissions for the channel.

- `invite` — The invite that was created

### `inviteDelete`

Emitted when an invite is deleted.
 This event only triggers if the client has `MANAGE_GUILD` permissions for the guild,
or `MANAGE_CHANNELS` permissions for the channel.

- `invite` — The invite that was deleted

### `messageCreate`

Emitted whenever a message is created.

- `message` — The created message

### `message`

Emitted whenever a message is created.

- `message` — The created message

### `messageDelete`

Emitted whenever a message is deleted.

- `message` — The deleted message

### `messageDeleteBulk`

Emitted whenever messages are deleted in bulk.

- `messages` — The deleted messages, mapped by their id

### `messagePollVoteAdd`

Emitted whenever a user votes in a poll.

- `pollAnswer` — The answer that was voted on
- `userId` — The id of the user that voted

### `messagePollVoteRemove`

Emitted whenever a user removes their vote in a poll.

- `pollAnswer` — The answer where the vote was removed
- `userId` — The id of the user that removed their vote

### `messageReactionAdd`

Emitted whenever a reaction is added to a cached message.

- `messageReaction` — The reaction object
- `user` — The user that applied the guild or reaction emoji
- `details` — Details of adding the reaction

### `messageReactionRemove`

Emitted whenever a reaction is removed from a cached message.

- `messageReaction` — The reaction object
- `user` — The user whose emoji or reaction emoji was removed
- `details` — Details of removing the reaction

### `messageReactionRemoveAll`

Emitted whenever all reactions are removed from a cached message.

- `message` — The message the reactions were removed from
- `reactions` — The cached message reactions that were removed.

### `messageReactionRemoveEmoji`

Emitted when a bot removes an emoji reaction from a cached message.

- `reaction` — The reaction that was removed

### `presenceUpdate`

Emitted whenever a guild member's presence (e.g. status, activity) is changed.

- `oldPresence` — The presence before the update, if one at all
- `newPresence` — The presence after the update

### `stageInstanceCreate`

Emitted whenever a stage instance is created.

- `stageInstance` — The created stage instance

### `stageInstanceDelete`

Emitted whenever a stage instance is deleted.

- `stageInstance` — The deleted stage instance

### `stageInstanceUpdate`

Emitted whenever a stage instance gets updated - e.g. change in topic or privacy level

- `oldStageInstance` — The stage instance before the update
- `newStageInstance` — The stage instance after the update

### `threadCreate`

Emitted whenever a thread is created or when the client user is added to a thread.

- `thread` — The thread that was created
- `newlyCreated` — Whether the thread was newly created

### `threadDelete`

Emitted whenever a thread is deleted.

- `thread` — The thread that was deleted

### `threadListSync`

Emitted whenever the client user gains access to a text or news channel that contains threads

- `threads` — The threads that were synced

### `threadMembersUpdate`

Emitted whenever members are added or removed from a thread. Requires `GUILD_MEMBERS` privileged intent

- `oldMembers` — The members before the update
- `newMembers` — The members after the update

### `threadMemberUpdate`

Emitted whenever the client user's thread member is updated.

- `oldMember` — The member before the update
- `newMember` — The member after the update

### `typingStart`

Emitted whenever a user starts typing in a channel.

- `typing` — The typing state

### `userUpdate`

Emitted whenever a user's details (e.g. username) are changed.
Triggered by the Discord gateway events USER_UPDATE, GUILD_MEMBER_UPDATE, and PRESENCE_UPDATE.

- `oldUser` — The user before the update
- `newUser` — The user after the update

### `voiceStateUpdate`

Emitted whenever a member changes voice state - e.g. joins/leaves a channel, mutes/unmutes.

- `oldState` — The voice state before the update
- `newState` — The voice state after the update

### `webhookUpdate`

Emitted whenever a channel has its webhooks changed.

- `channel` — The channel that had a webhook update

### `warn`

Emitted for general warnings.

- `info` — The warning

### `guildMemberSpeaking`

Emitted once a guild member changes speaking state.

- `member` — The member that started/stopped speaking
- `speaking` — The speaking state of the member

### `guildAvailable`

Emitted whenever a guild becomes available.

- `guild` — The guild that became available

### `guildCreate`

Emitted whenever the client joins a guild.

- `guild` — The created guild

### `interactionCreate`

Emitted when an interaction is created.

- `interaction` — The interaction that was created

### `interactionModalCreate`

Emitted whenever client user receive interaction.showModal()

- `modal` — The modal (extended)

### `shardReady`

Emitted when a shard turns ready.

- `id` — The shard id that turned ready
- `unavailableGuilds` — Set of unavailable guild ids, if any

### `shardDisconnect`

Emitted when a shard's WebSocket disconnects and will no longer reconnect.

- `event` — The WebSocket close event
- `id` — The shard id that disconnected

### `shardReconnecting`

Emitted when a shard is attempting to reconnect or re-identify.

- `id` — The shard id that is attempting to reconnect

### `invalidated`

Emitted when the client's session becomes invalidated.
You are expected to handle closing the process gracefully and preventing a boot loop
if you are listening to this event.

### `unhandledPacket`

Emitted whenever a packet isn't handled.

- `packet` — The packet (t: EVENT_NAME, d: unknown)
- `shard` — The shard that received the packet (Shard 0)

### `ready`

Emitted when the client becomes ready to start working.

- `client` — The client

### `shardError`

Emitted whenever a shard's WebSocket encounters a connection error.

- `error` — The encountered error
- `shardId` — The shard that encountered this error

### `error`

Emitted when the client encounters an error.
Errors thrown within this event do not have a catch handler, it is
recommended to not use async functions as `error` event handlers. See the
[Node.js docs](https://nodejs.org/api/events.html#capture-rejections-of-promises) for details.

- `error` — The error encountered

### `debug`

Emitted for general debugging information.

- `info` — The debug information

### `rateLimit`

Emitted when the client hits a rate limit while making a request

- `rateLimitData` — Object containing the rate limit info

### `apiRequest`

Emitted before every API request.
This event can emit several times for the same request, e.g. when hitting a rate limit.
This is an informational event that is emitted quite frequently,
it is highly recommended to check `request.path` to filter the data.

- `request` — The request that is about to be sent

### `apiResponse`

Emitted after every API request has received a response.
This event does not necessarily correlate to completion of the request, e.g. when hitting a rate limit.
This is an informational event that is emitted quite frequently,
it is highly recommended to check `request.path` to filter the data.

- `request` — The request that triggered this response
- `response` — The response received from the Discord API

### `invalidRequestWarning`

Emitted periodically when the process sends invalid requests to let users avoid the
10k invalid requests in 10 minutes threshold that causes a ban

- `invalidRequestWarningData` — Object containing the invalid request info

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/client/Client.ts#L52
