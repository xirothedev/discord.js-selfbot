import _errorsModule from '../errors';

const { Error, RangeError, TypeError } = _errorsModule;
import type {
  ApplicationRoleConnectionMetadataTypes,
  ForumLayoutTypes,
  MessageReferenceTypes,
  PollLayoutTypes,
  SortOrderTypes,
} from '../../typings/enums';
import type { MessageType } from '../../typings';

type EnumOf<Key extends string, Value extends number = number> = Record<
  Key,
  Value
> &
  Record<number, Key>;
type KeyMirrorOf<Key extends string> = { [Item in Key]: Item };

function keyMirror<Key extends string>(arr: readonly Key[]): KeyMirrorOf<Key> {
  const tmp: KeyMirrorOf<Key> = Object.create(null);
  for (const value of arr) {
    tmp[value] = value;
  }
  return tmp;
}

function createEnum<Key extends string, Value extends number = number>(
  keys: readonly (Key | null)[]
): EnumOf<Key, Value> {
  const obj: EnumOf<Key, Value> = Object.create(Object.prototype);
  for (const [index, key] of keys.entries()) {
    if (key === null) {
      continue;
    }
    Object.assign(obj, { [key]: index });
    obj[index] = key;
  }
  return obj;
}

const Constants: ConstantsShape = Object.create(Object.prototype);

Constants.MaxBulkDeletableMessageAge = 1_209_600_000;

Constants.UserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9267 Chrome/152.0.7977.169 Electron/44.10.0 Safari/537.36';

Constants.ciphers = [
  'TLS_AES_128_GCM_SHA256',
  'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256',
  'ECDHE-ECDSA-AES128-GCM-SHA256',
  'ECDHE-RSA-AES128-GCM-SHA256',
  'ECDHE-ECDSA-AES256-GCM-SHA384',
  'ECDHE-RSA-AES256-GCM-SHA384',
  'ECDHE-ECDSA-CHACHA20-POLY1305',
  'ECDHE-RSA-CHACHA20-POLY1305',
  'ECDHE-RSA-AES128-SHA',
  'ECDHE-RSA-AES256-SHA',
  'AES128-GCM-SHA256',
  'AES256-GCM-SHA384',
  'AES128-SHA',
  'AES256-SHA',
];

Constants.WSCodes = {
  1000: 'WS_CLOSE_REQUESTED',
  1011: 'INTERNAL_ERROR',
  4004: 'TOKEN_INVALID',
  4010: 'SHARDING_INVALID',
  4011: 'SHARDING_REQUIRED',
  4013: 'INVALID_INTENTS',
  4014: 'DISALLOWED_INTENTS',
};

const AllowedImageFormats = ['webp', 'png', 'jpg', 'jpeg', 'gif'];

const StickerFormatExtensions: Record<string, string> = {
  GIF: 'gif',
  LOTTIE: 'json',
};

const AllowedImageSizes = [
  16, 32, 56, 64, 96, 128, 256, 300, 512, 600, 1024, 2048, 4096,
];

interface ImageURLOptions {
  format?: string;
  size?: number;
}

interface CdnEndpoints {
  Emoji: (emojiId: string, format?: string) => string;
  Asset: (name: string) => string;
  DefaultAvatar: (index: number) => string;
  Avatar: (
    userId: string,
    hash: string,
    format: string,
    size?: number,
    dynamic?: boolean
  ) => string;
  AvatarDecoration: (hash: string) => string;
  GuildTagBadge: (guildId: string, hash: string) => string;
  GuildMemberAvatar: (
    guildId: string,
    memberId: string,
    hash: string,
    format?: string,
    size?: number,
    dynamic?: boolean
  ) => string;
  GuildMemberBanner: (
    guildId: string,
    memberId: string,
    hash: string,
    format?: string,
    size?: number,
    dynamic?: boolean
  ) => string;
  Banner: (
    id: string,
    hash: string,
    format: string,
    size?: number,
    dynamic?: boolean
  ) => string;
  Icon: (
    guildId: string,
    hash: string,
    format: string,
    size?: number,
    dynamic?: boolean
  ) => string;
  AppIcon: (appId: string, hash: string, options: ImageURLOptions) => string;
  AppAsset: (appId: string, hash: string, options: ImageURLOptions) => string;
  StickerPackBanner: (
    bannerId: string,
    format: string,
    size?: number
  ) => string;
  GDMIcon: (
    channelId: string,
    hash: string,
    format: string,
    size?: number
  ) => string;
  Splash: (
    guildId: string,
    hash: string,
    format: string,
    size?: number
  ) => string;
  DiscoverySplash: (
    guildId: string,
    hash: string,
    format: string,
    size?: number
  ) => string;
  TeamIcon: (teamId: string, hash: string, options: ImageURLOptions) => string;
  Sticker: (stickerId: string, stickerFormat: string) => string;
  RoleIcon: (
    roleId: string,
    hash: string,
    format?: string,
    size?: number
  ) => string;
  GuildScheduledEventCover: (
    scheduledEventId: string,
    coverHash: string,
    format: string,
    size?: number
  ) => string;
}

interface EndpointsShape {
  CDN: (root: string) => CdnEndpoints;
  invite: (root: string, code: string, eventId?: string) => string;
  scheduledEvent: (root: string, guildId: string, eventId: string) => string;
  botGateway: string;
}

function makeImageUrl(
  root: string,
  { format = 'webp', size }: ImageURLOptions = {}
) {
  if (!['undefined', 'number'].includes(typeof size)) {
    throw new TypeError('INVALID_TYPE', 'size', 'number');
  }
  if (format && !AllowedImageFormats.includes(format)) {
    throw new Error('IMAGE_FORMAT', format);
  }
  if (size && !AllowedImageSizes.includes(size)) {
    throw new RangeError('IMAGE_SIZE', size);
  }
  return `${root}.${format}${size ? `?size=${size}` : ''}`;
}

Constants.Endpoints = {
  CDN(root: string) {
    return {
      AppAsset: (appId: string, hash: string, options: ImageURLOptions) =>
        makeImageUrl(`${root}/app-assets/${appId}/${hash}`, options),
      AppIcon: (appId: string, hash: string, options: ImageURLOptions) =>
        makeImageUrl(`${root}/app-icons/${appId}/${hash}`, options),
      Asset: (name: string) => `${root}/assets/${name}`,
      Avatar: (
        userId: string,
        hash: string,
        format: string,
        size?: number,
        dynamic = false
      ) => {
        const resolvedFormat =
          dynamic && hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(`${root}/avatars/${userId}/${hash}`, {
          format: resolvedFormat,
          size,
        });
      },
      AvatarDecoration: (hash: string) =>
        makeImageUrl(`${root}/avatar-decoration-presets/${hash}`, {
          format: 'png',
        }),
      Banner: (
        id: string,
        hash: string,
        format: string,
        size?: number,
        dynamic = false
      ) => {
        const resolvedFormat =
          dynamic && hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(`${root}/banners/${id}/${hash}`, {
          format: resolvedFormat,
          size,
        });
      },
      DefaultAvatar: (index: number) => `${root}/embed/avatars/${index}.png`,
      DiscoverySplash: (
        guildId: string,
        hash: string,
        format: string,
        size?: number
      ) =>
        makeImageUrl(`${root}/discovery-splashes/${guildId}/${hash}`, {
          format,
          size,
        }),
      Emoji: (emojiId: string, format = 'webp') =>
        `${root}/emojis/${emojiId}.${format}`,
      GDMIcon: (
        channelId: string,
        hash: string,
        format: string,
        size?: number
      ) =>
        makeImageUrl(`${root}/channel-icons/${channelId}/${hash}`, {
          format,
          size,
        }),
      GuildMemberAvatar: (
        guildId: string,
        memberId: string,
        hash: string,
        format = 'webp',
        size?: number,
        dynamic = false
      ) => {
        const resolvedFormat =
          dynamic && hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(
          `${root}/guilds/${guildId}/users/${memberId}/avatars/${hash}`,
          { format: resolvedFormat, size }
        );
      },
      GuildMemberBanner: (
        guildId: string,
        memberId: string,
        hash: string,
        format = 'webp',
        size?: number,
        dynamic = false
      ) => {
        const resolvedFormat =
          dynamic && hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(
          `${root}/guilds/${guildId}/users/${memberId}/banners/${hash}`,
          { format: resolvedFormat, size }
        );
      },
      GuildScheduledEventCover: (
        scheduledEventId: string,
        coverHash: string,
        format: string,
        size?: number
      ) =>
        makeImageUrl(`${root}/guild-events/${scheduledEventId}/${coverHash}`, {
          format,
          size,
        }),
      GuildTagBadge: (guildId: string, hash: string) =>
        `${root}/guild-tag-badges/${guildId}/${hash}.png`,
      Icon: (
        guildId: string,
        hash: string,
        format: string,
        size?: number,
        dynamic = false
      ) => {
        const resolvedFormat =
          dynamic && hash.startsWith('a_') ? 'gif' : format;
        return makeImageUrl(`${root}/icons/${guildId}/${hash}`, {
          format: resolvedFormat,
          size,
        });
      },
      RoleIcon: (
        roleId: string,
        hash: string,
        format = 'webp',
        size?: number
      ) =>
        makeImageUrl(`${root}/role-icons/${roleId}/${hash}`, { format, size }),
      Splash: (guildId: string, hash: string, format: string, size?: number) =>
        makeImageUrl(`${root}/splashes/${guildId}/${hash}`, { format, size }),
      Sticker: (stickerId: string, stickerFormat: string) =>
        `${root}/stickers/${stickerId}.${StickerFormatExtensions[stickerFormat] ?? 'png'}`,
      StickerPackBanner: (bannerId: string, format: string, size?: number) =>
        makeImageUrl(
          `${root}/app-assets/710982414301790216/store/${bannerId}`,
          { format, size }
        ),
      TeamIcon: (teamId: string, hash: string, options: ImageURLOptions) =>
        makeImageUrl(`${root}/team-icons/${teamId}/${hash}`, options),
    };
  },
  botGateway: '/gateway',
  invite: (root: string, code: string, eventId?: string) =>
    eventId ? `${root}/${code}?event=${eventId}` : `${root}/${code}`,
  scheduledEvent: (root: string, guildId: string, eventId: string) =>
    `${root}/${guildId}/${eventId}`,
};

Constants.Status = {
  CONNECTING: 1,
  DISCONNECTED: 5,
  IDENTIFYING: 7,
  IDLE: 3,
  NEARLY: 4,
  READY: 0,
  RECONNECTING: 2,
  RESUMING: 8,
  WAITING_FOR_GUILDS: 6,
};

Constants.VoiceStatus = {
  AUTHENTICATING: 2,
  CONNECTED: 0,
  CONNECTING: 1,
  DISCONNECTED: 4,
  RECONNECTING: 3,
};

Constants.Opcodes = {
  DISPATCH: 0,
  DM_UPDATE: 13,
  EMBEDDED_ACTIVITY_CLOSE: 26,
  EMBEDDED_ACTIVITY_LAUNCH: 25,
  EMBEDDED_ACTIVITY_UPDATE: 27,
  // Payload: { guild_id: Snowflake, channel_ids_hash: string[], role_ids_hash: string[], emoji_ids_hash: string[], sticker_ids_hash: string[] }
  GET_DELETED_ENTITY_IDS_NOT_MATCHING_HASH: 30,
  GUILD_SUBSCRIPTIONS: 14,
  // Payload: { subscriptions: Object<guild_id, { Payload_op14 - guild_id }> } | Response: Opcode 14
  GUILD_SUBSCRIPTIONS_BULK: 37,
  GUILD_SYNC: 12,
  HEARTBEAT: 1,
  HEARTBEAT_ACK: 11,
  HELLO: 10,
  IDENTIFY: 2,
  INVALID_SESSION: 9,
  LOBBY_CONNECT: 15,
  LOBBY_DISCONNECT: 16,
  LOBBY_VOICE_STATE_UPDATE: 17,
  RECONNECT: 7,
  // Payload: { target_session_id: string, payload: any }
  REMOTE_COMMAND: 29,
  // Payload: { guild_id: string } | Response: CHANNEL_STATUSES | { guild_id, channels: { status, id }[] }
  REQUEST_CHANNEL_STATUSES: 36,
  // Payload: { guild_id: Snowflake, channel_id: Snowflake, threads: { thread_id: Snowflake, ack_message_id: Snowflake }[] }
  REQUEST_FORUM_UNREADS: 28,
  REQUEST_GUILD_APPLICATION_COMMANDS: 24,
  REQUEST_GUILD_MEMBERS: 8,
  // Payload: { guild_id: string, channel_ids: string[] }
  REQUEST_LAST_MESSAGES: 34,
  // Payload: { guild_ids: string[] }
  REQUEST_SOUNDBOARD_SOUNDS: 31,
  RESUME: 6,
  // Payload: { guild_id: string, query: string, continuation_token?: Snowflake }
  SEARCH_RECENT_MEMBERS: 35,
  // Payload: { preferred_region: string }
  SPEED_TEST_CREATE: 32,
  // Payload: null
  SPEED_TEST_DELETE: 33,
  STATUS_UPDATE: 3,
  STREAM_CREATE: 18,
  STREAM_DELETE: 19,
  STREAM_PING: 21,
  STREAM_SET_PAUSED: 22,
  STREAM_WATCH: 20,
  VOICE_GUILD_PING: 5,
  VOICE_STATE_UPDATE: 4,
};

Constants.VoiceOpcodes = {
  CHANNEL_OPTIONS_UPDATE: 17,
  CLIENT_DISCONNECT: 13,
  HEARTBEAT: 3,
  HEARTBEAT_ACK: 6,
  HELLO: 8,
  IDENTIFY: 0,
  MEDIA_SINK_WANTS: 15,
  READY: 2,
  RESUME: 7,
  RESUMED: 9,
  SELECT_PROTOCOL: 1,
  SESSION_DESCRIPTION: 4,
  SESSION_UPDATE: 14,
  SOURCES: 12,
  SPEAKING: 5,
  VOICE_BACKEND_VERSION: 16,
};

Constants.Events = {
  API_REQUEST: 'apiRequest',
  API_RESPONSE: 'apiResponse',
  APPLICATION_COMMAND_CREATE: 'applicationCommandCreate',
  APPLICATION_COMMAND_DELETE: 'applicationCommandDelete',
  APPLICATION_COMMAND_PERMISSIONS_UPDATE: 'applicationCommandPermissionsUpdate',
  APPLICATION_COMMAND_UPDATE: 'applicationCommandUpdate',
  AUTO_MODERATION_ACTION_EXECUTION: 'autoModerationActionExecution',
  AUTO_MODERATION_RULE_CREATE: 'autoModerationRuleCreate',
  AUTO_MODERATION_RULE_DELETE: 'autoModerationRuleDelete',
  AUTO_MODERATION_RULE_UPDATE: 'autoModerationRuleUpdate',
  CACHE_SWEEP: 'cacheSweep',
  CALL_CREATE: 'callCreate',
  CALL_DELETE: 'callDelete',
  CALL_UPDATE: 'callUpdate',
  CHANNEL_CREATE: 'channelCreate',
  CHANNEL_DELETE: 'channelDelete',
  CHANNEL_PINS_UPDATE: 'channelPinsUpdate',
  CHANNEL_RECIPIENT_ADD: 'channelRecipientAdd',
  CHANNEL_RECIPIENT_REMOVE: 'channelRecipientRemove',
  CHANNEL_UPDATE: 'channelUpdate',
  CLIENT_READY: 'ready',
  DEBUG: 'debug',
  ERROR: 'error',
  GUILD_AUDIT_LOG_ENTRY_CREATE: 'guildAuditLogEntryCreate',
  GUILD_AVAILABLE: 'guildAvailable',
  GUILD_BAN_ADD: 'guildBanAdd',
  GUILD_BAN_REMOVE: 'guildBanRemove',
  GUILD_CREATE: 'guildCreate',
  GUILD_DELETE: 'guildDelete',
  GUILD_EMOJI_CREATE: 'emojiCreate',
  GUILD_EMOJI_DELETE: 'emojiDelete',
  GUILD_EMOJI_UPDATE: 'emojiUpdate',
  GUILD_INTEGRATIONS_UPDATE: 'guildIntegrationsUpdate',
  GUILD_MEMBERS_CHUNK: 'guildMembersChunk',
  GUILD_MEMBER_ADD: 'guildMemberAdd',
  GUILD_MEMBER_AVAILABLE: 'guildMemberAvailable',
  GUILD_MEMBER_REMOVE: 'guildMemberRemove',
  GUILD_MEMBER_UPDATE: 'guildMemberUpdate',
  GUILD_ROLE_CREATE: 'roleCreate',
  GUILD_ROLE_DELETE: 'roleDelete',
  GUILD_ROLE_UPDATE: 'roleUpdate',
  GUILD_SCHEDULED_EVENT_CREATE: 'guildScheduledEventCreate',
  GUILD_SCHEDULED_EVENT_DELETE: 'guildScheduledEventDelete',
  GUILD_SCHEDULED_EVENT_UPDATE: 'guildScheduledEventUpdate',
  GUILD_SCHEDULED_EVENT_USER_ADD: 'guildScheduledEventUserAdd',
  GUILD_SCHEDULED_EVENT_USER_REMOVE: 'guildScheduledEventUserRemove',
  GUILD_STICKER_CREATE: 'stickerCreate',
  GUILD_STICKER_DELETE: 'stickerDelete',
  GUILD_STICKER_UPDATE: 'stickerUpdate',
  GUILD_UNAVAILABLE: 'guildUnavailable',
  GUILD_UPDATE: 'guildUpdate',
  INTERACTION_CREATE: 'interactionCreate',
  INTERACTION_MODAL_CREATE: 'interactionModalCreate',
  INVALIDATED: 'invalidated',
  INVALID_REQUEST_WARNING: 'invalidRequestWarning',
  INVITE_CREATE: 'inviteCreate',
  INVITE_DELETE: 'inviteDelete',
  MESSAGE_BULK_DELETE: 'messageDeleteBulk',
  MESSAGE_CREATE: 'messageCreate',
  MESSAGE_DELETE: 'messageDelete',
  MESSAGE_POLL_VOTE_ADD: 'messagePollVoteAdd',
  MESSAGE_POLL_VOTE_REMOVE: 'messagePollVoteRemove',
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
  MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
  MESSAGE_REACTION_REMOVE_ALL: 'messageReactionRemoveAll',
  MESSAGE_REACTION_REMOVE_EMOJI: 'messageReactionRemoveEmoji',
  MESSAGE_UPDATE: 'messageUpdate',
  PRESENCE_UPDATE: 'presenceUpdate',
  RATE_LIMIT: 'rateLimit',
  RAW: 'raw',
  RELATIONSHIP_ADD: 'relationshipAdd',
  RELATIONSHIP_REMOVE: 'relationshipRemove',
  RELATIONSHIP_UPDATE: 'relationshipUpdate',
  SHARD_DISCONNECT: 'shardDisconnect',
  SHARD_ERROR: 'shardError',
  SHARD_READY: 'shardReady',
  SHARD_RECONNECTING: 'shardReconnecting',
  SHARD_RESUME: 'shardResume',
  STAGE_INSTANCE_CREATE: 'stageInstanceCreate',
  STAGE_INSTANCE_DELETE: 'stageInstanceDelete',
  STAGE_INSTANCE_UPDATE: 'stageInstanceUpdate',
  THREAD_CREATE: 'threadCreate',
  THREAD_DELETE: 'threadDelete',
  THREAD_LIST_SYNC: 'threadListSync',
  THREAD_MEMBERS_UPDATE: 'threadMembersUpdate',
  THREAD_MEMBER_UPDATE: 'threadMemberUpdate',
  THREAD_UPDATE: 'threadUpdate',
  TYPING_START: 'typingStart',
  UNHANDLED_PACKET: 'unhandledPacket',
  USER_UPDATE: 'userUpdate',
  // Djs v12
  VOICE_BROADCAST_SUBSCRIBE: 'subscribe',
  VOICE_BROADCAST_UNSUBSCRIBE: 'unsubscribe',
  VOICE_CHANNEL_EFFECT_SEND: 'voiceChannelEffectSend',
  VOICE_SERVER_UPDATE: 'voiceServerUpdate',
  VOICE_STATE_UPDATE: 'voiceStateUpdate',
  WARN: 'warn',
  WEBHOOKS_UPDATE: 'webhookUpdate',
};

Constants.ShardEvents = {
  ALL_READY: 'allReady',
  CLOSE: 'close',
  DESTROYED: 'destroyed',
  INVALID_SESSION: 'invalidSession',
  READY: 'ready',
  RESUMED: 'resumed',
};

Constants.PartialTypes = keyMirror([
  'USER',
  'CHANNEL',
  'GUILD_MEMBER',
  'MESSAGE',
  'REACTION',
  'GUILD_SCHEDULED_EVENT',
]);

Constants.WSEvents = keyMirror([
  'READY',
  'RESUMED',
  'APPLICATION_COMMAND_CREATE',
  'APPLICATION_COMMAND_DELETE',
  'APPLICATION_COMMAND_UPDATE',
  'APPLICATION_COMMAND_PERMISSIONS_UPDATE',
  'AUTO_MODERATION_ACTION_EXECUTION',
  'AUTO_MODERATION_RULE_CREATE',
  'AUTO_MODERATION_RULE_DELETE',
  'AUTO_MODERATION_RULE_UPDATE',
  'GUILD_CREATE',
  'GUILD_DELETE',
  'GUILD_UPDATE',
  'INVITE_CREATE',
  'INVITE_DELETE',
  'GUILD_MEMBER_ADD',
  'GUILD_MEMBER_REMOVE',
  'GUILD_MEMBER_UPDATE',
  'GUILD_MEMBERS_CHUNK',
  'GUILD_INTEGRATIONS_UPDATE',
  'GUILD_ROLE_CREATE',
  'GUILD_ROLE_DELETE',
  'GUILD_ROLE_UPDATE',
  'GUILD_BAN_ADD',
  'GUILD_BAN_REMOVE',
  'GUILD_EMOJIS_UPDATE',
  'CHANNEL_CREATE',
  'CHANNEL_DELETE',
  'CHANNEL_UPDATE',
  'CHANNEL_PINS_UPDATE',
  'MESSAGE_CREATE',
  'MESSAGE_DELETE',
  'MESSAGE_UPDATE',
  'MESSAGE_DELETE_BULK',
  'MESSAGE_REACTION_ADD',
  'MESSAGE_REACTION_REMOVE',
  'MESSAGE_REACTION_REMOVE_ALL',
  'MESSAGE_REACTION_REMOVE_EMOJI',
  'THREAD_CREATE',
  'THREAD_UPDATE',
  'THREAD_DELETE',
  'THREAD_LIST_SYNC',
  'THREAD_MEMBER_UPDATE',
  'THREAD_MEMBERS_UPDATE',
  'USER_UPDATE',
  'PRESENCE_UPDATE',
  'TYPING_START',
  'VOICE_STATE_UPDATE',
  'VOICE_SERVER_UPDATE',
  'WEBHOOKS_UPDATE',
  'STAGE_INSTANCE_CREATE',
  'STAGE_INSTANCE_UPDATE',
  'STAGE_INSTANCE_DELETE',
  'GUILD_STICKERS_UPDATE',
  'GUILD_SCHEDULED_EVENT_CREATE',
  'GUILD_SCHEDULED_EVENT_UPDATE',
  'GUILD_SCHEDULED_EVENT_DELETE',
  'GUILD_SCHEDULED_EVENT_USER_ADD',
  'GUILD_SCHEDULED_EVENT_USER_REMOVE',
  'GUILD_AUDIT_LOG_ENTRY_CREATE',
]);

Constants.InviteScopes = [
  'applications.builds.read',
  'applications.commands',
  'applications.entitlements',
  'applications.store.update',
  'bot',
  'connections',
  'email',
  'identify',
  'guilds',
  'guilds.join',
  'gdm.join',
  'webhook.incoming',
  'role_connections.write',
];

// Integration#expireBehavior still uses the old strings. Align it with this enum later.
Constants.IntegrationExpireBehaviors = createEnum(['REMOVE_ROLE', 'KICK']);

Constants.MessageTypes = [
  // 0
  'DEFAULT',
  'RECIPIENT_ADD',
  'RECIPIENT_REMOVE',
  'CALL',
  'CHANNEL_NAME_CHANGE',
  'CHANNEL_ICON_CHANGE',
  'CHANNEL_PINNED_MESSAGE',
  'GUILD_MEMBER_JOIN',
  'USER_PREMIUM_GUILD_SUBSCRIPTION',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3',
  'CHANNEL_FOLLOW_ADD',
  // 13
  null,
  'GUILD_DISCOVERY_DISQUALIFIED',
  'GUILD_DISCOVERY_REQUALIFIED',
  'GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING',
  'GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING',
  'THREAD_CREATED',
  'REPLY',
  'APPLICATION_COMMAND',
  'THREAD_STARTER_MESSAGE',
  'GUILD_INVITE_REMINDER',
  'CONTEXT_MENU_COMMAND',
  'AUTO_MODERATION_ACTION',
  'ROLE_SUBSCRIPTION_PURCHASE',
  'INTERACTION_PREMIUM_UPSELL',
  'STAGE_START',
  'STAGE_END',
  'STAGE_SPEAKER',
  'STAGE_RAISE_HAND',
  'STAGE_TOPIC',
  'GUILD_APPLICATION_PREMIUM_SUBSCRIPTION',
  // 33 and 34 are unused
  null,
  null,
  'PREMIUM_REFERRAL',
  'GUILD_INCIDENT_ALERT_MODE_ENABLED',
  'GUILD_INCIDENT_ALERT_MODE_DISABLED',
  'GUILD_INCIDENT_REPORT_RAID',
  'GUILD_INCIDENT_REPORT_FALSE_ALARM',
  'GUILD_DEADCHAT_REVIVE_PROMPT',
  'CUSTOM_GIFT',
  'GUILD_GAMING_STATS_PROMPT',
  null,
  'PURCHASE_NOTIFICATION',
  null,
  'POLL_RESULT',
  'CHANGELOG',
  'NITRO_NOTIFICATION',
];

Constants.MessageReferenceTypes = createEnum<
  'DEFAULT' | 'FORWARD',
  MessageReferenceTypes
>([
  // 0
  'DEFAULT',
  'FORWARD',
]);

Constants.SweeperKeys = [
  'applicationCommands',
  'autoModerationRules',
  'bans',
  'emojis',
  'invites',
  'guildMembers',
  'messages',
  'presences',
  'reactions',
  'stageInstances',
  'stickers',
  'threadMembers',
  'threads',
  'users',
  'voiceStates',
];

Constants.SystemMessageTypes = Constants.MessageTypes.filter(
  (type): type is MessageType =>
    type !== null &&
    ![
      'DEFAULT',
      'REPLY',
      'APPLICATION_COMMAND',
      'CONTEXT_MENU_COMMAND',
    ].includes(type)
);

Constants.ActivityTypes = createEnum([
  'PLAYING',
  'STREAMING',
  'LISTENING',
  'WATCHING',
  'CUSTOM',
  'COMPETING',
  'HANG',
]);

Constants.ChannelTypes = createEnum<ChannelTypeName>([
  'GUILD_TEXT',
  'DM',
  'GUILD_VOICE',
  'GROUP_DM',
  'GUILD_CATEGORY',
  'GUILD_NEWS',
  'GUILD_STORE',
  ...Array.from({ length: 3 }, () => null),
  // 10
  'GUILD_NEWS_THREAD',
  'GUILD_PUBLIC_THREAD',
  'GUILD_PRIVATE_THREAD',
  'GUILD_STAGE_VOICE',
  'GUILD_DIRECTORY',
  'GUILD_FORUM',
  'GUILD_MEDIA',
]);

Constants.TextBasedChannelTypes = [
  'DM',
  'GUILD_TEXT',
  'GUILD_NEWS',
  'GUILD_NEWS_THREAD',
  'GUILD_PUBLIC_THREAD',
  'GUILD_PRIVATE_THREAD',
  'GUILD_VOICE',
  'GUILD_STAGE_VOICE',
];

Constants.ThreadChannelTypes = [
  'GUILD_NEWS_THREAD',
  'GUILD_PUBLIC_THREAD',
  'GUILD_PRIVATE_THREAD',
];

Constants.VoiceBasedChannelTypes = ['GUILD_VOICE', 'GUILD_STAGE_VOICE'];

Constants.ClientApplicationAssetTypes = {
  BIG: 2,
  SMALL: 1,
};

Constants.Colors = {
  AQUA: 0x1a_bc_9c,
  BLUE: 0x34_98_db,
  BLURPLE: 0x58_65_f2,
  DARKER_GREY: 0x7f_8c_8d,
  DARK_AQUA: 0x11_80_6a,
  DARK_BLUE: 0x20_66_94,
  DARK_BUT_NOT_BLACK: 0x2c_2f_33,
  DARK_GOLD: 0xc2_7c_0e,
  DARK_GREEN: 0x1f_8b_4c,
  DARK_GREY: 0x97_9c_9f,
  DARK_NAVY: 0x2c_3e_50,
  DARK_ORANGE: 0xa8_43_00,
  DARK_PURPLE: 0x71_36_8a,
  DARK_RED: 0x99_2d_22,
  DARK_VIVID_PINK: 0xad_14_57,
  DEFAULT: 0x00_00_00,
  FUCHSIA: 0xeb_45_9e,
  GOLD: 0xf1_c4_0f,
  GREEN: 0x57_f2_87,
  GREY: 0x95_a5_a6,
  GREYPLE: 0x99_aa_b5,
  LIGHT_GREY: 0xbc_c0_c0,
  LUMINOUS_VIVID_PINK: 0xe9_1e_63,
  NAVY: 0x34_49_5e,
  NOT_QUITE_BLACK: 0x23_27_2a,
  ORANGE: 0xe6_7e_22,
  PURPLE: 0x9b_59_b6,
  RED: 0xed_42_45,
  WHITE: 0xff_ff_ff,
  YELLOW: 0xfe_e7_5c,
};

Constants.HolographicStyles = {
  PRIMARY: 11_127_295,
  SECONDARY: 16_759_788,
  TERTIARY: 16_761_760,
};

Constants.ExplicitContentFilterLevels = createEnum([
  'DISABLED',
  'MEMBERS_WITHOUT_ROLES',
  'ALL_MEMBERS',
]);

Constants.VerificationLevels = createEnum([
  'NONE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'VERY_HIGH',
]);

Constants.APIErrors = {
  ACCOUNT_OWNER_ONLY: 20_018,
  ACCOUNT_VERIFICATION_REQUIRED: 40_002,
  ALREADY_CROSSPOSTED: 40_033,
  ANNOUNCEMENT_EDIT_LIMIT_EXCEEDED: 20_022,
  BOT_ONLY_ENDPOINT: 20_002,
  BOT_PROHIBITED_ENDPOINT: 20_001,
  BULK_DELETE_MESSAGE_TOO_OLD: 50_034,
  CANNOT_CONVERT_PREMIUM_EMOJI_TO_NORMAL_EMOJI: 50_145,
  CANNOT_DELETE_COMMUNITY_REQUIRED_CHANNEL: 50_074,
  CANNOT_EDIT_MESSAGE_BY_OTHER: 50_005,
  CANNOT_EXECUTE_ON_CHANNEL_TYPE: 50_024,
  CANNOT_EXECUTE_ON_DM: 50_003,
  CANNOT_EXECUTE_ON_SYSTEM_MESSAGE: 50_021,
  CANNOT_MESSAGE_USER: 50_007,
  CANNOT_MIX_SUBSCRIPTION_AND_NON_SUBSCRIPTION_ROLES_FOR_EMOJI: 50_144,
  CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL: 50_019,
  CANNOT_REPLY_WITHOUT_READ_MESSAGE_HISTORY_PERMISSION: 160_002,
  CANNOT_SELF_REDEEM_GIFT: 50_054,
  CANNOT_SEND_EMPTY_MESSAGE: 50_006,
  CANNOT_SEND_EXPLICIT_CONTENT: 20_009,
  CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL: 50_008,
  CANNOT_UPDATE_A_FINISHED_EVENT: 180_000,
  CHANNEL_HIT_WRITE_RATELIMIT: 20_028,
  CHANNEL_VERIFICATION_LEVEL_TOO_HIGH: 50_009,
  CONTENT_NOT_ALLOWED: 20_031,
  DIRECT_MESSAGES_TOO_FAST: 40_003,
  EMBED_DISABLED: 50_004,
  FAILED_TO_CREATE_STAGE_NEEDED_FOR_STAGE_EVENT: 180_002,
  FEATURE_TEMPORARILY_DISABLED: 40_006,
  FILE_UPLOADED_EXCEEDS_MAXIMUM_SIZE: 50_045,
  GUILD_ALREADY_HAS_TEMPLATE: 30_031,
  GUILD_MONETIZATION_REQUIRED: 50_097,
  GUILD_NOT_AVAILABLE_IN_LOCATION: 50_095,
  GUILD_PREMIUM_LEVEL_TOO_LOW: 20_035,
  INSUFFICIENT_BOOSTS: 50_101,
  INVALID_ACCOUNT_TYPE: 50_002,
  INVALID_API_VERSION: 50_041,
  INVALID_AUTHENTICATION_TOKEN: 50_014,
  INVALID_BULK_DELETE_QUANTITY: 50_016,
  INVALID_FILE_UPLOADED: 50_046,
  INVALID_FORM_BODY: 50_035,
  INVALID_GUILD: 50_055,
  INVALID_JSON: 50_109,
  INVALID_JSON_FOR_UPLOADED_LOTTIE_FILE: 170_001,
  INVALID_MESSAGE_TYPE: 50_068,
  INVALID_OAUTH_STATE: 50_012,
  INVALID_OAUTH_TOKEN: 50_025,
  INVALID_OPERATION_ON_ARCHIVED_THREAD: 50_083,
  INVALID_OR_TAKEN_INVITE_CODE: 50_020,
  INVALID_RECIPIENTS: 50_033,
  INVALID_ROLE: 50_028,
  INVALID_STICKER_SENT: 50_081,
  INVALID_THREAD_NOTIFICATION_SETTINGS: 50_084,
  INVALID_WEBHOOK_TOKEN: 50_027,
  INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT: 50_036,
  LOTTIE_ANIMATION_MAXIMUM_DIMENSIONS_EXCEEDED: 170_005,
  MAXIMUM_ACTIVE_ANNOUNCEMENT_THREADS: 160_007,
  MAXIMUM_ACTIVE_THREADS: 160_006,
  MAXIMUM_ANIMATED_EMOJIS: 30_018,
  MAXIMUM_ATTACHMENTS: 30_015,
  MAXIMUM_BAN_FETCHES: 30_037,
  MAXIMUM_CHANNELS: 30_013,
  MAXIMUM_EMOJIS: 30_008,
  MAXIMUM_FRIENDS: 30_002,
  MAXIMUM_GUILDS: 30_001,
  MAXIMUM_GUILD_WIDGET_SETTINGS_UPDATE: 30_042,
  MAXIMUM_INVITES: 30_016,
  MAXIMUM_NON_GUILD_MEMBERS_BANS: 30_035,
  MAXIMUM_NUMBER_OF_PREMIUM_EMOJIS: 30_056,
  MAXIMUM_NUMBER_OF_SERVER_CATEGORIES: 30_030,
  MAXIMUM_NUMBER_OF_STICKERS_REACHED: 30_039,
  MAXIMUM_NUMBER_OF_UNCOMPLETED_GUILD_SCHEDULED_EVENTS_REACHED: 30_038,
  MAXIMUM_OAUTH2_APPLICATIONS: 50_011,
  MAXIMUM_PINS: 30_003,
  MAXIMUM_PRUNE_REQUESTS: 30_040,
  MAXIMUM_REACTIONS: 30_010,
  MAXIMUM_RECIPIENTS: 30_004,
  MAXIMUM_ROLES: 30_005,
  MAXIMUM_SERVER_MEMBERS: 30_019,
  MAXIMUM_THREAD_PARTICIPANTS: 30_033,
  MAXIMUM_WEBHOOKS: 30_007,
  MESSAGE_ALREADY_HAS_THREAD: 160_004,
  MISSING_ACCESS: 50_001,
  MISSING_OAUTH_SCOPE: 50_026,
  MISSING_PERMISSIONS: 50_013,
  NOTE_TOO_LONG: 50_015,
  NOT_AUTHORIZED: 20_012,
  NO_USERS_WITH_DISCORDTAG_EXIST: 80_004,
  OAUTH2_APPLICATION_BOT_ABSENT: 50_010,
  PARAMETER_EARLIER_THAN_CREATION: 50_085,
  PAYMENT_SOURCE_REQUIRED: 50_070,
  REACTION_BLOCKED: 90_001,
  REQUEST_ENTITY_TOO_LARGE: 40_005,
  RESOURCE_OVERLOADED: 130_000,
  SERVER_HIT_WRITE_RATELIMIT: 20_029,
  SLOWMODE_RATE_LIMIT: 20_016,
  STAGE_ALREADY_OPEN: 150_006,
  STICKER_ANIMATION_DURATION_EXCEEDS_MAXIMUM_OF_5_SECONDS: 170_007,
  STICKER_FRAME_COUNT_EXCEEDS_MAXIMUM_OF_1000_FRAMES: 170_004,
  STICKER_FRAME_RATE_IS_TOO_SMALL_OR_TOO_LARGE: 170_006,
  STICKER_MAXIMUM_FRAMERATE_EXCEEDED: 170_003,
  TARGET_USER_NOT_CONNECTED_TO_VOICE: 40_032,
  THREAD_LOCKED: 160_005,
  TWO_FACTOR_REQUIRED: 60_003,
  UNAUTHORIZED: 40_001,
  UNKNOWN_ACCOUNT: 10_001,
  UNKNOWN_APPLICATION: 10_002,
  UNKNOWN_APPLICATION_COMMAND: 10_063,
  UNKNOWN_APPLICATION_COMMAND_PERMISSIONS: 10_066,
  UNKNOWN_BAN: 10_026,
  UNKNOWN_BRANCH: 10_032,
  UNKNOWN_BUILD: 10_030,
  UNKNOWN_CHANNEL: 10_003,
  UNKNOWN_DISCOVERABLE_SERVER_CATEGORY: 10_059,
  UNKNOWN_EMOJI: 10_014,
  UNKNOWN_ENTITLEMENT: 10_029,
  UNKNOWN_GIFT_CODE: 10_038,
  UNKNOWN_GUILD: 10_004,
  UNKNOWN_GUILD_MEMBER_VERIFICATION_FORM: 10_068,
  UNKNOWN_GUILD_SCHEDULED_EVENT: 10_070,
  UNKNOWN_GUILD_SCHEDULED_EVENT_USER: 10_071,
  UNKNOWN_GUILD_TEMPLATE: 10_057,
  UNKNOWN_GUILD_WELCOME_SCREEN: 10_069,
  UNKNOWN_INTEGRATION: 10_005,
  UNKNOWN_INTERACTION: 10_062,
  UNKNOWN_INVITE: 10_006,
  UNKNOWN_LOBBY: 10_031,
  UNKNOWN_MEMBER: 10_007,
  UNKNOWN_MESSAGE: 10_008,
  UNKNOWN_OVERWRITE: 10_009,
  UNKNOWN_PREMIUM_SERVER_SUBSCRIBE_COOLDOWN: 10_050,
  UNKNOWN_PROVIDER: 10_010,
  UNKNOWN_REDISTRIBUTABLE: 10_036,
  UNKNOWN_ROLE: 10_011,
  UNKNOWN_SESSION: 10_020,
  UNKNOWN_SKU: 10_027,
  UNKNOWN_STAGE_INSTANCE: 10_067,
  UNKNOWN_STICKER: 10_060,
  UNKNOWN_STORE_DIRECTORY_LAYOUT: 10_033,
  UNKNOWN_STORE_LISTING: 10_028,
  UNKNOWN_STREAM: 10_049,
  UNKNOWN_TOKEN: 10_012,
  UNKNOWN_USER: 10_013,
  UNKNOWN_WEBHOOK: 10_015,
  UNKNOWN_WEBHOOK_SERVICE: 10_016,
  UPLOADED_LOTTIES_CANNOT_CONTAIN_RASTERIZED_IMAGES: 170_002,
  USER_BANNED: 40_007,
  VOICE_MESSAGES_CANNOT_BE_EDITED: 50_162,
  VOICE_MESSAGES_DO_NOT_SUPPORT_ADDITIONAL_CONTENT: 50_159,
  VOICE_MESSAGES_MUST_HAVE_A_SINGLE_AUDIO_ATTACHMENT: 50_160,
  VOICE_MESSAGES_MUST_HAVE_SUPPORTING_METADATA: 50_161,
  YOU_CANNOT_SEND_VOICE_MESSAGES_IN_THIS_CHANNEL: 50_173,
};

Constants.DefaultMessageNotificationLevels = createEnum([
  'ALL_MESSAGES',
  'ONLY_MENTIONS',
]);

Constants.MembershipStates = createEnum([null, 'INVITED', 'ACCEPTED']);

Constants.WebhookTypes = createEnum([
  null,
  'Incoming',
  'Channel Follower',
  'Application',
]);

Constants.StickerTypes = createEnum([null, 'STANDARD', 'GUILD']);

Constants.StickerFormatTypes = createEnum([
  null,
  'PNG',
  'APNG',
  'LOTTIE',
  'GIF',
]);

Constants.OverwriteTypes = createEnum(['role', 'member']);

Constants.ApplicationCommandTypes = createEnum([
  null,
  'CHAT_INPUT',
  'USER',
  'MESSAGE',
]);

Constants.ApplicationCommandOptionTypes = createEnum([
  null,
  'SUB_COMMAND',
  'SUB_COMMAND_GROUP',
  'STRING',
  'INTEGER',
  'BOOLEAN',
  'USER',
  'CHANNEL',
  'ROLE',
  'MENTIONABLE',
  'NUMBER',
  'ATTACHMENT',
]);

Constants.ApplicationCommandPermissionTypes = createEnum([
  null,
  'ROLE',
  'USER',
]);

Constants.ApplicationRoleConnectionMetadataTypes = createEnum<
  | 'INTEGER_LESS_THAN_OR_EQUAL'
  | 'INTEGER_GREATER_THAN_OR_EQUAL'
  | 'INTEGER_EQUAL'
  | 'INTEGER_NOT_EQUAL'
  | 'DATATIME_LESS_THAN_OR_EQUAL'
  | 'DATATIME_GREATER_THAN_OR_EQUAL'
  | 'BOOLEAN_EQUAL'
  | 'BOOLEAN_NOT_EQUAL',
  ApplicationRoleConnectionMetadataTypes
>([
  null,
  'INTEGER_LESS_THAN_OR_EQUAL',
  'INTEGER_GREATER_THAN_OR_EQUAL',
  'INTEGER_EQUAL',
  'INTEGER_NOT_EQUAL',
  'DATATIME_LESS_THAN_OR_EQUAL',
  'DATATIME_GREATER_THAN_OR_EQUAL',
  'BOOLEAN_EQUAL',
  'BOOLEAN_NOT_EQUAL',
]);

Constants.AutoModerationRuleTriggerTypes = createEnum([
  null,
  'KEYWORD',
  null,
  'SPAM',
  'KEYWORD_PRESET',
  'MENTION_SPAM',
]);

Constants.AutoModerationRuleKeywordPresetTypes = createEnum([
  null,
  'PROFANITY',
  'SEXUAL_CONTENT',
  'SLURS',
]);
Constants.AutoModerationActionTypes = createEnum([
  null,
  'BLOCK_MESSAGE',
  'SEND_ALERT_MESSAGE',
  'TIMEOUT',
]);

Constants.AutoModerationRuleEventTypes = createEnum([null, 'MESSAGE_SEND']);
Constants.InteractionTypes = createEnum([
  null,
  'PING',
  'APPLICATION_COMMAND',
  'MESSAGE_COMPONENT',
  'APPLICATION_COMMAND_AUTOCOMPLETE',
  'MODAL_SUBMIT',
]);

Constants.InteractionResponseTypes = createEnum([
  null,
  'PONG',
  null,
  null,
  'CHANNEL_MESSAGE_WITH_SOURCE',
  'DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE',
  'DEFERRED_MESSAGE_UPDATE',
  'UPDATE_MESSAGE',
  'APPLICATION_COMMAND_AUTOCOMPLETE_RESULT',
  'MODAL',
]);

Constants.MessageComponentTypes = createEnum([
  null,
  'ACTION_ROW',
  'BUTTON',
  'STRING_SELECT',
  'TEXT_INPUT',
  'USER_SELECT',
  'ROLE_SELECT',
  'MENTIONABLE_SELECT',
  'CHANNEL_SELECT',
  'SECTION',
  'TEXT_DISPLAY',
  'THUMBNAIL',
  'MEDIA_GALLERY',
  'FILE',
  'SEPARATOR',
  null,
  null,
  'CONTAINER',
]);

Constants.SelectMenuComponentTypes = createEnum([
  ...Array.from({ length: 3 }, () => null),
  'STRING_MENU',
  null,
  'USER_SELECT',
  'ROLE_SELECT',
  'MENTIONABLE_SELECT',
  'CHANNEL_SELECT',
]);

Constants.MessageButtonStyles = createEnum([
  null,
  'PRIMARY',
  'SECONDARY',
  'SUCCESS',
  'DANGER',
  'LINK',
]);

Constants.MFALevels = createEnum(['NONE', 'ELEVATED']);

Constants.NSFWLevels = createEnum([
  'DEFAULT',
  'EXPLICIT',
  'SAFE',
  'AGE_RESTRICTED',
]);

Constants.PrivacyLevels = createEnum([null, 'PUBLIC', 'GUILD_ONLY']);

Constants.TextInputStyles = createEnum([null, 'SHORT', 'PARAGRAPH']);

Constants.GuildScheduledEventPrivacyLevels = createEnum([
  null,
  null,
  'GUILD_ONLY',
]);

Constants.PremiumTiers = createEnum(['NONE', 'TIER_1', 'TIER_2', 'TIER_3']);

Constants.GuildScheduledEventStatuses = createEnum([
  null,
  'SCHEDULED',
  'ACTIVE',
  'COMPLETED',
  'CANCELED',
]);

Constants.GuildScheduledEventEntityTypes = createEnum([
  null,
  'STAGE_INSTANCE',
  'VOICE',
  'EXTERNAL',
]);

Constants.VideoQualityModes = createEnum([null, 'AUTO', 'FULL']);

Constants.ReactionTypes = createEnum(['NORMAL', 'BURST']);

Constants.SortOrderTypes = createEnum<
  'LATEST_ACTIVITY' | 'CREATION_DATE',
  SortOrderTypes
>([null, 'LATEST_ACTIVITY', 'CREATION_DATE']);

Constants.ForumLayoutTypes = createEnum<
  'NOT_SET' | 'LIST_VIEW' | 'GALLERY_VIEW',
  ForumLayoutTypes
>(['NOT_SET', 'LIST_VIEW', 'GALLERY_VIEW']);

Constants.PollLayoutTypes = createEnum<
  'DEFAULT' | 'IMAGE_ONLY_ANSWERS',
  PollLayoutTypes
>([null, 'DEFAULT', 'IMAGE_ONLY_ANSWERS']);

Constants.RelationshipTypes = createEnum([
  'NONE',
  'FRIEND',
  'BLOCKED',
  'PENDING_INCOMING',
  'PENDING_OUTGOING',
  'IMPLICIT',
]);

Constants.SeparatorSpacingSizes = createEnum([null, 'SMALL', 'LARGE']);

Constants._cleanupSymbol = Symbol('djsCleanup');

function isEnumKey<Key extends string>(
  enumObject: EnumOf<Key>,
  value: string
): value is Key {
  return !/^\d+$/u.test(value) && Object.hasOwn(enumObject, value);
}

function resolveEnumValue<Key extends string>(
  enumObject: EnumOf<Key>,
  value: string | number | null | undefined
): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && isEnumKey(enumObject, value)) {
    return enumObject[value];
  }
  return undefined;
}

function resolveEnumMember<Key extends string, Value extends number>(
  enumObject: EnumOf<Key, Value>,
  value: string | number | null | undefined
): Value | undefined {
  if (typeof value === 'number') {
    const name = enumObject[value];
    return name === undefined ? undefined : enumObject[name];
  }
  if (typeof value === 'string' && isEnumKey(enumObject, value)) {
    return enumObject[value];
  }
  return undefined;
}

type PartialTypeName =
  | 'USER'
  | 'CHANNEL'
  | 'GUILD_MEMBER'
  | 'MESSAGE'
  | 'REACTION'
  | 'GUILD_SCHEDULED_EVENT';

type WSEventName =
  | 'READY'
  | 'RESUMED'
  | 'APPLICATION_COMMAND_CREATE'
  | 'APPLICATION_COMMAND_DELETE'
  | 'APPLICATION_COMMAND_UPDATE'
  | 'APPLICATION_COMMAND_PERMISSIONS_UPDATE'
  | 'AUTO_MODERATION_ACTION_EXECUTION'
  | 'AUTO_MODERATION_RULE_CREATE'
  | 'AUTO_MODERATION_RULE_DELETE'
  | 'AUTO_MODERATION_RULE_UPDATE'
  | 'GUILD_CREATE'
  | 'GUILD_DELETE'
  | 'GUILD_UPDATE'
  | 'INVITE_CREATE'
  | 'INVITE_DELETE'
  | 'GUILD_MEMBER_ADD'
  | 'GUILD_MEMBER_REMOVE'
  | 'GUILD_MEMBER_UPDATE'
  | 'GUILD_MEMBERS_CHUNK'
  | 'GUILD_INTEGRATIONS_UPDATE'
  | 'GUILD_ROLE_CREATE'
  | 'GUILD_ROLE_DELETE'
  | 'GUILD_ROLE_UPDATE'
  | 'GUILD_BAN_ADD'
  | 'GUILD_BAN_REMOVE'
  | 'GUILD_EMOJIS_UPDATE'
  | 'CHANNEL_CREATE'
  | 'CHANNEL_DELETE'
  | 'CHANNEL_UPDATE'
  | 'CHANNEL_PINS_UPDATE'
  | 'MESSAGE_CREATE'
  | 'MESSAGE_DELETE'
  | 'MESSAGE_UPDATE'
  | 'MESSAGE_DELETE_BULK'
  | 'MESSAGE_REACTION_ADD'
  | 'MESSAGE_REACTION_REMOVE'
  | 'MESSAGE_REACTION_REMOVE_ALL'
  | 'MESSAGE_REACTION_REMOVE_EMOJI'
  | 'THREAD_CREATE'
  | 'THREAD_UPDATE'
  | 'THREAD_DELETE'
  | 'THREAD_LIST_SYNC'
  | 'THREAD_MEMBER_UPDATE'
  | 'THREAD_MEMBERS_UPDATE'
  | 'USER_UPDATE'
  | 'PRESENCE_UPDATE'
  | 'TYPING_START'
  | 'VOICE_STATE_UPDATE'
  | 'VOICE_SERVER_UPDATE'
  | 'WEBHOOKS_UPDATE'
  | 'STAGE_INSTANCE_CREATE'
  | 'STAGE_INSTANCE_UPDATE'
  | 'STAGE_INSTANCE_DELETE'
  | 'GUILD_STICKERS_UPDATE'
  | 'GUILD_SCHEDULED_EVENT_CREATE'
  | 'GUILD_SCHEDULED_EVENT_UPDATE'
  | 'GUILD_SCHEDULED_EVENT_DELETE'
  | 'GUILD_SCHEDULED_EVENT_USER_ADD'
  | 'GUILD_SCHEDULED_EVENT_USER_REMOVE'
  | 'GUILD_AUDIT_LOG_ENTRY_CREATE';

type ChannelTypeName =
  | 'GUILD_TEXT'
  | 'DM'
  | 'GUILD_VOICE'
  | 'GROUP_DM'
  | 'GUILD_CATEGORY'
  | 'GUILD_NEWS'
  | 'GUILD_STORE'
  | 'GUILD_NEWS_THREAD'
  | 'GUILD_PUBLIC_THREAD'
  | 'GUILD_PRIVATE_THREAD'
  | 'GUILD_STAGE_VOICE'
  | 'GUILD_DIRECTORY'
  | 'GUILD_FORUM'
  | 'GUILD_MEDIA';

type ActivityTypeName =
  | 'PLAYING'
  | 'STREAMING'
  | 'LISTENING'
  | 'WATCHING'
  | 'CUSTOM'
  | 'COMPETING'
  | 'HANG';

type ApplicationCommandOptionTypeName =
  | 'SUB_COMMAND'
  | 'SUB_COMMAND_GROUP'
  | 'STRING'
  | 'INTEGER'
  | 'BOOLEAN'
  | 'USER'
  | 'CHANNEL'
  | 'ROLE'
  | 'MENTIONABLE'
  | 'NUMBER'
  | 'ATTACHMENT';

type MessageComponentTypeName =
  | 'ACTION_ROW'
  | 'BUTTON'
  | 'STRING_SELECT'
  | 'TEXT_INPUT'
  | 'USER_SELECT'
  | 'ROLE_SELECT'
  | 'MENTIONABLE_SELECT'
  | 'CHANNEL_SELECT'
  | 'SECTION'
  | 'TEXT_DISPLAY'
  | 'THUMBNAIL'
  | 'MEDIA_GALLERY'
  | 'FILE'
  | 'SEPARATOR'
  | 'CONTAINER';

interface ConstantsShape {
  MaxBulkDeletableMessageAge: number;
  UserAgent: string;
  ciphers: string[];
  WSCodes: Record<number, string>;
  Endpoints: EndpointsShape;
  Status: Record<string, number>;
  VoiceStatus: Record<string, number>;
  Opcodes: Record<string, number>;
  VoiceOpcodes: Record<string, number>;
  Events: Record<string, string>;
  ShardEvents: Record<string, string>;
  PartialTypes: KeyMirrorOf<PartialTypeName>;
  WSEvents: KeyMirrorOf<WSEventName>;
  InviteScopes: string[];
  IntegrationExpireBehaviors: EnumOf<'REMOVE_ROLE' | 'KICK'>;
  MessageTypes: (MessageType | null)[];
  MessageReferenceTypes: EnumOf<'DEFAULT' | 'FORWARD', MessageReferenceTypes>;
  SweeperKeys: string[];
  SystemMessageTypes: MessageType[];
  ActivityTypes: EnumOf<ActivityTypeName>;
  ChannelTypes: EnumOf<ChannelTypeName>;
  TextBasedChannelTypes: string[];
  ThreadChannelTypes: string[];
  VoiceBasedChannelTypes: string[];
  ClientApplicationAssetTypes: { SMALL: number; BIG: number };
  Colors: Record<string, number>;
  HolographicStyles: { PRIMARY: number; SECONDARY: number; TERTIARY: number };
  ExplicitContentFilterLevels: EnumOf<
    'DISABLED' | 'MEMBERS_WITHOUT_ROLES' | 'ALL_MEMBERS'
  >;
  VerificationLevels: EnumOf<'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'>;
  APIErrors: Record<string, number>;
  DefaultMessageNotificationLevels: EnumOf<'ALL_MESSAGES' | 'ONLY_MENTIONS'>;
  MembershipStates: EnumOf<'INVITED' | 'ACCEPTED'>;
  WebhookTypes: EnumOf<'Incoming' | 'Channel Follower' | 'Application'>;
  StickerTypes: EnumOf<'STANDARD' | 'GUILD'>;
  StickerFormatTypes: EnumOf<'PNG' | 'APNG' | 'LOTTIE' | 'GIF'>;
  OverwriteTypes: EnumOf<'role' | 'member'>;
  ApplicationCommandTypes: EnumOf<'CHAT_INPUT' | 'USER' | 'MESSAGE'>;
  ApplicationCommandOptionTypes: EnumOf<ApplicationCommandOptionTypeName>;
  ApplicationCommandPermissionTypes: EnumOf<'ROLE' | 'USER'>;
  ApplicationRoleConnectionMetadataTypes: EnumOf<
    | 'INTEGER_LESS_THAN_OR_EQUAL'
    | 'INTEGER_GREATER_THAN_OR_EQUAL'
    | 'INTEGER_EQUAL'
    | 'INTEGER_NOT_EQUAL'
    | 'DATATIME_LESS_THAN_OR_EQUAL'
    | 'DATATIME_GREATER_THAN_OR_EQUAL'
    | 'BOOLEAN_EQUAL'
    | 'BOOLEAN_NOT_EQUAL',
    ApplicationRoleConnectionMetadataTypes
  >;
  AutoModerationRuleTriggerTypes: EnumOf<
    'KEYWORD' | 'SPAM' | 'KEYWORD_PRESET' | 'MENTION_SPAM'
  >;
  AutoModerationRuleKeywordPresetTypes: EnumOf<
    'PROFANITY' | 'SEXUAL_CONTENT' | 'SLURS'
  >;
  AutoModerationActionTypes: EnumOf<
    'BLOCK_MESSAGE' | 'SEND_ALERT_MESSAGE' | 'TIMEOUT'
  >;
  AutoModerationRuleEventTypes: EnumOf<'MESSAGE_SEND'>;
  InteractionTypes: EnumOf<
    | 'PING'
    | 'APPLICATION_COMMAND'
    | 'MESSAGE_COMPONENT'
    | 'APPLICATION_COMMAND_AUTOCOMPLETE'
    | 'MODAL_SUBMIT'
  >;
  InteractionResponseTypes: EnumOf<
    | 'PONG'
    | 'CHANNEL_MESSAGE_WITH_SOURCE'
    | 'DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE'
    | 'DEFERRED_MESSAGE_UPDATE'
    | 'UPDATE_MESSAGE'
    | 'APPLICATION_COMMAND_AUTOCOMPLETE_RESULT'
    | 'MODAL'
  >;
  MessageComponentTypes: EnumOf<MessageComponentTypeName>;
  SelectMenuComponentTypes: EnumOf<
    | 'STRING_MENU'
    | 'USER_SELECT'
    | 'ROLE_SELECT'
    | 'MENTIONABLE_SELECT'
    | 'CHANNEL_SELECT'
  >;
  MessageButtonStyles: EnumOf<
    'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER' | 'LINK'
  >;
  MFALevels: EnumOf<'NONE' | 'ELEVATED'>;
  NSFWLevels: EnumOf<'DEFAULT' | 'EXPLICIT' | 'SAFE' | 'AGE_RESTRICTED'>;
  PrivacyLevels: EnumOf<'PUBLIC' | 'GUILD_ONLY'>;
  TextInputStyles: EnumOf<'SHORT' | 'PARAGRAPH'>;
  GuildScheduledEventPrivacyLevels: EnumOf<'GUILD_ONLY'>;
  PremiumTiers: EnumOf<'NONE' | 'TIER_1' | 'TIER_2' | 'TIER_3'>;
  GuildScheduledEventStatuses: EnumOf<
    'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED'
  >;
  GuildScheduledEventEntityTypes: EnumOf<
    'STAGE_INSTANCE' | 'VOICE' | 'EXTERNAL'
  >;
  VideoQualityModes: EnumOf<'AUTO' | 'FULL'>;
  ReactionTypes: EnumOf<'NORMAL' | 'BURST'>;
  SortOrderTypes: EnumOf<'LATEST_ACTIVITY' | 'CREATION_DATE', SortOrderTypes>;
  ForumLayoutTypes: EnumOf<
    'NOT_SET' | 'LIST_VIEW' | 'GALLERY_VIEW',
    ForumLayoutTypes
  >;
  PollLayoutTypes: EnumOf<'DEFAULT' | 'IMAGE_ONLY_ANSWERS', PollLayoutTypes>;
  RelationshipTypes: EnumOf<
    | 'NONE'
    | 'FRIEND'
    | 'BLOCKED'
    | 'PENDING_INCOMING'
    | 'PENDING_OUTGOING'
    | 'IMPLICIT'
  >;
  SeparatorSpacingSizes: EnumOf<'SMALL' | 'LARGE'>;
  _cleanupSymbol: symbol;
}

export default Constants;
export { Constants, resolveEnumValue, resolveEnumMember };
