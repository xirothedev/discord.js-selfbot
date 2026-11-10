import Base from './Base';
import type { TextBasedChannel } from '../types/channels';
import type User from './User';
import type { RawTypingData } from '../../typings/rawDataTypes';

/**
 * Represents a typing state for a user in a channel.
 * @extends {Base}
 */
class Typing extends Base {
  declare channel: TextBasedChannel;
  declare user: User;
  declare startedTimestamp: number;

  constructor(channel: TextBasedChannel, user: User, data: RawTypingData) {
    super(channel.client);

    /**
     * The channel the status is from
     * @type {TextBasedChannels}
     */
    this.channel = channel;

    /**
     * The user who is typing
     * @type {User}
     */
    this.user = user;

    this._patch(data);
  }

  _patch(data: RawTypingData) {
    if ('timestamp' in data) {
      /**
       * The UNIX timestamp in milliseconds the user started typing at
       * @type {number}
       */
      this.startedTimestamp = data.timestamp * 1_000;
    }
  }

  /**
   * Indicates whether the status is received from a guild.
   * @returns {boolean}
   */
  inGuild() {
    return this.guild !== null;
  }

  /**
   * The time the user started typing at
   * @type {Date}
   * @readonly
   */
  get startedAt() {
    return new Date(this.startedTimestamp);
  }

  /**
   * The guild the status is from
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return 'guild' in this.channel ? this.channel.guild : null;
  }

  /**
   * The member who is typing
   * @type {?GuildMember}
   * @readonly
   */
  get member() {
    return this.guild?.members.resolve(this.user) ?? null;
  }
}

export default Typing;
export { Typing };
