import process from 'node:process';
import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import ThreadMember from '../structures/ThreadMember';
import type { Snowflake } from 'discord-api-types/v10';
import type { RawThreadMemberData } from '../../typings/rawDataTypes';
import type {
  BaseFetchOptions,
  FetchThreadMemberOptions,
  FetchThreadMembersOptions,
  UserResolvable,
} from '../../typings';
import type { ThreadChannel } from '../structures/ThreadChannel';
import type { GuildMember } from '../structures/GuildMember';
import type { Message } from '../structures/Message';
import type { User } from '../structures/User';

type ThreadMemberResolvableSource = ThreadMember | User | GuildMember | Message | Snowflake | UserResolvable;

function isFetchOptions(value: unknown): value is FetchManyThreadMembersOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('cache' in value || 'withMember' in value || 'limit' in value || 'after' in value)
  );
}

interface FetchManyThreadMembersOptions {
  cache?: boolean;
  limit?: number;
  after?: Snowflake;
  withMember?: boolean;
}

let deprecationEmittedForPassingBoolean = false;

/**
 * Manages API methods for GuildMembers and stores their cache.
 * @extends {CachedManager}
 */
class ThreadMemberManager extends CachedManager<ThreadMember> {
  declare thread: ThreadChannel;
  constructor(thread: ThreadChannel, iterable?: Iterable<ThreadMember>) {
    super(thread.client, ThreadMember, iterable);

    /**
     * The thread this manager belongs to
     * @type {ThreadChannel}
     */
    this.thread = thread;
  }

  /**
   * The cache of this Manager
   * @type {Collection<Snowflake, ThreadMember>}
   * @name ThreadMemberManager#cache
   */

  _add(data: RawThreadMemberData, cache = true): ThreadMember {
    const userId = data.user_id;
    if (!userId) throw new TypeError('INVALID_TYPE', 'data', 'ThreadMemberData');
    const existing = this.cache.get(userId);
    if (cache) existing?._patch(data, { cache });
    if (existing) return existing;

    const member = new ThreadMember(this.thread, data, { cache });
    if (cache) this.cache.set(userId, member);
    return member;
  }

  /**
   * Fetches the client user as a ThreadMember of the thread.
   * @param {BaseFetchOptions} [options] The options for fetching the member
   * @returns {Promise<ThreadMember>}
   */
  fetchMe(options?: BaseFetchOptions): Promise<ThreadMember> {
    const userId = this.client.user?.id;
    if (!userId) throw new TypeError('INVALID_TYPE', 'user', 'UserResolvable');
    return this.fetch(userId, options);
  }

  /**
   * The client user as a ThreadMember of this ThreadChannel
   * @type {?ThreadMember}
   * @readonly
   */
  get me(): ThreadMember | null {
    const userId = this.client.user?.id;
    return userId ? (this.cache.get(userId) ?? null) : null;
  }

  /**
   * Data that resolves to give a ThreadMember object. This can be:
   * * A ThreadMember object
   * * A User resolvable
   * @typedef {ThreadMember|UserResolvable} ThreadMemberResolvable
   */

  /**
   * Resolves a {@link ThreadMemberResolvable} to a {@link ThreadMember} object.
   * @param {ThreadMemberResolvable} member The user that is part of the thread
   * @returns {?GuildMember}
   */
  resolve(member: ThreadMemberResolvableSource): ThreadMember | null {
    const memberResolvable = super.resolve(member);
    if (memberResolvable) return memberResolvable;
    const userId = this.client.users.resolveId(member);
    if (userId) return this.cache.get(userId) ?? null;
    return null;
  }

  /**
   * Resolves a {@link ThreadMemberResolvable} to a {@link ThreadMember} id string.
   * @param {ThreadMemberResolvable} member The user that is part of the guild
   * @returns {?Snowflake}
   */
  resolveId(member: ThreadMemberResolvableSource): string | null {
    const memberResolvable = super.resolveId(member);
    if (memberResolvable) return memberResolvable;
    const userResolvable = this.client.users.resolveId(member);
    if (!userResolvable) return null;
    return this.cache.has(userResolvable) ? userResolvable : null;
  }

  /**
   * Adds a member to the thread.
   * @param {UserResolvable|'@me'} member The member to add
   * @param {string} [reason] The reason for adding this member
   * @returns {Promise<Snowflake>}
   */
  async add(member: UserResolvable | '@me', reason?: string): Promise<Snowflake> {
    const id = member === '@me' ? member : this.client.users.resolveId(member);
    if (!id) throw new TypeError('INVALID_TYPE', 'member', 'UserResolvable');
    await this.client.api.channels(this.thread.id, 'thread-members', id).put({ reason });
    return id;
  }

  /**
   * Remove a user from the thread.
   * @param {Snowflake|'@me'} id The id of the member to remove
   * @param {string} [reason] The reason for removing this member from the thread
   * @returns {Promise<Snowflake>}
   */
  async remove(id: Snowflake | '@me', reason?: string): Promise<Snowflake | '@me'> {
    await this.client.api.channels(this.thread.id, 'thread-members', id).delete({ reason });
    return id;
  }

  async _fetchOne(
    memberId: Snowflake,
    { cache, force = false, withMember }: FetchThreadMemberOptions,
  ): Promise<ThreadMember> {
    if (!force) {
      const existing = this.cache.get(memberId);
      if (existing) return existing;
    }

    const data: RawThreadMemberData = await this.client.api.channels(this.thread.id, 'thread-members', memberId).get({
      query: { with_member: withMember },
    });
    return this._add(data, cache);
  }

  async _fetchMany({ cache, limit, after, withMember }: FetchManyThreadMembersOptions = {}): Promise<
    Collection<Snowflake, ThreadMember>
  > {
    const raw: RawThreadMemberData[] = await this.client.api.channels(this.thread.id, 'thread-members').get({
      query: { with_member: withMember, limit, after },
    });
    return raw.reduce(
      (col, member) => (member.user_id ? col.set(member.user_id, this._add(member, cache)) : col),
      new Collection<Snowflake, ThreadMember>(),
    );
  }

  /**
   * Options used to fetch a thread member.
   * @typedef {BaseFetchOptions} FetchThreadMemberOptions
   * @property {boolean} [withMember] Whether to also return the guild member associated with this thread member
   */

  /**
   * Options used to fetch multiple thread members with guild member data.
   * <info>With `withMember` set to `true`, pagination is enabled.</info>
   * @typedef {Object} FetchThreadMembersWithGuildMemberDataOptions
   * @property {true} withMember Whether to also return the guild member data
   * @property {Snowflake} [after] Consider only thread members after this id
   * @property {number} [limit] The maximum number of thread members to return
   * @property {boolean} [cache] Whether to cache the fetched thread members and guild members
   */

  /**
   * Options used to fetch multiple thread members without guild member data.
   * @typedef {Object} FetchThreadMembersWithoutGuildMemberDataOptions
   * @property {false} [withMember] Whether to also return the guild member data
   * @property {boolean} [cache] Whether to cache the fetched thread members
   */

  /**
   * Options used to fetch multiple thread members.
   * @typedef {FetchThreadMembersWithGuildMemberDataOptions|
   * FetchThreadMembersWithoutGuildMemberDataOptions} FetchThreadMembersOptions
   */

  /**
   * Fetches member(s) for the thread from Discord.
   * @param {UserResolvable|FetchThreadMembersOptions|boolean} [member] The member to fetch. If `undefined`, all members
   * in the thread are fetched, and will be cached based on `options.cache`.
   * @param {FetchThreadMemberOptions|FetchThreadMembersOptions} [options] Additional options for this fetch
   * @returns {Promise<ThreadMember|Collection<Snowflake, ThreadMember>>}
   */
  fetch(member: UserResolvable, options?: FetchThreadMemberOptions): Promise<ThreadMember>;
  fetch(options?: FetchThreadMembersOptions): Promise<Collection<Snowflake, ThreadMember>>;
  fetch(
    member?: ThreadMemberResolvableSource | FetchManyThreadMembersOptions | boolean,
    options: FetchThreadMemberOptions | FetchManyThreadMembersOptions = { cache: true, force: false },
  ): Promise<ThreadMember | Collection<Snowflake, ThreadMember>> {
    if (typeof member === 'boolean' && !deprecationEmittedForPassingBoolean) {
      process.emitWarning(
        'Passing boolean to member option is deprecated, use cache property instead.',
        'DeprecationWarning',
      );
      deprecationEmittedForPassingBoolean = true;
    }
    const isOptions = isFetchOptions(member);
    const id = !isOptions && typeof member !== 'boolean' && member !== undefined ? this.resolveId(member) : null;
    if (id) return this._fetchOne(id, options);
    const fetchOptions: FetchManyThreadMembersOptions = isOptions
      ? member
      : typeof member === 'boolean'
        ? { ...options, cache: member }
        : options;
    return this._fetchMany(fetchOptions);
  }
}

export default ThreadMemberManager;
export { ThreadMemberManager };
