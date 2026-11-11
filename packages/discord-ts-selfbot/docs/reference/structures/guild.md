# Guild

Represents a guild (or a server) on Discord.
It's recommended to see if a guild is available before performing operations or reading data from it. You can
check this with Guild#available.

```ts

class Guild extends AnonymousGuild

```

## Properties

### `afkChannel`

AFK voice channel for this guild

**Type:** `VoiceChannel | null` · **Modifiers:** readonly

### `afkChannelId`

The id of the voice channel where AFK members are moved

**Type:** `string | null`

### `afkTimeout`

The time in seconds before a user is counted as "away from keyboard"

**Type:** `number`

### `applicationId`

The id of the application that created this guild (if applicable)

**Type:** `string | null`

### `approximateMemberCount`

The approximate amount of members the guild has
You will need to fetch the guild using Guild#fetch if you want to receive this parameter

**Type:** `number | null`

### `approximatePresenceCount`

The approximate amount of presences the guild has
You will need to fetch the guild using Guild#fetch if you want to receive this parameter

**Type:** `number | null`

### `autoModerationRules`

A manager of the auto moderation rules of this guild.

**Type:** `AutoModerationRuleManager`

### `available`

Whether the guild is available to access. If it is not available, it indicates a server outage

**Type:** `boolean`

### `banner`

The hash of the guild banner

**Type:** `string | null`

### `bans`

A manager of the bans belonging to this guild

**Type:** `GuildBanManager`

### `channels`

A manager of the channels belonging to this guild

**Type:** `GuildChannelManager`

### `client`

The client that instantiated this

**Type:** `Client` · **Modifiers:** readonly

### `createdAt`

The time this guild was created at

**Type:** `Date` · **Modifiers:** readonly

### `createdTimestamp`

The timestamp this guild was created at

**Type:** `number` · **Modifiers:** readonly

### `defaultMessageNotifications`

The default message notification level of the guild

**Type:** `number | "ALL_MESSAGES" | "ONLY_MENTIONS"`

### `deleted`

Whether or not the structure has been deleted

**Type:** `boolean`

### `description`

The description of the guild, if any

**Type:** `string | null`

### `discoverySplash`

The hash of the guild discovery splash image

**Type:** `string | null`

### `emojis`

A manager of the emojis belonging to this guild

**Type:** `GuildEmojiManager`

### `explicitContentFilter`

The explicit content filter level of the guild

**Type:** `"DISABLED" | "MEMBERS_WITHOUT_ROLES" | "ALL_MEMBERS"`

### `features`

An array of features available to this guild

**Type:** `GuildFeature[]`

### `icon`

The icon hash of this guild

**Type:** `string | null`

### `id`

The guild's id

**Type:** `string`

### `incidentsData`

The incidents data of this guild.
You will need to fetch the guild using BaseGuild#fetch if you want to receive
this property.

**Type:** `IncidentActions | null`

### `invites`

A manager of the invites of this guild

**Type:** `GuildInviteManager`

### `joinedAt`

The time the client user joined the guild

**Type:** `Date` · **Modifiers:** readonly

### `joinedTimestamp`

The timestamp the client user joined the guild at

**Type:** `number`

### `large`

Whether the guild is "large" (has more than WebsocketOptions large_threshold members, 50 by default)

**Type:** `boolean`

### `maximumBitrate`

The maximum bitrate available for this guild

**Type:** `number` · **Modifiers:** readonly

### `maximumMembers`

The maximum amount of members the guild can have

**Type:** `number | null`

### `maximumPresences`

The maximum amount of presences the guild can have
You will need to fetch the guild using Guild#fetch if you want to receive this parameter

**Type:** `number | null`

### `maxStageVideoChannelUsers`

The maximum amount of users allowed in a stage video channel.

**Type:** `number | null`

### `maxVideoChannelUsers`

The maximum amount of users allowed in a video channel.

**Type:** `number | null`

### `me`

The client user as a GuildMember of this guild

**Type:** `GuildMember | null` · **Modifiers:** readonly

### `memberCount`

The full amount of members in this guild

**Type:** `number`

### `members`

A manager of the members belonging to this guild

**Type:** `GuildMemberManager`

### `mfaLevel`

The required MFA level for this guild

**Type:** `"NONE" | "ELEVATED"`

### `name`

The name of this guild

**Type:** `string`

### `nameAcronym`

The acronym that shows up in place of a guild icon

**Type:** `string` · **Modifiers:** readonly

### `nsfwLevel`

The NSFW level of this guild

**Type:** `"DEFAULT" | "EXPLICIT" | "SAFE" | "AGE_RESTRICTED"`

### `ownerId`

The user id of this guild's owner

**Type:** `string`

### `partnered`

Whether this guild is partnered

**Type:** `boolean` · **Modifiers:** readonly

### `preferredLocale`

The preferred locale of the guild, defaults to `en-US`

**Type:** `string`

### `premiumProgressBarEnabled`

Whether this guild has its premium (boost) progress bar enabled

**Type:** `boolean`

### `premiumSubscriptionCount`

The total number of boosts for this server

**Type:** `number | null`

### `premiumTier`

The premium tier of this guild

**Type:** `"NONE" | "TIER_1" | "TIER_2" | "TIER_3"`

### `presences`

A manager of the presences belonging to this guild

**Type:** `PresenceManager`

### `publicUpdatesChannel`

Public updates channel for this guild

**Type:** `TextChannel | null` · **Modifiers:** readonly

### `publicUpdatesChannelId`

The community updates channel's id for the guild

**Type:** `string | null`

### `roles`

A manager of the roles belonging to this guild

**Type:** `RoleManager`

### `rulesChannel`

Rules channel for this guild

**Type:** `TextChannel | null` · **Modifiers:** readonly

### `rulesChannelId`

The rules channel's id for the guild

**Type:** `string | null`

### `safetyAlertsChannel`

Safety alerts channel for this guild

**Type:** `TextChannel | null` · **Modifiers:** readonly

### `safetyAlertsChannelId`

The safety alerts channel's id for the guild

**Type:** `string | null`

### `scheduledEvents`

A manager of the scheduled events of this guild

**Type:** `GuildScheduledEventManager`

### `settings`

All of the settings Object

**Type:** `GuildSettingManager`

### `shard`

The Shard this Guild belongs to.

**Type:** `WebSocketShard` · **Modifiers:** readonly

### `shardId`

The id of the shard this Guild belongs to.

**Type:** `number`

### `splash`

The hash of the guild invite splash image

**Type:** `string | null`

### `stageInstances`

A manager of the stage instances of this guild

**Type:** `StageInstanceManager`

### `stickers`

A manager of the stickers belonging to this guild

**Type:** `GuildStickerManager`

### `systemChannel`

System channel for this guild

**Type:** `TextChannel | null` · **Modifiers:** readonly

### `systemChannelFlags`

The value set for the guild's system channel flags

**Type:** `Readonly<SystemChannelFlags>`

### `systemChannelId`

The system channel's id

**Type:** `string | null`

### `vanityURLCode`

The vanity invite code of the guild, if any

**Type:** `string | null`

### `vanityURLUses`

**Type:** `number | null`

### `verificationLevel`

The verification level of the guild

**Type:** `"NONE" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"`

### `verified`

Whether this guild is verified

**Type:** `boolean` · **Modifiers:** readonly

### `voiceAdapterCreator`

The voice state adapter for this guild that can be used with @discordjs/voice to play audio in voice
and stage channels.

**Type:** `InternalDiscordGatewayAdapterCreator` · **Modifiers:** readonly

### `voiceStates`

A manager of the voice states of this guild

**Type:** `VoiceStateManager` · **Modifiers:** readonly

### `widgetChannel`

Widget channel for this guild

**Type:** `NewsChannel | TextChannel | ForumChannel | MediaChannel | VoiceBasedChannel | null` · **Modifiers:** readonly

### `widgetChannelId`

The widget channel's id, if enabled

**Type:** `string | null`

### `widgetEnabled`

Whether widget images are enabled on this guild

**Type:** `boolean | null`

## Methods

### `bannerURL`

The URL to this guild's banner.

```ts

bannerURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `bulkBanV2`

```ts

bulkBanV2(data?: Record<string, unknown>): Promise<unknown>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `clearAutoModerationMentionRaid`

```ts

clearAutoModerationMentionRaid(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `createJoinRequest`

```ts

createJoinRequest(): Promise<Record<string, unknown>>

```

**Returns:** `Promise<Record<string, unknown>>`

### `createSoundboardSound`

```ts

createSoundboardSound(data?: Record<string, unknown>): Promise<unknown>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `createTemplate`

Creates a template for the guild.

```ts

createTemplate(name: string, description?: string): Promise<GuildTemplate>

```

- `name: string` — The name for the template
- `description?: string` — The description for the template

**Returns:** `Promise<GuildTemplate>`

### `delete`

Deletes the guild.

```ts

delete(): Promise<Guild>

```

**Returns:** `Promise<Guild>`

```ts
// Delete a guild
guild.delete()
  .then(g => console.log(`Deleted the guild ${g}`))
  .catch(console.error);
```

### `deleteJoinRequest`

```ts

deleteJoinRequest(): Promise<unknown>

```

**Returns:** `Promise<unknown>`

### `deleteSoundboardSound`

```ts

deleteSoundboardSound(soundId: string): Promise<unknown>

```

- `soundId: string`

**Returns:** `Promise<unknown>`

### `disableInvites`

Sets whether this guild's invites are disabled.

```ts

disableInvites(disabled?: boolean): Promise<Guild>

```

- `disabled?: boolean` — Whether the invites are disabled

**Returns:** `Promise<Guild>`

### `discoverySplashURL`

The URL to this guild's discovery splash image.

```ts

discoverySplashURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `edit`

Updates the guild with new information - e.g. a new name.

```ts

edit(data: GuildEditData, reason?: string): Promise<Guild>

```

- `data: GuildEditData` — The data to update the guild with
- `reason?: string` — Reason for editing this guild

**Returns:** `Promise<Guild>`

```ts
// Set the guild name
guild.edit({
  name: 'Discord Guild',
})
  .then(updated => console.log(`New guild name ${updated}`))
  .catch(console.error);
```

### `editGuildProfile`

```ts

editGuildProfile(data?: Record<string, unknown>): Promise<Record<string, unknown>>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<Record<string, unknown>>`

### `editMemberVerification`

```ts

editMemberVerification(data?: Record<string, unknown>): Promise<Record<string, unknown>>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<Record<string, unknown>>`

### `editOnboarding`

```ts

editOnboarding(data: Record<string, unknown>): Promise<APIGuildOnboarding>

```

- `data: Record<string, unknown>`

**Returns:** `Promise<APIGuildOnboarding>`

### `editSoundboardSound`

```ts

editSoundboardSound(soundId: string, data?: Record<string, unknown>): Promise<Record<string, unknown>>

```

- `soundId: string`
- `data?: Record<string, unknown>`

**Returns:** `Promise<Record<string, unknown>>`

### `editWelcomeScreen`

Updates the guild's welcome screen

```ts

editWelcomeScreen(data: WelcomeScreenEditData): Promise<WelcomeScreen>

```

- `data: WelcomeScreenEditData` — Data to edit the welcome screen with

**Returns:** `Promise<WelcomeScreen>`

```ts
guild.editWelcomeScreen({
  description: 'Hello World',
  enabled: true,
  welcomeChannels: [
    {
      description: 'foobar',
      channel: '222197033908436994',
    }
  ],
})
```

### `equals`

Whether this guild equals another guild. It compares all properties, so for most operations
it is advisable to just compare `guild.id === guild2.id` as it is much faster and is often
what most users need.

```ts

equals(guild: Guild): boolean

```

- `guild: Guild` — The guild to compare with

**Returns:** `boolean`

### `executeAutoModerationAlertAction`

```ts

executeAutoModerationAlertAction(data?: Record<string, unknown>): Promise<unknown>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `fetch`

Fetches this guild.

```ts

fetch(): Promise<Guild>

```

**Returns:** `Promise<Guild>`

### `fetchActiveThreads`

```ts

fetchActiveThreads(): Promise<{ members: unknown[]; threads: Collection<string, ThreadChannel> }>

```

**Returns:** `Promise<{ members: unknown[]; threads: Collection<string, ThreadChannel> }>`

### `fetchAuditLogs`

Fetches audit logs for this guild.

```ts

fetchAuditLogs<T extends GuildAuditLogsResolvable = "ALL">(options?: GuildAuditLogsFetchOptions<T>): Promise<GuildAuditLogs<T>>

```

- `options?: GuildAuditLogsFetchOptions<T>` — Options for fetching audit logs

**Returns:** `Promise<GuildAuditLogs<T>>`

```ts
// Output audit log entries
guild.fetchAuditLogs()
  .then(audit => console.log(audit.entries.first()))
  .catch(console.error);
```

### `fetchBasic`

```ts

fetchBasic(): Promise<Record<string, unknown>>

```

**Returns:** `Promise<Record<string, unknown>>`

### `fetchCurrentJoinRequest`

```ts

fetchCurrentJoinRequest(): Promise<Record<string, unknown>>

```

**Returns:** `Promise<Record<string, unknown>>`

### `fetchDefaultSoundboardSounds`

```ts

fetchDefaultSoundboardSounds(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchGuildProfile`

```ts

fetchGuildProfile(): Promise<Record<string, unknown>>

```

**Returns:** `Promise<Record<string, unknown>>`

### `fetchIntegrations`

Fetches a collection of integrations to this guild.
Resolves with a collection mapping integrations by their ids.

```ts

fetchIntegrations(): Promise<Collection<string, Integration>>

```

**Returns:** `Promise<Collection<string, Integration>>`

```ts
// Fetch integrations
guild.fetchIntegrations()
  .then(integrations => console.log(`Fetched ${integrations.size} integrations`))
  .catch(console.error);
```

### `fetchJoinRequest`

```ts

fetchJoinRequest(requestId: string): Promise<Record<string, unknown>>

```

- `requestId: string`

**Returns:** `Promise<Record<string, unknown>>`

### `fetchJoinRequestCooldown`

```ts

fetchJoinRequestCooldown(): Promise<Record<string, unknown>>

```

**Returns:** `Promise<Record<string, unknown>>`

### `fetchJoinRequests`

```ts

fetchJoinRequests(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchMemberVerification`

```ts

fetchMemberVerification(): Promise<Record<string, unknown>>

```

**Returns:** `Promise<Record<string, unknown>>`

### `fetchOnboarding`

```ts

fetchOnboarding(): Promise<APIGuildOnboarding>

```

**Returns:** `Promise<APIGuildOnboarding>`

### `fetchOnboardingAllowedApplications`

```ts

fetchOnboardingAllowedApplications(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchOwner`

Fetches the owner of the guild.
If the member object isn't needed, use Guild#ownerId instead.

```ts

fetchOwner(options?: BaseFetchOptions): Promise<GuildMember>

```

- `options?: BaseFetchOptions` — The options for fetching the member

**Returns:** `Promise<GuildMember>`

### `fetchPreview`

Obtains a guild preview for this guild from Discord.

```ts

fetchPreview(): Promise<GuildPreview>

```

**Returns:** `Promise<GuildPreview>`

### `fetchPruneCount`

```ts

fetchPruneCount(options?: { days?: number; includeRoles?: string[] }): Promise<{ pruned: number }>

```

- `options?: { days?: number; includeRoles?: string[] }`

**Returns:** `Promise<{ pruned: number }>`

### `fetchRoleMemberCounts`

```ts

fetchRoleMemberCounts(): Promise<Record<string, number>>

```

**Returns:** `Promise<Record<string, number>>`

### `fetchSoundboardSound`

```ts

fetchSoundboardSound(soundId: string): Promise<Record<string, unknown>>

```

- `soundId: string`

**Returns:** `Promise<Record<string, unknown>>`

### `fetchSoundboardSoundGuild`

```ts

fetchSoundboardSoundGuild(soundId: string): Promise<Record<string, unknown>>

```

- `soundId: string`

**Returns:** `Promise<Record<string, unknown>>`

### `fetchSoundboardSounds`

```ts

fetchSoundboardSounds(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchTemplates`

Fetches a collection of templates from this guild.
Resolves with a collection mapping templates by their codes.

```ts

fetchTemplates(): Promise<Collection<string, GuildTemplate>>

```

**Returns:** `Promise<Collection<string, GuildTemplate>>`

### `fetchTopGames`

```ts

fetchTopGames(): Promise<unknown[]>

```

**Returns:** `Promise<unknown[]>`

### `fetchVanityData`

Fetches the vanity URL invite object to this guild.
Resolves with an object containing the vanity URL invite code and the use count

```ts

fetchVanityData(): Promise<Vanity>

```

**Returns:** `Promise<Vanity>`

```ts
// Fetch invite data
guild.fetchVanityData()
  .then(res => {
    console.log(`Vanity URL: https://discord.gg/${res.code} with ${res.uses} uses`);
  })
  .catch(console.error);
```

### `fetchWebhooks`

Fetches all webhooks for the guild.

```ts

fetchWebhooks(): Promise<Collection<string, Webhook>>

```

**Returns:** `Promise<Collection<string, Webhook>>`

```ts
// Fetch webhooks
guild.fetchWebhooks()
  .then(webhooks => console.log(`Fetched ${webhooks.size} webhooks`))
  .catch(console.error);
```

### `fetchWelcomeScreen`

Fetches the welcome screen for this guild.

```ts

fetchWelcomeScreen(): Promise<WelcomeScreen>

```

**Returns:** `Promise<WelcomeScreen>`

### `fetchWidget`

Fetches the guild widget data, requires the widget to be enabled.

```ts

fetchWidget(): Promise<Widget>

```

**Returns:** `Promise<Widget>`

```ts
// Fetches the guild widget data
guild.fetchWidget()
  .then(widget => console.log(`The widget shows ${widget.channels.size} channels`))
  .catch(console.error);
```

### `fetchWidgetSettings`

Fetches the guild widget settings.

```ts

fetchWidgetSettings(): Promise<GuildWidgetSettings>

```

**Returns:** `Promise<GuildWidgetSettings>`

```ts
// Fetches the guild widget settings
guild.fetchWidgetSettings()
  .then(widget => console.log(`The widget is ${widget.enabled ? 'enabled' : 'disabled'}`))
  .catch(console.error);
```

### `iconURL`

The URL to this guild's icon.

```ts

iconURL(options?: ImageURLOptions): string | null

```

- `options?: ImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `leave`

Leaves the guild.

```ts

leave(): Promise<Guild>

```

**Returns:** `Promise<Guild>`

```ts
// Leave a guild
guild.leave()
  .then(guild => console.log(`Left the guild: ${guild.name}`))
  .catch(console.error);
```

### `markAsRead`

Marks the guild as read.

```ts

markAsRead(): Promise<void>

```

**Returns:** `Promise<void>`

```ts
const guild = client.guilds.cache.get('id');
guild.markAsRead();
```

### `pruneMembers`

```ts

pruneMembers(options?: { computePruneCount?: boolean; days?: number; includeRoles?: string[]; reason?: string }): Promise<RESTPostAPIGuildPruneResult>

```

- `options?: { computePruneCount?: boolean; days?: number; includeRoles?: string[]; reason?: string }`

**Returns:** `Promise<RESTPostAPIGuildPruneResult>`

### `reportAutoModerationRaid`

```ts

reportAutoModerationRaid(data?: Record<string, unknown>): Promise<unknown>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `resetJoinRequest`

```ts

resetJoinRequest(): Promise<Record<string, unknown>>

```

**Returns:** `Promise<Record<string, unknown>>`

### `resolveAutoModerationFalseAlarm`

```ts

resolveAutoModerationFalseAlarm(data?: Record<string, unknown>): Promise<unknown>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<unknown>`

### `searchBans`

```ts

searchBans(query: string): Promise<unknown[]>

```

- `query: string`

**Returns:** `Promise<unknown[]>`

### `sendSoundboardSound`

```ts

sendSoundboardSound(channelId: string, soundId: string): Promise<unknown>

```

- `channelId: string`
- `soundId: string`

**Returns:** `Promise<unknown>`

### `setAFKChannel`

Edits the AFK channel of the guild.

```ts

setAFKChannel(afkChannel: VoiceChannelResolvable | null, reason?: string): Promise<Guild>

```

- `afkChannel: VoiceChannelResolvable | null` — The new AFK channel
- `reason?: string` — Reason for changing the guild's AFK channel

**Returns:** `Promise<Guild>`

```ts
// Edit the guild AFK channel
guild.setAFKChannel(channel)
 .then(updated => console.log(`Updated guild AFK channel to ${guild.afkChannel.name}`))
 .catch(console.error);
```

### `setAFKTimeout`

Edits the AFK timeout of the guild.

```ts

setAFKTimeout(afkTimeout: number, reason?: string): Promise<Guild>

```

- `afkTimeout: number` — The time in seconds that a user must be idle to be considered AFK
- `reason?: string` — Reason for changing the guild's AFK timeout

**Returns:** `Promise<Guild>`

```ts
// Edit the guild AFK channel
guild.setAFKTimeout(60)
 .then(updated => console.log(`Updated guild AFK timeout to ${guild.afkTimeout}`))
 .catch(console.error);
```

### `setBanner`

Sets a new guild banner.

```ts

setBanner(banner: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null, reason?: string): Promise<Guild>

```

- `banner: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The new banner of the guild
- `reason?: string` — Reason for changing the guild's banner

**Returns:** `Promise<Guild>`

```ts
guild.setBanner('./banner.png')
 .then(updated => console.log('Updated the guild banner'))
 .catch(console.error);
```

### `setChannelPositions`

Batch-updates the guild's channels' positions.
Only one channel's parent can be changed at a time

> **Deprecated.** Use GuildChannelManager.setPositions instead

```ts

setChannelPositions(channelPositions: readonly ChannelPosition[]): Promise<Guild>

```

- `channelPositions: readonly ChannelPosition[]` — Channel positions to update

**Returns:** `Promise<Guild>`

```ts
guild.setChannelPositions([{ channel: channelId, position: newChannelIndex }])
  .then(guild => console.log(`Updated channel positions for ${guild}`))
  .catch(console.error);
```

### `setCommunity`

Set Community Feature.

```ts

setCommunity(stats?: boolean, publicUpdatesChannel?: GuildTextChannelResolvable, rulesChannel?: GuildTextChannelResolvable, reason?: string): Promise<Guild>

```

- `stats?: boolean` — True / False to enable / disable Community Feature
- `publicUpdatesChannel?: GuildTextChannelResolvable` — The community updates channel of the guild
- `rulesChannel?: GuildTextChannelResolvable` — The new rules channel
- `reason?: string` — Reason for changing the community feature

**Returns:** `Promise<Guild>`

### `setDefaultMessageNotifications`

Edits the setting of the default message notifications of the guild.

```ts

setDefaultMessageNotifications(defaultMessageNotifications: number | "ALL_MESSAGES" | "ONLY_MENTIONS" | null, reason?: string): Promise<Guild>

```

- `defaultMessageNotifications: number | "ALL_MESSAGES" | "ONLY_MENTIONS" | null` — The new default message notification level of the guild
- `reason?: string` — Reason for changing the setting of the default message notifications

**Returns:** `Promise<Guild>`

### `setDiscoverySplash`

Sets a new guild discovery splash image.

```ts

setDiscoverySplash(discoverySplash: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null, reason?: string): Promise<Guild>

```

- `discoverySplash: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The new discovery splash image of the guild
- `reason?: string` — Reason for changing the guild's discovery splash image

**Returns:** `Promise<Guild>`

```ts
// Edit the guild discovery splash
guild.setDiscoverySplash('./discoverysplash.png')
  .then(updated => console.log('Updated the guild discovery splash'))
  .catch(console.error);
```

### `setExplicitContentFilter`

Edits the level of the explicit content filter.

```ts

setExplicitContentFilter(explicitContentFilter: number | "DISABLED" | "MEMBERS_WITHOUT_ROLES" | "ALL_MEMBERS" | null, reason?: string): Promise<Guild>

```

- `explicitContentFilter: number | "DISABLED" | "MEMBERS_WITHOUT_ROLES" | "ALL_MEMBERS" | null` — The new level of the explicit content filter
- `reason?: string` — Reason for changing the level of the guild's explicit content filter

**Returns:** `Promise<Guild>`

### `setIcon`

Sets a new guild icon.

```ts

setIcon(icon: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null, reason?: string): Promise<Guild>

```

- `icon: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The new icon of the guild
- `reason?: string` — Reason for changing the guild's icon

**Returns:** `Promise<Guild>`

```ts
// Edit the guild icon
guild.setIcon('./icon.png')
 .then(updated => console.log('Updated the guild icon'))
 .catch(console.error);
```

### `setIncidentActions`

Sets the incident actions for a guild.

```ts

setIncidentActions(incidentActions: IncidentActionsEditOptions): Promise<IncidentActions>

```

- `incidentActions: IncidentActionsEditOptions` — The incident actions to set

**Returns:** `Promise<IncidentActions>`

### `setName`

Edits the name of the guild.

```ts

setName(name: string, reason?: string): Promise<Guild>

```

- `name: string` — The new name of the guild
- `reason?: string` — Reason for changing the guild's name

**Returns:** `Promise<Guild>`

```ts
// Edit the guild name
guild.setName('Discord Guild')
 .then(updated => console.log(`Updated guild name to ${updated.name}`))
 .catch(console.error);
```

### `setOwner`

Sets a new owner of the guild.

```ts

setOwner(owner: GuildMemberResolvable, reason?: string): Promise<Guild>

```

- `owner: GuildMemberResolvable` — The new owner of the guild
- `reason?: string` — Reason for setting the new owner

**Returns:** `Promise<Guild>`

```ts
// Edit the guild owner
guild.setOwner(guild.members.cache.first())
 .then(guild => guild.fetchOwner())
 .then(owner => console.log(`Updated the guild owner to ${owner.displayName}`))
 .catch(console.error);
```

### `setPreferredLocale`

Edits the preferred locale of the guild.

```ts

setPreferredLocale(preferredLocale: string | null, reason?: string): Promise<Guild>

```

- `preferredLocale: string | null` — The new preferred locale of the guild
- `reason?: string` — Reason for changing the guild's preferred locale

**Returns:** `Promise<Guild>`

```ts
// Edit the guild preferred locale
guild.setPreferredLocale('en-US')
 .then(updated => console.log(`Updated guild preferred locale to ${guild.preferredLocale}`))
 .catch(console.error);
```

### `setPremiumProgressBarEnabled`

Edits the enabled state of the guild's premium progress bar

```ts

setPremiumProgressBarEnabled(enabled?: boolean, reason?: string): Promise<Guild>

```

- `enabled?: boolean` — The new enabled state of the guild's premium progress bar
- `reason?: string` — Reason for changing the state of the guild's premium progress bar

**Returns:** `Promise<Guild>`

### `setPublicUpdatesChannel`

Edits the community updates channel of the guild.

```ts

setPublicUpdatesChannel(publicUpdatesChannel: TextChannelResolvable | null, reason?: string): Promise<Guild>

```

- `publicUpdatesChannel: TextChannelResolvable | null` — The new community updates channel
- `reason?: string` — Reason for changing the guild's community updates channel

**Returns:** `Promise<Guild>`

```ts
// Edit the guild community updates channel
guild.setPublicUpdatesChannel(channel)
 .then(updated => console.log(`Updated guild community updates channel to ${guild.publicUpdatesChannel.name}`))
 .catch(console.error);
```

### `setRolePositions`

Batch-updates the guild's role positions

> **Deprecated.** Use RoleManager.setPositions instead

```ts

setRolePositions(rolePositions: readonly RolePosition[]): Promise<Guild>

```

- `rolePositions: readonly RolePosition[]` — Role positions to update

**Returns:** `Promise<Guild>`

```ts
guild.setRolePositions([{ role: roleId, position: updatedRoleIndex }])
 .then(guild => console.log(`Role positions updated for ${guild}`))
 .catch(console.error);
```

### `setRulesChannel`

Edits the rules channel of the guild.

```ts

setRulesChannel(rulesChannel: TextChannelResolvable | null, reason?: string): Promise<Guild>

```

- `rulesChannel: TextChannelResolvable | null` — The new rules channel
- `reason?: string` — Reason for changing the guild's rules channel

**Returns:** `Promise<Guild>`

```ts
// Edit the guild rules channel
guild.setRulesChannel(channel)
 .then(updated => console.log(`Updated guild rules channel to ${guild.rulesChannel.name}`))
 .catch(console.error);
```

### `setSafetyAlertsChannel`

Edits the safety alerts channel of the guild.

```ts

setSafetyAlertsChannel(safetyAlertsChannel: TextChannelResolvable | null, reason?: string): Promise<Guild>

```

- `safetyAlertsChannel: TextChannelResolvable | null` — The new safety alerts channel
- `reason?: string` — Reason for changing the guild's safety alerts channel

**Returns:** `Promise<Guild>`

```ts
// Edit the guild safety alerts channel
guild.setSafetyAlertsChannel(channel)
 .then(updated => console.log(`Updated guild safety alerts channel to ${updated.safetyAlertsChannel.name}`))
 .catch(console.error);
```

### `setSplash`

Sets a new guild invite splash image.

```ts

setSplash(splash: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null, reason?: string): Promise<Guild>

```

- `splash: string | Buffer<ArrayBufferLike> | Buffer<ArrayBufferLike> | null` — The new invite splash image of the guild
- `reason?: string` — Reason for changing the guild's invite splash image

**Returns:** `Promise<Guild>`

```ts
// Edit the guild splash
guild.setSplash('./splash.png')
 .then(updated => console.log('Updated the guild splash'))
 .catch(console.error);
```

### `setSystemChannel`

Edits the system channel of the guild.

```ts

setSystemChannel(systemChannel: TextChannelResolvable | null, reason?: string): Promise<Guild>

```

- `systemChannel: TextChannelResolvable | null` — The new system channel
- `reason?: string` — Reason for changing the guild's system channel

**Returns:** `Promise<Guild>`

```ts
// Edit the guild system channel
guild.setSystemChannel(channel)
 .then(updated => console.log(`Updated guild system channel to ${guild.systemChannel.name}`))
 .catch(console.error);
```

### `setSystemChannelFlags`

Edits the flags of the default message notifications of the guild.

```ts

setSystemChannelFlags(systemChannelFlags: SystemChannelFlagsResolvable, reason?: string): Promise<Guild>

```

- `systemChannelFlags: SystemChannelFlagsResolvable` — The new flags for the default message notifications
- `reason?: string` — Reason for changing the flags of the default message notifications

**Returns:** `Promise<Guild>`

### `setVanityCode`

Set the vanity URL to this guild.
Resolves with an object containing the vanity URL invite code and the use count.

```ts

setVanityCode(code?: string): Promise<Vanity>

```

- `code?: string` — Vanity URL code

**Returns:** `Promise<Vanity>`

```ts
// Set invite code
guild.setVanityCode('elysia', '123456')
  .then(res => {
    console.log(`Vanity URL: https://discord.gg/${res.code} with ${res.uses} uses`);
  })
  .catch(console.error);
```

### `setVerificationLevel`

Edits the verification level of the guild.

```ts

setVerificationLevel(verificationLevel: number | "NONE" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" | null, reason?: string): Promise<Guild>

```

- `verificationLevel: number | "NONE" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" | null` — The new verification level of the guild
- `reason?: string` — Reason for changing the guild's verification level

**Returns:** `Promise<Guild>`

```ts
// Edit the guild verification level
guild.setVerificationLevel(1)
 .then(updated => console.log(`Updated guild verification level to ${guild.verificationLevel}`))
 .catch(console.error);
```

### `setWidgetSettings`

Edits the guild's widget settings.

```ts

setWidgetSettings(settings: GuildWidgetSettingsData, reason?: string): Promise<Guild>

```

- `settings: GuildWidgetSettingsData` — The widget settings for the guild
- `reason?: string` — Reason for changing the guild's widget settings

**Returns:** `Promise<Guild>`

### `splashURL`

The URL to this guild's invite splash image.

```ts

splashURL(options?: StaticImageURLOptions): string | null

```

- `options?: StaticImageURLOptions` — Options for the Image URL

**Returns:** `string | null`

### `toJSON`

```ts

toJSON(): unknown

```

**Returns:** `unknown`

### `topEmojis`

Get the top emojis of this guild.

```ts

topEmojis(): Promise<Collection<number, GuildEmoji>>

```

**Returns:** `Promise<Collection<number, GuildEmoji>>`

### `toString`

Returns a string representation of an object.

```ts

toString(): string

```

**Returns:** `string`

### `validateAutoModerationRule`

```ts

validateAutoModerationRule(data?: Record<string, unknown>): Promise<Record<string, unknown>>

```

- `data?: Record<string, unknown>`

**Returns:** `Promise<Record<string, unknown>>`

### `valueOf`

```ts

valueOf(): string

```

**Returns:** `string`

### `widgetImageURL`

Returns the guild's widget image URL.

```ts

widgetImageURL(style?: GuildWidgetStyle): string

```

- `style?: GuildWidgetStyle`

**Returns:** `string`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/structures/Guild.ts#L52
