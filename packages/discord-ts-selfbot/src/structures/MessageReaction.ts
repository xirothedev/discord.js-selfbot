import GuildEmoji from './GuildEmoji';
import ReactionEmoji from './ReactionEmoji';
import ReactionUserManager from '../managers/ReactionUserManager';
import Util from '../util/Util';
import type { ReactionCountDetailsData } from '../../typings';
import type { RawMessageReactionData } from '../../typings/rawDataTypes';

type RawMessageReactionSource = RawMessageReactionData & {
  me?: boolean;
  me_burst?: boolean;
};

type RawMessageReactionPatch = {
  burst_colors?: string[] | null;
  count?: number;
  count_details?: ReactionCountDetailsData;
};
import type { Message } from './Message';

/**
 * Represents a reaction to a message.
 */
class MessageReaction {
  declare client: import('../client/Client').default;
  declare message: Message;
  declare me: boolean;
  declare meBurst: boolean;
  declare users: ReactionUserManager;
  declare _emoji: GuildEmoji | ReactionEmoji;
  declare burstColors: string[] | null;
  declare count: number;
  declare countDetails: ReactionCountDetailsData;

  constructor(client: import('../client/Client').default, data: RawMessageReactionSource, message: Message) {
    /**
     * The client that instantiated this message reaction
     * @name MessageReaction#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The message that this reaction refers to
     * @type {Message}
     */
    this.message = message;

    /**
     * Whether the client has given this reaction
     * @type {boolean}
     */
    this.me = data.me ?? false;

    /**
     * Whether the client has super-reacted using this emoji
     * @type {boolean}
     */
    this.meBurst = Boolean(data.me_burst);

    /**
     * A manager of the users that have given this reaction
     * @type {ReactionUserManager}
     */
    this.users = new ReactionUserManager(this, this.me && client.user ? [client.user] : []);

    this._emoji = new ReactionEmoji(this, data.emoji);

    this.burstColors = null;

    this._patch(data);
  }

  _patch(data: RawMessageReactionPatch) {
    if (data.burst_colors) {
      /**
       * Hexadecimal colors used for this super reaction
       * @type {?string[]}
       */
      this.burstColors = data.burst_colors;
    }

    if (data.count !== undefined) {
      /**
       * The number of people that have given the same reaction
       * @type {?number}
       */
      this.count ??= data.count;
    }

    const countDetails = data.count_details;
    if (countDetails) {
      /**
       * The reaction count details object contains information about super and normal reaction counts.
       * @typedef {Object} ReactionCountDetailsData
       * @property {number} burst Count of super reactions
       * @property {number} normal Count of normal reactions
       */

      /**
       * The reaction count details object contains information about super and normal reaction counts.
       * @type {ReactionCountDetailsData}
       */
      this.countDetails = {
        burst: countDetails.burst,
        normal: countDetails.normal,
      };
    } else {
      this.countDetails ??= { burst: 0, normal: 0 };
    }
  }

  /**
   * Removes all users from this reaction.
   * @returns {Promise<MessageReaction>}
   */
  async remove() {
    await this.client.api
      .channels(this.message.channelId)
      .messages(this.message.id)
      .reactions(this._emoji.identifier)
      .delete();
    return this;
  }

  /**
   * The emoji of this reaction. Either a {@link GuildEmoji} object for known custom emojis, or a {@link ReactionEmoji}
   * object which has fewer properties. Whatever the prototype of the emoji, it will still have
   * `name`, `id`, `identifier` and `toString()`
   * @type {GuildEmoji|ReactionEmoji}
   * @readonly
   */
  get emoji() {
    if (this._emoji instanceof GuildEmoji) return this._emoji;
    // Check to see if the emoji has become known to the client
    if (this._emoji.id) {
      const emojis = this.message.client.emojis.cache;
      if (emojis.has(this._emoji.id)) {
        const emoji = emojis.get(this._emoji.id);
        if (emoji) {
          this._emoji = emoji;
          return emoji;
        }
      }
    }
    return this._emoji;
  }

  /**
   * Whether or not this reaction is a partial
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return this.count === null;
  }

  /**
   * Fetch this reaction.
   * @returns {Promise<MessageReaction>}
   */
  async fetch() {
    const message: import('./Message').Message = await this.message.fetch();
    const key = this.emoji.id ?? this.emoji.name;
    const existing = key === null ? undefined : message.reactions.cache.get(key);
    // The reaction won't get set when it has been completely removed
    if (existing) {
      this._patch({
        burst_colors: existing.burstColors,
        count: existing.count,
        count_details: existing.countDetails,
      });
    } else {
      this._patch({ count: 0 });
    }
    return this;
  }

  toJSON() {
    return Util.flatten(this, { emoji: 'emojiId', message: 'messageId' });
  }

  _add(user: any, burst: any) {
    if (this.partial) return;
    this.users.cache.set(user.id, user);
    if (!this.me || user.id !== this.message.client.user!.id || this.count === 0) {
      this.count++;
      if (burst) this.countDetails.burst++;
      else this.countDetails.normal++;
    }
    if (user.id === this.message.client.user!.id) {
      if (burst) this.meBurst = true;
      else this.me = true;
    }
  }

  _remove(user: any, burst: any) {
    if (this.partial) return;
    this.users.cache.delete(user.id);
    if (!this.me || user.id !== this.message.client.user!.id) {
      this.count--;
      if (burst) this.countDetails.burst--;
      else this.countDetails.normal--;
    }
    if (user.id === this.message.client.user!.id) {
      if (burst) this.meBurst = false;
      else this.me = false;
    }
    if (this.count <= 0 && this.users.cache.size === 0) {
      const key = this.emoji.id ?? this.emoji.name;
      if (key !== null) this.message.reactions.cache.delete(key);
    }
  }
}

export default MessageReaction;
export { MessageReaction };
