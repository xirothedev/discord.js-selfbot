import process from 'node:process';
import CachedManager from './CachedManager';
import { isGuildBasedChannel, isThreadChannel, isThreadParentChannel } from '../types/channels';
import _ChannelModule from '../structures/Channel';
const { Channel } = _ChannelModule;
import _ConstantsModule from '../util/Constants';
const { Events, RelationshipTypes } = _ConstantsModule;

let cacheWarningEmitted = false;

/**
 * A manager of channels belonging to a client
 * @extends {CachedManager}
 */
class ChannelManager extends CachedManager<import('../structures/Channel').Channel> {
  constructor(client: any, iterable?: any) {
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
    data: any,
    guild: any,
    { cache = true, allowUnknownGuild = false }: any = {},
  ): import('../structures/Channel').Channel | null {
    const existing = this.cache.get(data.id);
    if (existing) {
      if (cache) existing._patch(data);
      guild?.channels?._add(existing);
      if (isThreadChannel(existing)) {
        const parent = existing.parent;
        if (parent && isThreadParentChannel(parent)) parent.threads._add(existing);
      }
      return existing;
    }

    const channel = Channel.create(this.client, data, guild, { allowUnknownGuild });

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
    id: any,
    { allowUnknownGuild = false, cache = true, force = false }: any = {},
  ): Promise<import('../structures/Channel').Channel | null> {
    if (!force) {
      const existing = this.cache.get(id);
      if (existing && !existing.partial) return existing;
    }

    const data = await this.client.api.channels(id).get();
    return this._add(data, null, { cache, allowUnknownGuild });
  }

  /**
   * Create Group DM
   * @param {UserResolvable[]} [recipients=[]] Array of recipients
   * @returns {Promise<GroupDMChannel>} Channel
   * @example
   * client.channels.createGroupDM();
   */
  async createGroupDM(recipients: any = []) {
    if (!Array.isArray(recipients)) throw new Error(`Expected an array of recipients (got ${typeof recipients})`);
    recipients = recipients
      .map((r: any) => this.client.users.resolveId(r))
      .filter((r: any) => r && this.client.relationships.cache.get(r) == RelationshipTypes.FRIEND);
    if (recipients.length == 1 || recipients.length > 9) throw new Error('Invalid Users length (max=9)');
    const data = await this.client.api.users['@me'].channels.post({
      data: { recipients },
    });
    return this._add(data, null, { cache: true, allowUnknownGuild: true });
  }
}

// `CachedManager#_add` takes `(data, cache, options)`, but this manager takes
// `(data, guild, options)`. The merged overloads keep the class assignable to
// its base while callers keep the real channel signature.
interface ChannelManager {
  _add(data: unknown, guild: unknown, options?: unknown): import('../structures/Channel').Channel | null;
  _add(
    data: unknown,
    cache?: boolean,
    options?: { id?: string; extras?: unknown[] },
  ): import('../structures/Channel').Channel;
}

export default ChannelManager;
export { ChannelManager };
