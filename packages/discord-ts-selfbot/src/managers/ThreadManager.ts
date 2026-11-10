import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import ThreadChannel from '../structures/ThreadChannel';
import { isThreadChannel } from '../types/channels';
import type { Snowflake } from 'discord-api-types/v10';
import type { RawChannelData, RawMessageData, RawThreadMemberData } from '../../typings/rawDataTypes';
import type {
  BaseFetchOptions,
  FetchArchivedThreadOptions,
  FetchThreadsOptions,
  ThreadChannelResolvable,
} from '../../typings';
import type { Client } from '../client/Client';
import type { Guild } from '../structures/Guild';
import type { GuildChannel } from '../structures/GuildChannel';

type ThreadChannelResolvableSource = ThreadChannel | Snowflake | ThreadChannelResolvable;

interface FetchChannelThreadsOptionsSource {
  archived?: boolean;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
}

interface FetchedThreadsSource {
  threads: Collection<Snowflake, ThreadChannel>;
  hasMore?: boolean;
}

interface RawThreadsResponse {
  threads: RawChannelData[];
  members: RawThreadMemberData[];
  first_messages?: RawMessageData[] | null;
  has_more?: boolean;
}

/**
 * Manages API methods for {@link ThreadChannel} objects and stores their cache.
 * @extends {CachedManager}
 */
class ThreadManager extends CachedManager<ThreadChannel> {
  declare channel: GuildChannel;
  constructor(channel: GuildChannel, iterable?: Iterable<ThreadChannel>) {
    super(channel.client, ThreadChannel, iterable);

    /**
     * The channel this Manager belongs to
     * @type {NewsChannel|TextChannel}
     */
    this.channel = channel;
  }

  /**
   * The cache of this Manager
   * @type {Collection<Snowflake, ThreadChannel>}
   * @name ThreadManager#cache
   */

  _add(thread: ThreadChannel): ThreadChannel {
    const existing = this.cache.get(thread.id);
    if (existing) return existing;
    this.cache.set(thread.id, thread);
    return thread;
  }

  /**
   * Data that can be resolved to a Thread Channel object. This can be:
   * * A ThreadChannel object
   * * A Snowflake
   * @typedef {ThreadChannel|Snowflake} ThreadChannelResolvable
   */

  /**
   * Resolves a {@link ThreadChannelResolvable} to a {@link ThreadChannel} object.
   * @method resolve
   * @memberof ThreadManager
   * @instance
   * @param {ThreadChannelResolvable} thread The ThreadChannel resolvable to resolve
   * @returns {?ThreadChannel}
   */

  /**
   * Resolves a {@link ThreadChannelResolvable} to a {@link ThreadChannel} id.
   * @method resolveId
   * @memberof ThreadManager
   * @instance
   * @param {ThreadChannelResolvable} thread The ThreadChannel resolvable to resolve
   * @returns {?Snowflake}
   */

  /**
   * Options for fetching multiple threads.
   * @typedef {Object} FetchThreadsOptions
   * @property {FetchArchivedThreadOptions} [archived] The options used to fetch archived threads
   */

  /**
   * Obtains a thread from Discord, or the channel cache if it's already available.
   * @param {ThreadChannelResolvable|FetchChannelThreadsOptions|FetchThreadsOptions} [options] The options to fetch threads. If it is a
   * ThreadChannelResolvable then the specified thread will be fetched. Fetches all active threads if `undefined`
   * @param {BaseFetchOptions} [cacheOptions] Additional options for this fetch. <warn>The `force` field gets ignored
   * if `options` is not a {@link ThreadChannelResolvable}</warn>
   * @returns {Promise<?(ThreadChannel|FetchedThreads)>}
   * @example
   * // Fetch a thread by its id
   * channel.threads.fetch('831955138126104859')
   *   .then(channel => console.log(channel.name))
   *   .catch(console.error);
   */
  fetch(
    options?: ThreadChannelResolvableSource | FetchThreadsOptions,
    { cache, force }: BaseFetchOptions = {},
  ): Promise<ThreadChannel | FetchedThreadsSource | null> {
    if (!options) return this.fetchActive(cache);
    const channel = this.client.channels.resolveId(options);
    if (channel) {
      return this.client.channels
        .fetch(channel, { cache, force })
        .then(fetched => (fetched && isThreadChannel(fetched) ? fetched : null));
    }
    if (
      typeof options === 'object' &&
      'archived' in options &&
      typeof options.archived === 'object' &&
      options.archived
    ) {
      return this.fetchArchived(options.archived, cache);
    }
    return this.fetchActive(cache);
  }

  /**
   * Data that can be resolved to a Date object. This can be:
   * * A Date object
   * * A number representing a timestamp
   * * An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string
   * @typedef {Date|number|string} DateResolvable
   */

  /**
   * The options used to fetch archived threads.
   * @typedef {Object} FetchArchivedThreadOptions
   * @property {string} [type='public'] The type of threads to fetch, either `public` or `private`
   * @property {boolean} [fetchAll=false] Whether to fetch **all** archived threads when type is `private`.
   * Requires `MANAGE_THREADS` if true
   * @property {DateResolvable|ThreadChannelResolvable} [before] Only return threads that were archived before this Date
   * or Snowflake. <warn>Must be a {@link ThreadChannelResolvable} when type is `private` and fetchAll is `false`</warn>
   * @property {number} [limit] Maximum number of threads to return
   */

  /**
   * The data returned from a thread fetch that returns multiple threads.
   * @typedef {Object} FetchedThreads
   * @property {Collection<Snowflake, ThreadChannel>} threads The threads that were fetched, with any members returned
   * @property {?boolean} hasMore Whether there are potentially additional threads that require a subsequent call
   */

  /**
   * Obtains a set of archived threads from Discord, requires `READ_MESSAGE_HISTORY` in the parent channel.
   * @param {FetchChannelThreadsOptions} [options] The options to fetch archived threads
   * @param {boolean} [cache=true] Whether to cache the new thread objects if they aren't already
   * @returns {Promise<FetchedThreadsSource>}
   */
  fetchArchived(options: FetchArchivedThreadOptions = {}, cache = true): Promise<FetchedThreadsSource> {
    return this.fetchActive(cache, { archived: true, ...options });
  }

  /**
   * Discord.js self-bot specific options field for fetching active threads.
   * @typedef {Object} FetchChannelThreadsOptions
   * @property {boolean} [archived] Whether to fetch archived threads (default is false)
   * @property {string} [sortBy] The order in which the threads should be fetched in (default is last_message_time)
   * @property {string} [sortOrder] How the threads should be ordered (default is desc)
   * @property {number} [limit] The maximum number of threads to return (default is 25)
   * @property {number} [offset] The number of threads to offset fetching (useful when making multiple fetches) (default is 0)
   */

  /**
   * Obtains the accessible active threads from Discord, requires `READ_MESSAGE_HISTORY` in the parent channel.
   * @param {boolean} [cache=true] Whether to cache the new thread objects if they aren't already
   * @param {FetchChannelThreadsOptions} [options] Options for self-bots where advanced users can specify further options
   * @returns {Promise<FetchedThreadsSource>}
   */
  async fetchActive(cache = true, options: FetchChannelThreadsOptionsSource = {}): Promise<FetchedThreadsSource> {
    const raw: RawThreadsResponse = await this.client.api.channels(this.channel.id).threads.search.get({
      query: {
        archived: options?.archived ?? false,
        limit: options?.limit ?? 25,
        offset: options?.offset ?? 0,
        sort_by: options?.sortBy ?? 'last_message_time',
        sort_order: options?.sortOrder ?? 'desc',
      },
    });

    return ThreadManager._mapThreads(raw, this.client, { parent: this.channel, cache });
  }

  static _mapThreads(
    rawThreads: RawThreadsResponse,
    client: Client,
    { parent, guild, cache }: { parent?: GuildChannel; guild?: Guild | null; cache?: boolean },
  ): FetchedThreadsSource {
    const threads = rawThreads.threads.reduce((coll, raw) => {
      const thread = client.channels._add(raw, guild ?? parent?.guild ?? null, { cache });
      if (!thread || !isThreadChannel(thread)) return coll;
      if (parent && thread.parentId !== parent.id) return coll;
      return coll.set(thread.id, thread);
    }, new Collection<Snowflake, ThreadChannel>());
    // Discord sends the thread id as id in this object
    for (const rawMember of rawThreads.members) {
      const channel = rawMember.id ? client.channels.cache.get(rawMember.id) : undefined;
      if (channel && isThreadChannel(channel)) channel.members._add(rawMember);
    }
    // Patch firstMessage
    // According to https://github.com/aiko-chan-ai/discord.js-selfbot-v13/issues/1502, rawThreads.first_messages could be null.
    for (const rawMessage of rawThreads.first_messages || []) {
      const channel = client.channels.cache.get(rawMessage.id);
      if (channel && isThreadChannel(channel)) channel.messages._add(rawMessage);
    }
    return {
      threads,
      hasMore: rawThreads.has_more ?? false,
    };
  }
}

export default ThreadManager;
export { ThreadManager };
