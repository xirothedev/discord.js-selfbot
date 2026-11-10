import process from 'node:process';
import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { Error, TypeError } = _errorsModule;
import GuildChannel from '../structures/GuildChannel';
import PermissionOverwrites from '../structures/PermissionOverwrites';
import ThreadChannel from '../structures/ThreadChannel';
import Webhook from '../structures/Webhook';
import ChannelFlags from '../util/ChannelFlags';
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';
const { ThreadChannelTypes, ChannelTypes, VideoQualityModes, SortOrderTypes, ForumLayoutTypes } = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import Util from '../util/Util';
import _UtilModule from '../util/Util';
const { resolveAutoArchiveMaxLimit, transformGuildForumTag, transformGuildDefaultReaction } = _UtilModule;
import type { Snowflake } from 'discord-api-types/v10';
import type { RawGuildChannelData, RawWebhookData } from '../../typings/rawDataTypes';
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
} from '../../typings';
import type { BitFieldResolvable } from '../util/BitField';
import type CategoryChannel from '../structures/CategoryChannel';
import type { Guild } from '../structures/Guild';
import type PermissionOverwritesType from '../structures/PermissionOverwrites';

type GuildChannelResolvableSource = GuildChannel | ThreadChannel | GuildChannelResolvable | null | undefined;
type CategoryChannelResolvableSource = CategoryChannel | CategoryChannelResolvable;

interface OverwriteDataSource {
  id: unknown;
  type?: string | number;
  allow?: unknown;
  deny?: unknown;
}

type OverwriteResolvableSource = PermissionOverwritesType | OverwriteDataSource;

export type ChannelDataSource =
  | ChannelData
  | (Omit<ChannelData, 'parent' | 'permissionOverwrites' | 'flags' | 'type' | 'topic' | 'videoQualityMode'> & {
      parent?: CategoryChannelResolvableSource | null;
      permissionOverwrites?: readonly OverwriteResolvableSource[] | Collection<Snowflake, OverwriteResolvableSource>;
      flags?: BitFieldResolvable | ChannelFlagsResolvable;
      type?: string | number;
      topic?: string | null;
      videoQualityMode?: VideoQualityMode | number | null;
    });

type GuildChannelCreateOptionsSource = Omit<
  GuildChannelCreateOptions,
  'parent' | 'permissionOverwrites' | 'type' | 'reason' | 'rateLimitPerUser' | 'topic' | 'rtcRegion'
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

/**
 * Manages API methods for GuildChannels and stores their cache.
 * @extends {CachedManager}
 */
class GuildChannelManager extends CachedManager<GuildChannel> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<GuildChannel>) {
    super(guild.client, GuildChannel, iterable);
    const defaultCaching =
      this._cache.constructor.name === 'Collection' ||
      ((this._cache.maxSize === undefined || this._cache.maxSize === Infinity) &&
        (this._cache.sweepFilter === undefined || this._cache.sweepFilter.isDefault));
    if (!cacheWarningEmitted && !defaultCaching) {
      cacheWarningEmitted = true;
      process.emitWarning(
        `Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
        'UnsupportedCacheOverwriteWarning',
      );
    }

    /**
     * The guild this Manager belongs to
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The number of channels in this managers cache excluding thread channels
   * that do not count towards a guild's maximum channels restriction.
   * @type {number}
   * @readonly
   */
  get channelCountWithoutThreads() {
    return this.cache.reduce((acc, channel) => {
      if (ThreadChannelTypes.includes(channel.type)) return acc;
      return acc + 1;
    }, 0);
  }

  /**
   * The cache of this Manager
   * @type {Collection<Snowflake, GuildChannel|ThreadChannel>}
   * @name GuildChannelManager#cache
   */

  _add(channel: GuildChannel): GuildChannel {
    const existing = this.cache.get(channel.id);
    if (existing) return existing;
    this.cache.set(channel.id, channel);
    return channel;
  }

  /**
   * Data that can be resolved to give a Guild Channel object. This can be:
   * * A GuildChannel object
   * * A ThreadChannel object
   * * A Snowflake
   * @typedef {GuildChannel|ThreadChannel|Snowflake} GuildChannelResolvable
   */

  /**
   * Resolves a GuildChannelResolvable to a Channel object.
   * @param {GuildChannelResolvable} channel The GuildChannel resolvable to resolve
   * @returns {?(GuildChannel|ThreadChannel)}
   */
  resolve(channel: GuildChannelResolvableSource): GuildChannel | null {
    if (channel instanceof ThreadChannel) return this.cache.get(channel.id) ?? null;
    return super.resolve(channel);
  }

  /**
   * Resolves a GuildChannelResolvable to a channel id.
   * @param {GuildChannelResolvable} channel The GuildChannel resolvable to resolve
   * @returns {?Snowflake}
   */
  resolveId(channel: GuildChannelResolvableSource): string | null {
    if (channel instanceof ThreadChannel) return super.resolveId(channel.id);
    return super.resolveId(channel);
  }

  /**
   * Options used to create a new channel in a guild.
   * @typedef {CategoryCreateChannelOptions} GuildChannelCreateOptions
   * @property {CategoryChannelResolvable} [parent] Parent of the new channel
   */

  /**
   * Creates a new channel in the guild.
   * @param {string} name The name of the new channel
   * @param {GuildChannelCreateOptions} [options={}] Options for creating the new channel
   * @returns {Promise<GuildChannel>}
   * @example
   * // Create a new text channel
   * guild.channels.create('new-general', { reason: 'Needed a cool new channel' })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Create a new channel with permission overwrites
   * guild.channels.create('new-voice', {
   *   type: 'GUILD_VOICE',
   *   permissionOverwrites: [
   *      {
   *        id: message.author.id,
   *        deny: [Permissions.FLAGS.VIEW_CHANNEL],
   *     },
   *   ],
   * })
   */
  async create<T extends GuildChannel = GuildChannel>(
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
    }: GuildChannelCreateOptionsSource = {},
  ): Promise<T> {
    const parentId = parent ? this.client.channels.resolveId(parent) : undefined;
    const resolvedOverwrites = permissionOverwrites
      ? (permissionOverwrites instanceof Collection ? [...permissionOverwrites.values()] : permissionOverwrites).map(
          o => PermissionOverwrites.resolve(o, this.guild),
        )
      : undefined;
    const intType =
      typeof type === 'number'
        ? type
        : type
          ? (resolveEnumValue(ChannelTypes, type) ?? ChannelTypes.GUILD_TEXT)
          : ChannelTypes.GUILD_TEXT;

    const videoMode = resolveEnumValue(VideoQualityModes, videoQualityMode);

    const sortMode = resolveEnumValue(SortOrderTypes, defaultSortOrder);

    const layoutMode = resolveEnumValue(ForumLayoutTypes, defaultForumLayout);

    if (intType === ChannelTypes.GUILD_STORE && !storeChannelDeprecationEmitted) {
      storeChannelDeprecationEmitted = true;
      process.emitWarning(
        // eslint-disable-next-line max-len
        'Creating store channels is deprecated by Discord and will stop working in March 2022. Check the docs for more info.',
        'DeprecationWarning',
      );
    }

    const data = await this.client.api.guilds(this.guild.id).channels.post({
      data: {
        name,
        topic,
        type: intType,
        nsfw,
        bitrate,
        user_limit: userLimit,
        parent_id: parentId,
        position,
        permission_overwrites: resolvedOverwrites,
        rate_limit_per_user: rateLimitPerUser,
        rtc_region: rtcRegion,
        video_quality_mode: videoMode,
        available_tags: availableTags?.map(availableTag => transformGuildForumTag(availableTag)),
        default_reaction_emoji: defaultReactionEmoji && transformGuildDefaultReaction(defaultReactionEmoji),
        default_sort_order: sortMode,
        default_forum_layout: layoutMode,
        default_thread_rate_limit_per_user: defaultThreadRateLimitPerUser,
      },
      reason,
    });
    const channel = this.client.actions.ChannelCreate.handle(data).channel;
    if (!(channel instanceof GuildChannel)) throw new TypeError('INVALID_TYPE', 'channel', 'GuildChannel');
    return channel as T;
  }

  /**
   * Creates a webhook for the channel.
   * @param {GuildChannelResolvable} channel The channel to create the webhook for
   * @param {string} name The name of the webhook
   * @param {ChannelWebhookCreateOptions} [options] Options for creating the webhook
   * @returns {Promise<Webhook>} Returns the created Webhook
   * @example
   * // Create a webhook for the current channel
   * guild.channels.createWebhook('222197033908436994', 'Snek', {
   *   avatar: 'https://i.imgur.com/mI8XcpG.jpg',
   *   reason: 'Needed a cool new Webhook'
   * })
   *   .then(console.log)
   *   .catch(console.error)
   */
  async createWebhook(
    channel: GuildChannelResolvableSource,
    name: string,
    { avatar, reason }: ChannelWebhookCreateOptions = {},
  ): Promise<Webhook> {
    const id = this.resolveId(channel);
    if (!id) throw new TypeError('INVALID_TYPE', 'channel', 'GuildChannelResolvable');

    const resolvedImage = await DataResolver.resolveImage(avatar);

    const data = await this.client.api.channels[id].webhooks.post({
      data: {
        name,
        avatar: resolvedImage,
      },
      reason,
    });
    return new Webhook(this.client, data);
  }

  /**
   * Adds the target channel to a channel's followers.
   * @param {NewsChannel|Snowflake} channel The channel to follow
   * @param {TextChannelResolvable} targetChannel The channel where published announcements will be posted at
   * @param {string} [reason] Reason for creating the webhook
   * @returns {Promise<Snowflake>} Returns created target webhook id.
   */
  async addFollower(
    channel: GuildChannelResolvableSource,
    targetChannel: GuildChannelResolvableSource,
    reason?: string,
  ): Promise<Snowflake> {
    const channelId = this.resolveId(channel);
    const targetChannelId = this.resolveId(targetChannel);
    if (!channelId || !targetChannelId) throw new Error('GUILD_CHANNEL_RESOLVE');
    const { webhook_id } = await this.client.api.channels[channelId].followers.post({
      data: { webhook_channel_id: targetChannelId },
      reason,
    });
    return webhook_id;
  }

  /**
   * The data for a guild channel.
   * @typedef {Object} ChannelData
   * @property {string} [name] The name of the channel
   * @property {ChannelType} [type] The type of the channel (only conversion between text and news is supported)
   * @property {number} [position] The position of the channel
   * @property {string} [topic] The topic of the text channel
   * @property {boolean} [nsfw] Whether the channel is NSFW
   * @property {number} [bitrate] The bitrate of the voice channel
   * @property {number} [userLimit] The user limit of the voice channel
   * @property {?CategoryChannelResolvable} [parent] The parent of the channel
   * @property {boolean} [lockPermissions]
   * Lock the permissions of the channel to what the parent's permissions are
   * @property {OverwriteResolvable[]|Collection<Snowflake, OverwriteResolvable>} [permissionOverwrites]
   * Permission overwrites for the channel
   * @property {number} [rateLimitPerUser] The rate limit per user (slowmode) for the channel in seconds
   * @property {ThreadAutoArchiveDuration} [defaultAutoArchiveDuration]
   * The default auto archive duration for all new threads in this channel
   * @property {?string} [rtcRegion] The RTC region of the channel
   * @property {?VideoQualityMode|number} [videoQualityMode] The camera video quality mode of the channel
   * @property {ChannelFlagsResolvable} [flags] The flags to set on the channel
   * @property {GuildForumTagData[]} [availableTags] The tags to set as available in a forum channel
   * @property {?DefaultReactionEmoji} [defaultReactionEmoji] The emoji to set as the default reaction emoji
   * @property {number} [defaultThreadRateLimitPerUser] The rate limit per user (slowmode) to set on forum posts
   * @property {?SortOrderType} [defaultSortOrder] The default sort order mode to set on the channel
   */

  /**
   * Edits the channel.
   * @param {GuildChannelResolvable} channel The channel to edit
   * @param {ChannelData} data The new data for the channel
   * @param {string} [reason] Reason for editing this channel
   * @returns {Promise<GuildChannel>}
   * @example
   * // Edit a channel
   * guild.channels.edit('222197033908436994', { name: 'new-channel' })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async edit<T extends GuildChannel = GuildChannel>(
    channel: GuildChannelResolvableSource,
    data: ChannelDataSource,
    reason?: string,
  ): Promise<T> {
    const resolved = this.resolve(channel);
    if (!resolved) throw new TypeError('INVALID_TYPE', 'channel', 'GuildChannelResolvable');

    const parentId = data.parent && this.client.channels.resolveId(data.parent);

    if (typeof data.position !== 'undefined') await this.setPosition(resolved, data.position, { reason });

    let permission_overwrites = data.permissionOverwrites
      ? (data.permissionOverwrites instanceof Collection
          ? [...data.permissionOverwrites.values()]
          : data.permissionOverwrites
        ).map(o => PermissionOverwrites.resolve(o, this.guild))
      : undefined;

    if (data.lockPermissions) {
      if (parentId) {
        const newParent = this.cache.get(parentId);
        if (newParent?.type === 'GUILD_CATEGORY') {
          permission_overwrites = newParent.permissionOverwrites.cache.map(o =>
            PermissionOverwrites.resolve(o, this.guild),
          );
        }
      } else if (resolved.parent) {
        permission_overwrites = resolved.parent.permissionOverwrites.cache.map(o =>
          PermissionOverwrites.resolve(o, this.guild),
        );
      }
    }

    let defaultAutoArchiveDuration: ThreadAutoArchiveDuration | 'MAX' | number | undefined =
      data.defaultAutoArchiveDuration;
    if (defaultAutoArchiveDuration === 'MAX') defaultAutoArchiveDuration = resolveAutoArchiveMaxLimit(this.guild);

    const newData = await this.client.api.channels(resolved.id).patch({
      data: {
        name: (data.name ?? resolved.name).trim(),
        type: data.type,
        topic: data.topic,
        nsfw: data.nsfw,
        bitrate: data.bitrate ?? resolved.bitrate,
        user_limit: data.userLimit ?? resolved.userLimit,
        rtc_region: 'rtcRegion' in data ? data.rtcRegion : 'rtcRegion' in resolved ? resolved.rtcRegion : undefined,
        video_quality_mode: resolveEnumValue(VideoQualityModes, data.videoQualityMode),
        parent_id: parentId,
        lock_permissions: data.lockPermissions,
        rate_limit_per_user: data.rateLimitPerUser,
        default_auto_archive_duration: defaultAutoArchiveDuration,
        permission_overwrites,
        available_tags: data.availableTags?.map(availableTag => transformGuildForumTag(availableTag)),
        default_reaction_emoji: data.defaultReactionEmoji && transformGuildDefaultReaction(data.defaultReactionEmoji),
        default_thread_rate_limit_per_user: data.defaultThreadRateLimitPerUser,
        flags: 'flags' in data ? ChannelFlags.resolve(data.flags) : undefined,
        default_sort_order: resolveEnumValue(SortOrderTypes, data.defaultSortOrder),
      },
      reason,
    });

    const updated = this.client.actions.ChannelUpdate.handle(newData).updated;
    if (!(updated instanceof GuildChannel)) throw new TypeError('INVALID_TYPE', 'channel', 'GuildChannel');
    return updated as T;
  }

  /**
   * Sets a new position for the guild channel.
   * @param {GuildChannelResolvable} channel The channel to set the position for
   * @param {number} position The new position for the guild channel
   * @param {SetChannelPositionOptions} [options] Options for setting position
   * @returns {Promise<GuildChannel>}
   * @example
   * // Set a new channel position
   * guild.channels.setPosition('222078374472843266', 2)
   *   .then(newChannel => console.log(`Channel's new position is ${newChannel.position}`))
   *   .catch(console.error);
   */
  async setPosition(
    channel: GuildChannelResolvableSource,
    position: number,
    { relative, reason }: SetChannelPositionOptions = {},
  ): Promise<GuildChannel> {
    const resolved = this.resolve(channel);
    if (!resolved) throw new TypeError('INVALID_TYPE', 'channel', 'GuildChannelResolvable');
    const updatedChannels = await Util.setPosition(
      resolved,
      position,
      Boolean(relative),
      this.guild._sortedChannels(resolved),
      this.client.api.guilds(this.guild.id).channels,
      reason,
    );

    this.client.actions.GuildChannelsPositionUpdate.handle({
      guild_id: this.guild.id,
      channels: updatedChannels,
    });
    return this.cache.get(resolved.id) ?? resolved;
  }

  /**
   * Obtains one or more guild channels from Discord, or the channel cache if they're already available.
   * @param {Snowflake} [id] The channel's id
   * @param {BaseFetchOptions} [options] Additional options for this fetch
   * @returns {Promise<?GuildChannel|ThreadChannel|Collection<Snowflake, ?GuildChannel>>}
   * @example
   * // Fetch all channels from the guild (excluding threads)
   * message.guild.channels.fetch()
   *   .then(channels => console.log(`There are ${channels.size} channels.`))
   *   .catch(console.error);
   * @example
   * // Fetch a single channel
   * message.guild.channels.fetch('222197033908436994')
   *   .then(channel => console.log(`The channel name is: ${channel.name}`))
   *   .catch(console.error);
   */
  async fetch(id: Snowflake, options?: BaseFetchOptions): Promise<GuildChannel | null>;
  async fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<Snowflake, GuildChannel>>;
  async fetch(
    id?: Snowflake,
    { cache = true, force = false }: BaseFetchOptions = {},
  ): Promise<GuildChannel | Collection<Snowflake, GuildChannel> | null> {
    if (id && !force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    if (id) {
      const data: RawGuildChannelData = await this.client.api.channels(id).get();
      // Since this is the guild manager, throw if on a different guild
      if ('guild_id' in data && this.guild.id !== data.guild_id) throw new Error('GUILD_CHANNEL_UNOWNED');
      const channel = this.client.channels._add(data, this.guild, { cache });
      return channel instanceof GuildChannel ? channel : null;
    }

    const data: RawGuildChannelData[] = await this.client.api.guilds(this.guild.id).channels.get();
    const channels = new Collection<Snowflake, GuildChannel>();
    for (const rawChannel of data) {
      const channel = this.client.channels._add(rawChannel, this.guild, { cache });
      if (channel instanceof GuildChannel) channels.set(channel.id, channel);
    }
    return channels;
  }

  /**
   * Fetches all webhooks for the channel.
   * @param {GuildChannelResolvable} channel The channel to fetch webhooks for
   * @returns {Promise<Collection<Snowflake, Webhook>>}
   * @example
   * // Fetch webhooks
   * guild.channels.fetchWebhooks('769862166131245066')
   *   .then(hooks => console.log(`This channel has ${hooks.size} hooks`))
   *   .catch(console.error);
   */
  async fetchWebhooks(channel: GuildChannelResolvableSource): Promise<Collection<Snowflake, Webhook>> {
    const id = this.resolveId(channel);
    if (!id) throw new TypeError('INVALID_TYPE', 'channel', 'GuildChannelResolvable');
    const data: RawWebhookData[] = await this.client.api.channels[id].webhooks.get();
    return data.reduce(
      (hooks, hook) => hooks.set(hook.id, new Webhook(this.client, hook)),
      new Collection<Snowflake, Webhook>(),
    );
  }

  /**
   * Data that can be resolved to give a Category Channel object. This can be:
   * * A CategoryChannel object
   * * A Snowflake
   * @typedef {CategoryChannel|Snowflake} CategoryChannelResolvable
   */

  /**
   * The data needed for updating a channel's position.
   * @typedef {Object} ChannelPosition
   * @property {GuildChannel|Snowflake} channel Channel to update
   * @property {number} [position] New position for the channel
   * @property {CategoryChannelResolvable} [parent] Parent channel for this channel
   * @property {boolean} [lockPermissions] If the overwrites should be locked to the parents overwrites
   */

  /**
   * Batch-updates the guild's channels' positions.
   * <info>Only one channel's parent can be changed at a time</info>
   * @param {ChannelPosition[]} channelPositions Channel positions to update
   * @returns {Promise<Guild>}
   * @example
   * guild.channels.setPositions([{ channel: channelId, position: newChannelIndex }])
   *   .then(guild => console.log(`Updated channel positions for ${guild}`))
   *   .catch(console.error);
   */
  async setPositions(channelPositions: readonly ChannelPositionSource[]) {
    const positions = channelPositions.map(r => ({
      id: this.client.channels.resolveId(r.channel),
      position: r.position,
      lock_permissions: r.lockPermissions,
      parent_id: typeof r.parent !== 'undefined' ? this.resolveId(r.parent) : undefined,
    }));

    await this.client.api.guilds(this.guild.id).channels.patch({ data: positions });
    return this.client.actions.GuildChannelsPositionUpdate.handle({
      guild_id: this.guild.id,
      channels: positions,
    }).guild;
  }

  /**
   * Deletes the channel.
   * @param {GuildChannelResolvable} channel The channel to delete
   * @param {string} [reason] Reason for deleting this channel
   * @returns {Promise<void>}
   * @example
   * // Delete the channel
   * guild.channels.delete('858850993013260338', 'making room for new channels')
   *   .then(console.log)
   *   .catch(console.error);
   */
  async delete(channel: GuildChannelResolvableSource, reason?: string): Promise<void> {
    const id = this.resolveId(channel);
    if (!id) throw new TypeError('INVALID_TYPE', 'channel', 'GuildChannelResolvable');
    await this.client.api.channels(id).delete({ reason });
  }
}

export default GuildChannelManager;
export { GuildChannelManager };
