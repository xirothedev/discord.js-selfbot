// These are aggregate types that are used in the typings file but do not exist as actual exported values.
// To prevent them from showing up in an editor, they are imported from here instead of exporting them there directly.

import type {
  APIApplication,
  APIApplicationCommand,
  APIApplicationCommandInteraction,
  APIAuditLog,
  APIAuditLogEntry,
  APIBan,
  APIChannel,
  APIEmoji,
  APIExtendedInvite,
  APIGuildIntegration,
  APIGuildIntegrationApplication,
  APIGuildMember,
  APIGuildPreview,
  APIGuildWelcomeScreen,
  APIGuildWelcomeScreenChannel,
  APIGuildWidget,
  APIGuildWidgetMember,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  APIInteractionGuildMember,
  APIInvite,
  APIInviteStageInstance,
  APIMessage,
  APIMessageButtonInteractionData,
  APIMessageComponentInteraction,
  APIMessageSelectMenuInteractionData,
  APIOverwrite,
  APIPartialChannel,
  APIPartialEmoji,
  APIPartialGuild,
  APIReaction,
  APIRole,
  APIStageInstance,
  APISticker,
  APIStickerItem,
  APIStickerPack,
  APITeam,
  APITeamMember,
  APITemplate,
  APIThreadMember,
  APIUnavailableGuild,
  APIUser,
  APIVoiceRegion,
  APIWebhook,
  GatewayActivity,
  GatewayActivityAssets,
  GatewayActivityEmoji,
  GatewayGuildBanAddDispatchData,
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberUpdateDispatchData,
  GatewayInteractionCreateDispatchData,
  GatewayInviteCreateDispatchData,
  GatewayInviteDeleteDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageUpdateDispatchData,
  GatewayPresenceUpdate,
  GatewayReadyDispatchData,
  GatewayTypingStartDispatchData,
  GatewayVoiceState,
  RESTAPIPartialCurrentUserGuild,
  RESTGetAPIWebhookWithTokenResult,
  RESTPatchAPIChannelMessageJSONBody,
  RESTPatchAPICurrentGuildMemberNicknameJSONBody,
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  RESTPatchAPIWebhookWithTokenJSONBody,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIInteractionCallbackFormDataBody,
  RESTPostAPIInteractionFollowupJSONBody,
  RESTPostAPIWebhookWithTokenJSONBody,
  Snowflake,
  APIGuildScheduledEvent,
  APITextInputComponent,
  APIModalSubmitInteraction,
  Permissions,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildMFALevel,
  GuildSystemChannelFlags,
  GuildPremiumTier,
  GuildNSFWLevel,
  GuildHubType,
  GuildVerificationLevel,
  GuildFeature,
  LocalizationMap,
  APIActionRowComponent,
  APIActionRowComponentTypes,
  APIConnection,
  APIUserApplicationIdentity,
} from 'discord-api-types/v10';
import type { GuildChannel, Guild, PermissionOverwrites } from '.';
import type {
  AutoModerationActionTypes,
  AutoModerationRuleEventTypes,
  AutoModerationRuleKeywordPresetTypes,
  AutoModerationRuleTriggerTypes,
  ApplicationRoleConnectionMetadataTypes,
  MessageComponentTypes,
  SeparatorSpacingSizes,
} from './enums';

export type RawActivityData = GatewayActivity;

export type RawApplicationData =
  | RawClientApplicationData
  | RawIntegrationApplicationData;
export type RawClientApplicationData =
  | GatewayReadyDispatchData['application']
  | APIMessage['application'];
export type RawIntegrationApplicationData =
  | APIGuildIntegrationApplication
  | Partial<APIApplication>;

export type RawApplicationCommandData = APIApplicationCommand;

export type RawChannelData =
  | RawGuildChannelData
  | RawThreadChannelData
  | RawDMChannelData
  | RawPartialGroupDMChannelData;
export type RawDMChannelData = APIChannel | APIInteractionDataResolvedChannel;
export type RawGuildChannelData =
  | APIChannel
  | APIInteractionDataResolvedChannel
  | Required<APIPartialChannel>;
export type RawPartialGroupDMChannelData =
  | APIChannel
  | Required<APIPartialChannel>;
export type RawThreadChannelData =
  | APIChannel
  | APIInteractionDataResolvedChannel;

export type RawEmojiData =
  | RawGuildEmojiData
  | RawReactionEmojiData
  | GatewayActivityEmoji
  | Omit<Partial<APIPartialEmoji>, 'animated'>;
export type RawGuildEmojiData = APIEmoji;
export type RawReactionEmojiData = APIEmoji | APIPartialEmoji;

export type RawGuildAuditLogData = APIAuditLog;

export type RawGuildAuditLogEntryData = APIAuditLogEntry;

export type RawGuildBanData = GatewayGuildBanAddDispatchData | APIBan;

export type RawGuildData = APIGuild | APIUnavailableGuild;
export type RawAnonymousGuildData = RawGuildData | RawInviteGuildData;
export type RawBaseGuildData = RawAnonymousGuildData | RawOAuth2GuildData;
export type RawInviteGuildData = APIPartialGuild;
export type RawOAuth2GuildData = RESTAPIPartialCurrentUserGuild;

export type RawGuildMemberData =
  | APIGuildMember
  | APIInteractionGuildMember
  | APIInteractionDataResolvedGuildMember
  | GatewayGuildMemberAddDispatchData
  | GatewayGuildMemberUpdateDispatchData
  | Required<RESTPatchAPICurrentGuildMemberNicknameJSONBody>
  | { user: { id: Snowflake } };
export type RawThreadMemberData = APIThreadMember;

export type RawGuildPreviewData = APIGuildPreview;

export type RawGuildScheduledEventData = APIGuildScheduledEvent;

export type RawGuildTemplateData = APITemplate;

export type RawIntegrationData = APIGuildIntegration;

export type RawInteractionData = GatewayInteractionCreateDispatchData;
export type RawCommandInteractionData = APIApplicationCommandInteraction;
export type RawMessageComponentInteractionData = APIMessageComponentInteraction;
export type RawMessageButtonInteractionData = APIMessageButtonInteractionData;
export type RawMessageSelectMenuInteractionData =
  APIMessageSelectMenuInteractionData;

export type RawTextInputComponentData = APITextInputComponent;
export type RawModalSubmitInteractionData = APIModalSubmitInteraction;

export type RawInviteData =
  | APIExtendedInvite
  | APIInvite
  | (GatewayInviteCreateDispatchData & { channel: GuildChannel; guild: Guild })
  | (GatewayInviteDeleteDispatchData & { channel: GuildChannel; guild: Guild });

export type RawInviteStageInstance = APIInviteStageInstance;

export type RawMessageData = APIMessage;
export type RawPartialMessageData = GatewayMessageUpdateDispatchData;

export interface RawMessageAttachmentData {
  id: Snowflake;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number | null;
  width?: number | null;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
}

export type RawMessagePayloadData =
  | RESTPostAPIChannelMessageJSONBody
  | RESTPatchAPIChannelMessageJSONBody
  | RESTPostAPIWebhookWithTokenJSONBody
  | RESTPatchAPIWebhookWithTokenJSONBody
  | RESTPostAPIInteractionCallbackFormDataBody
  | RESTPatchAPIInteractionOriginalResponseJSONBody
  | RESTPostAPIInteractionFollowupJSONBody
  | RESTPatchAPIInteractionFollowupJSONBody;

export type RawMessageReactionData =
  | APIReaction
  | GatewayMessageReactionAddDispatchData;

export type RawPermissionOverwriteData = APIOverwrite | PermissionOverwrites;

export type RawPresenceData = GatewayPresenceUpdate;

export type RawRoleData = APIRole;

export type RawRichPresenceAssets = GatewayActivityAssets;

export type RawStageInstanceData =
  | (APIStageInstance & { invite_code?: string | null })
  | (Partial<APIStageInstance> &
      Pick<APIStageInstance, 'id' | 'channel_id' | 'guild_id'> & {
        invite_code?: string | null;
      });

export type RawStickerData = APISticker | APIStickerItem;

export type RawStickerPackData = APIStickerPack;

export type RawTeamData = APITeam;

export type RawTeamMemberData = APITeamMember;

export type RawTypingData = GatewayTypingStartDispatchData;

export type RawUserData =
  | (APIUser & { member?: Omit<APIGuildMember, 'user'> })
  | (GatewayPresenceUpdate['user'] & Pick<APIUser, 'username'>);

export type RawVoiceRegionData = APIVoiceRegion;

export type RawVoiceStateData =
  | GatewayVoiceState
  | Omit<GatewayVoiceState, 'guild_id'>;

export type RawWebhookData =
  | APIWebhook
  | RESTGetAPIWebhookWithTokenResult
  | (Partial<APIWebhook> & Required<Pick<APIWebhook, 'id' | 'guild_id'>>);

export type RawWelcomeChannelData = APIGuildWelcomeScreenChannel;

export type RawWelcomeScreenData = APIGuildWelcomeScreen;

export type RawWidgetData = APIGuildWidget;

export type RawWidgetMemberData = APIGuildWidgetMember;

export interface GatewayAutoModerationActionExecutionDispatchData {
  guild_id: Snowflake;
  action: APIAutoModerationAction;
  rule_id: Snowflake;
  rule_trigger_type: AutoModerationRuleTriggerTypes;
  user_id: Snowflake;
  channel_id?: Snowflake;
  message_id?: Snowflake;
  alert_system_message_id?: Snowflake;
  content: string;
  matched_keyword: string | null;
  matched_content: string | null;
}

export interface APIAutoModerationAction {
  type: AutoModerationActionTypes;
  metadata?: APIAutoModerationActionMetadata;
}
export interface APIAutoModerationActionMetadata {
  channel_id?: Snowflake;
  duration_seconds?: number;
  custom_message?: string;
}

export interface APIAutoModerationRule {
  id: Snowflake;
  guild_id: Snowflake;
  name: string;
  creator_id: Snowflake;
  event_type: AutoModerationRuleEventTypes;
  trigger_type: AutoModerationRuleTriggerTypes;
  trigger_metadata: APIAutoModerationRuleTriggerMetadata;
  actions: APIAutoModerationAction[];
  enabled: boolean;
  exempt_roles: Snowflake[];
  exempt_channels: Snowflake[];
}

export interface APIAutoModerationRuleTriggerMetadata {
  keyword_filter?: string[];
  presets?: AutoModerationRuleKeywordPresetTypes[];
  allow_list?: string[];
  regex_patterns?: string[];
  mention_total_limit?: number;
  mention_raid_protection_enabled?: boolean;
}

export interface APIGuild extends APIPartialGuild {
  icon_hash?: string | null;
  discovery_splash: string | null;
  owner?: boolean;
  owner_id: Snowflake;
  permissions?: Permissions;
  region: string;
  afk_channel_id: Snowflake | null;
  afk_timeout: number;
  widget_enabled?: boolean;
  widget_channel_id?: Snowflake | null;
  verification_level: GuildVerificationLevel;
  default_message_notifications: GuildDefaultMessageNotifications;
  explicit_content_filter: GuildExplicitContentFilter;
  roles: APIRole[];
  emojis: APIEmoji[];
  features: GuildFeature[];
  mfa_level: GuildMFALevel;
  application_id: Snowflake | null;
  system_channel_id: Snowflake | null;
  system_channel_flags: GuildSystemChannelFlags;
  rules_channel_id: Snowflake | null;
  max_presences?: number | null;
  max_members?: number;
  vanity_url_code: string | null;
  description: string | null;
  banner: string | null;
  premium_tier: GuildPremiumTier;
  premium_subscription_count?: number;
  preferred_locale: string;
  public_updates_channel_id: Snowflake | null;
  max_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  welcome_screen?: APIGuildWelcomeScreen;
  nsfw_level: GuildNSFWLevel;
  stickers: APISticker[];
  premium_progress_bar_enabled: boolean;
  hub_type: GuildHubType | null;
  safety_alerts_channel_id: Snowflake | null;
}

export interface APIApplicationRoleConnectionMetadata {
  type: ApplicationRoleConnectionMetadataTypes;
  key: string;
  name: string;
  name_localizations?: LocalizationMap;
  description: string;
  description_localizations?: LocalizationMap;
}

export interface APIBaseComponent<T extends MessageComponentTypes> {
  type: T;
  id?: number;
}

export interface APIUnfurledMediaItem {
  url: string;
}

export interface APIMediaGalleryItem {
  media: APIUnfurledMediaItem;
  description: string;
  spoiler: boolean;
}

export interface APISeparatorComponent extends APIBaseComponent<MessageComponentTypes.SEPARATOR> {
  spacing: SeparatorSpacingSizes;
  divider: boolean;
}

export interface APITextDisplayComponent extends APIBaseComponent<MessageComponentTypes.TEXT_DISPLAY> {
  content: string;
}

export interface APIThumbnailComponent extends APIBaseComponent<MessageComponentTypes.THUMBNAIL> {
  media: APIUnfurledMediaItem;
  description: string;
  spoiler: boolean;
}

export interface APIFileComponent extends APIBaseComponent<MessageComponentTypes.FILE> {
  file: APIUnfurledMediaItem;
  spoiler: boolean;
}

export interface APIMediaGalleryComponent extends APIBaseComponent<MessageComponentTypes.MEDIA_GALLERY> {
  items: APIMediaGalleryItem;
}

export interface APISectionComponent extends APIBaseComponent<MessageComponentTypes.SECTION> {
  components: APITextDisplayComponent[];
  accessory: APIThumbnailComponent | APIMessageButtonInteractionData;
}

export type APIContainerComponents =
  | APIActionRowComponent<APIActionRowComponentTypes>
  | APITextDisplayComponent
  | APISectionComponent
  | APIMediaGalleryComponent
  | APISeparatorComponent
  | APIFileComponent;
export interface APIContainerComponent extends APIBaseComponent<MessageComponentTypes.CONTAINER> {
  components: APIContainerComponents[];
  accent_color: number;
  spoiler: boolean;
}

export type RawConnectionData = APIConnection & {
  access_token?: string;
  metadata?: Record<string, unknown>;
  metadata_visibility?: number;
};

export interface RawProfileBadgeData {
  id: string;
  description: string;
  icon: string;
  link?: string;
}

export interface RawGameWidgetGameData {
  game_id: Snowflake;
  comment?: string | null;
  tags?: string[];
}

export interface RawGameWidgetContentData {
  type: string;
  games?: RawGameWidgetGameData[];
  application_id?: Snowflake;
}

export interface RawGameWidgetData {
  id?: Snowflake;
  updated_at?: string;
  data: RawGameWidgetContentData;
}

export interface RawProfileWidgetsData {
  widgets: RawGameWidgetData[];
}

export interface RawSuggestedWidgetGamesData {
  suggested_games: Snowflake[];
  suggested_wishlist_games: Snowflake[];
}

export interface RawProfileEffectData {
  id: Snowflake;
  expires_at?: number;
}

export interface RawUserProfileMetadataData {
  guild_id?: Snowflake;
  pronouns: string;
  bio?: string;
  banner?: string | null;
  accent_color?: number | null;
  theme_colors?: [number, number] | null;
  popout_animation_particle_type?: Snowflake | null;
  emoji?: APIEmoji | null;
  profile_effect?: RawProfileEffectData | null;
  collectibles?: Record<string, unknown>[];
}

export type RawUserProfilePartialUserData = RawUserData & {
  bio?: string;
  clan?: APIUser['primary_guild'];
  banner_color?: string | null;
  display_name_styles?: unknown | null;
};

export interface RawMutualGuildData {
  id: Snowflake;
  nick: string | null;
}

export interface RawWishlistSettingData {
  visibility: number;
  updated_at: string;
}

export type RawConnectedAccountData = APIConnection & {
  metadata?: Record<string, unknown>;
  metadata_visibility?: number;
};

export interface RawUserProfileData {
  application?: RawApplicationData;
  user: RawUserProfilePartialUserData;
  user_profile?: RawUserProfileMetadataData;
  badges?: RawProfileBadgeData[];
  guild_member?: RawGuildMemberData;
  guild_member_profile?: RawUserProfileMetadataData;
  guild_badges?: RawProfileBadgeData[];
  widgets?: RawGameWidgetData[];
  legacy_username?: string | null;
  mutual_guilds?: RawMutualGuildData[];
  mutual_friends?: RawUserData[];
  mutual_friends_count?: number;
  connected_accounts?: RawConnectedAccountData[];
  premium_since?: string | null;
  premium_type?: number | null;
  premium_guild_since?: string | null;
  wishlist_settings?: Record<string, RawWishlistSettingData>;
  profile_themes_experiment_bucket?: number;
}

export interface RawApplicationIdentityProfileData {
  primary?: Record<string, unknown>;
  dynamic?: Record<string, unknown>[];
}

export interface RawUserApplicationProfileData {
  username?: string | null;
  metadata?: string;
  data?: RawApplicationIdentityProfileData;
  data_trusted?: boolean;
  connection_visible?: boolean;
}

export type RawUserApplicationIdentityData = Omit<
  APIUserApplicationIdentity,
  'user_id'
> & {
  user_id?: Snowflake;
  application_id?: Snowflake;
  profile?: RawUserApplicationProfileData;
  profiles?: RawUserApplicationProfileData[];
  data?: RawApplicationIdentityProfileData;
  data_trusted?: boolean;
  connection_visible?: string;
};

export interface RawWidgetComponentFieldData {
  value_type: string;
  presentation_type: string;
  value: string;
  fallback?: RawWidgetComponentFieldData;
}

export interface RawWidgetComponentData {
  fields: Record<string, RawWidgetComponentFieldData>;
}

export interface RawWidgetSurfaceData {
  layout: string;
  components: Record<string, RawWidgetComponentData>;
}

export interface RawWidgetConfigData {
  application_id: Snowflake;
  config_id: Snowflake;
  display_name: string;
  status: string;
  surfaces: Record<string, RawWidgetSurfaceData>;
  resolved_assets?: Record<string, unknown>[];
  published_at?: string | null;
  updated_at: string;
}

export interface RawFeaturedWidgetConfigsData {
  applications: RawApplicationData[];
  configs: Record<string, RawWidgetConfigData[]>;
}

export interface RawDeveloperWidgetConfigsData {
  applications: RawApplicationData[];
  configs: Record<string, RawWidgetConfigData[]>;
}

export interface RawWidgetLayoutFieldData {
  display_name: string;
  required: boolean;
  allowed_presentation_types: string[];
}

export interface RawWidgetLayoutComponentData {
  display_name: string;
  required: boolean;
  fields: Record<string, RawWidgetLayoutFieldData>;
}

export interface RawWidgetLayoutDefinitionData {
  key: string;
  display_name: string;
  surface: string;
  components: Record<string, RawWidgetLayoutComponentData>;
}

export type RawWidgetLayoutDefinitionsData = Record<
  string,
  RawWidgetLayoutDefinitionData
>;
