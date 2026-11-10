# Manual test checklist (generated from src/index.ts exports)

Total exports: 211

Tick `[x]` as each API is exercised in a manual run. Mark `N/A` with reason for internals.

## BitFields (12)

- [ ] `ActivityFlagsBitField`
- [ ] `ApplicationFlagsBitField`
- [ ] `AttachmentFlagsBitField`
- [ ] `BitField`
- [ ] `GuildMemberFlagsBitField`
- [ ] `IntentsBitField`
- [ ] `MessageFlagsBitField`
- [ ] `PermissionsBitField`
- [ ] `RoleFlagsBitField`
- [ ] `SystemChannelFlagsBitField`
- [ ] `ThreadMemberFlagsBitField`
- [ ] `UserFlagsBitField`

## Builders (14)

- [ ] `ActionRowBuilder`
- [ ] `AttachmentBuilder`
- [ ] `ButtonBuilder`
- [ ] `ChannelSelectMenuBuilder`
- [ ] `EmbedBuilder`
- [ ] `MentionableSelectMenuBuilder`
- [ ] `ModalBuilder`
- [ ] `RoleSelectMenuBuilder`
- [ ] `SelectMenuBuilder`
- [ ] `SelectMenuOptionBuilder`
- [ ] `StringSelectMenuBuilder`
- [ ] `StringSelectMenuOptionBuilder`
- [ ] `TextInputBuilder`
- [ ] `UserSelectMenuBuilder`

## Collections (2)

- [ ] `Collection`
- [ ] `LimitedCollection`

## Collectors (4)

- [ ] `Collector`
- [ ] `InteractionCollector`
- [ ] `MessageCollector`
- [ ] `ReactionCollector`

## Core (3)

- [ ] `Base`
- [ ] `BaseClient`
- [ ] `Client`

## Errors (3)

- [ ] `DiscordAPIError`
- [ ] `HTTPError`
- [ ] `RateLimitError`

## Flags (10)

- [ ] `ActivityFlags`
- [ ] `ApplicationFlags`
- [ ] `AttachmentFlags`
- [ ] `GuildMemberFlags`
- [ ] `MessageFlags`
- [ ] `PurchasedFlags`
- [ ] `RoleFlags`
- [ ] `SystemChannelFlags`
- [ ] `ThreadMemberFlags`
- [ ] `UserFlags`

## Managers (37)

- [ ] `ApplicationCommandManager`
- [ ] `ApplicationCommandPermissionsManager`
- [ ] `AutoModerationRuleManager`
- [ ] `BaseGuildEmojiManager`
- [ ] `BaseManager`
- [ ] `CachedManager`
- [ ] `ChannelManager`
- [ ] `ClientVoiceManager`
- [ ] `DataManager`
- [ ] `GuildBanManager`
- [ ] `GuildChannelManager`
- [ ] `GuildEmojiManager`
- [ ] `GuildEmojiRoleManager`
- [ ] `GuildForumThreadManager`
- [ ] `GuildInviteManager`
- [ ] `GuildManager`
- [ ] `GuildMemberManager`
- [ ] `GuildMemberRoleManager`
- [ ] `GuildScheduledEventManager`
- [ ] `GuildStickerManager`
- [ ] `GuildTextThreadManager`
- [ ] `MessageManager`
- [ ] `PermissionOverwriteManager`
- [ ] `PresenceManager`
- [ ] `ReactionManager`
- [ ] `ReactionUserManager`
- [ ] `RelationshipManager`
- [ ] `RoleManager`
- [ ] `SessionManager`
- [ ] `ShardingManager`
- [ ] `StageInstanceManager`
- [ ] `ThreadManager`
- [ ] `ThreadMemberManager`
- [ ] `UserManager`
- [ ] `UserNoteManager`
- [ ] `VoiceStateManager`
- [ ] `WebSocketManager`

## Structures (117)

- [ ] `ActionRow`
- [ ] `Activity`
- [ ] `AnonymousGuild`
- [ ] `Application`
- [ ] `ApplicationCommand`
- [ ] `ApplicationRoleConnectionMetadata`
- [ ] `Attachment`
- [ ] `AutoModerationActionExecution`
- [ ] `AutoModerationRule`
- [ ] `AutocompleteInteraction`
- [ ] `BaseGuild`
- [ ] `BaseGuildEmoji`
- [ ] `BaseGuildTextChannel`
- [ ] `BaseGuildVoiceChannel`
- [ ] `Button`
- [ ] `ButtonInteraction`
- [ ] `CategoryChannel`
- [ ] `Channel`
- [ ] `ClientPresence`
- [ ] `ClientUser`
- [ ] `CommandInteraction`
- [ ] `CommandInteractionOptionResolver`
- [ ] `ContainerComponent`
- [ ] `CustomStatus`
- [ ] `DMChannel`
- [ ] `DirectoryChannel`
- [ ] `DiscordAuthWebsocket`
- [ ] `Embed`
- [ ] `Emoji`
- [ ] `FileComponent`
- [ ] `ForumChannel`
- [ ] `GroupDMChannel`
- [ ] `Guild`
- [ ] `GuildAuditLogs`
- [ ] `GuildAuditLogsEntry`
- [ ] `GuildBan`
- [ ] `GuildChannel`
- [ ] `GuildEmoji`
- [ ] `GuildMember`
- [ ] `GuildPreview`
- [ ] `GuildPreviewEmoji`
- [ ] `GuildScheduledEvent`
- [ ] `GuildTemplate`
- [ ] `Integration`
- [ ] `IntegrationApplication`
- [ ] `Intents`
- [ ] `InteractionWebhook`
- [ ] `Invite`
- [ ] `InviteGuild`
- [ ] `InviteStageInstance`
- [ ] `MediaChannel`
- [ ] `MediaGalleryComponent`
- [ ] `MediaGalleryItem`
- [ ] `Message`
- [ ] `MessageActionRow`
- [ ] `MessageAttachment`
- [ ] `MessageButton`
- [ ] `MessageComponentInteraction`
- [ ] `MessageEmbed`
- [ ] `MessageMentions`
- [ ] `MessagePayload`
- [ ] `MessageReaction`
- [ ] `Modal`
- [ ] `ModalSubmitInteraction`
- [ ] `NewsChannel`
- [ ] `OAuth2Guild`
- [ ] `PermissionOverwrites`
- [ ] `Permissions`
- [ ] `Poll`
- [ ] `PollAnswer`
- [ ] `Presence`
- [ ] `ReactionEmoji`
- [ ] `Recorder`
- [ ] `RichPresence`
- [ ] `RichPresenceAssets`
- [ ] `Role`
- [ ] `SectionComponent`
- [ ] `SelectMenu`
- [ ] `SelectMenuInteraction`
- [ ] `SeparatorComponent`
- [ ] `Session`
- [ ] `Shard`
- [ ] `ShardClientUtil`
- [ ] `SpotifyRPC`
- [ ] `StageChannel`
- [ ] `StageInstance`
- [ ] `Status`
- [ ] `Sticker`
- [ ] `StickerPack`
- [ ] `StoreChannel`
- [ ] `Team`
- [ ] `TeamMember`
- [ ] `TextChannel`
- [ ] `TextDisplayComponent`
- [ ] `TextInput`
- [ ] `TextInputComponent`
- [ ] `ThreadChannel`
- [ ] `ThreadMember`
- [ ] `ThreadOnlyChannel`
- [ ] `ThumbnailComponent`
- [ ] `Typing`
- [ ] `UnfurledMediaItem`
- [ ] `User`
- [ ] `VoiceChannel`
- [ ] `VoiceChannelEffect`
- [ ] `VoiceRegion`
- [ ] `VoiceState`
- [ ] `WebEmbed`
- [ ] `WebSocket`
- [ ] `WebSocketShard`
- [ ] `Webhook`
- [ ] `WebhookClient`
- [ ] `WelcomeChannel`
- [ ] `WelcomeScreen`
- [ ] `Widget`
- [ ] `WidgetMember`
- [ ] `version`

## Utilities (9)

- [ ] `Constants`
- [ ] `DataResolver`
- [ ] `Events`
- [ ] `Formatters`
- [ ] `Options`
- [ ] `Partials`
- [ ] `SnowflakeUtil`
- [ ] `Sweepers`
- [ ] `Util`
