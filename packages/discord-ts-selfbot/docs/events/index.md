# Event catalog

Events emitted by public classes. Each entry links to the class reference.

## BaseClient

- [`debug`](../reference/client/base-client.md#events): Emitted for general debugging information.
- [`rateLimit`](../reference/client/base-client.md#events): Emitted when the client hits a rate limit while making a request
- [`apiRequest`](../reference/client/base-client.md#events): Emitted before every API request. This event can emit several times for the same request, e.g. when hitting a rate limit. This is an info...
- [`apiResponse`](../reference/client/base-client.md#events): Emitted after every API request has received a response. This event does not necessarily correlate to completion of the request, e.g. whe...
- [`invalidRequestWarning`](../reference/client/base-client.md#events): Emitted periodically when the process sends invalid requests to let users avoid the 10k invalid requests in 10 minutes threshold that cau...

## Client

- [`applicationCommandPermissionsUpdate`](../reference/client/client.md#events): Emitted whenever permissions for an application command in a guild were updated. This includes permission updates for other applications ...
- [`autoModerationActionExecution`](../reference/client/client.md#events): Emitted whenever an auto moderation rule is triggered. This event requires the Permissions.FLAGS.MANAGE_GUILD permission.
- [`autoModerationRuleCreate`](../reference/client/client.md#events): Emitted whenever an auto moderation rule is created. This event requires the Permissions.FLAGS.MANAGE_GUILD permission.
- [`autoModerationRuleDelete`](../reference/client/client.md#events): Emitted whenever an auto moderation rule is deleted. This event requires the Permissions.FLAGS.MANAGE_GUILD permission.
- [`autoModerationRuleUpdate`](../reference/client/client.md#events): Emitted whenever an auto moderation rule gets updated. This event requires the Permissions.FLAGS.MANAGE_GUILD permission.
- [`channelCreate`](../reference/client/client.md#events): Emitted whenever a guild channel is created.
- [`channelDelete`](../reference/client/client.md#events): Emitted whenever a channel is deleted.
- [`guildAuditLogEntryCreate`](../reference/client/client.md#events): Emitted whenever a guild audit log entry is created.
- [`guildBanAdd`](../reference/client/client.md#events): Emitted whenever a member is banned from a guild.
- [`guildBanRemove`](../reference/client/client.md#events): Emitted whenever a member is unbanned from a guild.
- [`guildUnavailable`](../reference/client/client.md#events): Emitted whenever a guild becomes unavailable, likely due to a server outage.
- [`guildDelete`](../reference/client/client.md#events): Emitted whenever a guild kicks the client or the guild is deleted/left.
- [`emojiCreate`](../reference/client/client.md#events): Emitted whenever a custom emoji is created in a guild.
- [`emojiDelete`](../reference/client/client.md#events): Emitted whenever a custom emoji is deleted in a guild.
- [`emojiUpdate`](../reference/client/client.md#events): Emitted whenever a custom emoji is updated in a guild.
- [`guildIntegrationsUpdate`](../reference/client/client.md#events): Emitted whenever a guild integration is updated
- [`guildMemberRemove`](../reference/client/client.md#events): Emitted whenever a member leaves a guild, or is kicked.
- [`guildMemberUpdate`](../reference/client/client.md#events): Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
- [`guildMemberAvailable`](../reference/client/client.md#events): Emitted whenever a member becomes available.
- [`roleCreate`](../reference/client/client.md#events): Emitted whenever a role is created.
- [`roleDelete`](../reference/client/client.md#events): Emitted whenever a guild role is deleted.
- [`roleUpdate`](../reference/client/client.md#events): Emitted whenever a guild role is updated.
- [`guildScheduledEventCreate`](../reference/client/client.md#events): Emitted whenever a guild scheduled event is created.
- [`guildScheduledEventDelete`](../reference/client/client.md#events): Emitted whenever a guild scheduled event is deleted.
- [`guildScheduledEventUpdate`](../reference/client/client.md#events): Emitted whenever a guild scheduled event gets updated.
- [`guildScheduledEventUserAdd`](../reference/client/client.md#events): Emitted whenever a user subscribes to a guild scheduled event
- [`guildScheduledEventUserRemove`](../reference/client/client.md#events): Emitted whenever a user unsubscribes from a guild scheduled event
- [`stickerCreate`](../reference/client/client.md#events): Emitted whenever a custom sticker is created in a guild.
- [`stickerDelete`](../reference/client/client.md#events): Emitted whenever a custom sticker is deleted in a guild.
- [`stickerUpdate`](../reference/client/client.md#events): Emitted whenever a custom sticker is updated in a guild.
- [`guildUpdate`](../reference/client/client.md#events): Emitted whenever a guild is updated - e.g. name change.
- [`inviteCreate`](../reference/client/client.md#events): Emitted when an invite is created. This event only triggers if the client has `MANAGE_GUILD` permissions for the guild, or `MANAGE_CHANNE...
- [`inviteDelete`](../reference/client/client.md#events): Emitted when an invite is deleted. This event only triggers if the client has `MANAGE_GUILD` permissions for the guild, or `MANAGE_CHANNE...
- [`messageCreate`](../reference/client/client.md#events): Emitted whenever a message is created.
- [`message`](../reference/client/client.md#events): Emitted whenever a message is created.
- [`messageDelete`](../reference/client/client.md#events): Emitted whenever a message is deleted.
- [`messageDeleteBulk`](../reference/client/client.md#events): Emitted whenever messages are deleted in bulk.
- [`messagePollVoteAdd`](../reference/client/client.md#events): Emitted whenever a user votes in a poll.
- [`messagePollVoteRemove`](../reference/client/client.md#events): Emitted whenever a user removes their vote in a poll.
- [`messageReactionAdd`](../reference/client/client.md#events): Emitted whenever a reaction is added to a cached message.
- [`messageReactionRemove`](../reference/client/client.md#events): Emitted whenever a reaction is removed from a cached message.
- [`messageReactionRemoveAll`](../reference/client/client.md#events): Emitted whenever all reactions are removed from a cached message.
- [`messageReactionRemoveEmoji`](../reference/client/client.md#events): Emitted when a bot removes an emoji reaction from a cached message.
- [`presenceUpdate`](../reference/client/client.md#events): Emitted whenever a guild member's presence (e.g. status, activity) is changed.
- [`stageInstanceCreate`](../reference/client/client.md#events): Emitted whenever a stage instance is created.
- [`stageInstanceDelete`](../reference/client/client.md#events): Emitted whenever a stage instance is deleted.
- [`stageInstanceUpdate`](../reference/client/client.md#events): Emitted whenever a stage instance gets updated - e.g. change in topic or privacy level
- [`threadCreate`](../reference/client/client.md#events): Emitted whenever a thread is created or when the client user is added to a thread.
- [`threadDelete`](../reference/client/client.md#events): Emitted whenever a thread is deleted.
- [`threadListSync`](../reference/client/client.md#events): Emitted whenever the client user gains access to a text or news channel that contains threads
- [`threadMembersUpdate`](../reference/client/client.md#events): Emitted whenever members are added or removed from a thread. Requires `GUILD_MEMBERS` privileged intent
- [`threadMemberUpdate`](../reference/client/client.md#events): Emitted whenever the client user's thread member is updated.
- [`typingStart`](../reference/client/client.md#events): Emitted whenever a user starts typing in a channel.
- [`userUpdate`](../reference/client/client.md#events): Emitted whenever a user's details (e.g. username) are changed. Triggered by the Discord gateway events USER_UPDATE, GUILD_MEMBER_UPDATE, ...
- [`voiceStateUpdate`](../reference/client/client.md#events): Emitted whenever a member changes voice state - e.g. joins/leaves a channel, mutes/unmutes.
- [`webhookUpdate`](../reference/client/client.md#events): Emitted whenever a channel has its webhooks changed.
- [`warn`](../reference/client/client.md#events): Emitted for general warnings.
- [`guildMemberSpeaking`](../reference/client/client.md#events): Emitted once a guild member changes speaking state.
- [`guildAvailable`](../reference/client/client.md#events): Emitted whenever a guild becomes available.
- [`guildCreate`](../reference/client/client.md#events): Emitted whenever the client joins a guild.
- [`interactionCreate`](../reference/client/client.md#events): Emitted when an interaction is created.
- [`interactionModalCreate`](../reference/client/client.md#events): Emitted whenever client user receive interaction.showModal()
- [`shardReady`](../reference/client/client.md#events): Emitted when a shard turns ready.
- [`shardDisconnect`](../reference/client/client.md#events): Emitted when a shard's WebSocket disconnects and will no longer reconnect.
- [`shardReconnecting`](../reference/client/client.md#events): Emitted when a shard is attempting to reconnect or re-identify.
- [`invalidated`](../reference/client/client.md#events): Emitted when the client's session becomes invalidated. You are expected to handle closing the process gracefully and preventing a boot lo...
- [`unhandledPacket`](../reference/client/client.md#events): Emitted whenever a packet isn't handled.
- [`ready`](../reference/client/client.md#events): Emitted when the client becomes ready to start working.
- [`shardError`](../reference/client/client.md#events): Emitted whenever a shard's WebSocket encounters a connection error.
- [`error`](../reference/client/client.md#events): Emitted when the client encounters an error. Errors thrown within this event do not have a catch handler, it is recommended to not use as...
- [`debug`](../reference/client/client.md#events): Emitted for general debugging information.
- [`rateLimit`](../reference/client/client.md#events): Emitted when the client hits a rate limit while making a request
- [`apiRequest`](../reference/client/client.md#events): Emitted before every API request. This event can emit several times for the same request, e.g. when hitting a rate limit. This is an info...
- [`apiResponse`](../reference/client/client.md#events): Emitted after every API request has received a response. This event does not necessarily correlate to completion of the request, e.g. whe...
- [`invalidRequestWarning`](../reference/client/client.md#events): Emitted periodically when the process sends invalid requests to let users avoid the 10k invalid requests in 10 minutes threshold that cau...

## Collector

- [`collect`](../reference/structures/collector.md#events): Emitted whenever an element is collected.
- [`dispose`](../reference/structures/collector.md#events): Emitted whenever an element is disposed of.
- [`end`](../reference/structures/collector.md#events): Emitted when the collector is finished collecting.

## DiscordAuthWebsocket

- [`closed`](../reference/utilities/discord-auth-websocket.md#events): Emitted whenever a connection is closed.
- [`error`](../reference/utilities/discord-auth-websocket.md#events): WS Error
- [`debug`](../reference/utilities/discord-auth-websocket.md#events): Debug Event
- [`ready`](../reference/utilities/discord-auth-websocket.md#events): Ready Event
- [`cancel`](../reference/utilities/discord-auth-websocket.md#events): Cancel
- [`pending`](../reference/utilities/discord-auth-websocket.md#events): Emitted whenever a user is scan QR Code.
- [`finish`](../reference/utilities/discord-auth-websocket.md#events): Emitted whenever a real token is found.

## InteractionCollector

- [`collect`](../reference/structures/interaction-collector.md#events): Emitted whenever an interaction is collected.
- [`dispose`](../reference/structures/interaction-collector.md#events): Emitted whenever an interaction is disposed of.
- [`end`](../reference/structures/interaction-collector.md#events): Emitted when the collector is finished collecting.

## MessageCollector

- [`collect`](../reference/structures/message-collector.md#events): Emitted whenever a message is collected.
- [`dispose`](../reference/structures/message-collector.md#events): Emitted whenever a message is disposed of.
- [`end`](../reference/structures/message-collector.md#events): Emitted when the collector is finished collecting.

## ReactionCollector

- [`create`](../reference/structures/reaction-collector.md#events): Emitted whenever a reaction is newly created on a message. Will emit only when a new reaction is added to the message, as opposed to Coll...
- [`collect`](../reference/structures/reaction-collector.md#events): Emitted whenever a reaction is collected.
- [`dispose`](../reference/structures/reaction-collector.md#events): Emitted when the reaction had all the users removed and the `dispose` option is set to true.
- [`remove`](../reference/structures/reaction-collector.md#events): Emitted when the reaction had one user removed and the `dispose` option is set to true.
- [`end`](../reference/structures/reaction-collector.md#events): Emitted when the collector is finished collecting.

## Shard

- [`spawn`](../reference/sharding/shard.md#events): Emitted upon the creation of the shard's child process/worker.
- [`ready`](../reference/sharding/shard.md#events): Emitted upon the shard's Client#event:shardReady event.
- [`disconnect`](../reference/sharding/shard.md#events): Emitted upon the shard's Client#event:shardDisconnect event.
- [`reconnecting`](../reference/sharding/shard.md#events): Emitted upon the shard's Client#event:shardReconnecting event.
- [`message`](../reference/sharding/shard.md#events): Emitted upon receiving a message from the child process/worker.
- [`death`](../reference/sharding/shard.md#events): Emitted upon the shard's child process/worker exiting.

## ShardingManager

- [`shardCreate`](../reference/sharding/sharding-manager.md#events): Emitted upon creating a shard.

## WebhookClient

- [`debug`](../reference/client/webhook-client.md#events): Emitted for general debugging information.
- [`rateLimit`](../reference/client/webhook-client.md#events): Emitted when the client hits a rate limit while making a request
- [`apiRequest`](../reference/client/webhook-client.md#events): Emitted before every API request. This event can emit several times for the same request, e.g. when hitting a rate limit. This is an info...
- [`apiResponse`](../reference/client/webhook-client.md#events): Emitted after every API request has received a response. This event does not necessarily correlate to completion of the request, e.g. whe...
- [`invalidRequestWarning`](../reference/client/webhook-client.md#events): Emitted periodically when the process sends invalid requests to let users avoid the 10k invalid requests in 10 minutes threshold that cau...

## WebSocketShard

- [`close`](../reference/client/web-socket-shard.md#events): Emitted when a shard's WebSocket closes.
- [`ready`](../reference/client/web-socket-shard.md#events): Emitted when the shard receives the READY payload and is now waiting for guilds
- [`resumed`](../reference/client/web-socket-shard.md#events): Emitted when the shard resumes successfully
- [`invalidSession`](../reference/client/web-socket-shard.md#events): Emitted when the session has been invalidated.
- [`allReady`](../reference/client/web-socket-shard.md#events): Emitted when the shard is fully ready. This event is emitted if: * all guilds were received by this shard * the ready timeout expired, an...
- [`destroyed`](../reference/client/web-socket-shard.md#events): Emitted when a shard is destroyed, but no WebSocket connection was present.
