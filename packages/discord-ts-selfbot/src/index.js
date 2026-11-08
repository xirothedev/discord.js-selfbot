'use strict';

// "Root" classes (starting points)
exports.BaseClient = require('./client/BaseClient');
exports.Client = require('./client/Client');
/** @deprecated This will be removed in the next major version */
exports.Shard = require('./sharding/Shard');
/** @deprecated This will be removed in the next major version */
exports.ShardClientUtil = require('./sharding/ShardClientUtil');
/** @deprecated This will be removed in the next major version */
exports.ShardingManager = require('./sharding/ShardingManager');
exports.WebhookClient = require('./client/WebhookClient');

// Builders
exports.ActionRowBuilder = require('@discordjs/builders').ActionRowBuilder;
exports.AttachmentBuilder = require('./structures/AttachmentBuilder');
exports.ButtonBuilder = require('@discordjs/builders').ButtonBuilder;
exports.ChannelSelectMenuBuilder = require('@discordjs/builders').ChannelSelectMenuBuilder;
exports.EmbedBuilder = require('@discordjs/builders').EmbedBuilder;
exports.MentionableSelectMenuBuilder = require('@discordjs/builders').MentionableSelectMenuBuilder;
exports.ModalBuilder = require('@discordjs/builders').ModalBuilder;
exports.RoleSelectMenuBuilder = require('@discordjs/builders').RoleSelectMenuBuilder;
exports.SelectMenuBuilder = require('@discordjs/builders').SelectMenuBuilder;
exports.SelectMenuOptionBuilder = require('@discordjs/builders').SelectMenuOptionBuilder;
exports.StringSelectMenuBuilder = require('@discordjs/builders').StringSelectMenuBuilder;
exports.StringSelectMenuOptionBuilder = require('@discordjs/builders').StringSelectMenuOptionBuilder;
exports.TextInputBuilder = require('@discordjs/builders').TextInputBuilder;
exports.UserSelectMenuBuilder = require('@discordjs/builders').UserSelectMenuBuilder;

// V13 aliases for the v14 builders
/** @deprecated Use {@link ActionRowBuilder} instead. */
exports.ActionRow = exports.ActionRowBuilder;
/** @deprecated Use {@link ButtonBuilder} instead. */
exports.Button = exports.ButtonBuilder;
/** @deprecated Use {@link StringSelectMenuBuilder} instead. */
exports.SelectMenu = exports.StringSelectMenuBuilder;
/** @deprecated Use {@link EmbedBuilder} instead. */
exports.Embed = exports.EmbedBuilder;
/** @deprecated Use {@link AttachmentBuilder} instead. */
exports.Attachment = exports.AttachmentBuilder;
/** @deprecated Use {@link TextInputBuilder} instead. */
exports.TextInput = exports.TextInputBuilder;

// Utilities
exports.ActivityFlags = require('./util/ActivityFlags');
exports.ApplicationFlags = require('./util/ApplicationFlags');
exports.AttachmentFlags = require('./util/AttachmentFlags');
exports.BaseManager = require('./managers/BaseManager');
exports.BitField = require('./util/BitField');
exports.Collection = require('@discordjs/collection').Collection;
exports.Constants = require('./util/Constants');
exports.DataResolver = require('./util/DataResolver');
exports.DiscordAPIError = require('./rest/DiscordAPIError');
exports.Events = require('./util/Events');
exports.Formatters = require('./util/Formatters');
exports.GuildMemberFlags = require('./util/GuildMemberFlags');
exports.HTTPError = require('./rest/HTTPError');
exports.Intents = require('./util/Intents');
exports.LimitedCollection = require('./util/LimitedCollection');
exports.MessageFlags = require('./util/MessageFlags');
exports.Options = require('./util/Options');
exports.Partials = require('./util/Partials');
exports.Permissions = require('./util/Permissions');
exports.RateLimitError = require('./rest/RateLimitError');
exports.RoleFlags = require('./util/RoleFlags');
exports.SnowflakeUtil = require('./util/SnowflakeUtil');
exports.Status = require('./util/Status');
exports.Sweepers = require('./util/Sweepers');
exports.SystemChannelFlags = require('./util/SystemChannelFlags');
exports.ThreadMemberFlags = require('./util/ThreadMemberFlags');
exports.UserFlags = require('./util/UserFlags');
exports.Util = require('./util/Util');
exports.version = require('../package.json').version;

// V14 aliases for the v13 flag classes above
exports.ActivityFlagsBitField = require('./util/ActivityFlags');
exports.ApplicationFlagsBitField = require('./util/ApplicationFlags');
exports.AttachmentFlagsBitField = require('./util/AttachmentFlags');
exports.GuildMemberFlagsBitField = require('./util/GuildMemberFlags');
exports.IntentsBitField = require('./util/Intents');
exports.MessageFlagsBitField = require('./util/MessageFlags');
exports.PermissionsBitField = require('./util/Permissions');
exports.RoleFlagsBitField = require('./util/RoleFlags');
exports.SystemChannelFlagsBitField = require('./util/SystemChannelFlags');
exports.ThreadMemberFlagsBitField = require('./util/ThreadMemberFlags');
exports.UserFlagsBitField = require('./util/UserFlags');

// Managers
exports.ApplicationCommandManager = require('./managers/ApplicationCommandManager');
exports.ApplicationCommandPermissionsManager = require('./managers/ApplicationCommandPermissionsManager');
exports.AutoModerationRuleManager = require('./managers/AutoModerationRuleManager');
exports.BaseGuildEmojiManager = require('./managers/BaseGuildEmojiManager');
exports.CachedManager = require('./managers/CachedManager');
exports.ChannelManager = require('./managers/ChannelManager');
exports.ClientVoiceManager = require('./client/voice/ClientVoiceManager');
exports.DataManager = require('./managers/DataManager');
exports.GuildBanManager = require('./managers/GuildBanManager');
exports.GuildChannelManager = require('./managers/GuildChannelManager');
exports.GuildEmojiManager = require('./managers/GuildEmojiManager');
exports.GuildEmojiRoleManager = require('./managers/GuildEmojiRoleManager');
exports.GuildForumThreadManager = require('./managers/GuildForumThreadManager');
exports.GuildInviteManager = require('./managers/GuildInviteManager');
exports.GuildManager = require('./managers/GuildManager');
exports.GuildMemberManager = require('./managers/GuildMemberManager');
exports.GuildMemberRoleManager = require('./managers/GuildMemberRoleManager');
exports.GuildScheduledEventManager = require('./managers/GuildScheduledEventManager');
exports.GuildStickerManager = require('./managers/GuildStickerManager');
exports.GuildTextThreadManager = require('./managers/GuildTextThreadManager');
exports.MessageManager = require('./managers/MessageManager');
exports.PermissionOverwriteManager = require('./managers/PermissionOverwriteManager');
exports.PresenceManager = require('./managers/PresenceManager');
exports.ReactionManager = require('./managers/ReactionManager');
exports.ReactionUserManager = require('./managers/ReactionUserManager');
exports.RoleManager = require('./managers/RoleManager');
exports.SessionManager = require('./managers/SessionManager');
exports.StageInstanceManager = require('./managers/StageInstanceManager');
exports.ThreadManager = require('./managers/ThreadManager');
exports.ThreadMemberManager = require('./managers/ThreadMemberManager');
exports.UserManager = require('./managers/UserManager');
exports.VoiceStateManager = require('./managers/VoiceStateManager');
exports.WebSocketManager = require('./client/websocket/WebSocketManager');
exports.WebSocketShard = require('./client/websocket/WebSocketShard');
exports.RelationshipManager = require('./managers/RelationshipManager');
exports.UserNoteManager = require('./managers/UserNoteManager');

// Structures
exports.Activity = require('./structures/Presence').Activity;
exports.AnonymousGuild = require('./structures/AnonymousGuild');
exports.Application = require('./structures/interfaces/Application');
exports.ApplicationCommand = require('./structures/ApplicationCommand');
exports.ApplicationRoleConnectionMetadata =
  require('./structures/ApplicationRoleConnectionMetadata').ApplicationRoleConnectionMetadata;
exports.AutoModerationActionExecution = require('./structures/AutoModerationActionExecution');
exports.AutoModerationRule = require('./structures/AutoModerationRule');
exports.AutocompleteInteraction = require('./structures/AutocompleteInteraction');
exports.Base = require('./structures/Base');
exports.BaseGuild = require('./structures/BaseGuild');
exports.BaseGuildEmoji = require('./structures/BaseGuildEmoji');
exports.BaseGuildTextChannel = require('./structures/BaseGuildTextChannel');
exports.BaseGuildVoiceChannel = require('./structures/BaseGuildVoiceChannel');
exports.ButtonInteraction = require('./structures/ButtonInteraction');
exports.CategoryChannel = require('./structures/CategoryChannel');
exports.Channel = require('./structures/Channel').Channel;
exports.ClientPresence = require('./structures/ClientPresence');
exports.ClientUser = require('./structures/ClientUser');
exports.Collector = require('./structures/interfaces/Collector');
exports.CommandInteraction = require('./structures/CommandInteraction');
exports.CommandInteractionOptionResolver = require('./structures/CommandInteractionOptionResolver');
exports.ContainerComponent = require('./structures/ContainerComponent');
exports.DirectoryChannel = require('./structures/DirectoryChannel');
exports.DMChannel = require('./structures/DMChannel');
exports.Emoji = require('./structures/Emoji').Emoji;
exports.FileComponent = require('./structures/FileComponent');
exports.ForumChannel = require('./structures/ForumChannel');
exports.Guild = require('./structures/Guild').Guild;
exports.GuildAuditLogs = require('./structures/GuildAuditLogs');
exports.GuildAuditLogsEntry = require('./structures/GuildAuditLogs').Entry;
exports.GuildBan = require('./structures/GuildBan');
exports.GuildChannel = require('./structures/GuildChannel');
exports.GuildEmoji = require('./structures/GuildEmoji');
exports.GuildMember = require('./structures/GuildMember').GuildMember;
exports.GuildPreview = require('./structures/GuildPreview');
exports.GuildPreviewEmoji = require('./structures/GuildPreviewEmoji');
exports.GuildScheduledEvent = require('./structures/GuildScheduledEvent').GuildScheduledEvent;
exports.GuildTemplate = require('./structures/GuildTemplate');
exports.Integration = require('./structures/Integration');
exports.IntegrationApplication = require('./structures/IntegrationApplication');
exports.InteractionCollector = require('./structures/InteractionCollector');
exports.InteractionWebhook = require('./structures/InteractionWebhook');
exports.Invite = require('./structures/Invite');
exports.InviteStageInstance = require('./structures/InviteStageInstance');
exports.InviteGuild = require('./structures/InviteGuild');
exports.MediaChannel = require('./structures/MediaChannel');
exports.MediaGalleryComponent = require('./structures/MediaGalleryComponent');
exports.MediaGalleryItem = require('./structures/MediaGalleryItem');
exports.Message = require('./structures/Message').Message;
exports.MessageActionRow = require('./structures/MessageActionRow');
exports.MessageAttachment = require('./structures/MessageAttachment');
exports.MessageButton = require('./structures/MessageButton');
exports.MessageCollector = require('./structures/MessageCollector');
exports.MessageComponentInteraction = require('./structures/MessageComponentInteraction');
exports.MessageEmbed = require('./structures/MessageEmbed');
exports.MessageMentions = require('./structures/MessageMentions');
exports.MessagePayload = require('./structures/MessagePayload');
exports.MessageReaction = require('./structures/MessageReaction');
exports.Modal = require('./structures/Modal');
exports.ModalSubmitInteraction = require('./structures/ModalSubmitInteraction');
exports.NewsChannel = require('./structures/NewsChannel');
exports.OAuth2Guild = require('./structures/OAuth2Guild');
exports.GroupDMChannel = require('./structures/GroupDMChannel');
exports.PermissionOverwrites = require('./structures/PermissionOverwrites');
exports.Presence = require('./structures/Presence').Presence;
exports.ReactionCollector = require('./structures/ReactionCollector');
exports.ReactionEmoji = require('./structures/ReactionEmoji');
exports.RichPresenceAssets = require('./structures/Presence').RichPresenceAssets;
exports.Role = require('./structures/Role').Role;
exports.SectionComponent = require('./structures/SectionComponent');
exports.SelectMenuInteraction = require('./structures/SelectMenuInteraction');
exports.SeparatorComponent = require('./structures/SeparatorComponent');
exports.Session = require('./structures/Session');
exports.StageChannel = require('./structures/StageChannel');
exports.StageInstance = require('./structures/StageInstance').StageInstance;
exports.Sticker = require('./structures/Sticker').Sticker;
exports.StickerPack = require('./structures/StickerPack');
exports.StoreChannel = require('./structures/StoreChannel');
exports.Team = require('./structures/Team');
exports.TeamMember = require('./structures/TeamMember');
exports.TextChannel = require('./structures/TextChannel');
exports.TextDisplayComponent = require('./structures/TextDisplayComponent');
exports.TextInputComponent = require('./structures/TextInputComponent');
exports.ThreadChannel = require('./structures/ThreadChannel');
exports.ThreadOnlyChannel = require('./structures/ThreadOnlyChannel');
exports.ThreadMember = require('./structures/ThreadMember');
exports.ThumbnailComponent = require('./structures/ThumbnailComponent');
exports.Typing = require('./structures/Typing');
exports.UnfurledMediaItem = require('./structures/UnfurledMediaItem');
exports.User = require('./structures/User');
exports.VoiceChannel = require('./structures/VoiceChannel');
exports.VoiceChannelEffect = require('./structures/VoiceChannelEffect');
exports.VoiceRegion = require('./structures/VoiceRegion');
exports.VoiceState = require('./structures/VoiceState');
exports.Webhook = require('./structures/Webhook');
exports.Widget = require('./structures/Widget');
exports.WidgetMember = require('./structures/WidgetMember');
exports.WelcomeChannel = require('./structures/WelcomeChannel');
exports.WelcomeScreen = require('./structures/WelcomeScreen');

exports.WebSocket = require('./WebSocket');

exports.CustomStatus = require('./structures/Presence').CustomStatus;
exports.RichPresence = require('./structures/Presence').RichPresence;
exports.SpotifyRPC = require('./structures/Presence').SpotifyRPC;
exports.WebEmbed = require('./structures/WebEmbed');
exports.DiscordAuthWebsocket = require('./util/RemoteAuth');
exports.PurchasedFlags = require('./util/PurchasedFlags');
exports.Poll = require('./structures/Poll').Poll;
exports.PollAnswer = require('./structures/PollAnswer').PollAnswer;
exports.Recorder = require('./client/voice/receiver/Recorder');
