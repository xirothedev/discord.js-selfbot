import process from 'node:process';
import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import ThreadMember from '../structures/ThreadMember';

let deprecationEmittedForPassingBoolean = false;

/**
 * Manages API methods for GuildMembers and stores their cache.
 * @extends {CachedManager}
 */
class ThreadMemberManager extends CachedManager {
  declare thread: import('../structures/ThreadChannel').ThreadChannel;
  constructor(thread: any, iterable?: any) {
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

  _add(data: any, cache: any = true) {
    const existing = this.cache.get(data.user_id);
    if (cache) existing?._patch(data, { cache });
    if (existing) return existing;

    const member = new ThreadMember(this.thread, data, { cache });
    if (cache) this.cache.set(data.user_id, member);
    return member;
  }

  /**
   * Fetches the client user as a ThreadMember of the thread.
   * @param {BaseFetchOptions} [options] The options for fetching the member
   * @returns {Promise<ThreadMember>}
   */
  fetchMe(options: any) {
    return this.fetch(this.client.user!.id, options);
  }

  /**
   * The client user as a ThreadMember of this ThreadChannel
   * @type {?ThreadMember}
   * @readonly
   */
  get me() {
    return this.cache.get(this.client.user!.id) ?? null;
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
  resolve(member: any) {
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
  resolveId(member: any) {
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
  async add(member: any, reason?: string) {
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
  async remove(id: any, reason?: string) {
    await this.client.api.channels(this.thread.id, 'thread-members', id).delete({ reason });
    return id;
  }

  async _fetchOne(memberId: any, { cache, force = false, withMember }: any) {
    if (!force) {
      const existing = this.cache.get(memberId);
      if (existing) return existing;
    }

    const data = await this.client.api.channels(this.thread.id, 'thread-members', memberId).get({
      query: { with_member: withMember },
    });
    return this._add(data, cache);
  }

  async _fetchMany({ cache, limit, after, withMember }: any = {}) {
    const raw = await this.client.api.channels(this.thread.id, 'thread-members').get({
      query: { with_member: withMember, limit, after },
    });
    return raw.reduce((col: any, member: any) => col.set(member.user_id, this._add(member, cache)), new Collection());
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
  fetch(member: any, options: any = { cache: true, force: false }) {
    if (typeof member === 'boolean' && !deprecationEmittedForPassingBoolean) {
      process.emitWarning(
        'Passing boolean to member option is deprecated, use cache property instead.',
        'DeprecationWarning',
      );
      deprecationEmittedForPassingBoolean = true;
    }
    const id = this.resolveId(member);
    return id
      ? this._fetchOne(id, options)
      : this._fetchMany(typeof member === 'boolean' ? { ...options, cache: member } : options);
  }
}

export default ThreadMemberManager;
export { ThreadMemberManager };
