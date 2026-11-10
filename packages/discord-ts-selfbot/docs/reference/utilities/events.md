# Events

The types of events emitted by the Client:
* RATE_LIMIT: rateLimit
* INVALID_REQUEST_WARNING: invalidRequestWarning
* API_RESPONSE: apiResponse
* API_REQUEST: apiRequest
* CLIENT_READY: ready
* APPLICATION_COMMAND_CREATE: applicationCommandCreate (deprecated)
* APPLICATION_COMMAND_DELETE: applicationCommandDelete (deprecated)
* APPLICATION_COMMAND_UPDATE: applicationCommandUpdate (deprecated)
* APPLICATION_COMMAND_PERMISSIONS_UPDATE: applicationCommandPermissionsUpdate
* AUTO_MODERATION_ACTION_EXECUTION: autoModerationActionExecution
* AUTO_MODERATION_RULE_CREATE: autoModerationRuleCreate
* AUTO_MODERATION_RULE_DELETE: autoModerationRuleDelete
* AUTO_MODERATION_RULE_UPDATE: autoModerationRuleUpdate
* GUILD_AVAILABLE: guildAvailable
* GUILD_CREATE: guildCreate
* GUILD_DELETE: guildDelete
* GUILD_UPDATE: guildUpdate
* GUILD_UNAVAILABLE: guildUnavailable
* GUILD_MEMBER_ADD: guildMemberAdd
* GUILD_MEMBER_REMOVE: guildMemberRemove
* GUILD_MEMBER_UPDATE: guildMemberUpdate
* GUILD_MEMBER_AVAILABLE: guildMemberAvailable
* GUILD_MEMBERS_CHUNK: guildMembersChunk
* GUILD_INTEGRATIONS_UPDATE: guildIntegrationsUpdate
* GUILD_ROLE_CREATE: roleCreate
* GUILD_ROLE_DELETE: roleDelete
* INVITE_CREATE: inviteCreate
* INVITE_DELETE: inviteDelete
* GUILD_ROLE_UPDATE: roleUpdate
* GUILD_EMOJI_CREATE: emojiCreate
* GUILD_EMOJI_DELETE: emojiDelete
* GUILD_EMOJI_UPDATE: emojiUpdate
* GUILD_BAN_ADD: guildBanAdd
* GUILD_BAN_REMOVE: guildBanRemove
* CHANNEL_CREATE: channelCreate
* CHANNEL_DELETE: channelDelete
* CHANNEL_UPDATE: channelUpdate
* CHANNEL_PINS_UPDATE: channelPinsUpdate
* MESSAGE_CREATE: messageCreate
* MESSAGE_DELETE: messageDelete
* MESSAGE_UPDATE: messageUpdate
* MESSAGE_BULK_DELETE: messageDeleteBulk
* MESSAGE_REACTION_ADD: messageReactionAdd
* MESSAGE_REACTION_REMOVE: messageReactionRemove
* MESSAGE_REACTION_REMOVE_ALL: messageReactionRemoveAll
* MESSAGE_REACTION_REMOVE_EMOJI: messageReactionRemoveEmoji
* THREAD_CREATE: threadCreate
* THREAD_DELETE: threadDelete
* THREAD_UPDATE: threadUpdate
* THREAD_LIST_SYNC: threadListSync
* THREAD_MEMBER_UPDATE: threadMemberUpdate
* THREAD_MEMBERS_UPDATE: threadMembersUpdate
* USER_UPDATE: userUpdate
* PRESENCE_UPDATE: presenceUpdate
* VOICE_SERVER_UPDATE: voiceServerUpdate
* VOICE_STATE_UPDATE: voiceStateUpdate
* TYPING_START: typingStart
* WEBHOOKS_UPDATE: webhookUpdate
* ERROR: error
* WARN: warn
* DEBUG: debug
* CACHE_SWEEP: cacheSweep
* SHARD_DISCONNECT: shardDisconnect
* SHARD_ERROR: shardError
* SHARD_RECONNECTING: shardReconnecting
* SHARD_READY: shardReady
* SHARD_RESUME: shardResume
* INVALIDATED: invalidated
* RAW: raw
* STAGE_INSTANCE_CREATE: stageInstanceCreate
* STAGE_INSTANCE_UPDATE: stageInstanceUpdate
* STAGE_INSTANCE_DELETE: stageInstanceDelete
* GUILD_STICKER_CREATE: stickerCreate
* GUILD_STICKER_DELETE: stickerDelete
* GUILD_STICKER_UPDATE: stickerUpdate
* GUILD_SCHEDULED_EVENT_CREATE: guildScheduledEventCreate
* GUILD_SCHEDULED_EVENT_UPDATE: guildScheduledEventUpdate
* GUILD_SCHEDULED_EVENT_DELETE: guildScheduledEventDelete
* GUILD_SCHEDULED_EVENT_USER_ADD: guildScheduledEventUserAdd
* GUILD_SCHEDULED_EVENT_USER_REMOVE: guildScheduledEventUserRemove
* GUILD_AUDIT_LOG_ENTRY_CREATE: guildAuditLogEntryCreate
* UNHANDLED_PACKET: unhandledPacket
* RELATIONSHIP_ADD: relationshipAdd
* RELATIONSHIP_REMOVE: relationshipRemove
* RELATIONSHIP_UPDATE: relationshipUpdate
* CHANNEL_RECIPIENT_ADD: channelRecipientAdd
* CHANNEL_RECIPIENT_REMOVE: channelRecipientRemove
* INTERACTION_CREATE: interactionCreate
* INTERACTION_MODAL_CREATE: interactionModalCreate
* CALL_CREATE: callCreate
* CALL_UPDATE: callUpdate
* CALL_DELETE: callDelete
* VOICE_CHANNEL_EFFECT_SEND: voiceChannelEffectSend

**Type:** `{ API_REQUEST: "apiRequest"; API_RESPONSE: "apiResponse"; APPLICATION_COMMAND_CREATE: "applicationCommandCreate"; APPLICATION_COMMAND_DELETE: "applicationCommandDelete"; APPLICATION_COMMAND_PERMISSIONS_UPDATE: "applicationCommandPermissionsUpdate"; APPLICATION_COMMAND_UPDATE: "applicationCommandUpdate"; ApplicationCommandPermissionsUpdate: "applicationCommandPermissionsUpdate"; AUTO_MODERATION_ACTION_EXECUTION: "autoModerationActionExecution"; AUTO_MODERATION_RULE_CREATE: "autoModerationRuleCreate"; AUTO_MODERATION_RULE_DELETE: "autoModerationRuleDelete"; AUTO_MODERATION_RULE_UPDATE: "autoModerationRuleUpdate"; AutoModerationActionExecution: "autoModerationActionExecution"; AutoModerationRuleCreate: "autoModerationRuleCreate"; AutoModerationRuleDelete: "autoModerationRuleDelete"; AutoModerationRuleUpdate: "autoModerationRuleUpdate"; CACHE_SWEEP: "cacheSweep"; CacheSweep: "cacheSweep"; CALL_CREATE: "callCreate"; CALL_DELETE: "callDelete"; CALL_UPDATE: "callUpdate"; CHANNEL_CREATE: "channelCreate"; CHANNEL_DELETE: "channelDelete"; CHANNEL_PINS_UPDATE: "channelPinsUpdate"; CHANNEL_RECIPIENT_ADD: "channelRecipientAdd"; CHANNEL_RECIPIENT_REMOVE: "channelRecipientRemove"; CHANNEL_UPDATE: "channelUpdate"; ChannelCreate: "channelCreate"; ChannelDelete: "channelDelete"; ChannelPinsUpdate: "channelPinsUpdate"; ChannelUpdate: "channelUpdate"; CLIENT_READY: "ready"; ClientReady: "clientReady"; Debug: "debug"; DEBUG: "debug"; EntitlementCreate: "entitlementCreate"; EntitlementDelete: "entitlementDelete"; EntitlementUpdate: "entitlementUpdate"; Error: "error"; ERROR: "error"; GUILD_AUDIT_LOG_ENTRY_CREATE: "guildAuditLogEntryCreate"; GUILD_AVAILABLE: "guildAvailable"; GUILD_BAN_ADD: "guildBanAdd"; GUILD_BAN_REMOVE: "guildBanRemove"; GUILD_CREATE: "guildCreate"; GUILD_DELETE: "guildDelete"; GUILD_EMOJI_CREATE: "emojiCreate"; GUILD_EMOJI_DELETE: "emojiDelete"; GUILD_EMOJI_UPDATE: "emojiUpdate"; GUILD_INTEGRATIONS_UPDATE: "guildIntegrationsUpdate"; GUILD_MEMBER_ADD: "guildMemberAdd"; GUILD_MEMBER_AVAILABLE: "guildMemberAvailable"; GUILD_MEMBER_REMOVE: "guildMemberRemove"; GUILD_MEMBER_UPDATE: "guildMemberUpdate"; GUILD_MEMBERS_CHUNK: "guildMembersChunk"; GUILD_ROLE_CREATE: "roleCreate"; GUILD_ROLE_DELETE: "roleDelete"; GUILD_ROLE_UPDATE: "roleUpdate"; GUILD_SCHEDULED_EVENT_CREATE: "guildScheduledEventCreate"; GUILD_SCHEDULED_EVENT_DELETE: "guildScheduledEventDelete"; GUILD_SCHEDULED_EVENT_UPDATE: "guildScheduledEventUpdate"; GUILD_SCHEDULED_EVENT_USER_ADD: "guildScheduledEventUserAdd"; GUILD_SCHEDULED_EVENT_USER_REMOVE: "guildScheduledEventUserRemove"; GUILD_STICKER_CREATE: "stickerCreate"; GUILD_STICKER_DELETE: "stickerDelete"; GUILD_STICKER_UPDATE: "stickerUpdate"; GUILD_UNAVAILABLE: "guildUnavailable"; GUILD_UPDATE: "guildUpdate"; GuildAuditLogEntryCreate: "guildAuditLogEntryCreate"; GuildAvailable: "guildAvailable"; GuildBanAdd: "guildBanAdd"; GuildBanRemove: "guildBanRemove"; GuildCreate: "guildCreate"; GuildDelete: "guildDelete"; GuildEmojiCreate: "emojiCreate"; GuildEmojiDelete: "emojiDelete"; GuildEmojiUpdate: "emojiUpdate"; GuildIntegrationsUpdate: "guildIntegrationsUpdate"; GuildMemberAdd: "guildMemberAdd"; GuildMemberAvailable: "guildMemberAvailable"; GuildMemberRemove: "guildMemberRemove"; GuildMembersChunk: "guildMembersChunk"; GuildMemberUpdate: "guildMemberUpdate"; GuildRoleCreate: "roleCreate"; GuildRoleDelete: "roleDelete"; GuildRoleUpdate: "roleUpdate"; GuildScheduledEventCreate: "guildScheduledEventCreate"; GuildScheduledEventDelete: "guildScheduledEventDelete"; GuildScheduledEventUpdate: "guildScheduledEventUpdate"; GuildScheduledEventUserAdd: "guildScheduledEventUserAdd"; GuildScheduledEventUserRemove: "guildScheduledEventUserRemove"; GuildSoundboardSoundCreate: "guildSoundboardSoundCreate"; GuildSoundboardSoundDelete: "guildSoundboardSoundDelete"; GuildSoundboardSoundsUpdate: "guildSoundboardSoundsUpdate"; GuildSoundboardSoundUpdate: "guildSoundboardSoundUpdate"; GuildStickerCreate: "stickerCreate"; GuildStickerDelete: "stickerDelete"; GuildStickerUpdate: "stickerUpdate"; GuildUnavailable: "guildUnavailable"; GuildUpdate: "guildUpdate"; INTERACTION_MODAL_CREATE: "interactionModalCreate"; InteractionCreate: "interactionCreate"; INVALID_REQUEST_WARNING: "invalidRequestWarning"; Invalidated: "invalidated"; INVALIDATED: "invalidated"; INVITE_CREATE: "inviteCreate"; INVITE_DELETE: "inviteDelete"; InviteCreate: "inviteCreate"; InviteDelete: "inviteDelete"; MESSAGE_BULK_DELETE: "messageDeleteBulk"; MESSAGE_CREATE: "messageCreate"; MESSAGE_DELETE: "messageDelete"; MESSAGE_POLL_VOTE_ADD: "messagePollVoteAdd"; MESSAGE_POLL_VOTE_REMOVE: "messagePollVoteRemove"; MESSAGE_REACTION_ADD: "messageReactionAdd"; MESSAGE_REACTION_REMOVE: "messageReactionRemove"; MESSAGE_REACTION_REMOVE_ALL: "messageReactionRemoveAll"; MESSAGE_REACTION_REMOVE_EMOJI: "messageReactionRemoveEmoji"; MESSAGE_UPDATE: "messageUpdate"; MessageBulkDelete: "messageDeleteBulk"; MessageCreate: "messageCreate"; MessageDelete: "messageDelete"; MessagePollVoteAdd: "messagePollVoteAdd"; MessagePollVoteRemove: "messagePollVoteRemove"; MessageReactionAdd: "messageReactionAdd"; MessageReactionRemove: "messageReactionRemove"; MessageReactionRemoveAll: "messageReactionRemoveAll"; MessageReactionRemoveEmoji: "messageReactionRemoveEmoji"; MessageUpdate: "messageUpdate"; PRESENCE_UPDATE: "presenceUpdate"; PresenceUpdate: "presenceUpdate"; RATE_LIMIT: "rateLimit"; Raw: "raw"; RAW: "raw"; READY: "ready"; RELATIONSHIP_ADD: "relationshipAdd"; RELATIONSHIP_REMOVE: "relationshipRemove"; RELATIONSHIP_UPDATE: "relationshipUpdate"; SHARD_DISCONNECT: "shardDisconnect"; SHARD_ERROR: "shardError"; SHARD_READY: "shardReady"; SHARD_RECONNECTING: "shardReconnecting"; SHARD_RESUME: "shardResume"; ShardDisconnect: "shardDisconnect"; ShardError: "shardError"; ShardReady: "shardReady"; ShardReconnecting: "shardReconnecting"; ShardResume: "shardResume"; SoundboardSounds: "soundboardSounds"; STAGE_INSTANCE_CREATE: "stageInstanceCreate"; STAGE_INSTANCE_DELETE: "stageInstanceDelete"; STAGE_INSTANCE_UPDATE: "stageInstanceUpdate"; StageInstanceCreate: "stageInstanceCreate"; StageInstanceDelete: "stageInstanceDelete"; StageInstanceUpdate: "stageInstanceUpdate"; SubscriptionCreate: "subscriptionCreate"; SubscriptionDelete: "subscriptionDelete"; SubscriptionUpdate: "subscriptionUpdate"; THREAD_CREATE: "threadCreate"; THREAD_DELETE: "threadDelete"; THREAD_LIST_SYNC: "threadListSync"; THREAD_MEMBER_UPDATE: "threadMemberUpdate"; THREAD_MEMBERS_UPDATE: "threadMembersUpdate"; THREAD_UPDATE: "threadUpdate"; ThreadCreate: "threadCreate"; ThreadDelete: "threadDelete"; ThreadListSync: "threadListSync"; ThreadMembersUpdate: "threadMembersUpdate"; ThreadMemberUpdate: "threadMemberUpdate"; ThreadUpdate: "threadUpdate"; TYPING_START: "typingStart"; TypingStart: "typingStart"; UNHANDLED_PACKET: "unhandledPacket"; USER_UPDATE: "userUpdate"; UserUpdate: "userUpdate"; VOICE_BROADCAST_SUBSCRIBE: "subscribe"; VOICE_BROADCAST_UNSUBSCRIBE: "unsubscribe"; VOICE_CHANNEL_EFFECT_SEND: "voiceChannelEffectSend"; VOICE_SERVER_UPDATE: "voiceServerUpdate"; VOICE_STATE_UPDATE: "voiceStateUpdate"; VoiceChannelEffectSend: "voiceChannelEffectSend"; VoiceServerUpdate: "voiceServerUpdate"; VoiceStateUpdate: "voiceStateUpdate"; Warn: "warn"; WARN: "warn"; WEBHOOKS_UPDATE: "webhookUpdate"; WebhooksUpdate: "webhooksUpdate" }`

## Members

- `API_REQUEST` = "apiRequest"
- `API_RESPONSE` = "apiResponse"
- `APPLICATION_COMMAND_CREATE` = "applicationCommandCreate"
- `APPLICATION_COMMAND_DELETE` = "applicationCommandDelete"
- `APPLICATION_COMMAND_PERMISSIONS_UPDATE` = "applicationCommandPermissionsUpdate"
- `APPLICATION_COMMAND_UPDATE` = "applicationCommandUpdate"
- `ApplicationCommandPermissionsUpdate` = "applicationCommandPermissionsUpdate"
- `AUTO_MODERATION_ACTION_EXECUTION` = "autoModerationActionExecution"
- `AUTO_MODERATION_RULE_CREATE` = "autoModerationRuleCreate"
- `AUTO_MODERATION_RULE_DELETE` = "autoModerationRuleDelete"
- `AUTO_MODERATION_RULE_UPDATE` = "autoModerationRuleUpdate"
- `AutoModerationActionExecution` = "autoModerationActionExecution"
- `AutoModerationRuleCreate` = "autoModerationRuleCreate"
- `AutoModerationRuleDelete` = "autoModerationRuleDelete"
- `AutoModerationRuleUpdate` = "autoModerationRuleUpdate"
- `CACHE_SWEEP` = "cacheSweep"
- `CacheSweep` = "cacheSweep"
- `CALL_CREATE` = "callCreate"
- `CALL_DELETE` = "callDelete"
- `CALL_UPDATE` = "callUpdate"
- `CHANNEL_CREATE` = "channelCreate"
- `CHANNEL_DELETE` = "channelDelete"
- `CHANNEL_PINS_UPDATE` = "channelPinsUpdate"
- `CHANNEL_RECIPIENT_ADD` = "channelRecipientAdd"
- `CHANNEL_RECIPIENT_REMOVE` = "channelRecipientRemove"
- `CHANNEL_UPDATE` = "channelUpdate"
- `ChannelCreate` = "channelCreate"
- `ChannelDelete` = "channelDelete"
- `ChannelPinsUpdate` = "channelPinsUpdate"
- `ChannelUpdate` = "channelUpdate"
- `CLIENT_READY` = "ready"
- `ClientReady` = "clientReady"
- `Debug` = "debug"
- `DEBUG` = "debug"
- `EntitlementCreate` = "entitlementCreate"
- `EntitlementDelete` = "entitlementDelete"
- `EntitlementUpdate` = "entitlementUpdate"
- `Error` = "error"
- `ERROR` = "error"
- `GUILD_AUDIT_LOG_ENTRY_CREATE` = "guildAuditLogEntryCreate"
- `GUILD_AVAILABLE` = "guildAvailable"
- `GUILD_BAN_ADD` = "guildBanAdd"
- `GUILD_BAN_REMOVE` = "guildBanRemove"
- `GUILD_CREATE` = "guildCreate"
- `GUILD_DELETE` = "guildDelete"
- `GUILD_EMOJI_CREATE` = "emojiCreate"
- `GUILD_EMOJI_DELETE` = "emojiDelete"
- `GUILD_EMOJI_UPDATE` = "emojiUpdate"
- `GUILD_INTEGRATIONS_UPDATE` = "guildIntegrationsUpdate"
- `GUILD_MEMBER_ADD` = "guildMemberAdd"
- `GUILD_MEMBER_AVAILABLE` = "guildMemberAvailable"
- `GUILD_MEMBER_REMOVE` = "guildMemberRemove"
- `GUILD_MEMBER_UPDATE` = "guildMemberUpdate"
- `GUILD_MEMBERS_CHUNK` = "guildMembersChunk"
- `GUILD_ROLE_CREATE` = "roleCreate"
- `GUILD_ROLE_DELETE` = "roleDelete"
- `GUILD_ROLE_UPDATE` = "roleUpdate"
- `GUILD_SCHEDULED_EVENT_CREATE` = "guildScheduledEventCreate"
- `GUILD_SCHEDULED_EVENT_DELETE` = "guildScheduledEventDelete"
- `GUILD_SCHEDULED_EVENT_UPDATE` = "guildScheduledEventUpdate"
- `GUILD_SCHEDULED_EVENT_USER_ADD` = "guildScheduledEventUserAdd"
- `GUILD_SCHEDULED_EVENT_USER_REMOVE` = "guildScheduledEventUserRemove"
- `GUILD_STICKER_CREATE` = "stickerCreate"
- `GUILD_STICKER_DELETE` = "stickerDelete"
- `GUILD_STICKER_UPDATE` = "stickerUpdate"
- `GUILD_UNAVAILABLE` = "guildUnavailable"
- `GUILD_UPDATE` = "guildUpdate"
- `GuildAuditLogEntryCreate` = "guildAuditLogEntryCreate"
- `GuildAvailable` = "guildAvailable"
- `GuildBanAdd` = "guildBanAdd"
- `GuildBanRemove` = "guildBanRemove"
- `GuildCreate` = "guildCreate"
- `GuildDelete` = "guildDelete"
- `GuildEmojiCreate` = "emojiCreate"
- `GuildEmojiDelete` = "emojiDelete"
- `GuildEmojiUpdate` = "emojiUpdate"
- `GuildIntegrationsUpdate` = "guildIntegrationsUpdate"
- `GuildMemberAdd` = "guildMemberAdd"
- `GuildMemberAvailable` = "guildMemberAvailable"
- `GuildMemberRemove` = "guildMemberRemove"
- `GuildMembersChunk` = "guildMembersChunk"
- `GuildMemberUpdate` = "guildMemberUpdate"
- `GuildRoleCreate` = "roleCreate"
- `GuildRoleDelete` = "roleDelete"
- `GuildRoleUpdate` = "roleUpdate"
- `GuildScheduledEventCreate` = "guildScheduledEventCreate"
- `GuildScheduledEventDelete` = "guildScheduledEventDelete"
- `GuildScheduledEventUpdate` = "guildScheduledEventUpdate"
- `GuildScheduledEventUserAdd` = "guildScheduledEventUserAdd"
- `GuildScheduledEventUserRemove` = "guildScheduledEventUserRemove"
- `GuildSoundboardSoundCreate` = "guildSoundboardSoundCreate"
- `GuildSoundboardSoundDelete` = "guildSoundboardSoundDelete"
- `GuildSoundboardSoundsUpdate` = "guildSoundboardSoundsUpdate"
- `GuildSoundboardSoundUpdate` = "guildSoundboardSoundUpdate"
- `GuildStickerCreate` = "stickerCreate"
- `GuildStickerDelete` = "stickerDelete"
- `GuildStickerUpdate` = "stickerUpdate"
- `GuildUnavailable` = "guildUnavailable"
- `GuildUpdate` = "guildUpdate"
- `INTERACTION_MODAL_CREATE` = "interactionModalCreate"
- `InteractionCreate` = "interactionCreate"
- `INVALID_REQUEST_WARNING` = "invalidRequestWarning"
- `Invalidated` = "invalidated"
- `INVALIDATED` = "invalidated"
- `INVITE_CREATE` = "inviteCreate"
- `INVITE_DELETE` = "inviteDelete"
- `InviteCreate` = "inviteCreate"
- `InviteDelete` = "inviteDelete"
- `MESSAGE_BULK_DELETE` = "messageDeleteBulk"
- `MESSAGE_CREATE` = "messageCreate"
- `MESSAGE_DELETE` = "messageDelete"
- `MESSAGE_POLL_VOTE_ADD` = "messagePollVoteAdd"
- `MESSAGE_POLL_VOTE_REMOVE` = "messagePollVoteRemove"
- `MESSAGE_REACTION_ADD` = "messageReactionAdd"
- `MESSAGE_REACTION_REMOVE` = "messageReactionRemove"
- `MESSAGE_REACTION_REMOVE_ALL` = "messageReactionRemoveAll"
- `MESSAGE_REACTION_REMOVE_EMOJI` = "messageReactionRemoveEmoji"
- `MESSAGE_UPDATE` = "messageUpdate"
- `MessageBulkDelete` = "messageDeleteBulk"
- `MessageCreate` = "messageCreate"
- `MessageDelete` = "messageDelete"
- `MessagePollVoteAdd` = "messagePollVoteAdd"
- `MessagePollVoteRemove` = "messagePollVoteRemove"
- `MessageReactionAdd` = "messageReactionAdd"
- `MessageReactionRemove` = "messageReactionRemove"
- `MessageReactionRemoveAll` = "messageReactionRemoveAll"
- `MessageReactionRemoveEmoji` = "messageReactionRemoveEmoji"
- `MessageUpdate` = "messageUpdate"
- `PRESENCE_UPDATE` = "presenceUpdate"
- `PresenceUpdate` = "presenceUpdate"
- `RATE_LIMIT` = "rateLimit"
- `Raw` = "raw"
- `RAW` = "raw"
- `READY` = "ready"
- `RELATIONSHIP_ADD` = "relationshipAdd"
- `RELATIONSHIP_REMOVE` = "relationshipRemove"
- `RELATIONSHIP_UPDATE` = "relationshipUpdate"
- `SHARD_DISCONNECT` = "shardDisconnect"
- `SHARD_ERROR` = "shardError"
- `SHARD_READY` = "shardReady"
- `SHARD_RECONNECTING` = "shardReconnecting"
- `SHARD_RESUME` = "shardResume"
- `ShardDisconnect` = "shardDisconnect"
- `ShardError` = "shardError"
- `ShardReady` = "shardReady"
- `ShardReconnecting` = "shardReconnecting"
- `ShardResume` = "shardResume"
- `SoundboardSounds` = "soundboardSounds"
- `STAGE_INSTANCE_CREATE` = "stageInstanceCreate"
- `STAGE_INSTANCE_DELETE` = "stageInstanceDelete"
- `STAGE_INSTANCE_UPDATE` = "stageInstanceUpdate"
- `StageInstanceCreate` = "stageInstanceCreate"
- `StageInstanceDelete` = "stageInstanceDelete"
- `StageInstanceUpdate` = "stageInstanceUpdate"
- `SubscriptionCreate` = "subscriptionCreate"
- `SubscriptionDelete` = "subscriptionDelete"
- `SubscriptionUpdate` = "subscriptionUpdate"
- `THREAD_CREATE` = "threadCreate"
- `THREAD_DELETE` = "threadDelete"
- `THREAD_LIST_SYNC` = "threadListSync"
- `THREAD_MEMBER_UPDATE` = "threadMemberUpdate"
- `THREAD_MEMBERS_UPDATE` = "threadMembersUpdate"
- `THREAD_UPDATE` = "threadUpdate"
- `ThreadCreate` = "threadCreate"
- `ThreadDelete` = "threadDelete"
- `ThreadListSync` = "threadListSync"
- `ThreadMembersUpdate` = "threadMembersUpdate"
- `ThreadMemberUpdate` = "threadMemberUpdate"
- `ThreadUpdate` = "threadUpdate"
- `TYPING_START` = "typingStart"
- `TypingStart` = "typingStart"
- `UNHANDLED_PACKET` = "unhandledPacket"
- `USER_UPDATE` = "userUpdate"
- `UserUpdate` = "userUpdate"
- `VOICE_BROADCAST_SUBSCRIBE` = "subscribe"
- `VOICE_BROADCAST_UNSUBSCRIBE` = "unsubscribe"
- `VOICE_CHANNEL_EFFECT_SEND` = "voiceChannelEffectSend"
- `VOICE_SERVER_UPDATE` = "voiceServerUpdate"
- `VOICE_STATE_UPDATE` = "voiceStateUpdate"
- `VoiceChannelEffectSend` = "voiceChannelEffectSend"
- `VoiceServerUpdate` = "voiceServerUpdate"
- `VoiceStateUpdate` = "voiceStateUpdate"
- `Warn` = "warn"
- `WARN` = "warn"
- `WEBHOOKS_UPDATE` = "webhookUpdate"
- `WebhooksUpdate` = "webhooksUpdate"

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/Constants.ts#L282
