import CachedManager from "./CachedManager";
import _errorsModule from "../errors";

const { TypeError, Error } = _errorsModule;
import _StageInstanceModule from "../structures/StageInstance";

const { StageInstance } = _StageInstanceModule;
import _ConstantsModule from "../util/Constants";

const { PrivacyLevels } = _ConstantsModule;
import type { RawStageInstanceData } from "../../typings/rawDataTypes";
import type {
  BaseFetchOptions,
  StageChannelResolvable,
  StageInstanceCreateOptions,
  StageInstanceEditOptions,
} from "../../typings";
import type { Guild } from "../structures/Guild";
import type { StageChannel } from "../structures/StageChannel";
import type { StageInstance as StageInstanceType } from "../structures/StageInstance";

type StageChannelResolvableSource = StageChannel | StageChannelResolvable;

class StageInstanceManager extends CachedManager<StageInstanceType> {
  declare guild: Guild;
  constructor(
    guild: Guild,
    iterable?: Iterable<InstanceType<typeof StageInstance>>
  ) {
    super(guild.client, StageInstance, iterable);

    this.guild = guild;
  }

  async create(
    channel: StageChannelResolvableSource,
    options: StageInstanceCreateOptions
  ): Promise<InstanceType<typeof StageInstance>> {
    const channelId = this.guild.channels.resolveId(channel);
    if (!channelId) {
      throw new Error("STAGE_CHANNEL_RESOLVE");
    }
    if (typeof options !== "object") {
      throw new TypeError("INVALID_TYPE", "options", "object", true);
    }
    let { privacyLevel } = options;
    const { guildScheduledEvent, topic, sendStartNotification } = options;

    privacyLevel &&=
      typeof privacyLevel === "number"
        ? privacyLevel
        : PrivacyLevels[privacyLevel];
    const guildScheduledEventId =
      guildScheduledEvent && this.resolveId(guildScheduledEvent);

    const data: RawStageInstanceData = await this.client.api[
      "stage-instances"
    ].post({
      data: {
        channel_id: channelId,
        guild_scheduled_event_id: guildScheduledEventId,
        privacy_level: privacyLevel,
        send_start_notification: sendStartNotification,
        topic,
      },
    });

    return this._add(data);
  }

  async fetch(
    channel: StageChannelResolvableSource,
    { cache = true, force = false }: BaseFetchOptions = {}
  ): Promise<InstanceType<typeof StageInstance>> {
    const channelId = this.guild.channels.resolveId(channel);
    if (!channelId) {
      throw new Error("STAGE_CHANNEL_RESOLVE");
    }

    if (!force) {
      const existing = this.cache.find(
        (stageInstance) => stageInstance.channelId === channelId
      );
      if (existing) {
        return existing;
      }
    }

    const data: RawStageInstanceData = await this.client
      .api("stage-instances", channelId)
      .get();
    return this._add(data, cache);
  }

  async edit(
    channel: StageChannelResolvableSource,
    options: StageInstanceEditOptions
  ): Promise<InstanceType<typeof StageInstance>> {
    if (typeof options !== "object") {
      throw new TypeError("INVALID_TYPE", "options", "object", true);
    }
    const channelId = this.guild.channels.resolveId(channel);
    if (!channelId) {
      throw new Error("STAGE_CHANNEL_RESOLVE");
    }

    let { privacyLevel } = options;
    const { topic } = options;

    privacyLevel &&=
      typeof privacyLevel === "number"
        ? privacyLevel
        : PrivacyLevels[privacyLevel];

    const data: RawStageInstanceData = await this.client
      .api("stage-instances", channelId)
      .patch({
        data: {
          privacy_level: privacyLevel,
          topic,
        },
      });

    const existing = this.cache.get(data.id);
    if (existing) {
      const clone = existing._clone();
      clone._patch(data);
      return clone;
    }

    return this._add(data);
  }

  async delete(channel: StageChannelResolvableSource): Promise<void> {
    const channelId = this.guild.channels.resolveId(channel);
    if (!channelId) {
      throw new Error("STAGE_CHANNEL_RESOLVE");
    }

    await this.client.api("stage-instances", channelId).delete();
  }
}

export default StageInstanceManager;
export { StageInstanceManager };
