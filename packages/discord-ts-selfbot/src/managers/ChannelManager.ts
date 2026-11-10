import process from 'node:process';
import CachedManager from './CachedManager';
import { isGuildBasedChannel, isThreadChannel, isThreadParentChannel } from '../types/channels';
import _ChannelModule from '../structures/Channel';
const { Channel } = _ChannelModule;
import GuildChannel from '../structures/GuildChannel';
import _ConstantsModule from '../util/Constants';
const { Events, RelationshipTypes } = _ConstantsModule;
import type { Snowflake } from 'discord-api-types/v10';
import type { RawChannelData } from '../../typings/rawDataTypes';
import type { FetchChannelOptions, UserResolvable } from '../../typings';
import type { Client } from '../client/Client';
import type { Guild } from '../structures/Guild';
import GroupDMChannel from '../structures/GroupDMChannel';

let cacheWarningEmitted = false;

/**
 * A manager of channels belonging to a client
 * @extends {CachedManager}
 */
class ChannelManager extends CachedManager<import('../structures/Channel').Channel> {
  constructor(client: Client, iterable?: Iterable<import('../structures/Channel').Channel>) {
    super(client, Channel, iterable);
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
  }

  /**
   * The cache of Channels
   * @type {Collection<Snowflake, Channel>}
   * @name ChannelManager#cache
   */

  _add(
    data: RawChannelData | import('../structures/Channel').Channel,
    guildOrCache?: Guild | null | boolean,
    options: { cache?: boolean; allowUnknownGuild?: boolean } | { id?: string; extras?: unknown[] } = {},
  ): import('../structures/Channel').Channel | null {
    const guild = typeof guildOrCache === 'object' ? guildOrCache : null;
    const cache =
      typeof guildOrCache === 'boolean'
        ? guildOrCache
        : 'cache' in options && typeof options.cache === 'boolean'
          ? options.cache
          : true;
    const allowUnknownGuild = 'allowUnknownGuild' in options ? Boolean(options.allowUnknownGuild) : false;
    const existing = this.cache.get(data.id);
    if (existing) {
      if (cache && !(data instanceof Channel)) existing._patch(data);
      if (existing instanceof GuildChannel) existing.guild.channels._add(existing);
      if (isThreadChannel(existing)) {
        const parent = existing.parent;
        if (parent && isThreadParentChannel(parent)) parent.threads._add(existing);
      }
      return existing;
    }

    const channel = data instanceof Channel ? data : Channel.create(this.client, data, guild, { allowUnknownGuild });

    if (!channel) {
      this.client.emit(Events.DEBUG, `Failed to find guild, or unknown type for channel ${data.id} ${data.type}`);
      return null;
    }

    if (cache && !allowUnknownGuild) this.cache.set(channel.id, channel);

    return channel;
  }

  _remove(id: string) {
    const channel = this.cache.get(id);
    if (channel && isGuildBasedChannel(channel)) {
      channel.guild.channels.cache.delete(id);
      for (const [code, invite] of channel.guild.invites.cache) {
        if (invite.channelId === id) channel.guild.invites.cache.delete(code);
      }
    }
    if (channel && isThreadChannel(channel)) {
      const parent = channel.parent;
      if (parent && isThreadParentChannel(parent)) parent.threads.cache.delete(id);
    }
    this.cache.delete(id);
    if (channel && isThreadParentChannel(channel)) {
      for (const threadId of channel.threads.cache.keys()) {
        this.cache.delete(threadId);
        channel.guild.channels.cache.delete(threadId);
      }
    }
  }

  /**
   * Data that can be resolved to give a Channel object. This can be:
   * * A Channel object
   * * A Snowflake
   * @typedef {Channel|Snowflake} ChannelResolvable
   */

  /**
   * Resolves a ChannelResolvable to a Channel object.
   * @method resolve
   * @memberof ChannelManager
   * @instance
   * @param {ChannelResolvable} channel The channel resolvable to resolve
   * @returns {?Channel}
   */

  /**
   * Resolves a ChannelResolvable to a channel id string.
   * @method resolveId
   * @memberof ChannelManager
   * @instance
   * @param {ChannelResolvable} channel The channel resolvable to resolve
   * @returns {?Snowflake}
   */

  /**
   * Options for fetching a channel from Discord
   * @typedef {BaseFetchOptions} FetchChannelOptions
   * @property {boolean} [allowUnknownGuild=false] Allows the channel to be returned even if the guild is not in cache,
   * it will not be cached. <warn>Many of the properties and methods on the returned channel will throw errors</warn>
   */

  /**
   * Obtains a channel from Discord, or the channel cache if it's already available.
   * @param {Snowflake} id The channel's id
   * @param {FetchChannelOptions} [options] Additional options for this fetch
   * @returns {Promise<?Channel>}
   * @example
   * // Fetch a channel by its id
   * client.channels.fetch('222109930545610754')
   *   .then(channel => console.log(channel.name))
   *   .catch(console.error);
   */
  async fetch(
    id: Snowflake,
    { allowUnknownGuild = false, cache = true, force = false }: FetchChannelOptions = {},
  ): Promise<import('../structures/Channel').Channel | null> {
    if (!force) {
      const existing = this.cache.get(id);
      if (existing && !existing.partial) return existing;
    }

    const data: RawChannelData = await this.client.api.channels(id).get();
    return this._add(data, null, { cache, allowUnknownGuild });
  }

  /**
   * Create Group DM
   * @param {UserResolvable[]} [recipients=[]] Array of recipients
   * @returns {Promise<GroupDMChannel>} Channel
   * @example
   * client.channels.createGroupDM();
   */
  async createGroupDM(recipients: UserResolvable[] = []): Promise<GroupDMChannel> {
    if (!Array.isArray(recipients)) throw new Error(`Expected an array of recipients (got ${typeof recipients})`);
    const resolvedRecipients = recipients
      .map(r => this.client.users.resolveId(r))
      .filter(
        (r): r is Snowflake =>
          typeof r === 'string' && this.client.relationships.cache.get(r) === RelationshipTypes.FRIEND,
      );
    if (resolvedRecipients.length == 1 || resolvedRecipients.length > 9) {
      throw new Error('Invalid Users length (max=9)');
    }
    const data: RawChannelData = await this.client.api.users['@me'].channels.post({
      data: { recipients: resolvedRecipients },
    });
    const channel = this._add(data, null, { cache: true, allowUnknownGuild: true });
    if (!(channel instanceof GroupDMChannel)) throw new Error('INVALID_TYPE: channel is not a GroupDMChannel');
    return channel;
  }
}

// `CachedManager#_add` takes `(data, cache, options)`, but this manager takes
// `(data, guild, options)`. The merged overloads keep the class assignable to
// its base while callers keep the real channel signature.
// `CachedManager#_add` takes `(data, cache, options)`, but this manager takes
// `(data, guild, options)`. The merged overloads keep the class assignable to
// its base while callers keep the real channel signature.
interface ChannelManager {
  _add(data: unknown, guild?: unknown, options?: unknown): import('../structures/Channel').Channel | null;
  _add(
    data: unknown,
    cache?: boolean,
    options?: { id?: string; extras?: unknown[] },
  ): import('../structures/Channel').Channel;
}

export default ChannelManager;
export { ChannelManager };
