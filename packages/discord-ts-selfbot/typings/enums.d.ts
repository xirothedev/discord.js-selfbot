// These are enums that are used in the typings file but do not exist as actual exported values. To prevent them from
// showing up in an editor, they are imported from here instead of exporting them there directly.

export enum ActivityTypes {
  PLAYING = 0,
  STREAMING = 1,
  LISTENING = 2,
  WATCHING = 3,
  CUSTOM = 4,
  COMPETING = 5,
  HANG = 6,
}

export enum ApplicationCommandTypes {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3,
}

export enum ApplicationCommandOptionTypes {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
  ATTACHMENT = 11,
}

export enum ApplicationCommandPermissionTypes {
  ROLE = 1,
  USER = 2,
}

export enum AutoModerationRuleTriggerTypes {
  KEYWORD = 1,
  SPAM = 2,
  KEYWORD_PRESET = 3,
  MENTION_SPAM = 4,
}

export enum AutoModerationRuleKeywordPresetTypes {
  PROFANITY = 1,
  SEXUAL_CONTENT = 2,
  SLURS = 3,
}

export enum AutoModerationActionTypes {
  BLOCK_MESSAGE = 1,
  SEND_ALERT_MESSAGE = 2,
  TIMEOUT = 3,
}

export enum AutoModerationRuleEventTypes {
  MESSAGE_SEND = 1,
}

export enum ChannelTypes {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_NEWS = 5,
  GUILD_STORE = 6,
  UNKNOWN = 7,
  GUILD_NEWS_THREAD = 10,
  GUILD_PUBLIC_THREAD = 11,
  GUILD_PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_DIRECTORY = 14,
  GUILD_FORUM = 15,
  GUILD_MEDIA = 16,
}

export enum SortOrderTypes {
  LATEST_ACTIVITY = 1,
  CREATION_DATE = 2,
}

export enum ForumLayoutTypes {
  NOT_SET = 0,
  LIST_VIEW = 1,
  GALLERY_VIEW = 2,
}

export enum PollLayoutTypes {
  DEFAULT = 1,
  IMAGE_ONLY_ANSWERS = 1,
}

export enum MessageTypes {
  DEFAULT = 0,
  RECIPIENT_ADD = 1,
  RECIPIENT_REMOVE = 2,
  CALL = 3,
  CHANNEL_NAME_CHANGE = 4,
  CHANNEL_ICON_CHANGE = 5,
  CHANNEL_PINNED_MESSAGE = 6,
  GUILD_MEMBER_JOIN = 7,
  USER_PREMIUM_GUILD_SUBSCRIPTION = 8,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1 = 9,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2 = 10,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3 = 11,
  CHANNEL_FOLLOW_ADD = 12,
  GUILD_DISCOVERY_DISQUALIFIED = 14,
  GUILD_DISCOVERY_REQUALIFIED = 14,
  GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING = 15,
  GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING = 16,
  THREAD_CREATED = 17,
  REPLY = 18,
  APPLICATION_COMMAND = 19,
  THREAD_STARTER_MESSAGE = 20,
  GUILD_INVITE_REMINDER = 21,
  CONTEXT_MENU_COMMAND = 22,
  AUTO_MODERATION_ACTION = 23,
  ROLE_SUBSCRIPTION_PURCHASE = 24,
  INTERACTION_PREMIUM_UPSELL = 25,
  STAGE_START = 26,
  STAGE_END = 27,
  STAGE_SPEAKER = 28,
  STAGE_RAISE_HAND = 29,
  STAGE_TOPIC = 30,
  GUILD_APPLICATION_PREMIUM_SUBSCRIPTION = 31,
  PREMIUM_REFERRAL = 35,
  GUILD_INCIDENT_ALERT_MODE_ENABLED = 33,
  GUILD_INCIDENT_ALERT_MODE_DISABLED = 34,
  GUILD_INCIDENT_REPORT_RAID = 35,
  GUILD_INCIDENT_REPORT_FALSE_ALARM = 36,
  GUILD_DEADCHAT_REVIVE_PROMPT = 37,
  CUSTOM_GIFT = 38,
  GUILD_GAMING_STATS_PROMPT = 39,
  PURCHASE_NOTIFICATION = 44,
  POLL_RESULT = 46,
  CHANGELOG = 42,
  NITRO_NOTIFICATION = 43,
}

export enum MessageReferenceTypes {
  DEFAULT = 0,
  FORWARD = 1,
}

export enum DefaultMessageNotificationLevels {
  ALL_MESSAGES = 0,
  ONLY_MENTIONS = 1,
}

export enum ExplicitContentFilterLevels {
  DISABLED = 0,
  MEMBERS_WITHOUT_ROLES = 1,
  ALL_MEMBERS = 2,
}

export enum GuildScheduledEventEntityTypes {
  STAGE_INSTANCE = 1,
  VOICE = 2,
  EXTERNAL = 3,
}

export enum GuildScheduledEventPrivacyLevels {
  GUILD_ONLY = 2,
}

export enum GuildScheduledEventStatuses {
  SCHEDULED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELED = 4,
}

export enum InteractionResponseTypes {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_MESSAGE_UPDATE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9,
}

export enum InteractionTypes {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

export enum InviteTargetTypes {
  STREAM = 1,
  EMBEDDED_APPLICATION = 1,
  ROLE_SUBSCRIPTIONS = 2,
  CREATOR_PAGE = 3,
}

export enum InviteTypes {
  GUILD = 0,
  GROUP_DM = 1,
  FRIEND = 2,
}

export enum MembershipStates {
  INVITED = 1,
  ACCEPTED = 2,
}

export enum MessageButtonStyles {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DANGER = 4,
  LINK = 5,
}

export enum MessageComponentTypes {
  ACTION_ROW = 1,
  BUTTON = 2,
  STRING_SELECT = 3,
  TEXT_INPUT = 4,
  USER_SELECT = 5,
  ROLE_SELECT = 6,
  MENTIONABLE_SELECT = 7,
  CHANNEL_SELECT = 8,
  SECTION = 9,
  TEXT_DISPLAY = 10,
  THUMBNAIL = 11,
  MEDIA_GALLERY = 12,
  FILE = 13,
  SEPARATOR = 14,
  CONTAINER = 17,
}

export enum MessageComponentInteractables {
  ACTION_ROW = 1,
  BUTTON = 2,
  STRING_SELECT = 3,
  TEXT_INPUT = 4,
  USER_SELECT = 5,
  ROLE_SELECT = 6,
  MENTIONABLE_SELECT = 7,
  CHANNEL_SELECT = 8,
}

export enum SelectMenuComponentTypes {
  STRING_SELECT = 3,
  USER_SELECT = 5,
  ROLE_SELECT = 6,
  MENTIONABLE_SELECT = 7,
  CHANNEL_SELECT = 8,
}

export enum MFALevels {
  NONE = 0,
  ELEVATED = 1,
}

export enum NSFWLevels {
  DEFAULT = 0,
  EXPLICIT = 1,
  SAFE = 2,
  AGE_RESTRICTED = 3,
}

/**
 * Background color of a nameplate.
 * @see {@link https://docs.discord.food/resources/user#nameplate-color-palette}
 */
export enum NameplatePalette {
  /**
   * Value: none
   * Name: None
   */
  None = 'none',
  /**
   * Value: crimson
   * Name: Crimson
   */
  Crimson = 'crimson',
  /**
   * Value: berry
   * Name: Berry
   */
  Berry = 'berry',
  /**
   * Value: sky
   * Name: Sky
   */
  Sky = 'sky',
  /**
   * Value: teal
   * Name: Teal
   */
  Teal = 'teal',
  /**
   * Value: forest
   * Name: Forest
   */
  Forest = 'forest',
  /**
   * Value: bubble_gum
   * Name: BubbleGum
   */
  BubbleGum = 'bubble_gum',
  /**
   * Value: violet
   * Name: Violet
   */
  Violet = 'violet',
  /**
   * Value: cobalt
   * Name: Cobalt
   */
  Cobalt = 'cobalt',
  /**
   * Value: clover
   * Name: Clover
   */
  Clover = 'clover',
  /**
   * Value: lemon
   * Name: Lemon
   */
  Lemon = 'lemon',
  /**
   * Value: white
   * Name: White
   */
  White = 'white',
}

export enum OverwriteTypes {
  role = 0,
  member = 1,
}

export enum PremiumTiers {
  NONE = 0,
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
}

export enum PrivacyLevels {
  PUBLIC = 1,
  GUILD_ONLY = 2,
}

export enum StickerFormatTypes {
  PNG = 1,
  APNG = 2,
  LOTTIE = 3,
  GIF = 4,
}

export enum StickerTypes {
  STANDARD = 1,
  GUILD = 2,
}

export enum TextInputStyles {
  SHORT = 1,
  PARAGRAPH = 2,
}

export enum VerificationLevels {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  VERY_HIGH = 4,
}

export enum VideoQualityModes {
  AUTO = 1,
  FULL = 2,
}

export enum ReactionTypes {
  NORMAL = 0,
  BURST = 1,
}

export enum WebhookTypes {
  Incoming = 1,
  'Channel Follower' = 2,
  Application = 3,
}

export enum ApplicationRoleConnectionMetadataTypes {
  INTEGER_LESS_THAN_OR_EQUAL = 1,
  INTEGER_GREATER_THAN_OR_EQUAL = 1,
  INTEGER_EQUAL = 2,
  INTEGER_NOT_EQUAL = 3,
  DATATIME_LESS_THAN_OR_EQUAL = 4,
  DATATIME_GREATER_THAN_OR_EQUAL = 5,
  BOOLEAN_EQUAL = 6,
  BOOLEAN_NOT_EQUAL = 7,
}

export enum RelationshipTypes {
  NONE = 0,
  FRIEND = 1,
  BLOCKED = 2,
  PENDING_INCOMING = 3,
  PENDING_OUTGOING = 4,
  IMPLICIT = 5,
}

export enum SeparatorSpacingSizes {
  SMALL = 1,
  LARGE = 2,
}

export enum ApplicationType {
  /**
   * A game integrating with Discord
   */
  GAME = 1,
  /**
   * A music service integrating with Discord
   * @deprecated
   */
  MUSIC = 2,
  /**
   * A limited application used for ticketed event SKUs
   */
  TICKETED_EVENTS = 3,
  /**
   * A limited application used for creator monetization (e.g. role subscription) SKUs
   */
  CREATOR_MONETIZATION = 4,
}
