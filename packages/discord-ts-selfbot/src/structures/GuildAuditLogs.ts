import { Collection } from '@discordjs/collection';
import ApplicationCommand from './ApplicationCommand';
import AutoModerationRule from './AutoModerationRule';
import _GuildScheduledEventModule from './GuildScheduledEvent';
const { GuildScheduledEvent } = _GuildScheduledEventModule;
import Integration from './Integration';
import Invite from './Invite';
import _StageInstanceModule from './StageInstance';
const { StageInstance } = _StageInstanceModule;
import _StickerModule from './Sticker';
const { Sticker } = _StickerModule;
import Webhook from './Webhook';
import _ConstantsModule from '../util/Constants';
const { OverwriteTypes, PartialTypes, AutoModerationRuleTriggerTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import Util from '../util/Util';
import type { APIAuditLogOptions, APIAutoModerationRule, Snowflake } from 'discord-api-types/v10';
import type {
  GuildAuditLogsActionType,
  GuildAuditLogsIds,
  GuildAuditLogsResolvable,
  GuildAuditLogsTarget,
} from '../../typings';
import type { RawGuildAuditLogData, RawGuildAuditLogEntryData } from '../../typings/rawDataTypes';
import type { Guild } from './Guild';
import type { User } from './User';

const Targets = {
  ALL: 'ALL',
  GUILD: 'GUILD',
  GUILD_SCHEDULED_EVENT: 'GUILD_SCHEDULED_EVENT',
  CHANNEL: 'CHANNEL',
  USER: 'USER',
  ROLE: 'ROLE',
  INVITE: 'INVITE',
  WEBHOOK: 'WEBHOOK',
  EMOJI: 'EMOJI',
  MESSAGE: 'MESSAGE',
  INTEGRATION: 'INTEGRATION',
  STAGE_INSTANCE: 'STAGE_INSTANCE',
  STICKER: 'STICKER',
  THREAD: 'THREAD',
  APPLICATION_COMMAND: 'APPLICATION_COMMAND',
  AUTO_MODERATION: 'AUTO_MODERATION',
  SOUNDBOARD_SOUND: 'SOUNDBOARD_SOUND',
  GUILD_ONBOARDING_PROMPT: 'GUILD_ONBOARDING_PROMPT',
  GUILD_ONBOARDING: 'GUILD_ONBOARDING',
  UNKNOWN: 'UNKNOWN',
} as const;

const Actions: Record<string, number | null> = {
  ALL: null,
  GUILD_UPDATE: 1,
  CHANNEL_CREATE: 10,
  CHANNEL_UPDATE: 11,
  CHANNEL_DELETE: 12,
  CHANNEL_OVERWRITE_CREATE: 13,
  CHANNEL_OVERWRITE_UPDATE: 14,
  CHANNEL_OVERWRITE_DELETE: 15,
  MEMBER_KICK: 20,
  MEMBER_PRUNE: 21,
  MEMBER_BAN_ADD: 22,
  MEMBER_BAN_REMOVE: 23,
  MEMBER_UPDATE: 24,
  MEMBER_ROLE_UPDATE: 25,
  MEMBER_MOVE: 26,
  MEMBER_DISCONNECT: 27,
  BOT_ADD: 28,
  ROLE_CREATE: 30,
  ROLE_UPDATE: 31,
  ROLE_DELETE: 32,
  INVITE_CREATE: 40,
  INVITE_UPDATE: 41,
  INVITE_DELETE: 42,
  WEBHOOK_CREATE: 50,
  WEBHOOK_UPDATE: 51,
  WEBHOOK_DELETE: 52,
  EMOJI_CREATE: 60,
  EMOJI_UPDATE: 61,
  EMOJI_DELETE: 62,
  MESSAGE_DELETE: 72,
  MESSAGE_BULK_DELETE: 73,
  MESSAGE_PIN: 74,
  MESSAGE_UNPIN: 75,
  INTEGRATION_CREATE: 80,
  INTEGRATION_UPDATE: 81,
  INTEGRATION_DELETE: 82,
  STAGE_INSTANCE_CREATE: 83,
  STAGE_INSTANCE_UPDATE: 84,
  STAGE_INSTANCE_DELETE: 85,
  STICKER_CREATE: 90,
  STICKER_UPDATE: 91,
  STICKER_DELETE: 92,
  GUILD_SCHEDULED_EVENT_CREATE: 100,
  GUILD_SCHEDULED_EVENT_UPDATE: 101,
  GUILD_SCHEDULED_EVENT_DELETE: 102,
  THREAD_CREATE: 110,
  THREAD_UPDATE: 111,
  THREAD_DELETE: 112,
  APPLICATION_COMMAND_PERMISSION_UPDATE: 121,
  AUTO_MODERATION_RULE_CREATE: 140,
  AUTO_MODERATION_RULE_UPDATE: 141,
  AUTO_MODERATION_RULE_DELETE: 142,
  AUTO_MODERATION_BLOCK_MESSAGE: 143,
  AUTO_MODERATION_FLAG_TO_CHANNEL: 144,
  AUTO_MODERATION_USER_COMMUNICATION_DISABLED: 145,
};

interface AuditLogsCache {
  webhooks: Collection<Snowflake, Webhook>;
  integrations: Collection<Snowflake, Integration>;
  applicationCommands: Collection<Snowflake, ApplicationCommand>;
}

interface AuditLogChangeEntry {
  key: string;
  old?: unknown;
  new?: unknown;
}

type AuditLogTarget =
  GuildAuditLogsTarget | 'APPLICATION_COMMAND' | 'SOUNDBOARD_SOUND' | 'GUILD_ONBOARDING_PROMPT' | 'GUILD_ONBOARDING';

class GuildAuditLogs<T extends GuildAuditLogsResolvable = 'ALL'> {
  declare webhooks: Collection<Snowflake, Webhook>;
  declare integrations: Collection<Snowflake, Integration>;
  declare applicationCommands: Collection<Snowflake, ApplicationCommand>;
  declare autoModerationRules: Collection<Snowflake, AutoModerationRule>;
  declare entries: Collection<Snowflake, GuildAuditLogsEntry<T>>;

  constructor(guild: Guild, data: RawGuildAuditLogData) {
    if (data.users) for (const user of data.users) guild.client.users._add(user);
    if (data.threads) for (const thread of data.threads) guild.client.channels._add(thread, guild);
    this.webhooks = new Collection();
    if (data.webhooks) {
      for (const hook of data.webhooks) {
        this.webhooks.set(hook.id, new Webhook(guild.client, hook));
      }
    }

    this.integrations = new Collection();
    if (data.integrations) {
      for (const integration of data.integrations) {
        this.integrations.set(integration.id, new Integration(guild.client, integration, guild));
      }
    }

    this.applicationCommands = new Collection();
    if (data.application_commands) {
      for (const command of data.application_commands) {
        this.applicationCommands.set(command.id, new ApplicationCommand(guild.client, command, guild, null));
      }
    }
    this.autoModerationRules = data.auto_moderation_rules.reduce(
      (autoModerationRules, autoModerationRule) =>
        autoModerationRules.set(autoModerationRule.id, guild.autoModerationRules._add(autoModerationRule)),
      new Collection<Snowflake, AutoModerationRule>(),
    );

    this.entries = new Collection();
    for (const item of data.audit_log_entries) {
      const entry = new GuildAuditLogsEntry<T>(guild, item, this);
      this.entries.set(entry.id, entry);
    }
  }

  static Actions: typeof Actions;
  static Targets: typeof Targets;
  static Entry: typeof GuildAuditLogsEntry;

  static async build<T extends GuildAuditLogsResolvable = 'ALL'>(guild: Guild, data: RawGuildAuditLogData) {
    const logs = new GuildAuditLogs<T>(guild, data);
    await Promise.all(logs.entries.map(e => e.target));
    return logs;
  }

  static targetType(target: number): AuditLogTarget {
    if (target < 10) return Targets.GUILD;
    if (target < 20) return Targets.CHANNEL;
    if (target < 30) return Targets.USER;
    if (target < 40) return Targets.ROLE;
    if (target < 50) return Targets.INVITE;
    if (target < 60) return Targets.WEBHOOK;
    if (target < 70) return Targets.EMOJI;
    if (target < 80) return Targets.MESSAGE;
    if (target < 83) return Targets.INTEGRATION;
    if (target < 86) return Targets.STAGE_INSTANCE;
    if (target < 100) return Targets.STICKER;
    if (target < 110) return Targets.GUILD_SCHEDULED_EVENT;
    if (target < 120) return Targets.THREAD;
    if (target < 130) return Targets.APPLICATION_COMMAND;
    if (target < 140) return Targets.SOUNDBOARD_SOUND; // !Todo
    if (target < 143) return Targets.AUTO_MODERATION;
    if (target < 146) return Targets.USER;
    if (target >= 163 && target <= 165) return Targets.GUILD_ONBOARDING_PROMPT; // !Todo
    if (target >= 160 && target < 170) return Targets.GUILD_ONBOARDING; // !Todo
    return Targets.UNKNOWN;
  }

  static actionType(action: number): GuildAuditLogsActionType {
    if (
      [
        Actions.CHANNEL_CREATE,
        Actions.CHANNEL_OVERWRITE_CREATE,
        Actions.MEMBER_BAN_REMOVE,
        Actions.BOT_ADD,
        Actions.ROLE_CREATE,
        Actions.INVITE_CREATE,
        Actions.WEBHOOK_CREATE,
        Actions.EMOJI_CREATE,
        Actions.MESSAGE_PIN,
        Actions.INTEGRATION_CREATE,
        Actions.STAGE_INSTANCE_CREATE,
        Actions.STICKER_CREATE,
        Actions.GUILD_SCHEDULED_EVENT_CREATE,
        Actions.THREAD_CREATE,
        Actions.AUTO_MODERATION_RULE_CREATE,
        Actions.AUTO_MODERATION_BLOCK_MESSAGE,
      ].includes(action)
    ) {
      return 'CREATE';
    }

    if (
      [
        Actions.CHANNEL_DELETE,
        Actions.CHANNEL_OVERWRITE_DELETE,
        Actions.MEMBER_KICK,
        Actions.MEMBER_PRUNE,
        Actions.MEMBER_BAN_ADD,
        Actions.MEMBER_DISCONNECT,
        Actions.ROLE_DELETE,
        Actions.INVITE_DELETE,
        Actions.WEBHOOK_DELETE,
        Actions.EMOJI_DELETE,
        Actions.MESSAGE_DELETE,
        Actions.MESSAGE_BULK_DELETE,
        Actions.MESSAGE_UNPIN,
        Actions.INTEGRATION_DELETE,
        Actions.STAGE_INSTANCE_DELETE,
        Actions.STICKER_DELETE,
        Actions.GUILD_SCHEDULED_EVENT_DELETE,
        Actions.THREAD_DELETE,
        Actions.AUTO_MODERATION_RULE_DELETE,
      ].includes(action)
    ) {
      return 'DELETE';
    }

    if (
      [
        Actions.GUILD_UPDATE,
        Actions.CHANNEL_UPDATE,
        Actions.CHANNEL_OVERWRITE_UPDATE,
        Actions.MEMBER_UPDATE,
        Actions.MEMBER_ROLE_UPDATE,
        Actions.MEMBER_MOVE,
        Actions.ROLE_UPDATE,
        Actions.INVITE_UPDATE,
        Actions.WEBHOOK_UPDATE,
        Actions.EMOJI_UPDATE,
        Actions.INTEGRATION_UPDATE,
        Actions.STAGE_INSTANCE_UPDATE,
        Actions.STICKER_UPDATE,
        Actions.GUILD_SCHEDULED_EVENT_UPDATE,
        Actions.THREAD_UPDATE,
        Actions.APPLICATION_COMMAND_PERMISSION_UPDATE,
        Actions.AUTO_MODERATION_RULE_UPDATE,
      ].includes(action)
    ) {
      return 'UPDATE';
    }

    return 'ALL';
  }

  toJSON() {
    return Util.flatten(this);
  }
}

class GuildAuditLogsEntry<
  TActionRaw extends GuildAuditLogsResolvable = 'ALL',
  TAction = TActionRaw extends keyof GuildAuditLogsIds
    ? GuildAuditLogsIds[TActionRaw]
    : TActionRaw extends null
      ? 'ALL'
      : TActionRaw,
  TActionType extends GuildAuditLogsActionType = GuildAuditLogsActionType,
  TTargetType extends GuildAuditLogsTarget = GuildAuditLogsTarget,
> {
  declare targetType: TTargetType;
  declare actionType: TActionType;
  declare action: TAction;
  declare reason: string | null;
  declare executorId: Snowflake | null;
  declare executor: User | null;
  declare changes: AuditLogChangeEntry[];
  declare id: Snowflake;
  declare extra: unknown;
  declare targetId: Snowflake | null;
  declare target: unknown;

  constructor(guild: Guild, data: RawGuildAuditLogEntryData, logs?: AuditLogsCache) {
    const targetType = GuildAuditLogs.targetType(data.action_type);
    this.targetType = targetType as TTargetType;

    this.actionType = GuildAuditLogs.actionType(data.action_type) as TActionType;

    this.action = Object.entries(Actions).find(([, value]) => value === data.action_type)?.[0] as TAction;

    this.reason = data.reason ?? null;

    this.executorId = data.user_id;

    this.executor = data.user_id
      ? guild.client.options.partials.includes(PartialTypes.USER)
        ? guild.client.users._add({ id: data.user_id })
        : (guild.client.users.cache.get(data.user_id) ?? null)
      : null;

    this.changes =
      data.changes?.map(change => ({
        key: change.key,
        ...('old_value' in change ? { old: change.old_value } : {}),
        ...('new_value' in change ? { new: change.new_value } : {}),
      })) ?? [];

    this.id = data.id;

    const options: APIAuditLogOptions = data.options ?? {};

    this.extra = null;
    switch (data.action_type) {
      case Actions.MEMBER_PRUNE:
        this.extra = {
          removed: Number(options.members_removed),
          days: Number(options.delete_member_days),
        };
        break;

      case Actions.MEMBER_MOVE:
      case Actions.MESSAGE_DELETE:
        this.extra = {
          channel: guild.channels.cache.get(options.channel_id!) ?? { id: options.channel_id },
          count: Number(options.count),
        };
        break;
      case Actions.MESSAGE_PIN:
      case Actions.MESSAGE_UNPIN:
        this.extra = {
          channel: guild.client.channels.cache.get(options.channel_id!) ?? { id: options.channel_id },
          messageId: options.message_id,
        };
        break;

      case Actions.MESSAGE_BULK_DELETE:
      case Actions.MEMBER_DISCONNECT:
        this.extra = {
          count: Number(options.count),
        };
        break;

      case Actions.CHANNEL_OVERWRITE_CREATE:
      case Actions.CHANNEL_OVERWRITE_UPDATE:
      case Actions.CHANNEL_OVERWRITE_DELETE:
        switch (Number(options.type)) {
          case OverwriteTypes.role:
            this.extra = guild.roles.cache.get(options.id!) ?? {
              id: options.id,
              name: options.role_name,
              type: OverwriteTypes[OverwriteTypes.role],
            };
            break;

          case OverwriteTypes.member:
            this.extra = guild.members.cache.get(options.id!) ?? {
              id: options.id,
              type: OverwriteTypes[OverwriteTypes.member],
            };
            break;

          default:
            break;
        }
        break;

      case Actions.STAGE_INSTANCE_CREATE:
      case Actions.STAGE_INSTANCE_DELETE:
      case Actions.STAGE_INSTANCE_UPDATE:
        this.extra = {
          channel: guild.client.channels.cache.get(options.channel_id!) ?? { id: options.channel_id },
        };
        break;
      case Actions.APPLICATION_COMMAND_PERMISSION_UPDATE:
        this.extra = {
          applicationId: options.application_id,
        };
        break;
      case Actions.AUTO_MODERATION_BLOCK_MESSAGE:
      case Actions.AUTO_MODERATION_FLAG_TO_CHANNEL:
      case Actions.AUTO_MODERATION_USER_COMMUNICATION_DISABLED:
        this.extra = {
          autoModerationRuleName: options.auto_moderation_rule_name,
          autoModerationRuleTriggerType: AutoModerationRuleTriggerTypes[options.auto_moderation_rule_trigger_type!],
          channel: guild.client.channels.cache.get(options.channel_id!) ?? { id: options.channel_id },
        };
        break;
      default:
        break;
    }

    this.targetId = data.target_id;

    this.target = null;
    if (targetType === Targets.UNKNOWN) {
      const target = this.changesObject({});
      target.id = data.target_id;
      this.target = target;
      // MEMBER_DISCONNECT and similar types do not provide a target_id.
    } else if (targetType === Targets.USER && data.target_id) {
      this.target = guild.client.options.partials.includes(PartialTypes.USER)
        ? guild.client.users._add({ id: data.target_id })
        : (guild.client.users.cache.get(data.target_id) ?? null);
    } else if (targetType === Targets.GUILD) {
      this.target = guild.client.guilds.cache.get(data.target_id!);
    } else if (targetType === Targets.WEBHOOK) {
      this.target =
        logs?.webhooks.get(data.target_id!) ??
        new Webhook(guild.client, this.changesObject({ id: data.target_id!, guild_id: guild.id }));
    } else if (targetType === Targets.INVITE) {
      const change = this.changes.find(c => c.key === 'code');
      const code = change?.new ?? change?.old;

      this.target =
        (typeof code === 'string' ? guild.invites.cache.get(code) : null) ??
        new Invite(
          guild.client,
          this.changesObject({ guild }) as unknown as import('../../typings/rawDataTypes').RawInviteData,
        );
    } else if (targetType === Targets.MESSAGE) {
      // Discord sends a channel id for the MESSAGE_BULK_DELETE action type.
      this.target =
        data.action_type === Actions.MESSAGE_BULK_DELETE
          ? (guild.channels.cache.get(data.target_id!) ?? { id: data.target_id })
          : (guild.client.users.cache.get(data.target_id!) ?? null);
    } else if (targetType === Targets.INTEGRATION) {
      this.target =
        logs?.integrations.get(data.target_id!) ??
        new Integration(
          guild.client,
          this.changesObject({
            id: data.target_id!,
          }) as unknown as import('../../typings/rawDataTypes').RawIntegrationData,
          guild,
        );
    } else if (targetType === Targets.CHANNEL || targetType === Targets.THREAD) {
      this.target = guild.channels.cache.get(data.target_id!) ?? this.changesObject({ id: data.target_id! });
    } else if (targetType === Targets.STAGE_INSTANCE) {
      this.target =
        guild.stageInstances.cache.get(data.target_id!) ??
        new StageInstance(
          guild.client,
          this.changesObject({
            id: data.target_id!,
            channel_id: options.channel_id!,
            guild_id: guild.id,
          }),
        );
    } else if (targetType === Targets.STICKER) {
      this.target =
        guild.stickers.cache.get(data.target_id!) ??
        new Sticker(guild.client, this.changesObject({ id: data.target_id! }));
    } else if (targetType === Targets.GUILD_SCHEDULED_EVENT) {
      this.target =
        guild.scheduledEvents.cache.get(data.target_id!) ??
        new GuildScheduledEvent(guild.client, this.changesObject({ id: data.target_id!, guild_id: guild.id }));
    } else if (targetType === Targets.APPLICATION_COMMAND) {
      this.target = logs?.applicationCommands.get(data.target_id!) ?? { id: data.target_id };
    } else if (targetType === Targets.AUTO_MODERATION) {
      this.target =
        guild.autoModerationRules.cache.get(data.target_id!) ??
        new AutoModerationRule(
          guild.client,
          this.changesObject({ id: data.target_id!, guild_id: guild.id }) as unknown as APIAutoModerationRule,
          guild,
        );
    } else if (targetType === Targets.ROLE) {
      this.target = guild.roles.cache.get(data.target_id!) ?? { id: data.target_id };
    } else if (targetType === Targets.EMOJI) {
      this.target = guild.emojis.cache.get(data.target_id!) ?? { id: data.target_id };
    } else if (data.target_id) {
      // Missing SoundboardSound & Onboarding
      this.target = { id: data.target_id };
    }
  }

  private changesObject<T extends Record<string, unknown>>(base: T): T & Record<string, unknown> {
    const object: Record<string, unknown> = { ...base };
    for (const change of this.changes) {
      object[change.key] = change.new ?? change.old;
    }
    return object as T & Record<string, unknown>;
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  toJSON() {
    return Util.flatten(this, { createdTimestamp: true });
  }
}

GuildAuditLogs.Actions = Actions;
GuildAuditLogs.Targets = Targets;
GuildAuditLogs.Entry = GuildAuditLogsEntry;

export default GuildAuditLogs;
export { GuildAuditLogs };
