import pkg from "../package.json";
import _GuildAuditLogsModule from "./structures/GuildAuditLogs";

// "Root" classes (starting points)
export { default as BaseClient } from "./client/BaseClient";
export { default as Client } from "./client/Client";
/** @deprecated This will be removed in the next major version */
export { default as Shard } from "./sharding/Shard";
/** @deprecated This will be removed in the next major version */
export { default as ShardClientUtil } from "./sharding/ShardClientUtil";
/** @deprecated This will be removed in the next major version */
export { default as ShardingManager } from "./sharding/ShardingManager";
export { default as WebhookClient } from "./client/WebhookClient";

// Builders
export { ActionRowBuilder } from "@discordjs/builders";
export { default as AttachmentBuilder } from "./structures/AttachmentBuilder";
export { ButtonBuilder } from "@discordjs/builders";
export { ChannelSelectMenuBuilder } from "@discordjs/builders";
export { EmbedBuilder } from "@discordjs/builders";
export { MentionableSelectMenuBuilder } from "@discordjs/builders";
export { ModalBuilder } from "@discordjs/builders";
export { RoleSelectMenuBuilder } from "@discordjs/builders";
export { SelectMenuBuilder } from "@discordjs/builders";
export { SelectMenuOptionBuilder } from "@discordjs/builders";
export { StringSelectMenuBuilder } from "@discordjs/builders";
export { StringSelectMenuOptionBuilder } from "@discordjs/builders";
export { TextInputBuilder } from "@discordjs/builders";
export { UserSelectMenuBuilder } from "@discordjs/builders";

// V13 aliases for the v14 builders
/** @deprecated Use {@link ActionRowBuilder} instead. */
export { ActionRowBuilder as ActionRow } from "@discordjs/builders";
/** @deprecated Use {@link ButtonBuilder} instead. */
export { ButtonBuilder as Button } from "@discordjs/builders";
/** @deprecated Use {@link StringSelectMenuBuilder} instead. */
export { StringSelectMenuBuilder as SelectMenu } from "@discordjs/builders";
/** @deprecated Use {@link EmbedBuilder} instead. */
export { EmbedBuilder as Embed } from "@discordjs/builders";
/** @deprecated Use {@link AttachmentBuilder} instead. */
export { AttachmentBuilder as Attachment } from "./structures/AttachmentBuilder";
/** @deprecated Use {@link TextInputBuilder} instead. */
export { TextInputBuilder as TextInput } from "@discordjs/builders";

// Utilities
export { default as ActivityFlags } from "./util/ActivityFlags";
export { default as ApplicationFlags } from "./util/ApplicationFlags";
export { default as AttachmentFlags } from "./util/AttachmentFlags";
export { default as BaseManager } from "./managers/BaseManager";
export { default as BitField } from "./util/BitField";
export { Collection } from "@discordjs/collection";
export { default as Constants } from "./util/Constants";
export { default as DataResolver } from "./util/DataResolver";
export { default as DiscordAPIError } from "./rest/DiscordAPIError";
export { default as Events } from "./util/Events";
export { default as Formatters } from "./util/Formatters";
export { default as GuildMemberFlags } from "./util/GuildMemberFlags";
export { default as HTTPError } from "./rest/HTTPError";
export { default as Intents } from "./util/Intents";
export { default as LimitedCollection } from "./util/LimitedCollection";
export { default as MessageFlags } from "./util/MessageFlags";
export { default as Options } from "./util/Options";
export { default as Partials } from "./util/Partials";
export { default as Permissions } from "./util/Permissions";
export { default as RateLimitError } from "./rest/RateLimitError";
export { default as RoleFlags } from "./util/RoleFlags";
export { default as SnowflakeUtil } from "./util/SnowflakeUtil";
export { default as Status } from "./util/Status";
export { default as Sweepers } from "./util/Sweepers";
export { default as SystemChannelFlags } from "./util/SystemChannelFlags";
export { default as ThreadMemberFlags } from "./util/ThreadMemberFlags";
export { default as UserFlags } from "./util/UserFlags";
export { default as Util } from "./util/Util";
export type { DiscordPayload } from "./util/types";
export const { version } = pkg;

// V14 aliases for the v13 flag classes above
export { default as ActivityFlagsBitField } from "./util/ActivityFlags";
export { default as ApplicationFlagsBitField } from "./util/ApplicationFlags";
export { default as AttachmentFlagsBitField } from "./util/AttachmentFlags";
export { default as GuildMemberFlagsBitField } from "./util/GuildMemberFlags";
export { default as IntentsBitField } from "./util/Intents";
export { default as MessageFlagsBitField } from "./util/MessageFlags";
export { default as PermissionsBitField } from "./util/Permissions";
export { default as RoleFlagsBitField } from "./util/RoleFlags";
export { default as SystemChannelFlagsBitField } from "./util/SystemChannelFlags";
export { default as ThreadMemberFlagsBitField } from "./util/ThreadMemberFlags";
export { default as UserFlagsBitField } from "./util/UserFlags";

// Managers
export { default as ApplicationCommandManager } from "./managers/ApplicationCommandManager";
export { default as ApplicationCommandPermissionsManager } from "./managers/ApplicationCommandPermissionsManager";
export { default as AutoModerationRuleManager } from "./managers/AutoModerationRuleManager";
export { default as BaseGuildEmojiManager } from "./managers/BaseGuildEmojiManager";
export { default as CachedManager } from "./managers/CachedManager";
export { default as ChannelManager } from "./managers/ChannelManager";
export { default as ClientVoiceManager } from "./client/voice/ClientVoiceManager";
export { default as DataManager } from "./managers/DataManager";
export { default as GuildBanManager } from "./managers/GuildBanManager";
export { default as GuildChannelManager } from "./managers/GuildChannelManager";
export { default as GuildEmojiManager } from "./managers/GuildEmojiManager";
export { default as GuildEmojiRoleManager } from "./managers/GuildEmojiRoleManager";
export { default as GuildForumThreadManager } from "./managers/GuildForumThreadManager";
export { default as GuildInviteManager } from "./managers/GuildInviteManager";
export { default as GuildManager } from "./managers/GuildManager";
export { default as GuildMemberManager } from "./managers/GuildMemberManager";
export { default as GuildMemberRoleManager } from "./managers/GuildMemberRoleManager";
export { default as GuildScheduledEventManager } from "./managers/GuildScheduledEventManager";
export { default as GuildStickerManager } from "./managers/GuildStickerManager";
export { default as GuildTextThreadManager } from "./managers/GuildTextThreadManager";
export { default as MessageManager } from "./managers/MessageManager";
export { default as PermissionOverwriteManager } from "./managers/PermissionOverwriteManager";
export { default as PresenceManager } from "./managers/PresenceManager";
export { default as ReactionManager } from "./managers/ReactionManager";
export { default as ReactionUserManager } from "./managers/ReactionUserManager";
export { default as RoleManager } from "./managers/RoleManager";
export { default as SessionManager } from "./managers/SessionManager";
export { default as StageInstanceManager } from "./managers/StageInstanceManager";
export { default as ThreadManager } from "./managers/ThreadManager";
export { default as ThreadMemberManager } from "./managers/ThreadMemberManager";
export { default as UserManager } from "./managers/UserManager";
export { default as VoiceStateManager } from "./managers/VoiceStateManager";
export { default as WebSocketManager } from "./client/websocket/WebSocketManager";
export { default as WebSocketShard } from "./client/websocket/WebSocketShard";
export { default as RelationshipManager } from "./managers/RelationshipManager";
export { default as UserNoteManager } from "./managers/UserNoteManager";

// Structures
export { Activity } from "./structures/Presence";
export { default as AnonymousGuild } from "./structures/AnonymousGuild";
export { default as Application } from "./structures/interfaces/Application";
export { default as ApplicationCommand } from "./structures/ApplicationCommand";
export { ApplicationRoleConnectionMetadata } from "./structures/ApplicationRoleConnectionMetadata";
export { default as AutoModerationActionExecution } from "./structures/AutoModerationActionExecution";
export { default as AutoModerationRule } from "./structures/AutoModerationRule";
export { default as AutocompleteInteraction } from "./structures/AutocompleteInteraction";
export { default as Base } from "./structures/Base";
export { default as BaseGuild } from "./structures/BaseGuild";
export { default as BaseGuildEmoji } from "./structures/BaseGuildEmoji";
export { default as BaseGuildTextChannel } from "./structures/BaseGuildTextChannel";
export { default as BaseGuildVoiceChannel } from "./structures/BaseGuildVoiceChannel";
export { default as ButtonInteraction } from "./structures/ButtonInteraction";
export { default as CategoryChannel } from "./structures/CategoryChannel";
export { Channel } from "./structures/Channel";
export { default as ClientPresence } from "./structures/ClientPresence";
export { default as ClientUser } from "./structures/ClientUser";
export { default as Collector } from "./structures/interfaces/Collector";
export { default as CommandInteraction } from "./structures/CommandInteraction";
export { default as CommandInteractionOptionResolver } from "./structures/CommandInteractionOptionResolver";
export { default as ContainerComponent } from "./structures/ContainerComponent";
export { default as DirectoryChannel } from "./structures/DirectoryChannel";
export { default as DMChannel } from "./structures/DMChannel";
export { Emoji } from "./structures/Emoji";
export { default as FileComponent } from "./structures/FileComponent";
export { default as ForumChannel } from "./structures/ForumChannel";
export { Guild } from "./structures/Guild";
export { default as GuildAuditLogs } from "./structures/GuildAuditLogs";
export const GuildAuditLogsEntry = _GuildAuditLogsModule.Entry;
export { default as GuildBan } from "./structures/GuildBan";
export { default as GuildChannel } from "./structures/GuildChannel";
export { default as GuildEmoji } from "./structures/GuildEmoji";
export { GuildMember } from "./structures/GuildMember";
export { default as GuildPreview } from "./structures/GuildPreview";
export { default as GuildPreviewEmoji } from "./structures/GuildPreviewEmoji";
export { GuildScheduledEvent } from "./structures/GuildScheduledEvent";
export { default as GuildTemplate } from "./structures/GuildTemplate";
export { default as Integration } from "./structures/Integration";
export { default as IntegrationApplication } from "./structures/IntegrationApplication";
export { default as InteractionCollector } from "./structures/InteractionCollector";
export { default as InteractionWebhook } from "./structures/InteractionWebhook";
export { default as Invite } from "./structures/Invite";
export { default as InviteStageInstance } from "./structures/InviteStageInstance";
export { default as InviteGuild } from "./structures/InviteGuild";
export { default as MediaChannel } from "./structures/MediaChannel";
export { default as MediaGalleryComponent } from "./structures/MediaGalleryComponent";
export { default as MediaGalleryItem } from "./structures/MediaGalleryItem";
export { Message } from "./structures/Message";
export { default as MessageActionRow } from "./structures/MessageActionRow";
export { default as MessageAttachment } from "./structures/MessageAttachment";
export { default as MessageButton } from "./structures/MessageButton";
export { default as MessageCollector } from "./structures/MessageCollector";
export { default as MessageComponentInteraction } from "./structures/MessageComponentInteraction";
export { default as MessageEmbed } from "./structures/MessageEmbed";
export { default as MessageMentions } from "./structures/MessageMentions";
export { default as MessagePayload } from "./structures/MessagePayload";
export { default as MessageReaction } from "./structures/MessageReaction";
export { default as Modal } from "./structures/Modal";
export { default as ModalSubmitInteraction } from "./structures/ModalSubmitInteraction";
export { default as NewsChannel } from "./structures/NewsChannel";
export { default as OAuth2Guild } from "./structures/OAuth2Guild";
export { default as GroupDMChannel } from "./structures/GroupDMChannel";
export { default as PermissionOverwrites } from "./structures/PermissionOverwrites";
export { Presence } from "./structures/Presence";
export { default as ReactionCollector } from "./structures/ReactionCollector";
export { default as ReactionEmoji } from "./structures/ReactionEmoji";
export { RichPresenceAssets } from "./structures/Presence";
export { Role } from "./structures/Role";
export { default as SectionComponent } from "./structures/SectionComponent";
export { default as SelectMenuInteraction } from "./structures/SelectMenuInteraction";
export { default as SeparatorComponent } from "./structures/SeparatorComponent";
export { default as Session } from "./structures/Session";
export { default as StageChannel } from "./structures/StageChannel";
export { StageInstance } from "./structures/StageInstance";
export { Sticker } from "./structures/Sticker";
export { default as StickerPack } from "./structures/StickerPack";
export { default as StoreChannel } from "./structures/StoreChannel";
export { default as Team } from "./structures/Team";
export { default as TeamMember } from "./structures/TeamMember";
export { default as TextChannel } from "./structures/TextChannel";
export { default as TextDisplayComponent } from "./structures/TextDisplayComponent";
export { default as TextInputComponent } from "./structures/TextInputComponent";
export { default as ThreadChannel } from "./structures/ThreadChannel";
export { default as ThreadOnlyChannel } from "./structures/ThreadOnlyChannel";
export { default as ThreadMember } from "./structures/ThreadMember";
export { default as ThumbnailComponent } from "./structures/ThumbnailComponent";
export { default as Typing } from "./structures/Typing";
export { default as UnfurledMediaItem } from "./structures/UnfurledMediaItem";
export { default as User } from "./structures/User";
export { default as VoiceChannel } from "./structures/VoiceChannel";
export { default as VoiceChannelEffect } from "./structures/VoiceChannelEffect";
export { default as VoiceRegion } from "./structures/VoiceRegion";
export { default as VoiceState } from "./structures/VoiceState";
export { default as Webhook } from "./structures/Webhook";
export { default as Widget } from "./structures/Widget";
export { default as WidgetMember } from "./structures/WidgetMember";
export { default as WelcomeChannel } from "./structures/WelcomeChannel";
export { default as WelcomeScreen } from "./structures/WelcomeScreen";

export { default as WebSocket } from "./WebSocket";

export { CustomStatus } from "./structures/Presence";
export { RichPresence } from "./structures/Presence";
export { SpotifyRPC } from "./structures/Presence";
export { default as WebEmbed } from "./structures/WebEmbed";
export { default as DiscordAuthWebsocket } from "./util/RemoteAuth";
export { default as PurchasedFlags } from "./util/PurchasedFlags";
export { Poll } from "./structures/Poll";
export { PollAnswer } from "./structures/PollAnswer";
export { default as Recorder } from "./client/voice/receiver/Recorder";
