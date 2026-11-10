import { setInterval } from 'node:timers';
import { Collection } from '@discordjs/collection';
import type { Client } from '../client/Client';
import _ConstantsModule from './Constants';
import { isTextBasedChannel, isThreadChannel } from '../types/channels';
const { Events, ThreadChannelTypes, SweeperKeys } = _ConstantsModule;
import _DJSErrorModule from '../errors/DJSError';
const { TypeError } = _DJSErrorModule;
('use strict');

/**
 * @typedef {Function} GlobalSweepFilter
 * @returns {Function|null} Return `null` to skip sweeping, otherwise a function passed to `sweep()`,
 * See {@link [Collection#sweep](https://discord.js.org/docs/packages/collection/stable/Collection:Class#sweep)}
 * for the definition of this function.
 */

/**
 * A container for all cache sweeping intervals and their associated sweep methods.
 */
type SweepFilterFn = (value: unknown, key: unknown, collection: unknown) => boolean;

type SweepableManager = { cache: Collection<string, unknown> };

function isSweepableManager(value: unknown): value is SweepableManager {
  return typeof value === 'object' && value !== null && 'cache' in value && value.cache instanceof Collection;
}

type SweepableGuildKey =
  | 'autoModerationRules'
  | 'bans'
  | 'commands'
  | 'emojis'
  | 'invites'
  | 'members'
  | 'presences'
  | 'stageInstances'
  | 'stickers'
  | 'voiceStates';

class Sweepers {
  client!: Client;
  options: Record<string, unknown>;
  intervals: Record<string, ReturnType<typeof setInterval> | null>;

  constructor(client: Client, options: Record<string, unknown>) {
    /**
     * The client that instantiated this
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The options the sweepers were instantiated with
     * @type {SweeperOptions}
     */
    this.options = options;

    /**
     * A record of interval timeout that is used to sweep the indicated items, or null if not being swept
     * @type {Object<SweeperKey, ?Timeout>}
     */
    this.intervals = Object.fromEntries(SweeperKeys.map((key: string) => [key, null]));

    for (const key of SweeperKeys) {
      if (!(key in options)) continue;

      this._validateProperties(key);

      const clonedOptions = { ...(this.options[key] as Record<string, unknown>) };

      // Handle cases that have a "lifetime"
      if (!('filter' in clonedOptions)) {
        switch (key) {
          case 'invites':
            clonedOptions.filter = Sweepers.expiredInviteSweepFilter(clonedOptions.lifetime as number);
            break;
          case 'messages':
            clonedOptions.filter = Sweepers.outdatedMessageSweepFilter(clonedOptions.lifetime as number);
            break;
          case 'threads':
            clonedOptions.filter = Sweepers.archivedThreadSweepFilter(clonedOptions.lifetime as number);
        }
      }

      this._initInterval(key, `sweep${key[0].toUpperCase()}${key.slice(1)}`, clonedOptions);
    }
  }

  /**
   * Sweeps all guild and global application commands and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which commands will be removed from the caches.
   * @returns {number} Amount of commands that were removed from the caches
   */
  sweepApplicationCommands(filter: SweepFilterFn) {
    const { guilds, items: guildCommands } = this._sweepGuildDirectProp('commands', filter, { emit: false });

    const globalCommands = this.client.application?.commands.cache.sweep(filter) ?? 0;

    this.client.emit(
      Events.CACHE_SWEEP,
      `Swept ${globalCommands} global application commands and ${guildCommands} guild commands in ${guilds} guilds.`,
    );
    return guildCommands + globalCommands;
  }

  /**
   * Sweeps all auto moderation rules and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine
   * which auto moderation rules will be removed from the caches
   * @returns {number} Amount of auto moderation rules that were removed from the caches
   */
  sweepAutoModerationRules(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('autoModerationRules', filter).items;
  }

  /**
   * Sweeps all guild bans and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which bans will be removed from the caches.
   * @returns {number} Amount of bans that were removed from the caches
   */
  sweepBans(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('bans', filter).items;
  }

  /**
   * Sweeps all guild emojis and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which emojis will be removed from the caches.
   * @returns {number} Amount of emojis that were removed from the caches
   */
  sweepEmojis(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('emojis', filter).items;
  }

  /**
   * Sweeps all guild invites and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which invites will be removed from the caches.
   * @returns {number} Amount of invites that were removed from the caches
   */
  sweepInvites(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('invites', filter).items;
  }

  /**
   * Sweeps all guild members and removes the ones which are indicated by the filter.
   * <info>It is highly recommended to keep the client guild member cached</info>
   * @param {Function} filter The function used to determine which guild members will be removed from the caches.
   * @returns {number} Amount of guild members that were removed from the caches
   */
  sweepGuildMembers(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('members', filter, { outputName: 'guild members' }).items;
  }

  /**
   * Sweeps all text-based channels' messages and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which messages will be removed from the caches.
   * @returns {number} Amount of messages that were removed from the caches
   * @example
   * // Remove all messages older than 1800 seconds from the messages cache
   * const amount = sweepers.sweepMessages(
   *   Sweepers.filterByLifetime({
   *     lifetime: 1800,
   *     getComparisonTimestamp: m => m.editedTimestamp ?? m.createdTimestamp,
   *   })(),
   * );
   * console.log(`Successfully removed ${amount} messages from the cache.`);
   */
  sweepMessages(filter: SweepFilterFn) {
    if (typeof filter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'filter', 'function');
    }
    let channels = 0;
    let messages = 0;

    for (const channel of this.client.channels.cache.values()) {
      if (!isTextBasedChannel(channel)) continue;

      channels++;
      messages += channel.messages.cache.sweep(filter);
    }
    this.client.emit(Events.CACHE_SWEEP, `Swept ${messages} messages in ${channels} text-based channels.`);
    return messages;
  }

  /**
   * Sweeps all presences and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which presences will be removed from the caches.
   * @returns {number} Amount of presences that were removed from the caches
   */
  sweepPresences(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('presences', filter).items;
  }

  /**
   * Sweeps all message reactions and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which reactions will be removed from the caches.
   * @returns {number} Amount of reactions that were removed from the caches
   */
  sweepReactions(filter: SweepFilterFn) {
    if (typeof filter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'filter', 'function');
    }
    let channels = 0;
    let messages = 0;
    let reactions = 0;

    for (const channel of this.client.channels.cache.values()) {
      if (!isTextBasedChannel(channel)) continue;
      channels++;

      for (const message of channel.messages.cache.values()) {
        messages++;
        reactions += message.reactions.cache.sweep(filter);
      }
    }
    this.client.emit(
      Events.CACHE_SWEEP,
      `Swept ${reactions} reactions on ${messages} messages in ${channels} text-based channels.`,
    );
    return reactions;
  }

  /**
   * Sweeps all guild stage instances and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which stage instances will be removed from the caches.
   * @returns {number} Amount of stage instances that were removed from the caches
   */
  sweepStageInstances(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('stageInstances', filter, { outputName: 'stage instances' }).items;
  }

  /**
   * Sweeps all guild stickers and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which stickers will be removed from the caches.
   * @returns {number} Amount of stickers that were removed from the caches
   */
  sweepStickers(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('stickers', filter).items;
  }

  /**
   * Sweeps all thread members and removes the ones which are indicated by the filter.
   * <info>It is highly recommended to keep the client thread member cached</info>
   * @param {Function} filter The function used to determine which thread members will be removed from the caches.
   * @returns {number} Amount of thread members that were removed from the caches
   */
  sweepThreadMembers(filter: SweepFilterFn) {
    if (typeof filter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'filter', 'function');
    }

    let threads = 0;
    let members = 0;
    for (const channel of this.client.channels.cache.values()) {
      if (!isThreadChannel(channel)) continue;
      threads++;
      members += channel.members.cache.sweep(filter);
    }
    this.client.emit(Events.CACHE_SWEEP, `Swept ${members} thread members in ${threads} threads.`);
    return members;
  }

  /**
   * Sweeps all threads and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which threads will be removed from the caches.
   * @returns {number} filter Amount of threads that were removed from the caches
   * @example
   * // Remove all threads archived greater than 1 day ago from all the channel caches
   * const amount = sweepers.sweepThreads(
   *   Sweepers.filterByLifetime({
   *     getComparisonTimestamp: t => t.archivedTimestamp,
   *     excludeFromSweep: t => !t.archived,
   *   })(),
   * );
   * console.log(`Successfully removed ${amount} threads from the cache.`);
   */
  sweepThreads(filter: SweepFilterFn) {
    if (typeof filter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'filter', 'function');
    }

    let threads = 0;
    for (const [key, val] of this.client.channels.cache.entries()) {
      if (!ThreadChannelTypes.includes(val.type)) continue;
      if (filter(val, key, this.client.channels.cache)) {
        threads++;
        this.client.channels._remove(key);
      }
    }
    this.client.emit(Events.CACHE_SWEEP, `Swept ${threads} threads.`);
    return threads;
  }

  /**
   * Sweeps all users and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which users will be removed from the caches.
   * @returns {number} Amount of users that were removed from the caches
   */
  sweepUsers(filter: SweepFilterFn) {
    if (typeof filter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'filter', 'function');
    }

    const users = this.client.users.cache.sweep(filter);

    this.client.emit(Events.CACHE_SWEEP, `Swept ${users} users.`);

    return users;
  }

  /**
   * Sweeps all guild voice states and removes the ones which are indicated by the filter.
   * @param {Function} filter The function used to determine which voice states will be removed from the caches.
   * @returns {number} Amount of voice states that were removed from the caches
   */
  sweepVoiceStates(filter: SweepFilterFn) {
    return this._sweepGuildDirectProp('voiceStates', filter, { outputName: 'voice states' }).items;
  }

  /**
   * Cancels all sweeping intervals
   * @returns {void}
   */
  destroy() {
    for (const key of SweeperKeys) {
      if (this.intervals[key]) clearInterval(this.intervals[key]);
    }
  }

  /**
   * Options for generating a filter function based on lifetime
   * @typedef {Object} LifetimeFilterOptions
   * @property {number} [lifetime=14400] How long, in seconds, an entry should stay in the collection
   * before it is considered sweepable.
   * @property {Function} [getComparisonTimestamp=e => e?.createdTimestamp] A function that takes an entry, key,
   * and the collection and returns a timestamp to compare against in order to determine the lifetime of the entry.
   * @property {Function} [excludeFromSweep=() => false] A function that takes an entry, key, and the collection
   * and returns a boolean, `true` when the entry should not be checked for sweepability.
   */

  /**
   * Create a sweepFilter function that uses a lifetime to determine sweepability.
   * @param {LifetimeFilterOptions} [options={}] The options used to generate the filter function
   * @returns {GlobalSweepFilter}
   */
  static filterByLifetime({
    lifetime = 14400,
    getComparisonTimestamp = (e: unknown) => (e as { createdTimestamp?: number } | null)?.createdTimestamp,
    excludeFromSweep = () => false,
  }: Record<string, unknown> = {}) {
    if (typeof lifetime !== 'number') {
      throw new TypeError('INVALID_TYPE', 'lifetime', 'number');
    }
    if (typeof getComparisonTimestamp !== 'function') {
      throw new TypeError('INVALID_TYPE', 'getComparisonTimestamp', 'function');
    }
    if (typeof excludeFromSweep !== 'function') {
      throw new TypeError('INVALID_TYPE', 'excludeFromSweep', 'function');
    }
    return () => {
      if (lifetime <= 0) return null;
      const lifetimeMs = lifetime * 1_000;
      const now = Date.now();
      return (entry: unknown, key: unknown, coll: unknown) => {
        if (excludeFromSweep(entry, key, coll)) {
          return false;
        }
        const comparisonTimestamp = getComparisonTimestamp(entry, key, coll);
        if (!comparisonTimestamp || typeof comparisonTimestamp !== 'number') return false;
        return now - comparisonTimestamp > lifetimeMs;
      };
    };
  }

  /**
   * Creates a sweep filter that sweeps archived threads
   * @param {number} [lifetime=14400] How long a thread has to be archived to be valid for sweeping
   * @returns {GlobalSweepFilter}
   */
  static archivedThreadSweepFilter(lifetime: number = 14400) {
    return this.filterByLifetime({
      lifetime,
      getComparisonTimestamp: (e: unknown) => (e as { archiveTimestamp?: number } | null)?.archiveTimestamp,
      excludeFromSweep: (e: unknown) => !(e as { archived?: boolean } | null)?.archived,
    });
  }

  /**
   * Creates a sweep filter that sweeps expired invites
   * @param {number} [lifetime=14400] How long ago an invite has to have expired to be valid for sweeping
   * @returns {GlobalSweepFilter}
   */
  static expiredInviteSweepFilter(lifetime: number = 14400) {
    return this.filterByLifetime({
      lifetime,
      getComparisonTimestamp: (i: unknown) => (i as { expiresTimestamp?: number } | null)?.expiresTimestamp,
    });
  }

  /**
   * Creates a sweep filter that sweeps outdated messages (edits taken into account)
   * @param {number} [lifetime=3600] How long ago a message has to have been sent or edited to be valid for sweeping
   * @returns {GlobalSweepFilter}
   */
  static outdatedMessageSweepFilter(lifetime: number = 3600) {
    return this.filterByLifetime({
      lifetime,
      getComparisonTimestamp: (m: unknown) =>
        (m as { editedTimestamp?: number; createdTimestamp?: number } | null)?.editedTimestamp ??
        (m as { createdTimestamp?: number } | null)?.createdTimestamp,
    });
  }

  /**
   * Configuration options for emitting the cache sweep client event
   * @typedef {Object} SweepEventOptions
   * @property {boolean} [emit=true] Whether to emit the client event in this method
   * @property {string} [outputName] A name to output in the client event if it should differ from the key
   * @private
   */

  /**
   * Sweep a direct sub property of all guilds
   * @param {string} key The name of the property
   * @param {Function} filter Filter function passed to sweep
   * @param {SweepEventOptions} [eventOptions={}] Options for the Client event emitted here
   * @returns {Object} Object containing the number of guilds swept and the number of items swept
   * @private
   */
  _sweepGuildDirectProp(
    key: SweepableGuildKey,
    filter: SweepFilterFn,
    { emit = true, outputName }: { emit?: boolean; outputName?: string } = {},
  ) {
    if (typeof filter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'filter', 'function');
    }

    let guilds = 0;
    let items = 0;

    for (const guild of this.client.guilds.cache.values()) {
      const manager: unknown = Reflect.get(guild, key);
      if (!isSweepableManager(manager)) continue;

      guilds++;
      items += manager.cache.sweep(filter);
    }

    if (emit) {
      this.client.emit(Events.CACHE_SWEEP, `Swept ${items} ${outputName ?? key} in ${guilds} guilds.`);
    }

    return { guilds, items };
  }

  /**
   * Validates a set of properties
   * @param {string} key Key of the options object to check
   * @private
   */
  _validateProperties(key: string) {
    const props = this.options[key] as Record<string, unknown> | null;
    if (typeof props !== 'object' || props === null) {
      throw new TypeError('INVALID_TYPE', `sweepers.${key}`, 'object', true);
    }
    if (typeof props.interval !== 'number') {
      throw new TypeError('INVALID_TYPE', `sweepers.${key}.interval`, 'number');
    }
    // Invites, Messages, and Threads can be provided a lifetime parameter, which we use to generate the filter
    if (['invites', 'messages', 'threads'].includes(key) && !('filter' in props)) {
      if (typeof props.lifetime !== 'number') {
        throw new TypeError('INVALID_TYPE', `sweepers.${key}.lifetime`, 'number');
      }
      return;
    }
    if (typeof props.filter !== 'function') {
      throw new TypeError('INVALID_TYPE', `sweepers.${key}.filter`, 'function');
    }
  }

  /**
   * Initialize an interval for sweeping
   * @param {string} intervalKey The name of the property that stores the interval for this sweeper
   * @param {string} sweepKey The name of the function that sweeps the desired caches
   * @param {Object} opts Validated options for a sweep
   * @private
   */
  _initInterval(intervalKey: string, sweepKey: string, opts: Record<string, unknown>) {
    const interval = opts.interval as number;
    if (interval <= 0 || interval === Infinity) return;
    const filter = opts.filter as () => SweepFilterFn | null;
    this.intervals[intervalKey] = setInterval(() => {
      const sweepFn = filter();
      if (sweepFn === null) return;
      if (typeof sweepFn !== 'function') throw new TypeError('SWEEP_FILTER_RETURN');
      (this as unknown as Record<string, (fn: SweepFilterFn) => number>)[sweepKey](sweepFn);
    }, interval * 1_000).unref();
  }
}

export default Sweepers;
export { Sweepers };
