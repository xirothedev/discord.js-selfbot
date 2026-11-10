import Base, { patchValue } from './Base';
import _errorsModule from '../errors';

const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';

const {
  GuildScheduledEventEntityTypes,
  GuildScheduledEventStatuses,
  GuildScheduledEventPrivacyLevels,
  Endpoints,
} = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawGuildScheduledEventData } from '../../typings/rawDataTypes';
import type {
  CreateGuildScheduledEventInviteURLOptions,
  DateResolvable,
  GuildScheduledEventStatus,
  StaticImageURLOptions,
} from '../../typings';
import type { GuildScheduledEventEntity } from '../types/entities/guild-scheduled-event';
import type { PatchOf } from '../types/schema';
import type Client from '../client/Client';
import type { GuildScheduledEventEditOptionsSource } from '../managers/GuildScheduledEventManager';

class GuildScheduledEvent extends Base implements GuildScheduledEventEntity {
  declare id: GuildScheduledEventEntity['id'];
  declare guildId: GuildScheduledEventEntity['guildId'];
  declare channelId: GuildScheduledEventEntity['channelId'];
  declare creatorId: GuildScheduledEventEntity['creatorId'];
  declare name: GuildScheduledEventEntity['name'];
  declare description: GuildScheduledEventEntity['description'];
  declare scheduledStartTimestamp: GuildScheduledEventEntity['scheduledStartTimestamp'];
  declare scheduledEndTimestamp: GuildScheduledEventEntity['scheduledEndTimestamp'];
  declare privacyLevel: GuildScheduledEventEntity['privacyLevel'];
  declare status: GuildScheduledEventEntity['status'];
  declare entityType: GuildScheduledEventEntity['entityType'];
  declare entityId: GuildScheduledEventEntity['entityId'];
  declare entityMetadata: GuildScheduledEventEntity['entityMetadata'];
  declare userCount: GuildScheduledEventEntity['userCount'];
  declare creator: GuildScheduledEventEntity['creator'];
  declare recurrenceRule: GuildScheduledEventEntity['recurrenceRule'];
  declare image: GuildScheduledEventEntity['image'];

  constructor(
    client: Client,
    data: PatchOf<'GuildScheduledEvent'> &
      Pick<RawGuildScheduledEventData, 'id' | 'guild_id'>
  ) {
    super(client);

    this.id = data.id;

    this.guildId = data.guild_id;

    this._patch(data);
  }

  _patch(data: PatchOf<'GuildScheduledEvent'>) {
    this.channelId = patchValue(data.channel_id, this.channelId);
    this.creatorId = patchValue(data.creator_id, this.creatorId);
    this.name = patchValue(data.name, this.name);
    this.description = patchValue(data.description, this.description);
    this.scheduledStartTimestamp =
      data.scheduled_start_time === undefined
        ? (this.scheduledStartTimestamp ?? null)
        : Date.parse(data.scheduled_start_time);
    if (data.scheduled_end_time === undefined) {
      this.scheduledEndTimestamp ??= null;
    } else {
      this.scheduledEndTimestamp = data.scheduled_end_time
        ? Date.parse(data.scheduled_end_time)
        : null;
    }
    this.privacyLevel =
      data.privacy_level === undefined
        ? (this.privacyLevel ?? null)
        : GuildScheduledEventPrivacyLevels[data.privacy_level];
    this.status =
      data.status === undefined
        ? (this.status ?? null)
        : GuildScheduledEventStatuses[data.status];
    this.entityType =
      data.entity_type === undefined
        ? (this.entityType ?? null)
        : GuildScheduledEventEntityTypes[data.entity_type];
    this.entityId = patchValue(data.entity_id, this.entityId);
    this.userCount = patchValue(data.user_count, this.userCount);

    if (data.creator === undefined) {
      this.creator ??= this.client.users.resolve(this.creatorId);
    } else {
      this.creator = this.client.users._add(data.creator);
    }

    this._patchEntityMetadata(data);
    this._patchRecurrenceRule(data);
    this.image = patchValue(data.image, this.image);
  }

  private _patchEntityMetadata(data: PatchOf<'GuildScheduledEvent'>) {
    if (data.entity_metadata === undefined) {
      this.entityMetadata ??= null;
      return;
    }
    this.entityMetadata = data.entity_metadata
      ? {
          location:
            data.entity_metadata.location ??
            this.entityMetadata?.location ??
            null,
        }
      : null;
  }

  private _patchRecurrenceRule(data: PatchOf<'GuildScheduledEvent'>) {
    if (data.recurrence_rule === undefined) {
      this.recurrenceRule ??= null;
      return;
    }
    this.recurrenceRule = data.recurrence_rule && {
      byMonth: data.recurrence_rule.by_month,
      byMonthDay: data.recurrence_rule.by_month_day,
      byNWeekday: data.recurrence_rule.by_n_weekday,
      byWeekday: data.recurrence_rule.by_weekday,
      byYearDay: data.recurrence_rule.by_year_day,
      count: data.recurrence_rule.count,
      get endAt() {
        return this.endTimestamp ? new Date(this.endTimestamp) : null;
      },
      endTimestamp: data.recurrence_rule.end
        ? Date.parse(data.recurrence_rule.end)
        : null,
      frequency: data.recurrence_rule.frequency,
      interval: data.recurrence_rule.interval,
      get startAt() {
        return new Date(this.startTimestamp);
      },
      startTimestamp: Date.parse(data.recurrence_rule.start),
    };
  }

  coverImageURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    return (
      this.image &&
      this.client.rest.cdn.GuildScheduledEventCover(
        this.id,
        this.image,
        format,
        size
      )
    );
  }

  get partial() {
    return this.name === null;
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  get scheduledStartAt() {
    return new Date(this.scheduledStartTimestamp ?? 0);
  }

  get scheduledEndAt() {
    return this.scheduledEndTimestamp && new Date(this.scheduledEndTimestamp);
  }

  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  get guild() {
    return this.client.guilds.resolve(this.guildId);
  }

  get url() {
    return Endpoints.scheduledEvent(
      this.client.options.http.scheduledEvent,
      this.guildId,
      this.id
    );
  }

  fetch(force = true) {
    const { guild } = this;
    if (!guild) {
      throw new Error('GUILD_NOT_FOUND');
    }
    return guild.scheduledEvents.fetch({ force, guildScheduledEvent: this.id });
  }

  async createInviteURL(options?: CreateGuildScheduledEventInviteURLOptions) {
    const { guild } = this;
    if (!guild) {
      throw new Error('GUILD_NOT_FOUND');
    }
    let { channelId } = this;
    if (this.entityType === 'EXTERNAL') {
      if (!options?.channel) {
        throw new Error('INVITE_OPTIONS_MISSING_CHANNEL');
      }
      channelId = guild.channels.resolveId(options.channel);
      if (!channelId) {
        throw new Error('GUILD_CHANNEL_RESOLVE');
      }
    }
    if (!channelId) {
      throw new Error('GUILD_CHANNEL_RESOLVE');
    }
    const invite = await guild.invites.create(channelId, options);
    return Endpoints.invite(
      this.client.options.http.invite,
      invite.code,
      this.id
    );
  }

  edit(options: GuildScheduledEventEditOptionsSource) {
    const { guild } = this;
    if (!guild) {
      throw new Error('GUILD_NOT_FOUND');
    }
    return guild.scheduledEvents.edit(this.id, options);
  }

  async delete() {
    const { guild } = this;
    if (!guild) {
      throw new Error('GUILD_NOT_FOUND');
    }
    await guild.scheduledEvents.delete(this.id);
    return this;
  }

  setName(name: string, reason?: string) {
    return this.edit({ name, reason });
  }

  setScheduledStartTime(scheduledStartTime: DateResolvable, reason?: string) {
    return this.edit({ reason, scheduledStartTime });
  }

  // scheduledEndTime resets on passing null, which is not documented.
  setScheduledEndTime(scheduledEndTime: DateResolvable, reason?: string) {
    return this.edit({ reason, scheduledEndTime });
  }

  setDescription(description: string, reason?: string) {
    return this.edit({ description, reason });
  }

  setStatus(status: GuildScheduledEventStatus, reason?: string) {
    return this.edit({ reason, status });
  }

  setLocation(location: string, reason?: string) {
    return this.edit({ entityMetadata: { location }, reason });
  }

  fetchSubscribers(options?: Record<string, unknown>) {
    const { guild } = this;
    if (!guild) {
      throw new Error('GUILD_NOT_FOUND');
    }
    return guild.scheduledEvents.fetchSubscribers(this.id, options);
  }

  toString() {
    return this.url;
  }

  isActive() {
    return this.status
      ? GuildScheduledEventStatuses[this.status] ===
          GuildScheduledEventStatuses.ACTIVE
      : false;
  }

  isCanceled() {
    return this.status
      ? GuildScheduledEventStatuses[this.status] ===
          GuildScheduledEventStatuses.CANCELED
      : false;
  }

  isCompleted() {
    return this.status
      ? GuildScheduledEventStatuses[this.status] ===
          GuildScheduledEventStatuses.COMPLETED
      : false;
  }

  isScheduled() {
    return this.status
      ? GuildScheduledEventStatuses[this.status] ===
          GuildScheduledEventStatuses.SCHEDULED
      : false;
  }
}

export { GuildScheduledEvent };
export default { GuildScheduledEvent };
