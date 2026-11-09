import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import User from '../structures/User';
import _ConstantsModule from '../util/Constants';
const { ReactionTypes } = _ConstantsModule;

/**
 * Manages API methods for users who reacted to a reaction and stores their cache.
 * @extends {CachedManager}
 */
class ReactionUserManager extends CachedManager<User> {
  declare reaction: import('../structures/MessageReaction').MessageReaction;
  constructor(reaction: any, iterable?: any) {
    super(reaction.client, User, iterable);

    /**
     * The reaction that this manager belongs to
     * @type {MessageReaction}
     */
    this.reaction = reaction;
  }

  /**
   * The cache of this manager
   * @type {Collection<Snowflake, User>}
   * @name ReactionUserManager#cache
   */

  /**
   * Options used to fetch users who gave a reaction.
   * @typedef {Object} FetchReactionUsersOptions
   * @property {ReactionType} [type='NORMAL'] The reaction type to fetch
   * @property {number} [limit=100] The maximum amount of users to fetch, defaults to `100`
   * @property {Snowflake} [after] Limit fetching users to those with an id greater than the supplied id
   */

  /**
   * Fetches all the users that gave this reaction. Resolves with a collection of users, mapped by their ids.
   * @param {FetchReactionUsersOptions} [options] Options for fetching the users
   * @returns {Promise<Collection<Snowflake, User>>}
   */
  async fetch({ limit = 100, after, type = 'NORMAL' }: any = {}) {
    const message = this.reaction.message;
    const data = await this.client.api.channels[message.channelId].messages[message.id].reactions[
      this.reaction.emoji.identifier
    ].get({ query: { limit, after, type: typeof type == 'number' ? type : ReactionTypes[type] } });
    const users = new Collection();
    for (const rawUser of data) {
      const user = this.client.users._add(rawUser);
      this.cache.set(user.id, user);
      users.set(user.id, user);
    }
    return users;
  }

  /**
   * Removes a user from this reaction.
   * @param {UserResolvable} [user=this.client.user] The user to remove the reaction of
   * @returns {Promise<MessageReaction>}
   */
  async remove(user: any = this.client.user) {
    const userId = this.client.users.resolveId(user);
    if (!userId) throw new Error('REACTION_RESOLVE_USER');
    const message = this.reaction.message;
    await this.client.api.channels[message.channelId].messages[message.id].reactions[this.reaction.emoji.identifier][
      userId === this.client.user!.id ? '@me' : userId
    ].delete();
    return this.reaction;
  }
}

export default ReactionUserManager;
export { ReactionUserManager };
