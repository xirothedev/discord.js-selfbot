import Base from './Base';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { GuildScheduledEventEntityTypes, GuildScheduledEventStatuses, GuildScheduledEventPrivacyLevels, Endpoints } =
  _ConstantsModule;
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
    client: import('../client/Client').default,
    data: PatchOf<'GuildScheduledEvent'> & Pick<RawGuildScheduledEventData, 'id' | 'guild_id'>,
  ) {
    super(client);

    this.id = data.id;

    this.guildId = data.guild_id;

    this._patch(data);
  }

  _patch(data: PatchOf<'GuildScheduledEvent'>) {
    if (data.channel_id !== undefined) {
      this.channelId = data.channel_id;
    } else {
      this.channelId ??= null;
    }

    if (data.creator_id !== undefined) {
      this.creatorId = data.creator_id;
    } else {
      this.creatorId ??= null;
    }

    if (data.name !== undefined) {
      this.name = data.name;
    } else {
      // Only if partial.
      this.name ??= null;
    }

    if (data.description !== undefined) {
      this.description = data.description;
    } else {
      this.description ??= null;
    }

    if (data.scheduled_start_time !== undefined) {
      this.scheduledStartTimestamp = Date.parse(data.scheduled_start_time);
    } else {
      this.scheduledStartTimestamp ??= null;
    }

    if (data.scheduled_end_time !== undefined) {
      this.scheduledEndTimestamp = data.scheduled_end_time ? Date.parse(data.scheduled_end_time) : null;
    } else {
      this.scheduledEndTimestamp ??= null;
    }

    if (data.privacy_level !== undefined) {
      this.privacyLevel = GuildScheduledEventPrivacyLevels[data.privacy_level];
    } else {
      // Only if partial.
      this.privacyLevel ??= null;
    }

    if (data.status !== undefined) {
      this.status = GuildScheduledEventStatuses[data.status];
    } else {
      // Only if partial.
      this.status ??= null;
    }

    if (data.entity_type !== undefined) {
      this.entityType = GuildScheduledEventEntityTypes[data.entity_type];
    } else {
      // Only if partial.
      this.entityType ??= null;
    }

    if (data.entity_id !== undefined) {
      this.entityId = data.entity_id;
    } else {
      this.entityId ??= null;
    }

    if (data.user_count !== undefined) {
      this.userCount = data.user_count;
    } else {
      this.userCount ??= null;
    }

    if (data.creator !== undefined) {
      this.creator = this.client.users._add(data.creator);
    } else {
      this.creator ??= this.client.users.resolve(this.creatorId);
    }

    /* eslint-disable max-len */
    /* eslint-enable max-len */

    if (data.entity_metadata !== undefined) {
      if (data.entity_metadata) {
        this.entityMetadata = {
          location: data.entity_metadata.location ?? this.entityMetadata?.location ?? null,
        };
      } else {
        this.entityMetadata = null;
      }
    } else {
      this.entityMetadata ??= null;
    }

    if (data.image !== undefined) {
      this.image = data.image;
    } else {
      this.image ??= null;
    }

    if (data.recurrence_rule !== undefined) {
      this.recurrenceRule = data.recurrence_rule && {
        startTimestamp: Date.parse(data.recurrence_rule.start),
        get startAt() {
          return new Date(this.startTimestamp);
        },
        endTimestamp: data.recurrence_rule.end ? Date.parse(data.recurrence_rule.end) : null,
        get endAt() {
          return this.endTimestamp ? new Date(this.endTimestamp) : null;
        },
        frequency: data.recurrence_rule.frequency,
        interval: data.recurrence_rule.interval,
        byWeekday: data.recurrence_rule.by_weekday,
        byNWeekday: data.recurrence_rule.by_n_weekday,
        byMonth: data.recurrence_rule.by_month,
        byMonthDay: data.recurrence_rule.by_month_day,
        byYearDay: data.recurrence_rule.by_year_day,
        count: data.recurrence_rule.count,
      };
    } else {
      this.recurrenceRule ??= null;
    }
  }

  coverImageURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    return this.image && this.client.rest.cdn.GuildScheduledEventCover(this.id, this.image, format, size);
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
    return Endpoints.scheduledEvent(this.client.options.http.scheduledEvent, this.guildId, this.id);
  }

  fetch(force: boolean = true) {
    const guild = this.guild;
    if (!guild) throw new Error('GUILD_NOT_FOUND');
    return guild.scheduledEvents.fetch({ guildScheduledEvent: this.id, force });
  }

  async createInviteURL(options?: CreateGuildScheduledEventInviteURLOptions) {
    const guild = this.guild;
    if (!guild) throw new Error('GUILD_NOT_FOUND');
    let channelId = this.channelId;
    if (this.entityType === 'EXTERNAL') {
      if (!options?.channel) throw new Error('INVITE_OPTIONS_MISSING_CHANNEL');
      channelId = guild.channels.resolveId(options.channel);
      if (!channelId) throw new Error('GUILD_CHANNEL_RESOLVE');
    }
    if (!channelId) throw new Error('GUILD_CHANNEL_RESOLVE');
    const invite = await guild.invites.create(channelId, options);
    return Endpoints.invite(this.client.options.http.invite, invite.code, this.id);
  }

  edit(options: import('../managers/GuildScheduledEventManager').GuildScheduledEventEditOptionsSource) {
    const guild = this.guild;
    if (!guild) throw new Error('GUILD_NOT_FOUND');
    return guild.scheduledEvents.edit(this.id, options);
  }

  async delete() {
    const guild = this.guild;
    if (!guild) throw new Error('GUILD_NOT_FOUND');
    await guild.scheduledEvents.delete(this.id);
    return this;
  }

  setName(name: string, reason?: string) {
    return this.edit({ name, reason });
  }

  setScheduledStartTime(scheduledStartTime: DateResolvable, reason?: string) {
    return this.edit({ scheduledStartTime, reason });
  }

  // TODO: scheduledEndTime gets reset on passing null but it hasn't been documented
  setScheduledEndTime(scheduledEndTime: DateResolvable, reason?: string) {
    return this.edit({ scheduledEndTime, reason });
  }

  setDescription(description: string, reason?: string) {
    return this.edit({ description, reason });
  }

  setStatus(status: GuildScheduledEventStatus, reason?: string) {
    return this.edit({ status, reason });
  }

  setLocation(location: string, reason?: string) {
    return this.edit({ entityMetadata: { location }, reason });
  }

  fetchSubscribers(options?: Record<string, unknown>) {
    const guild = this.guild;
    if (!guild) throw new Error('GUILD_NOT_FOUND');
    return guild.scheduledEvents.fetchSubscribers(this.id, options);
  }

  toString() {
    return this.url;
  }

  isActive() {
    return this.status ? GuildScheduledEventStatuses[this.status] === GuildScheduledEventStatuses.ACTIVE : false;
  }

  isCanceled() {
    return this.status ? GuildScheduledEventStatuses[this.status] === GuildScheduledEventStatuses.CANCELED : false;
  }

  isCompleted() {
    return this.status ? GuildScheduledEventStatuses[this.status] === GuildScheduledEventStatuses.COMPLETED : false;
  }

  isScheduled() {
    return this.status ? GuildScheduledEventStatuses[this.status] === GuildScheduledEventStatuses.SCHEDULED : false;
  }
}

export { GuildScheduledEvent };
export default { GuildScheduledEvent };
