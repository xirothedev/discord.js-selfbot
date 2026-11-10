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

const { OverwriteTypes, PartialTypes, AutoModerationRuleTriggerTypes } =
  _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import Util from '../util/Util';
import type {
  APIAuditLogOptions,
  APIAutoModerationRule,
  Snowflake,
} from 'discord-api-types/v10';
import type {
  GuildAuditLogsActionType,
  GuildAuditLogsIds,
  GuildAuditLogsResolvable,
  GuildAuditLogsTarget,
} from '../../typings';
import type {
  RawGuildAuditLogData,
  RawGuildAuditLogEntryData,
  RawIntegrationData,
  RawInviteData,
} from '../../typings/rawDataTypes';
import type { Guild } from './Guild';
import type { User } from './User';

const Targets = {
  ALL: 'ALL',
  APPLICATION_COMMAND: 'APPLICATION_COMMAND',
  AUTO_MODERATION: 'AUTO_MODERATION',
  CHANNEL: 'CHANNEL',
  EMOJI: 'EMOJI',
  GUILD: 'GUILD',
  GUILD_ONBOARDING: 'GUILD_ONBOARDING',
  GUILD_ONBOARDING_PROMPT: 'GUILD_ONBOARDING_PROMPT',
  GUILD_SCHEDULED_EVENT: 'GUILD_SCHEDULED_EVENT',
  INTEGRATION: 'INTEGRATION',
  INVITE: 'INVITE',
  MESSAGE: 'MESSAGE',
  ROLE: 'ROLE',
  SOUNDBOARD_SOUND: 'SOUNDBOARD_SOUND',
  STAGE_INSTANCE: 'STAGE_INSTANCE',
  STICKER: 'STICKER',
  THREAD: 'THREAD',
  UNKNOWN: 'UNKNOWN',
  USER: 'USER',
  WEBHOOK: 'WEBHOOK',
} as const;

const Actions: Record<string, number | null> = {
  ALL: null,
  APPLICATION_COMMAND_PERMISSION_UPDATE: 121,
  AUTO_MODERATION_BLOCK_MESSAGE: 143,
  AUTO_MODERATION_FLAG_TO_CHANNEL: 144,
  AUTO_MODERATION_RULE_CREATE: 140,
  AUTO_MODERATION_RULE_DELETE: 142,
  AUTO_MODERATION_RULE_UPDATE: 141,
  AUTO_MODERATION_USER_COMMUNICATION_DISABLED: 145,
  BOT_ADD: 28,
  CHANNEL_CREATE: 10,
  CHANNEL_DELETE: 12,
  CHANNEL_OVERWRITE_CREATE: 13,
  CHANNEL_OVERWRITE_DELETE: 15,
  CHANNEL_OVERWRITE_UPDATE: 14,
  CHANNEL_UPDATE: 11,
  EMOJI_CREATE: 60,
  EMOJI_DELETE: 62,
  EMOJI_UPDATE: 61,
  GUILD_SCHEDULED_EVENT_CREATE: 100,
  GUILD_SCHEDULED_EVENT_DELETE: 102,
  GUILD_SCHEDULED_EVENT_UPDATE: 101,
  GUILD_UPDATE: 1,
  INTEGRATION_CREATE: 80,
  INTEGRATION_DELETE: 82,
  INTEGRATION_UPDATE: 81,
  INVITE_CREATE: 40,
  INVITE_DELETE: 42,
  INVITE_UPDATE: 41,
  MEMBER_BAN_ADD: 22,
  MEMBER_BAN_REMOVE: 23,
  MEMBER_DISCONNECT: 27,
  MEMBER_KICK: 20,
  MEMBER_MOVE: 26,
  MEMBER_PRUNE: 21,
  MEMBER_ROLE_UPDATE: 25,
  MEMBER_UPDATE: 24,
  MESSAGE_BULK_DELETE: 73,
  MESSAGE_DELETE: 72,
  MESSAGE_PIN: 74,
  MESSAGE_UNPIN: 75,
  ROLE_CREATE: 30,
  ROLE_DELETE: 32,
  ROLE_UPDATE: 31,
  STAGE_INSTANCE_CREATE: 83,
  STAGE_INSTANCE_DELETE: 85,
  STAGE_INSTANCE_UPDATE: 84,
  STICKER_CREATE: 90,
  STICKER_DELETE: 92,
  STICKER_UPDATE: 91,
  THREAD_CREATE: 110,
  THREAD_DELETE: 112,
  THREAD_UPDATE: 111,
  WEBHOOK_CREATE: 50,
  WEBHOOK_DELETE: 52,
  WEBHOOK_UPDATE: 51,
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
  | GuildAuditLogsTarget
  | 'APPLICATION_COMMAND'
  | 'SOUNDBOARD_SOUND'
  | 'GUILD_ONBOARDING_PROMPT'
  | 'GUILD_ONBOARDING';

function requireTargetId<TValue>(value: TValue | null | undefined): TValue {
  if (value === null || value === undefined) {
    throw new TypeError('AUDIT_LOG_TARGET_ID_MISSING');
  }
  return value;
}

const AUDIT_LOG_TARGET_TYPES: [number, AuditLogTarget][] = [
  [10, Targets.GUILD],
  [20, Targets.CHANNEL],
  [30, Targets.USER],
  [40, Targets.ROLE],
  [50, Targets.INVITE],
  [60, Targets.WEBHOOK],
  [70, Targets.EMOJI],
  [80, Targets.MESSAGE],
  [83, Targets.INTEGRATION],
  [86, Targets.STAGE_INSTANCE],
  [100, Targets.STICKER],
  [110, Targets.GUILD_SCHEDULED_EVENT],
  [120, Targets.THREAD],
  [130, Targets.APPLICATION_COMMAND],
  [140, Targets.SOUNDBOARD_SOUND],
  [143, Targets.AUTO_MODERATION],
  [146, Targets.USER],
];

class GuildAuditLogs<TAction extends GuildAuditLogsResolvable = 'ALL'> {
  declare webhooks: Collection<Snowflake, Webhook>;
  declare integrations: Collection<Snowflake, Integration>;
  declare applicationCommands: Collection<Snowflake, ApplicationCommand>;
  declare autoModerationRules: Collection<Snowflake, AutoModerationRule>;
  declare entries: Collection<Snowflake, GuildAuditLogsEntry<TAction>>;

  constructor(guild: Guild, data: RawGuildAuditLogData) {
    this.fillUsers(guild, data);
    this.fillThreads(guild, data);
    this.fillWebhooks(guild, data);
    this.fillIntegrations(guild, data);
    this.fillApplicationCommands(guild, data);
    this.autoModerationRules = new Collection();
    for (const rule of data.auto_moderation_rules) {
      this.autoModerationRules.set(
        rule.id,
        guild.autoModerationRules._add(rule)
      );
    }

    this.entries = new Collection();
    for (const item of data.audit_log_entries) {
      const entry = new GuildAuditLogsEntry<TAction>(guild, item, this);
      this.entries.set(entry.id, entry);
    }
  }

  private fillUsers(guild: Guild, data: RawGuildAuditLogData) {
    for (const user of data.users ?? []) {
      guild.client.users._add(user);
    }
  }

  private fillThreads(guild: Guild, data: RawGuildAuditLogData) {
    for (const thread of data.threads ?? []) {
      guild.client.channels._add(thread, guild);
    }
  }

  private fillWebhooks(guild: Guild, data: RawGuildAuditLogData) {
    this.webhooks = new Collection();
    for (const hook of data.webhooks ?? []) {
      this.webhooks.set(hook.id, new Webhook(guild.client, hook));
    }
  }

  private fillIntegrations(guild: Guild, data: RawGuildAuditLogData) {
    this.integrations = new Collection();
    for (const integration of data.integrations ?? []) {
      this.integrations.set(
        integration.id,
        new Integration(guild.client, integration, guild)
      );
    }
  }

  private fillApplicationCommands(guild: Guild, data: RawGuildAuditLogData) {
    this.applicationCommands = new Collection();
    for (const command of data.application_commands ?? []) {
      this.applicationCommands.set(
        command.id,
        new ApplicationCommand(guild.client, command, guild, null)
      );
    }
  }

  static Actions: typeof Actions;
  static Targets: typeof Targets;
  static Entry: typeof GuildAuditLogsEntry;

  static async build<TAction extends GuildAuditLogsResolvable = 'ALL'>(
    guild: Guild,
    data: RawGuildAuditLogData
  ) {
    const logs = new GuildAuditLogs<TAction>(guild, data);
    await Promise.all(logs.entries.map((e) => e.target));
    return logs;
  }

  static targetType(target: number): AuditLogTarget {
    for (const [limit, targetType] of AUDIT_LOG_TARGET_TYPES) {
      if (target < limit) {
        return targetType;
      }
    }
    if (target >= 163 && target <= 165) {
      return Targets.GUILD_ONBOARDING_PROMPT;
    }
    if (target >= 160 && target < 170) {
      return Targets.GUILD_ONBOARDING;
    }
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

  constructor(
    guild: Guild,
    data: RawGuildAuditLogEntryData,
    logs?: AuditLogsCache
  ) {
    const targetType = GuildAuditLogs.targetType(data.action_type);
    this.targetType = targetType as TTargetType;

    this.actionType = GuildAuditLogs.actionType(
      data.action_type
    ) as TActionType;

    this.action = Object.entries(Actions).find(
      ([, value]) => value === data.action_type
    )?.[0] as TAction;

    this.reason = data.reason ?? null;

    this.executorId = data.user_id;

    this.executor = GuildAuditLogsEntry.resolveExecutor(guild, data.user_id);

    this.changes =
      data.changes?.map((change) => ({
        key: change.key,
        ...('old_value' in change ? { old: change.old_value } : {}),
        ...('new_value' in change ? { new: change.new_value } : {}),
      })) ?? [];

    this.id = data.id;

    const options: APIAuditLogOptions = data.options ?? {};

    this.extra = this.buildExtra(guild, data, options);

    this.targetId = data.target_id;
    this.target = this.resolveTarget(guild, data, logs, targetType, options);
  }

  private resolveTarget(
    guild: Guild,
    data: RawGuildAuditLogEntryData,
    logs: AuditLogsCache | undefined,
    targetType: AuditLogTarget,
    options: APIAuditLogOptions
  ) {
    if (targetType === Targets.UNKNOWN) {
      const changesTarget = this.changesObject({});
      changesTarget.id = data.target_id;
      // MEMBER_DISCONNECT and similar types do not provide a target_id.
      return changesTarget;
    }

    const cached = this.resolveCachedTarget(guild, data, logs, targetType);
    if (cached.handled) {
      return cached.target;
    }
    return this.resolveConstructedTarget(
      guild,
      data,
      logs,
      targetType,
      options
    );
  }

  private resolveCachedTarget(
    guild: Guild,
    data: RawGuildAuditLogEntryData,
    logs: AuditLogsCache | undefined,
    targetType: AuditLogTarget
  ): { handled: boolean; target: unknown } {
    const direct = this.resolveDirectTarget(guild, data, logs, targetType);
    if (direct.handled) {
      return direct;
    }
    return this.resolveLinkedTarget(guild, data, logs, targetType);
  }

  private resolveDirectTarget(
    guild: Guild,
    data: RawGuildAuditLogEntryData,
    logs: AuditLogsCache | undefined,
    targetType: AuditLogTarget
  ): { handled: boolean; target: unknown } {
    if (targetType === Targets.USER) {
      if (!data.target_id) {
        return { handled: false, target: null };
      }
      return {
        handled: true,
        target: guild.client.options.partials.includes(PartialTypes.USER)
          ? guild.client.users._add({ id: data.target_id })
          : (guild.client.users.cache.get(data.target_id) ?? null),
      };
    }
    if (targetType === Targets.GUILD) {
      return {
        handled: true,
        target: guild.client.guilds.cache.get(requireTargetId(data.target_id)),
      };
    }
    if (targetType === Targets.WEBHOOK) {
      const targetId = requireTargetId(data.target_id);
      return {
        handled: true,
        target:
          logs?.webhooks.get(targetId) ??
          new Webhook(
            guild.client,
            this.changesObject({ guild_id: guild.id, id: targetId })
          ),
      };
    }
    if (targetType === Targets.INVITE) {
      const change = this.changes.find((entry) => entry.key === 'code');
      const code = change?.new ?? change?.old;
      return {
        handled: true,
        target:
          (typeof code === 'string' ? guild.invites.cache.get(code) : null) ??
          new Invite(
            guild.client,
            this.changesObject({ guild }) as unknown as RawInviteData
          ),
      };
    }
    return { handled: false, target: null };
  }

  private resolveLinkedTarget(
    guild: Guild,
    data: RawGuildAuditLogEntryData,
    logs: AuditLogsCache | undefined,
    targetType: AuditLogTarget
  ): { handled: boolean; target: unknown } {
    if (targetType === Targets.MESSAGE) {
      // Discord sends a channel id for the MESSAGE_BULK_DELETE action type.
      const targetId = requireTargetId(data.target_id);
      return {
        handled: true,
        target:
          data.action_type === Actions.MESSAGE_BULK_DELETE
            ? (guild.channels.cache.get(targetId) ?? { id: data.target_id })
            : (guild.client.users.cache.get(targetId) ?? null),
      };
    }
    if (targetType === Targets.INTEGRATION) {
      const targetId = requireTargetId(data.target_id);
      return {
        handled: true,
        target:
          logs?.integrations.get(targetId) ??
          new Integration(
            guild.client,
            this.changesObject({
              id: targetId,
            }) as unknown as RawIntegrationData,
            guild
          ),
      };
    }
    if (targetType === Targets.CHANNEL || targetType === Targets.THREAD) {
      const targetId = requireTargetId(data.target_id);
      return {
        handled: true,
        target:
          guild.channels.cache.get(targetId) ??
          this.changesObject({ id: targetId }),
      };
    }
    return { handled: false, target: null };
  }

  private resolveConstructedTarget(
    guild: Guild,
    data: RawGuildAuditLogEntryData,
    logs: AuditLogsCache | undefined,
    targetType: AuditLogTarget,
    options: APIAuditLogOptions
  ) {
    if (targetType === Targets.STAGE_INSTANCE) {
      const targetId = requireTargetId(data.target_id);
      return (
        guild.stageInstances.cache.get(targetId) ??
        new StageInstance(
          guild.client,
          this.changesObject({
            channel_id: requireTargetId(options.channel_id),
            guild_id: guild.id,
            id: targetId,
          })
        )
      );
    }
    if (targetType === Targets.STICKER) {
      const targetId = requireTargetId(data.target_id);
      return (
        guild.stickers.cache.get(targetId) ??
        new Sticker(guild.client, this.changesObject({ id: targetId }))
      );
    }
    if (targetType === Targets.GUILD_SCHEDULED_EVENT) {
      const targetId = requireTargetId(data.target_id);
      return (
        guild.scheduledEvents.cache.get(targetId) ??
        new GuildScheduledEvent(
          guild.client,
          this.changesObject({ guild_id: guild.id, id: targetId })
        )
      );
    }
    if (targetType === Targets.APPLICATION_COMMAND) {
      const targetId = requireTargetId(data.target_id);
      return logs?.applicationCommands.get(targetId) ?? { id: data.target_id };
    }
    if (targetType === Targets.AUTO_MODERATION) {
      const targetId = requireTargetId(data.target_id);
      return (
        guild.autoModerationRules.cache.get(targetId) ??
        new AutoModerationRule(
          guild.client,
          this.changesObject({
            guild_id: guild.id,
            id: targetId,
          }) as unknown as APIAutoModerationRule,
          guild
        )
      );
    }
    if (targetType === Targets.ROLE) {
      return (
        guild.roles.cache.get(requireTargetId(data.target_id)) ?? {
          id: data.target_id,
        }
      );
    }
    if (targetType === Targets.EMOJI) {
      return (
        guild.emojis.cache.get(requireTargetId(data.target_id)) ?? {
          id: data.target_id,
        }
      );
    }
    if (data.target_id) {
      // Missing SoundboardSound & Onboarding
      return { id: data.target_id };
    }
    return null;
  }

  private buildMessageExtra(
    guild: Guild,
    data: RawGuildAuditLogEntryData,
    options: APIAuditLogOptions
  ) {
    if (data.action_type === Actions.MEMBER_PRUNE) {
      return {
        days: Number(options.delete_member_days),
        removed: Number(options.members_removed),
      };
    }
    if (
      data.action_type === Actions.MESSAGE_BULK_DELETE ||
      data.action_type === Actions.MEMBER_DISCONNECT
    ) {
      return { count: Number(options.count) };
    }
    if (
      data.action_type === Actions.MESSAGE_PIN ||
      data.action_type === Actions.MESSAGE_UNPIN
    ) {
      return {
        channel: guild.client.channels.cache.get(
          requireTargetId(options.channel_id)
        ) ?? { id: options.channel_id },
        messageId: options.message_id,
      };
    }
    return {
      channel: guild.channels.cache.get(
        requireTargetId(options.channel_id)
      ) ?? {
        id: options.channel_id,
      },
      count: Number(options.count),
    };
  }

  private buildOverwriteExtra(guild: Guild, options: APIAuditLogOptions) {
    if (Number(options.type) === OverwriteTypes.role) {
      return (
        guild.roles.cache.get(requireTargetId(options.id)) ?? {
          id: options.id,
          name: options.role_name,
          type: OverwriteTypes[OverwriteTypes.role],
        }
      );
    }
    return (
      guild.members.cache.get(requireTargetId(options.id)) ?? {
        id: options.id,
        type: OverwriteTypes[OverwriteTypes.member],
      }
    );
  }

  private buildAutoModerationExtra(guild: Guild, options: APIAuditLogOptions) {
    return {
      autoModerationRuleName: options.auto_moderation_rule_name,
      autoModerationRuleTriggerType:
        AutoModerationRuleTriggerTypes[
          requireTargetId(options.auto_moderation_rule_trigger_type)
        ],
      channel: guild.client.channels.cache.get(
        requireTargetId(options.channel_id)
      ) ?? {
        id: options.channel_id,
      },
    };
  }

  private buildExtra(
    guild: Guild,
    data: RawGuildAuditLogEntryData,
    options: APIAuditLogOptions
  ) {
    switch (data.action_type) {
      case Actions.MEMBER_PRUNE:
      case Actions.MEMBER_MOVE:
      case Actions.MESSAGE_DELETE:
      case Actions.MESSAGE_PIN:
      case Actions.MESSAGE_UNPIN:
      case Actions.MESSAGE_BULK_DELETE:
      case Actions.MEMBER_DISCONNECT: {
        return this.buildMessageExtra(guild, data, options);
      }

      case Actions.CHANNEL_OVERWRITE_CREATE:
      case Actions.CHANNEL_OVERWRITE_UPDATE:
      case Actions.CHANNEL_OVERWRITE_DELETE: {
        return this.buildOverwriteExtra(guild, options);
      }

      case Actions.STAGE_INSTANCE_CREATE:
      case Actions.STAGE_INSTANCE_DELETE:
      case Actions.STAGE_INSTANCE_UPDATE: {
        return {
          channel: guild.client.channels.cache.get(
            requireTargetId(options.channel_id)
          ) ?? {
            id: options.channel_id,
          },
        };
      }
      case Actions.APPLICATION_COMMAND_PERMISSION_UPDATE: {
        return {
          applicationId: options.application_id,
        };
      }
      case Actions.AUTO_MODERATION_BLOCK_MESSAGE:
      case Actions.AUTO_MODERATION_FLAG_TO_CHANNEL:
      case Actions.AUTO_MODERATION_USER_COMMUNICATION_DISABLED: {
        return this.buildAutoModerationExtra(guild, options);
      }
      default: {
        return null;
      }
    }
  }

  private static resolveExecutor(guild: Guild, userId: Snowflake | null) {
    if (!userId) {
      return null;
    }
    if (guild.client.options.partials.includes(PartialTypes.USER)) {
      return guild.client.users._add({ id: userId });
    }
    return guild.client.users.cache.get(userId) ?? null;
  }

  private changesObject<TBase extends Record<string, unknown>>(
    base: TBase
  ): TBase & Record<string, unknown> {
    const object: Record<string, unknown> = { ...base };
    for (const change of this.changes) {
      object[change.key] = change.new ?? change.old;
    }
    return object as TBase & Record<string, unknown>;
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
