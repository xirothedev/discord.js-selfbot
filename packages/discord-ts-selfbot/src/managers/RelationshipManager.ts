import { Collection } from '@discordjs/collection';
import BaseManager from './BaseManager';
import _GuildMemberModule from '../structures/GuildMember';
const { GuildMember } = _GuildMemberModule;
import _MessageModule from '../structures/Message';
const { Message } = _MessageModule;
import ThreadMember from '../structures/ThreadMember';
import User from '../structures/User';
import _ConstantsModule from '../util/Constants';
const { RelationshipTypes } = _ConstantsModule;
import type { Snowflake } from 'discord-api-types/v10';
import type { BaseFetchOptions } from '../../typings';
import type { Client } from '../client/Client';

type UserResolvableSource =
  User | InstanceType<typeof GuildMember> | InstanceType<typeof Message> | ThreadMember | Snowflake;

export interface RelationshipData {
  id: Snowflake;
  type: number;
  nickname: string | null;
  since?: string;
}

/**
 * Manages API methods for Relationships and stores their cache.
 */
class RelationshipManager extends BaseManager {
  declare cache: Collection<string, number>;
  declare friendNicknames: Collection<string, string | null>;
  declare sinceCache: Collection<string, Date>;

  constructor(client: Client, users?: RelationshipData[]) {
    super(client);
    /**
     * A collection of users this manager is caching. (Type: Number)
     * @type {Collection<Snowflake, RelationshipType>}
     */
    this.cache = new Collection();
    /**
     * @type {Collection<Snowflake, string>}
     */
    this.friendNicknames = new Collection();
    /**
     * @type {Collection<Snowflake, Date>}
     */
    this.sinceCache = new Collection();
    this._setup(users);
  }

  /**
   * Get all friends
   * @type {Collection<Snowflake, User>}
   * @readonly
   */
  get friendCache(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const key of this.cache.filter(value => value === RelationshipTypes.FRIEND).keys()) {
      const user = this.client.users.cache.get(key);
      if (user) users.set(key, user);
    }
    return users;
  }

  /**
   * Get all blocked users
   * @type {Collection<Snowflake, User>}
   * @readonly
   */
  get blockedCache(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const key of this.cache.filter(value => value === RelationshipTypes.BLOCKED).keys()) {
      const user = this.client.users.cache.get(key);
      if (user) users.set(key, user);
    }
    return users;
  }

  /**
   * Get all incoming friend requests
   * @type {Collection<Snowflake, User>}
   * @readonly
   */
  get incomingCache(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const key of this.cache.filter(value => value === RelationshipTypes.PENDING_INCOMING).keys()) {
      const user = this.client.users.cache.get(key);
      if (user) users.set(key, user);
    }
    return users;
  }

  /**
   * Get all outgoing friend requests
   * @type {Collection<Snowflake, User>}
   * @readonly
   */
  get outgoingCache(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const key of this.cache.filter(value => value === RelationshipTypes.PENDING_OUTGOING).keys()) {
      const user = this.client.users.cache.get(key);
      if (user) users.set(key, user);
    }
    return users;
  }

  /**
   * @typedef {Object} RelationshipJSONData
   * @property {Snowflake} id The ID of the target user
   * @property {RelationshipType} type The type of relationship
   * @property {string | null} nickname The nickname of the user in this relationship (1-32 characters)
   * @property {string} since When the user requested a relationship (ISO8601 timestamp)
   */

  /**
   * Return array of cache
   * @returns {RelationshipJSONData[]}
   */
  toJSON() {
    return this.cache.map((value, key) => ({
      id: key,
      type: RelationshipTypes[value],
      nickname: this.friendNicknames.get(key),
      since: this.sinceCache.get(key)?.toISOString() ?? '',
    }));
  }

  /**
   * @private
   * @param {Array<User>} users An array of users to add to the cache
   * @returns {void}
   */
  _setup(users?: RelationshipData[]) {
    if (!Array.isArray(users)) return;
    for (const relationShip of users) {
      this.friendNicknames.set(relationShip.id, relationShip.nickname);
      this.cache.set(relationShip.id, relationShip.type);
      this.sinceCache.set(relationShip.id, new Date(relationShip.since || 0));
    }
  }

  /**
   * Resolves a {@link UserResolvable} to a {@link User} id.
   * @param {UserResolvable} user The UserResolvable to identify
   * @returns {?Snowflake}
   */
  resolveId(user: UserResolvableSource): string | null {
    if (user instanceof ThreadMember) return user.id;
    if (user instanceof GuildMember) return user.user.id;
    if (user instanceof Message) return user.author?.id ?? null;
    if (user instanceof User) return user.id;
    return user.match(/\d{17,19}/)?.[0] || null;
  }

  /**
   * Resolves a {@link UserResolvable} to a {@link User} username.
   * @param {UserResolvable} user The UserResolvable to identify
   * @returns {?string}
   */
  resolveUsername(user: UserResolvableSource): string | null {
    if (user instanceof ThreadMember) return user.guildMember?.user.username ?? null;
    if (user instanceof GuildMember) return user.user.username;
    if (user instanceof Message) return user.author?.username ?? null;
    if (user instanceof User) return user.username;
    return user;
  }

  /**
   * Obtains a user from Discord, or the user cache if it's already available.
   * @param {UserResolvable} [user] The user to fetch
   * @param {BaseFetchOptions} [options] Additional options for this fetch
   * @returns {Promise<RelationshipType|RelationshipManager>}
   */
  async fetch(
    user?: UserResolvableSource,
    { force = false }: BaseFetchOptions = {},
  ): Promise<number | RelationshipManager | undefined> {
    if (user) {
      const id = this.resolveId(user);
      if (!id) return undefined;
      if (!force) {
        const existing = this.cache.get(id);
        if (existing) return existing;
      }
      const data = await this.client.api.users['@me'].relationships.get();
      await this._setup(data);
      return this.cache.get(id);
    } else {
      const data = await this.client.api.users['@me'].relationships.get();
      await this._setup(data);
      return this;
    }
  }

  /**
   * Deletes a friend / blocked relationship with a client user or cancels a friend request.
   * <info>This method is not implemented for safety. It always rejects and makes no REST request.</info>
   * @deprecated Risky relationship mutation that can trigger Discord ToS enforcement; not implemented.
   * @experimental Placeholder kept for a future opt-in design; do not use.
   * @param {UserResolvable} user Target
   * @returns {Promise<boolean>}
   * @throws {Error} Always rejects with `Risky action, not finished yet.`
   * @see {@link https://github.com/xirothedev/discord.js-selfbot/issues/11}
   */
  async deleteRelationship(_user: UserResolvableSource): Promise<boolean> {
    throw new Error('Risky action, not finished yet.');
  }

  /**
   * Sends a friend request.
   * <info>This method is not implemented for safety. It always rejects and makes no REST request.</info>
   * @deprecated Risky relationship mutation that can trigger Discord ToS enforcement; not implemented.
   * @experimental Placeholder kept for a future opt-in design; do not use.
   * @param {UserResolvable} options Target (User Object, Username, User Id)
   * @returns {Promise<boolean>}
   * @throws {Error} Always rejects with `Risky action, not finished yet.`
   * @see {@link https://github.com/xirothedev/discord.js-selfbot/issues/11}
   */
  async sendFriendRequest(_options: UserResolvableSource): Promise<boolean> {
    throw new Error('Risky action, not finished yet.');
  }

  /**
   * Accepts a friend request.
   * <info>This method is not implemented for safety. It always rejects and makes no REST request.</info>
   * @deprecated Risky relationship mutation that can trigger Discord ToS enforcement; not implemented.
   * @experimental Placeholder kept for a future opt-in design; do not use.
   * @param {UserResolvable} user The user to add as a friend
   * @returns {Promise<boolean>}
   * @throws {Error} Always rejects with `Risky action, not finished yet.`
   * @see {@link https://github.com/xirothedev/discord.js-selfbot/issues/11}
   */
  async addFriend(_user: UserResolvableSource): Promise<boolean> {
    throw new Error('Risky action, not finished yet.');
  }

  /**
   * Changes the nickname of a friend.
   * @param {UserResolvable} user The user to change the nickname
   * @param {?string} nickname New nickname
   * @returns {Promise<boolean>}
   */
  async setNickname(user: UserResolvableSource, nickname: string | null = null): Promise<boolean> {
    const id = this.resolveId(user);
    if (!id || this.cache.get(id) !== RelationshipTypes.FRIEND) return Promise.resolve(false);
    await this.client.api.users['@me'].relationships[id].patch({
      data: {
        nickname: typeof nickname === 'string' ? nickname : null,
      },
    });
    if (nickname) {
      this.friendNicknames.set(id, nickname);
    } else {
      this.friendNicknames.delete(id);
    }
    return true;
  }

  /**
   * Blocks a user.
   * <info>This method is not implemented for safety. It always rejects and makes no REST request.</info>
   * @deprecated Risky relationship mutation that can trigger Discord ToS enforcement; not implemented.
   * @experimental Placeholder kept for a future opt-in design; do not use.
   * @param {UserResolvable} user User to block
   * @returns {Promise<boolean>}
   * @throws {Error} Always rejects with `Risky action, not finished yet.`
   * @see {@link https://github.com/xirothedev/discord.js-selfbot/issues/11}
   */
  async addBlocked(_user: UserResolvableSource): Promise<boolean> {
    throw new Error('Risky action, not finished yet.');
  }
}

export default RelationshipManager;
export { RelationshipManager };
