import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';

const { TypeError, Error } = _errorsModule;
import _GuildScheduledEventModule from '../structures/GuildScheduledEvent';

const { GuildScheduledEvent } = _GuildScheduledEventModule;
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';

const {
  PrivacyLevels,
  GuildScheduledEventEntityTypes,
  GuildScheduledEventStatuses,
} = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import Util from '../util/Util';
import type { APIGuildMember, APIUser, Snowflake } from 'discord-api-types/v10';
import type { RawGuildScheduledEventData } from '../../typings/rawDataTypes';
import type {
  FetchGuildScheduledEventOptions,
  FetchGuildScheduledEventsOptions,
  GuildScheduledEventCreateOptions,
  GuildScheduledEventRecurrenceRuleOptions,
  GuildScheduledEventResolvable,
  GuildVoiceChannelResolvable,
} from '../../typings';
import type { Guild } from '../structures/Guild';
import type { GuildMember } from '../structures/GuildMember';
import type { User } from '../structures/User';
import type { GuildScheduledEvent as GuildScheduledEventType } from '../structures/GuildScheduledEvent';

type GuildScheduledEventResolvableSource =
  | InstanceType<typeof GuildScheduledEvent>
  | GuildScheduledEventResolvable;

export type GuildScheduledEventEditOptionsSource = Partial<
  Omit<GuildScheduledEventCreateOptions, 'channel' | 'recurrenceRule'>
> & {
  channel?: GuildVoiceChannelResolvable | null;
  status?: string | number;
  recurrenceRule?: GuildScheduledEventRecurrenceRuleOptions | null;
};

interface FetchGuildScheduledEventSubscribersOptionsSource {
  limit?: number;
  withMember?: boolean;
  before?: Snowflake;
  after?: Snowflake;
}

interface GuildScheduledEventUserSource {
  guildScheduledEventId: Snowflake;
  user: User;
  member: GuildMember | null;
}

function isFetchEventOptions(
  value: unknown
): value is FetchGuildScheduledEventOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    'guildScheduledEvent' in value
  );
}

function isFetchEventsOptions(
  value: unknown
): value is FetchGuildScheduledEventsOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('withUserCount' in value || 'cache' in value)
  );
}

class GuildScheduledEventManager extends CachedManager<GuildScheduledEventType> {
  declare guild: Guild;
  constructor(
    guild: Guild,
    iterable?: Iterable<InstanceType<typeof GuildScheduledEvent>>
  ) {
    super(guild.client, GuildScheduledEvent, iterable);

    this.guild = guild;
  }

  async create(
    options: GuildScheduledEventCreateOptions
  ): Promise<InstanceType<typeof GuildScheduledEvent>> {
    if (typeof options !== 'object') {
      throw new TypeError('INVALID_TYPE', 'options', 'object', true);
    }
    let { privacyLevel, entityType } = options;
    const {
      channel,
      name,
      scheduledStartTime,
      description,
      scheduledEndTime,
      entityMetadata,
      reason,
      image,
      recurrenceRule,
    } = options;

    if (typeof privacyLevel === 'string') {
      privacyLevel = PrivacyLevels[privacyLevel];
    }
    if (typeof entityType === 'string') {
      entityType = GuildScheduledEventEntityTypes[entityType];
    }

    let channel_id;
    let entity_metadata;
    if (entityType === GuildScheduledEventEntityTypes.EXTERNAL) {
      channel_id = channel === undefined ? channel : null;
      entity_metadata = { location: entityMetadata?.location };
    } else {
      channel_id = this.guild.channels.resolveId(channel);
      if (!channel_id) {
        throw new Error('GUILD_VOICE_CHANNEL_RESOLVE');
      }
      entity_metadata = entityMetadata === undefined ? entityMetadata : null;
    }

    const data: RawGuildScheduledEventData = await this.client.api
      .guilds(this.guild.id, 'scheduled-events')
      .post({
        data: {
          channel_id,
          description,
          entity_metadata,
          entity_type: entityType,
          image: image && (await DataResolver.resolveImage(image)),
          name,
          privacy_level: privacyLevel,
          recurrence_rule:
            recurrenceRule &&
            Util.transformGuildScheduledEventRecurrenceRule(recurrenceRule),
          scheduled_end_time: scheduledEndTime
            ? new Date(scheduledEndTime).toISOString()
            : scheduledEndTime,
          scheduled_start_time: new Date(scheduledStartTime).toISOString(),
        },
        reason,
      });

    return this._add(data);
  }

  fetch(
    options:
      | GuildScheduledEventResolvableSource
      | FetchGuildScheduledEventOptions
  ): Promise<InstanceType<typeof GuildScheduledEvent>>;
  fetch(
    options?: FetchGuildScheduledEventsOptions
  ): Promise<Collection<Snowflake, InstanceType<typeof GuildScheduledEvent>>>;
  async fetch(
    options:
      | GuildScheduledEventResolvableSource
      | FetchGuildScheduledEventOptions
      | FetchGuildScheduledEventsOptions = {}
  ): Promise<
    | InstanceType<typeof GuildScheduledEvent>
    | Collection<Snowflake, InstanceType<typeof GuildScheduledEvent>>
  > {
    const eventOptions = isFetchEventOptions(options) ? options : undefined;
    const eventsOptions = isFetchEventsOptions(options) ? options : undefined;
    const id = this.resolveId(eventOptions?.guildScheduledEvent ?? options);

    if (id) {
      if (!eventOptions?.force) {
        const existing = this.cache.get(id);
        if (existing) {
          return existing;
        }
      }

      const data: RawGuildScheduledEventData = await this.client.api
        .guilds(this.guild.id, 'scheduled-events', id)
        .get({
          query: { with_user_count: eventOptions?.withUserCount ?? true },
        });
      return this._add(data, eventOptions?.cache);
    }

    const data: RawGuildScheduledEventData[] = await this.client.api
      .guilds(this.guild.id, 'scheduled-events')
      .get({
        query: { with_user_count: eventsOptions?.withUserCount ?? true },
      });

    const events = new Collection<
      Snowflake,
      InstanceType<typeof GuildScheduledEvent>
    >();
    for (const rawGuildScheduledEventData of data) {
      events.set(
        rawGuildScheduledEventData.id,
        this._add(rawGuildScheduledEventData, eventsOptions?.cache)
      );
    }
    return events;
  }

  async edit(
    guildScheduledEvent: GuildScheduledEventResolvableSource,
    options: GuildScheduledEventEditOptionsSource
  ): Promise<InstanceType<typeof GuildScheduledEvent>> {
    const guildScheduledEventId = this.resolveId(guildScheduledEvent);
    if (!guildScheduledEventId) {
      throw new Error('GUILD_SCHEDULED_EVENT_RESOLVE');
    }

    if (typeof options !== 'object') {
      throw new TypeError('INVALID_TYPE', 'options', 'object', true);
    }
    let { privacyLevel, entityType, status } = options;
    const {
      channel,
      name,
      scheduledStartTime,
      description,
      scheduledEndTime,
      entityMetadata,
      reason,
      image,
      recurrenceRule,
    } = options;

    if (typeof privacyLevel === 'string') {
      privacyLevel = PrivacyLevels[privacyLevel];
    }
    if (typeof entityType === 'string') {
      entityType = GuildScheduledEventEntityTypes[entityType];
    }
    if (typeof status === 'string') {
      status = resolveEnumValue(GuildScheduledEventStatuses, status);
    }

    let entity_metadata;
    if (entityMetadata) {
      entity_metadata = {
        location: entityMetadata.location,
      };
    }

    const data: RawGuildScheduledEventData = await this.client.api
      .guilds(this.guild.id, 'scheduled-events', guildScheduledEventId)
      .patch({
        data: {
          channel_id:
            channel === undefined
              ? channel
              : this.guild.channels.resolveId(channel),
          description,
          entity_metadata,
          entity_type: entityType,
          image: image && (await DataResolver.resolveImage(image)),
          name,
          privacy_level: privacyLevel,
          recurrence_rule:
            recurrenceRule &&
            Util.transformGuildScheduledEventRecurrenceRule(recurrenceRule),
          scheduled_end_time: scheduledEndTime
            ? new Date(scheduledEndTime).toISOString()
            : scheduledEndTime,
          scheduled_start_time: scheduledStartTime
            ? new Date(scheduledStartTime).toISOString()
            : undefined,
          status,
        },
        reason,
      });

    return this._add(data);
  }

  async delete(
    guildScheduledEvent: GuildScheduledEventResolvableSource
  ): Promise<void> {
    const guildScheduledEventId = this.resolveId(guildScheduledEvent);
    if (!guildScheduledEventId) {
      throw new Error('GUILD_SCHEDULED_EVENT_RESOLVE');
    }

    await this.client.api
      .guilds(this.guild.id, 'scheduled-events', guildScheduledEventId)
      .delete();
  }

  async fetchSubscribers(
    guildScheduledEvent: GuildScheduledEventResolvableSource,
    options: FetchGuildScheduledEventSubscribersOptionsSource = {}
  ): Promise<Collection<Snowflake, GuildScheduledEventUserSource>> {
    const guildScheduledEventId = this.resolveId(guildScheduledEvent);
    if (!guildScheduledEventId) {
      throw new Error('GUILD_SCHEDULED_EVENT_RESOLVE');
    }

    const { limit, withMember, before, after } = options;

    const data: {
      guild_scheduled_event_id: Snowflake;
      user: APIUser;
      member?: APIGuildMember;
    }[] = await this.client.api
      .guilds(this.guild.id, 'scheduled-events', guildScheduledEventId)
      .users.get({
        query: { after, before, limit, with_member: withMember },
      });

    const subscribers = new Collection<
      Snowflake,
      GuildScheduledEventUserSource
    >();
    for (const rawData of data) {
      subscribers.set(rawData.user.id, {
        guildScheduledEventId: rawData.guild_scheduled_event_id,
        member: rawData.member
          ? this.guild.members._add({ ...rawData.member, user: rawData.user })
          : null,
        user: this.client.users._add(rawData.user),
      });
    }
    return subscribers;
  }
}

export default GuildScheduledEventManager;
export { GuildScheduledEventManager };
