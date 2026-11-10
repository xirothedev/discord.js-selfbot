import process from "node:process";
import { Collection } from "@discordjs/collection";
import CachedManager from "./CachedManager";
import _errorsModule from "../errors";

const { Error, TypeError } = _errorsModule;
import GuildChannel from "../structures/GuildChannel";
import PermissionOverwrites from "../structures/PermissionOverwrites";
import ThreadChannel from "../structures/ThreadChannel";
import Webhook from "../structures/Webhook";
import ChannelFlags from "../util/ChannelFlags";
import _ConstantsModule, { resolveEnumValue } from "../util/Constants";

const {
  ThreadChannelTypes,
  ChannelTypes,
  VideoQualityModes,
  SortOrderTypes,
  ForumLayoutTypes,
} = _ConstantsModule;
import DataResolver from "../util/DataResolver";
import Util from "../util/Util";

const {
  resolveAutoArchiveMaxLimit,
  transformGuildForumTag,
  transformGuildDefaultReaction,
} = Util;
import type {
  GatewayChannelCreateDispatchData,
  GatewayChannelUpdateDispatchData,
  RESTPostAPIChannelFollowersResult,
  RESTPostAPIChannelWebhookResult,
  Snowflake,
} from "discord-api-types/v10";
import type {
  RawGuildChannelData,
  RawWebhookData,
} from "../../typings/rawDataTypes";
import type {
  BaseFetchOptions,
  CategoryChannelResolvable,
  ChannelData,
  ChannelFlagsResolvable,
  ChannelWebhookCreateOptions,
  DefaultReactionEmoji,
  GuildChannelCreateOptions,
  GuildChannelResolvable,
  OverwriteResolvable,
  SetChannelPositionOptions,
  ThreadAutoArchiveDuration,
  VideoQualityMode,
} from "../../typings";
import type { BitFieldResolvable } from "../util/BitField";
import type CategoryChannel from "../structures/CategoryChannel";
import type { Guild } from "../structures/Guild";
import type PermissionOverwritesType from "../structures/PermissionOverwrites";

type GuildChannelResolvableSource =
  | GuildChannel
  | ThreadChannel
  | GuildChannelResolvable
  | null
  | undefined;
type CategoryChannelResolvableSource =
  | CategoryChannel
  | CategoryChannelResolvable;

interface OverwriteDataSource {
  id: unknown;
  type?: string | number;
  allow?: unknown;
  deny?: unknown;
}

type OverwriteResolvableSource = PermissionOverwritesType | OverwriteDataSource;
type ResolvedOverwrite = ReturnType<typeof PermissionOverwrites.resolve>;

export type ChannelDataSource =
  | ChannelData
  | (Omit<
      ChannelData,
      | "parent"
      | "permissionOverwrites"
      | "flags"
      | "type"
      | "topic"
      | "videoQualityMode"
    > & {
      parent?: CategoryChannelResolvableSource | null;
      permissionOverwrites?:
        | readonly OverwriteResolvableSource[]
        | Collection<Snowflake, OverwriteResolvableSource>;
      flags?: BitFieldResolvable | ChannelFlagsResolvable;
      type?: string | number;
      topic?: string | null;
      videoQualityMode?: VideoQualityMode | number | null;
    });

type GuildChannelCreateOptionsSource = Omit<
  GuildChannelCreateOptions,
  | "parent"
  | "permissionOverwrites"
  | "type"
  | "reason"
  | "rateLimitPerUser"
  | "topic"
  | "rtcRegion"
> & {
  parent?: CategoryChannelResolvableSource | null;
  permissionOverwrites?:
    | readonly OverwriteResolvableSource[]
    | Collection<Snowflake, OverwriteResolvableSource>
    | readonly OverwriteResolvable[]
    | Collection<Snowflake, OverwriteResolvable>;
  type?: string | number;
  reason?: string | null;
  rateLimitPerUser?: number | null;
  topic?: string | null;
  rtcRegion?: string | null;
  defaultSortOrder?: string | number | null;
  defaultForumLayout?: string | number;
  defaultReactionEmoji?: DefaultReactionEmoji;
};

interface ChannelPositionSource {
  channel: GuildChannelResolvableSource;
  position?: number;
  parent?: CategoryChannelResolvableSource | null;
  lockPermissions?: boolean;
}

let cacheWarningEmitted = false;
let storeChannelDeprecationEmitted = false;

class GuildChannelManager extends CachedManager<GuildChannel> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<GuildChannel>) {
    super(guild.client, GuildChannel, iterable);
    const defaultCaching =
      this._cache.constructor.name === "Collection" ||
      ((this._cache.maxSize === undefined ||
        this._cache.maxSize === Infinity) &&
        (this._cache.sweepFilter === undefined ||
          this._cache.sweepFilter.isDefault));
    if (!cacheWarningEmitted && !defaultCaching) {
      cacheWarningEmitted = true;
      process.emitWarning(
        `Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
        "UnsupportedCacheOverwriteWarning"
      );
    }

    this.guild = guild;
  }

  get channelCountWithoutThreads() {
    let count = 0;
    for (const channel of this.cache.values()) {
      if (!ThreadChannelTypes.includes(channel.type)) {
        count++;
      }
    }
    return count;
  }

  _add(channel: GuildChannel): GuildChannel {
    const existing = this.cache.get(channel.id);
    if (existing) {
      return existing;
    }
    this.cache.set(channel.id, channel);
    return channel;
  }

  resolve(channel: GuildChannelResolvableSource): GuildChannel | null {
    if (channel instanceof ThreadChannel) {
      return this.cache.get(channel.id) ?? null;
    }
    return super.resolve(channel);
  }

  resolveId(channel: GuildChannelResolvableSource): string | null {
    if (channel instanceof ThreadChannel) {
      return super.resolveId(channel.id);
    }
    return super.resolveId(channel);
  }

  async create<Result extends GuildChannel = GuildChannel>(
    name: string,
    {
      type,
      topic,
      nsfw,
      bitrate,
      userLimit,
      parent,
      permissionOverwrites,
      position,
      rateLimitPerUser,
      rtcRegion,
      videoQualityMode,
      availableTags,
      defaultReactionEmoji,
      defaultSortOrder,
      defaultForumLayout,
      defaultThreadRateLimitPerUser,
      reason,
    }: GuildChannelCreateOptionsSource = {}
  ): Promise<Result> {
    const parentId = parent
      ? this.client.channels.resolveId(parent)
      : undefined;
    const resolvedOverwrites = permissionOverwrites
      ? (permissionOverwrites instanceof Collection
          ? [...permissionOverwrites.values()]
          : permissionOverwrites
        ).map((overwrite) =>
          PermissionOverwrites.resolve(overwrite, this.guild)
        )
      : undefined;
    let intType: number;
    if (typeof type === "number") {
      intType = type;
    } else if (type) {
      intType = resolveEnumValue(ChannelTypes, type) ?? ChannelTypes.GUILD_TEXT;
    } else {
      intType = ChannelTypes.GUILD_TEXT;
    }

    const videoMode = resolveEnumValue(VideoQualityModes, videoQualityMode);

    const sortMode = resolveEnumValue(SortOrderTypes, defaultSortOrder);

    const layoutMode = resolveEnumValue(ForumLayoutTypes, defaultForumLayout);

    if (
      intType === ChannelTypes.GUILD_STORE &&
      !storeChannelDeprecationEmitted
    ) {
      storeChannelDeprecationEmitted = true;
      process.emitWarning(
        "Creating store channels is deprecated by Discord and will stop working in March 2022. Check the docs for more info.",
        "DeprecationWarning"
      );
    }

    const data = await this.client.api
      .guilds(this.guild.id)
      .channels.post<GatewayChannelCreateDispatchData>({
        data: {
          available_tags: availableTags?.map((availableTag) =>
            transformGuildForumTag(availableTag)
          ),
          bitrate,
          default_forum_layout: layoutMode,
          default_reaction_emoji:
            defaultReactionEmoji &&
            transformGuildDefaultReaction(defaultReactionEmoji),
          default_sort_order: sortMode,
          default_thread_rate_limit_per_user: defaultThreadRateLimitPerUser,
          name,
          nsfw,
          parent_id: parentId,
          permission_overwrites: resolvedOverwrites,
          position,
          rate_limit_per_user: rateLimitPerUser,
          rtc_region: rtcRegion,
          topic,
          type: intType,
          user_limit: userLimit,
          video_quality_mode: videoMode,
        },
        reason,
      });
    const { channel } = this.client.actions.ChannelCreate.handle(data);
    if (!(channel instanceof GuildChannel)) {
      throw new TypeError("INVALID_TYPE", "channel", "GuildChannel");
    }
    return channel as Result;
  }

  async createWebhook(
    channel: GuildChannelResolvableSource,
    name: string,
    { avatar, reason }: ChannelWebhookCreateOptions = {}
  ): Promise<Webhook> {
    const id = this.resolveId(channel);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "channel", "GuildChannelResolvable");
    }

    const resolvedImage = await DataResolver.resolveImage(avatar);

    const data = await this.client.api.channels[
      id
    ].webhooks.post<RESTPostAPIChannelWebhookResult>({
      data: {
        avatar: resolvedImage,
        name,
      },
      reason,
    });
    return new Webhook(this.client, data);
  }

  async addFollower(
    channel: GuildChannelResolvableSource,
    targetChannel: GuildChannelResolvableSource,
    reason?: string
  ): Promise<Snowflake> {
    const channelId = this.resolveId(channel);
    const targetChannelId = this.resolveId(targetChannel);
    if (!channelId || !targetChannelId) {
      throw new Error("GUILD_CHANNEL_RESOLVE");
    }
    const { webhook_id } = await this.client.api.channels[
      channelId
    ].followers.post<RESTPostAPIChannelFollowersResult>({
      data: { webhook_channel_id: targetChannelId },
      reason,
    });
    return webhook_id;
  }

  async edit<Result extends GuildChannel = GuildChannel>(
    channel: GuildChannelResolvableSource,
    data: ChannelDataSource,
    reason?: string
  ): Promise<Result> {
    const resolved = this.resolve(channel);
    if (!resolved) {
      throw new TypeError("INVALID_TYPE", "channel", "GuildChannelResolvable");
    }

    const parentId = data.parent && this.client.channels.resolveId(data.parent);

    if (data.position !== undefined) {
      await this.setPosition(resolved, data.position, { reason });
    }

    const permission_overwrites = this.resolveEditOverwrites(
      data,
      parentId ?? undefined,
      resolved
    );

    let defaultAutoArchiveDuration:
      | ThreadAutoArchiveDuration
      | "MAX"
      | number
      | undefined = data.defaultAutoArchiveDuration;
    if (defaultAutoArchiveDuration === "MAX") {
      defaultAutoArchiveDuration = resolveAutoArchiveMaxLimit(this.guild);
    }

    let resolvedRtcRegion: unknown;
    if ("rtcRegion" in data) {
      resolvedRtcRegion = data.rtcRegion;
    } else if ("rtcRegion" in resolved) {
      resolvedRtcRegion = resolved.rtcRegion;
    }

    const newData = await this.client.api
      .channels(resolved.id)
      .patch<GatewayChannelUpdateDispatchData>({
        data: {
          available_tags: data.availableTags?.map((availableTag) =>
            transformGuildForumTag(availableTag)
          ),
          bitrate: data.bitrate ?? resolved.bitrate,
          default_auto_archive_duration: defaultAutoArchiveDuration,
          default_reaction_emoji:
            data.defaultReactionEmoji &&
            transformGuildDefaultReaction(data.defaultReactionEmoji),
          default_sort_order: resolveEnumValue(
            SortOrderTypes,
            data.defaultSortOrder
          ),
          default_thread_rate_limit_per_user:
            data.defaultThreadRateLimitPerUser,
          flags: "flags" in data ? ChannelFlags.resolve(data.flags) : undefined,
          lock_permissions: data.lockPermissions,
          name: (data.name ?? resolved.name).trim(),
          nsfw: data.nsfw,
          parent_id: parentId,
          permission_overwrites,
          rate_limit_per_user: data.rateLimitPerUser,
          rtc_region: resolvedRtcRegion,
          topic: data.topic,
          type: data.type,
          user_limit: data.userLimit ?? resolved.userLimit,
          video_quality_mode: resolveEnumValue(
            VideoQualityModes,
            data.videoQualityMode
          ),
        },
        reason,
      });

    const { updated } = this.client.actions.ChannelUpdate.handle(newData);
    if (!(updated instanceof GuildChannel)) {
      throw new TypeError("INVALID_TYPE", "channel", "GuildChannel");
    }
    return updated as Result;
  }

  private resolveEditOverwrites(
    data: ChannelDataSource,
    parentId: string | undefined,
    resolved: GuildChannel
  ): ResolvedOverwrite[] | undefined {
    let permissionOverwrites = data.permissionOverwrites
      ? (data.permissionOverwrites instanceof Collection
          ? [...data.permissionOverwrites.values()]
          : data.permissionOverwrites
        ).map((overwrite) =>
          PermissionOverwrites.resolve(overwrite, this.guild)
        )
      : undefined;

    if (!data.lockPermissions) {
      return permissionOverwrites;
    }
    if (parentId) {
      const newParent = this.cache.get(parentId);
      if (newParent?.type === "GUILD_CATEGORY") {
        permissionOverwrites = newParent.permissionOverwrites.cache.map(
          (overwrite) => PermissionOverwrites.resolve(overwrite, this.guild)
        );
      }
    } else if (resolved.parent) {
      permissionOverwrites = resolved.parent.permissionOverwrites.cache.map(
        (overwrite) => PermissionOverwrites.resolve(overwrite, this.guild)
      );
    }
    return permissionOverwrites;
  }

  async setPosition(
    channel: GuildChannelResolvableSource,
    position: number,
    { relative, reason }: SetChannelPositionOptions = {}
  ): Promise<GuildChannel> {
    const resolved = this.resolve(channel);
    if (!resolved) {
      throw new TypeError("INVALID_TYPE", "channel", "GuildChannelResolvable");
    }
    const updatedChannels = await Util.setPosition(
      resolved,
      position,
      Boolean(relative),
      this.guild._sortedChannels(resolved),
      this.client.api.guilds(this.guild.id).channels,
      reason
    );

    this.client.actions.GuildChannelsPositionUpdate.handle({
      channels: updatedChannels,
      guild_id: this.guild.id,
    });
    return this.cache.get(resolved.id) ?? resolved;
  }

  async fetch(
    id: Snowflake,
    options?: BaseFetchOptions
  ): Promise<GuildChannel | null>;
  async fetch(
    id?: undefined,
    options?: BaseFetchOptions
  ): Promise<Collection<Snowflake, GuildChannel>>;
  async fetch(
    id?: Snowflake,
    { cache = true, force = false }: BaseFetchOptions = {}
  ): Promise<GuildChannel | Collection<Snowflake, GuildChannel> | null> {
    if (id && !force) {
      const existing = this.cache.get(id);
      if (existing) {
        return existing;
      }
    }

    if (id) {
      const data: RawGuildChannelData = await this.client.api
        .channels(id)
        .get();
      // Since this is the guild manager, throw if on a different guild
      if ("guild_id" in data && this.guild.id !== data.guild_id) {
        throw new Error("GUILD_CHANNEL_UNOWNED");
      }
      const channel = this.client.channels._add(data, this.guild, { cache });
      return channel instanceof GuildChannel ? channel : null;
    }

    const data: RawGuildChannelData[] = await this.client.api
      .guilds(this.guild.id)
      .channels.get();
    const channels = new Collection<Snowflake, GuildChannel>();
    for (const rawChannel of data) {
      const channel = this.client.channels._add(rawChannel, this.guild, {
        cache,
      });
      if (channel instanceof GuildChannel) {
        channels.set(channel.id, channel);
      }
    }
    return channels;
  }

  async fetchWebhooks(
    channel: GuildChannelResolvableSource
  ): Promise<Collection<Snowflake, Webhook>> {
    const id = this.resolveId(channel);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "channel", "GuildChannelResolvable");
    }
    const data: RawWebhookData[] =
      await this.client.api.channels[id].webhooks.get();
    const hooks = new Collection<Snowflake, Webhook>();
    for (const hook of data) {
      hooks.set(hook.id, new Webhook(this.client, hook));
    }
    return hooks;
  }

  async setPositions(channelPositions: readonly ChannelPositionSource[]) {
    const positions = channelPositions.map((positionSource) => ({
      id: this.client.channels.resolveId(positionSource.channel),
      lock_permissions: positionSource.lockPermissions,
      parent_id:
        positionSource.parent === undefined
          ? undefined
          : this.resolveId(positionSource.parent),
      position: positionSource.position,
    }));

    await this.client.api
      .guilds(this.guild.id)
      .channels.patch({ data: positions });
    return this.client.actions.GuildChannelsPositionUpdate.handle({
      channels: positions,
      guild_id: this.guild.id,
    }).guild;
  }

  async delete(
    channel: GuildChannelResolvableSource,
    reason?: string
  ): Promise<void> {
    const id = this.resolveId(channel);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "channel", "GuildChannelResolvable");
    }
    await this.client.api.channels(id).delete({ reason });
  }
}

export default GuildChannelManager;
export { GuildChannelManager };
