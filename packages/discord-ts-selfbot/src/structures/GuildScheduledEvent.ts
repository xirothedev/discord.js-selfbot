import Base from "./Base";
import _errorsModule from "../errors";

const { Error } = _errorsModule;
import _ConstantsModule from "../util/Constants";

const {
  GuildScheduledEventEntityTypes,
  GuildScheduledEventStatuses,
  GuildScheduledEventPrivacyLevels,
  Endpoints,
} = _ConstantsModule;
import SnowflakeUtil from "../util/SnowflakeUtil";
import type { RawGuildScheduledEventData } from "../../typings/rawDataTypes";
import type {
  CreateGuildScheduledEventInviteURLOptions,
  DateResolvable,
  GuildScheduledEventStatus,
  StaticImageURLOptions,
} from "../../typings";
import type { GuildScheduledEventEntity } from "../types/entities/guild-scheduled-event";
import type { PatchOf } from "../types/schema";
import type Client from "../client/Client";
import type { GuildScheduledEventEditOptionsSource } from "../managers/GuildScheduledEventManager";

class GuildScheduledEvent extends Base implements GuildScheduledEventEntity {
  declare id: GuildScheduledEventEntity["id"];
  declare guildId: GuildScheduledEventEntity["guildId"];
  declare channelId: GuildScheduledEventEntity["channelId"];
  declare creatorId: GuildScheduledEventEntity["creatorId"];
  declare name: GuildScheduledEventEntity["name"];
  declare description: GuildScheduledEventEntity["description"];
  declare scheduledStartTimestamp: GuildScheduledEventEntity["scheduledStartTimestamp"];
  declare scheduledEndTimestamp: GuildScheduledEventEntity["scheduledEndTimestamp"];
  declare privacyLevel: GuildScheduledEventEntity["privacyLevel"];
  declare status: GuildScheduledEventEntity["status"];
  declare entityType: GuildScheduledEventEntity["entityType"];
  declare entityId: GuildScheduledEventEntity["entityId"];
  declare entityMetadata: GuildScheduledEventEntity["entityMetadata"];
  declare userCount: GuildScheduledEventEntity["userCount"];
  declare creator: GuildScheduledEventEntity["creator"];
  declare recurrenceRule: GuildScheduledEventEntity["recurrenceRule"];
  declare image: GuildScheduledEventEntity["image"];

  constructor(
    client: Client,
    data: PatchOf<"GuildScheduledEvent"> &
      Pick<RawGuildScheduledEventData, "id" | "guild_id">
  ) {
    super(client);

    this.id = data.id;

    this.guildId = data.guild_id;

    this._patch(data);
  }

  _patch(data: PatchOf<"GuildScheduledEvent">) {
    if (data.channel_id === undefined) {
      this.channelId ??= null;
    } else {
      this.channelId = data.channel_id;
    }

    if (data.creator_id === undefined) {
      this.creatorId ??= null;
    } else {
      this.creatorId = data.creator_id;
    }

    if (data.name === undefined) {
      // Only if partial.
      this.name ??= null;
    } else {
      this.name = data.name;
    }

    if (data.description === undefined) {
      this.description ??= null;
    } else {
      this.description = data.description;
    }

    if (data.scheduled_start_time === undefined) {
      this.scheduledStartTimestamp ??= null;
    } else {
      this.scheduledStartTimestamp = Date.parse(data.scheduled_start_time);
    }

    if (data.scheduled_end_time === undefined) {
      this.scheduledEndTimestamp ??= null;
    } else {
      this.scheduledEndTimestamp = data.scheduled_end_time
        ? Date.parse(data.scheduled_end_time)
        : null;
    }

    if (data.privacy_level === undefined) {
      // Only if partial.
      this.privacyLevel ??= null;
    } else {
      this.privacyLevel = GuildScheduledEventPrivacyLevels[data.privacy_level];
    }

    if (data.status === undefined) {
      // Only if partial.
      this.status ??= null;
    } else {
      this.status = GuildScheduledEventStatuses[data.status];
    }

    if (data.entity_type === undefined) {
      // Only if partial.
      this.entityType ??= null;
    } else {
      this.entityType = GuildScheduledEventEntityTypes[data.entity_type];
    }

    if (data.entity_id === undefined) {
      this.entityId ??= null;
    } else {
      this.entityId = data.entity_id;
    }

    if (data.user_count === undefined) {
      this.userCount ??= null;
    } else {
      this.userCount = data.user_count;
    }

    if (data.creator === undefined) {
      this.creator ??= this.client.users.resolve(this.creatorId);
    } else {
      this.creator = this.client.users._add(data.creator);
    }

    /* eslint-disable max-len */
    /* eslint-enable max-len */

    if (data.entity_metadata === undefined) {
      this.entityMetadata ??= null;
    } else {
      if (data.entity_metadata) {
        this.entityMetadata = {
          location:
            data.entity_metadata.location ??
            this.entityMetadata?.location ??
            null,
        };
      } else {
        this.entityMetadata = null;
      }
    }

    if (data.image === undefined) {
      this.image ??= null;
    } else {
      this.image = data.image;
    }

    if (data.recurrence_rule === undefined) {
      this.recurrenceRule ??= null;
    } else {
      this.recurrenceRule = data.recurrence_rule && {
        startTimestamp: Date.parse(data.recurrence_rule.start),
        get startAt() {
          return new Date(this.startTimestamp);
        },
        endTimestamp: data.recurrence_rule.end
          ? Date.parse(data.recurrence_rule.end)
          : null,
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
    }
  }

  coverImageURL({ format = "webp", size }: StaticImageURLOptions = {}) {
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
      throw new Error("GUILD_NOT_FOUND");
    }
    return guild.scheduledEvents.fetch({ force, guildScheduledEvent: this.id });
  }

  async createInviteURL(options?: CreateGuildScheduledEventInviteURLOptions) {
    const { guild } = this;
    if (!guild) {
      throw new Error("GUILD_NOT_FOUND");
    }
    let { channelId } = this;
    if (this.entityType === "EXTERNAL") {
      if (!options?.channel) {
        throw new Error("INVITE_OPTIONS_MISSING_CHANNEL");
      }
      channelId = guild.channels.resolveId(options.channel);
      if (!channelId) {
        throw new Error("GUILD_CHANNEL_RESOLVE");
      }
    }
    if (!channelId) {
      throw new Error("GUILD_CHANNEL_RESOLVE");
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
      throw new Error("GUILD_NOT_FOUND");
    }
    return guild.scheduledEvents.edit(this.id, options);
  }

  async delete() {
    const { guild } = this;
    if (!guild) {
      throw new Error("GUILD_NOT_FOUND");
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

  // TODO: scheduledEndTime gets reset on passing null but it hasn't been documented
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
      throw new Error("GUILD_NOT_FOUND");
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
