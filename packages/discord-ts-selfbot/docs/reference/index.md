# API reference

Public runtime surface of `@discord-selfbot/core@14.0.2`. Every page is generated from `typings/index.d.ts`.

Type-only exports stay in `typings/index.d.ts`; this reference does not repeat them.

### Client

- [BaseClient](./client/base-client.md): The base class for all clients.
- [Client](./client/client.md): The main hub for interacting with the Discord API, and the starting point for any bot.
- [createRestClient](./client/create-rest-client.md): createRestClient reference.
- [WebhookClient](./client/webhook-client.md): The webhook client.
- [WebSocketManager](./client/web-socket-manager.md): The WebSocket manager for this client. This class forwards raw dispatch events, read more about it here https://discord.com/developers/do...
- [WebSocketShard](./client/web-socket-shard.md): Represents a Shard's WebSocket connection

### Structures

- [Activity](./structures/activity.md): Activity reference.
- [AnonymousGuild](./structures/anonymous-guild.md): Bundles common attributes and methods between Guild and InviteGuild
- [Application](./structures/application.md): Represents an OAuth2 Application.
- [ApplicationCommand](./structures/application-command.md): Represents an application command.
- [ApplicationRoleConnectionMetadata](./structures/application-role-connection-metadata.md): Role connection metadata object for an application.
- [AttachmentBuilder](./structures/attachment-builder.md): Represents an attachment builder.
- [AutocompleteInteraction](./structures/autocomplete-interaction.md): Represents an autocomplete interaction.
- [AutoModerationActionExecution](./structures/auto-moderation-action-execution.md): Represents the structure of an executed action when an AutoModerationRule is triggered.
- [AutoModerationRule](./structures/auto-moderation-rule.md): Represents an auto moderation rule.
- [Base](./structures/base.md): Represents a data model that is identifiable by a Snowflake (i.e. Discord API data models).
- [BaseGuild](./structures/base-guild.md): The base class for Guild, OAuth2Guild and InviteGuild.
- [BaseGuildEmoji](./structures/base-guild-emoji.md): Parent class for GuildEmoji and GuildPreviewEmoji.
- [BaseGuildTextChannel](./structures/base-guild-text-channel.md): Represents a text-based guild channel on Discord.
- [BaseGuildVoiceChannel](./structures/base-guild-voice-channel.md): Represents a voice-based guild channel on Discord.
- [ButtonInteraction](./structures/button-interaction.md): Represents a button interaction.
- [CategoryChannel](./structures/category-channel.md): Represents a guild category channel on Discord.
- [Channel](./structures/channel.md): Represents any channel on Discord.
- [ClientPresence](./structures/client-presence.md): Represents the client's presence.
- [ClientUser](./structures/client-user.md): Represents the logged in client's Discord user.
- [Collector](./structures/collector.md): Abstract class for defining a new Collector.
- [CommandInteraction](./structures/command-interaction.md): Represents a command interaction.
- [CommandInteractionOptionResolver](./structures/command-interaction-option-resolver.md): A resolver for command interaction options.
- [ContainerComponent](./structures/container-component.md): ContainerComponent reference.
- [CustomStatus](./structures/custom-status.md): CustomStatus reference.
- [DirectoryChannel](./structures/directory-channel.md): Represents a channel that displays a directory of guilds.
- [DMChannel](./structures/dm-channel.md): Represents a direct message channel between two users.
- [Emoji](./structures/emoji.md): Represents an emoji, see GuildEmoji and ReactionEmoji.
- [FileComponent](./structures/file-component.md): FileComponent reference.
- [ForumChannel](./structures/forum-channel.md): Represents a forum channel.
- [GroupDMChannel](./structures/group-dm-channel.md): Represents a Group DM Channel on Discord.
- [Guild](./structures/guild.md): Represents a guild (or a server) on Discord. It's recommended to see if a guild is available before performing operations or reading data...
- [GuildAuditLogs](./structures/guild-audit-logs.md): Audit logs entries are held in this class.
- [GuildBan](./structures/guild-ban.md): Represents a ban in a guild on Discord.
- [GuildChannel](./structures/guild-channel.md): Represents a guild channel from any of the following: - TextChannel - VoiceChannel - CategoryChannel - NewsChannel - StoreChannel - Stage...
- [GuildEmoji](./structures/guild-emoji.md): Represents a custom emoji.
- [GuildMember](./structures/guild-member.md): Represents a member of a guild on Discord.
- [GuildPreview](./structures/guild-preview.md): Represents the data about the guild any bot can preview, connected to the specified guild.
- [GuildPreviewEmoji](./structures/guild-preview-emoji.md): Represents an instance of an emoji belonging to a public guild obtained through Discord's preview endpoint.
- [GuildScheduledEvent](./structures/guild-scheduled-event.md): Represents a scheduled event in a Guild.
- [GuildTemplate](./structures/guild-template.md): Represents the template for a guild.
- [Integration](./structures/integration.md): Represents a guild integration.
- [IntegrationApplication](./structures/integration-application.md): Represents an Integration's OAuth2 Application.
- [InteractionCollector](./structures/interaction-collector.md): Collects interactions. Will automatically stop if the message (Client#event:messageDelete messageDelete or Client#event:messageDeleteBulk...
- [InteractionWebhook](./structures/interaction-webhook.md): Represents a webhook for an Interaction
- [Invite](./structures/invite.md): Represents an invitation to a guild channel.
- [InviteGuild](./structures/invite-guild.md): Represents a guild received from an invite, includes welcome screen data if available.
- [InviteStageInstance](./structures/invite-stage-instance.md): Represents the data about a public StageInstance in an Invite.
- [MediaChannel](./structures/media-channel.md): Represents a media channel.
- [MediaGalleryComponent](./structures/media-gallery-component.md): MediaGalleryComponent reference.
- [MediaGalleryItem](./structures/media-gallery-item.md): MediaGalleryItem reference.
- [Message](./structures/message.md): Represents a message on Discord.
- [MessageActionRow](./structures/message-action-row.md): Represents an action row containing message components.
- [MessageAttachment](./structures/message-attachment.md): Represents an attachment in a message.
- [MessageButton](./structures/message-button.md): Represents a button message component.
- [MessageCollector](./structures/message-collector.md): Collects messages on a channel. Will automatically stop if the channel (Client#event:channelDelete channelDelete), thread (Client#event:t...
- [MessageComponentInteraction](./structures/message-component-interaction.md): Represents a message component interaction.
- [MessageEmbed](./structures/message-embed.md): Represents an embed in a message (image/video preview, rich embed, etc.)
- [MessageMentions](./structures/message-mentions.md): MessageMentions reference.
- [MessagePayload](./structures/message-payload.md): Represents a message to be sent to the API.
- [MessageReaction](./structures/message-reaction.md): Represents a reaction to a message.
- [Modal](./structures/modal.md): Represents a modal (form) to be shown in response to an interaction
- [ModalSubmitInteraction](./structures/modal-submit-interaction.md): Represents a modal submit interaction.
- [NewsChannel](./structures/news-channel.md): Represents a guild news channel on Discord.
- [OAuth2Guild](./structures/o-auth2-guild.md): A partial guild received when using GuildManager#fetch to fetch multiple guilds.
- [PermissionOverwrites](./structures/permission-overwrites.md): Represents a permission overwrite for a role or member in a guild channel.
- [Poll](./structures/poll.md): Represents a Poll
- [PollAnswer](./structures/poll-answer.md): Represents an answer to a Poll
- [Presence](./structures/presence.md): Presence reference.
- [ReactionCollector](./structures/reaction-collector.md): Collects reactions on messages. Will automatically stop if the message (Client#event:messageDelete messageDelete or Client#event:messageD...
- [ReactionEmoji](./structures/reaction-emoji.md): Represents a limited emoji set used for both custom and unicode emojis. Custom emojis will use this class opposed to the Emoji class when...
- [RichPresence](./structures/rich-presence.md): RichPresence reference.
- [RichPresenceAssets](./structures/rich-presence-assets.md): Assets for a rich presence
- [Role](./structures/role.md): Represents a role on Discord.
- [SectionComponent](./structures/section-component.md): SectionComponent reference.
- [SelectMenuInteraction](./structures/select-menu-interaction.md): Represents a select menu interaction.
- [SeparatorComponent](./structures/separator-component.md): SeparatorComponent reference.
- [Session](./structures/session.md): Represents a Client OAuth2 Application Team.
- [SpotifyRPC](./structures/spotify-rpc.md): SpotifyRPC reference.
- [StageChannel](./structures/stage-channel.md): Represents a guild stage channel on Discord.
- [StageInstance](./structures/stage-instance.md): Represents a stage instance.
- [Sticker](./structures/sticker.md): Represents a Sticker.
- [StickerPack](./structures/sticker-pack.md): Represents a pack of standard stickers.
- [StoreChannel](./structures/store-channel.md): Represents a guild store channel on Discord. Store channels have been removed from Discord. See [Self-serve Game Selling Deprecation](htt...
- [Team](./structures/team.md): Represents a Client OAuth2 Application Team.
- [TeamMember](./structures/team-member.md): Represents a Client OAuth2 Application Team Member.
- [TextChannel](./structures/text-channel.md): Represents a guild text channel on Discord.
- [TextDisplayComponent](./structures/text-display-component.md): TextDisplayComponent reference.
- [TextInputComponent](./structures/text-input-component.md): Represents a text input component in a modal
- [ThreadChannel](./structures/thread-channel.md): Represents a thread channel on Discord.
- [ThreadMember](./structures/thread-member.md): Represents a Member for a Thread.
- [ThreadOnlyChannel](./structures/thread-only-channel.md): Represents a channel that only contains threads
- [ThumbnailComponent](./structures/thumbnail-component.md): ThumbnailComponent reference.
- [Typing](./structures/typing.md): Represents a typing state for a user in a channel.
- [UnfurledMediaItem](./structures/unfurled-media-item.md): UnfurledMediaItem reference.
- [User](./structures/user.md): Represents a user on Discord.
- [VoiceChannel](./structures/voice-channel.md): Represents a guild voice channel on Discord.
- [VoiceChannelEffect](./structures/voice-channel-effect.md): Represents an effect used in a VoiceChannel.
- [VoiceRegion](./structures/voice-region.md): Represents a Discord voice region for guilds.
- [VoiceState](./structures/voice-state.md): Represents the voice state for a Guild Member.
- [WebEmbed](./structures/web-embed.md): Send Embedlink to Discord Only works with Discord Web and Discord Client (no custom theme installed) - No Timestamp, Footer, Fields, Auth...
- [Webhook](./structures/webhook.md): Represents a webhook.
- [WelcomeChannel](./structures/welcome-channel.md): Represents a channel link in a guild's welcome screen.
- [WelcomeScreen](./structures/welcome-screen.md): Represents a welcome screen.
- [Widget](./structures/widget.md): Represents a Widget.
- [WidgetMember](./structures/widget-member.md): Represents a WidgetMember.

### Managers

- [ApplicationCommandManager](./managers/application-command-manager.md): Manages API methods for application commands and stores their cache.
- [ApplicationCommandPermissionsManager](./managers/application-command-permissions-manager.md): Manages API methods for permissions of Application Commands.
- [AutoModerationRuleManager](./managers/auto-moderation-rule-manager.md): Manages API methods for auto moderation rules and stores their cache.
- [BaseGuildEmojiManager](./managers/base-guild-emoji-manager.md): Holds methods to resolve GuildEmojis and stores their cache.
- [BaseManager](./managers/base-manager.md): Manages the API methods of a data model.
- [CachedManager](./managers/cached-manager.md): Manages the API methods of a data model with a mutable cache of instances.
- [ChannelManager](./managers/channel-manager.md): A manager of channels belonging to a client
- [DataManager](./managers/data-manager.md): Manages the API methods of a data model along with a collection of instances.
- [GuildBanManager](./managers/guild-ban-manager.md): Manages API methods for GuildBans and stores their cache.
- [GuildChannelManager](./managers/guild-channel-manager.md): Manages API methods for GuildChannels and stores their cache.
- [GuildEmojiManager](./managers/guild-emoji-manager.md): Manages API methods for GuildEmojis and stores their cache.
- [GuildEmojiRoleManager](./managers/guild-emoji-role-manager.md): Manages API methods for roles belonging to emojis and stores their cache.
- [GuildForumThreadManager](./managers/guild-forum-thread-manager.md): Manages API methods for threads in forum channels and stores their cache.
- [GuildInviteManager](./managers/guild-invite-manager.md): Manages API methods for GuildInvites and stores their cache.
- [GuildManager](./managers/guild-manager.md): Manages API methods for Guilds and stores their cache.
- [GuildMemberManager](./managers/guild-member-manager.md): Manages API methods for GuildMembers and stores their cache.
- [GuildMemberRoleManager](./managers/guild-member-role-manager.md): Manages API methods for roles of a GuildMember and stores their cache.
- [GuildScheduledEventManager](./managers/guild-scheduled-event-manager.md): Manages API methods for GuildScheduledEvents and stores their cache.
- [GuildStickerManager](./managers/guild-sticker-manager.md): Manages API methods for Guild Stickers and stores their cache.
- [GuildTextThreadManager](./managers/guild-text-thread-manager.md): Manages API methods for ThreadChannel objects and stores their cache.
- [MessageManager](./managers/message-manager.md): Manages API methods for Messages and holds their cache.
- [PermissionOverwriteManager](./managers/permission-overwrite-manager.md): Manages API methods for guild channel permission overwrites and stores their cache.
- [PresenceManager](./managers/presence-manager.md): Manages API methods for Presences and holds their cache.
- [ReactionManager](./managers/reaction-manager.md): Manages API methods for reactions and holds their cache.
- [ReactionUserManager](./managers/reaction-user-manager.md): Manages API methods for users who reacted to a reaction and stores their cache.
- [RelationshipManager](./managers/relationship-manager.md): Manages API methods for Relationships and stores their cache.
- [RoleManager](./managers/role-manager.md): Manages API methods for roles and stores their cache.
- [SessionManager](./managers/session-manager.md): Manages API methods for users and stores their cache.
- [StageInstanceManager](./managers/stage-instance-manager.md): Manages API methods for StageInstance objects and holds their cache.
- [ThreadManager](./managers/thread-manager.md): Manages API methods for ThreadChannel objects and stores their cache.
- [ThreadMemberManager](./managers/thread-member-manager.md): Manages API methods for GuildMembers and stores their cache.
- [UserManager](./managers/user-manager.md): Manages API methods for users and stores their cache.
- [UserNoteManager](./managers/user-note-manager.md): Manages API methods for Client and stores their cache.
- [VoiceStateManager](./managers/voice-state-manager.md): Manages API methods for VoiceStates and stores their cache.
- [WidgetManager](./managers/widget-manager.md): Manages profile widgets and widget configuration reads for the current user.

### REST

- [createProxyFetch](./rest/create-proxy-fetch.md): createProxyFetch reference.
- [deriveRoute](./rest/derive-route.md): deriveRoute reference.
- [DiscordAPIError](./rest/discord-api-error.md): Represents an error from the Discord API.
- [HTTPError](./rest/http-error.md): Represents an HTTP error from a request.
- [MissingTokenError](./rest/missing-token-error.md): Thrown before any HTTP is sent when no usable token is set. Never retried.
- [OAuth2RoleConnection](./rest/o-auth2-role-connection.md): Reads and writes application role connections with an OAuth2 access token.
- [parseProxyUrl](./rest/parse-proxy-url.md): parseProxyUrl reference.
- [RateLimitError](./rest/rate-limit-error.md): Represents a RateLimit error from a request.

### Voice

- [ClientVoiceManager](./voice/client-voice-manager.md): ClientVoiceManager reference.
- [Recorder](./voice/recorder.md): Represents a FFmpeg handler

### Sharding

- [Shard](./sharding/shard.md): A self-contained shard created by the ShardingManager. Each one has a ChildProcess that contains an instance of the bot and its Client. W...
- [ShardClientUtil](./sharding/shard-client-util.md): Helper class for sharded clients spawned as a child process/worker, such as from a ShardingManager. Utilizes IPC to send and receive data...
- [ShardingManager](./sharding/sharding-manager.md): This is a utility class that makes multi-process sharding of a bot an easy and painless experience. It works by spawning a self-contained...

### Utilities

- [ActivityFlags](./utilities/activity-flags.md): Data structure that makes it easy to interact with an Activity#flags bitfield.
- [ActivityFlagsBitField](./utilities/activity-flags-bit-field.md): Data structure that makes it easy to interact with an Activity#flags bitfield.
- [ApplicationFlags](./utilities/application-flags.md): Data structure that makes it easy to interact with a Application#flags bitfield.
- [ApplicationFlagsBitField](./utilities/application-flags-bit-field.md): Data structure that makes it easy to interact with a Application#flags bitfield.
- [AttachmentFlags](./utilities/attachment-flags.md): Data structure that makes it easy to interact with an GuildMember#flags bitfield.
- [AttachmentFlagsBitField](./utilities/attachment-flags-bit-field.md): Data structure that makes it easy to interact with an GuildMember#flags bitfield.
- [BitField](./utilities/bit-field.md): BitField reference.
- [Constants](./utilities/constants.md): Constants that can be used in an enum or object-like way.
- [DataResolver](./utilities/data-resolver.md): The DataResolver identifies different objects and tries to resolve a specific piece of information from them.
- [DiscordAuthWebsocket](./utilities/discord-auth-websocket.md): Discord Auth QR
- [Events](./utilities/events.md): The types of events emitted by the Client: * RATE_LIMIT: rateLimit * INVALID_REQUEST_WARNING: invalidRequestWarning * API_RESPONSE: apiRe...
- [Formatters](./utilities/formatters.md): Contains various Discord-specific functions for formatting messages.
- [GuildMemberFlags](./utilities/guild-member-flags.md): Data structure that makes it easy to interact with an GuildMember#flags bitfield.
- [GuildMemberFlagsBitField](./utilities/guild-member-flags-bit-field.md): Data structure that makes it easy to interact with an GuildMember#flags bitfield.
- [Intents](./utilities/intents.md): Data structure that makes it easy to calculate intents.
- [IntentsBitField](./utilities/intents-bit-field.md): Data structure that makes it easy to calculate intents.
- [LimitedCollection](./utilities/limited-collection.md): A Map with additional utility methods. This is used throughout discord.js rather than Arrays for anything that has an ID, for significant...
- [MessageFlags](./utilities/message-flags.md): Data structure that makes it easy to interact with a Message#flags bitfield.
- [MessageFlagsBitField](./utilities/message-flags-bit-field.md): Data structure that makes it easy to interact with a Message#flags bitfield.
- [Options](./utilities/options.md): Contains various utilities for client options.
- [Partials](./utilities/partials.md): Partials reference.
- [Permissions](./utilities/permissions.md): Data structure that makes it easy to interact with a permission bitfield. All GuildMembers have a set of permissions in their guild, and ...
- [PermissionsBitField](./utilities/permissions-bit-field.md): Data structure that makes it easy to interact with a permission bitfield. All GuildMembers have a set of permissions in their guild, and ...
- [PurchasedFlags](./utilities/purchased-flags.md): Data structure that makes it easy to interact with an PurchasedFlags#flags bitfield.
- [RoleFlags](./utilities/role-flags.md): Data structure that makes it easy to interact with an GuildMember#flags bitfield.
- [RoleFlagsBitField](./utilities/role-flags-bit-field.md): Data structure that makes it easy to interact with an GuildMember#flags bitfield.
- [SnowflakeUtil](./utilities/snowflake-util.md): A container for useful snowflake-related methods.
- [Status](./utilities/status.md): The current status of the client. Here are the available statuses: * READY: 0 * CONNECTING: 1 * RECONNECTING: 2 * IDLE: 3 * NEARLY: 4 * D...
- [Sweepers](./utilities/sweepers.md): Sweepers reference.
- [SystemChannelFlags](./utilities/system-channel-flags.md): Data structure that makes it easy to interact with a Guild#systemChannelFlags bitfield. Note that all event message types are enabled by ...
- [SystemChannelFlagsBitField](./utilities/system-channel-flags-bit-field.md): Data structure that makes it easy to interact with a Guild#systemChannelFlags bitfield. Note that all event message types are enabled by ...
- [ThreadMemberFlags](./utilities/thread-member-flags.md): Data structure that makes it easy to interact with a ThreadMember#flags bitfield.
- [ThreadMemberFlagsBitField](./utilities/thread-member-flags-bit-field.md): Data structure that makes it easy to interact with a ThreadMember#flags bitfield.
- [UserFlags](./utilities/user-flags.md): Data structure that makes it easy to interact with a User#flags bitfield.
- [UserFlagsBitField](./utilities/user-flags-bit-field.md): Data structure that makes it easy to interact with a User#flags bitfield.
- [Util](./utilities/util.md): Contains various general-purpose utility methods.

### Other

- [GuildAuditLogsEntry](./other/guild-audit-logs-entry.md): Audit logs entry.

## Known gaps

- `WebSocket`: runtime shim, not described by the public typings.
