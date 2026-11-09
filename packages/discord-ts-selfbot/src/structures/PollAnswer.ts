import Base from './Base';
import _EmojiModule from './Emoji';
const { Emoji } = _EmojiModule;
import type { APIPartialEmoji } from 'discord-api-types/v10';
import type { APIPollAnswer } from 'discord-api-types/v10';
import type { BaseFetchPollAnswerVotersOptions } from '../../typings';
import type { Poll } from './Poll';

/**
 * Represents an answer to a {@link Poll}
 * @extends {Base}
 */
class PollAnswer extends Base {
  declare poll: Poll;
  declare id: number;
  declare text: string | null;
  declare _emoji: APIPartialEmoji | null;
  declare voteCount: number;

  constructor(client: import('../client/Client').default, data: APIPollAnswer & { count?: number }, poll: Poll) {
    super(client);

    /**
     * The {@link Poll} this answer is part of
     * @name PollAnswer#poll
     * @type {Poll}
     * @readonly
     */
    Object.defineProperty(this, 'poll', { value: poll });

    /**
     * The id of this answer
     * @type {number}
     */
    this.id = data.answer_id;

    /**
     * The text of this answer
     * @type {?string}
     */
    this.text = data.poll_media.text ?? null;

    /**
     * The raw emoji of this answer
     * @name PollAnswer#_emoji
     * @type {?APIPartialEmoji}
     * @private
     */
    Object.defineProperty(this, '_emoji', { value: data.poll_media.emoji ?? null });

    this._patch(data);
  }

  _patch(data: APIPollAnswer & { count?: number }) {
    // This `count` field comes from `poll.results.answer_counts`
    if ('count' in data) {
      /**
       * The amount of votes this answer has
       * @type {number}
       */
      this.voteCount = data.count ?? 0;
    } else {
      this.voteCount ??= 0;
    }
  }

  /**
   * The emoji of this answer
   * @type {?(GuildEmoji|Emoji)}
   */
  get emoji() {
    if (!this._emoji || (!this._emoji.id && !this._emoji.name)) return null;
    return (
      (this._emoji.id ? this.client.emojis.cache.get(this._emoji.id) : null) ?? new Emoji(this.client, this._emoji)
    );
  }

  /**
   * @typedef {Object} FetchPollVotersOptions
   * @property {number} [limit] The maximum number of voters to fetch
   * @property {Snowflake} [after] The user id to fetch voters after
   */

  /**
   * Fetches the users that voted for this answer
   * @param {FetchPollVotersOptions} [options={}] The options for fetching voters
   * @returns {Promise<Collection<Snowflake, User>>}
   */
  fetchVoters({ after, limit }: BaseFetchPollAnswerVotersOptions = {}) {
    return this.poll.message.channel.messages.fetchPollAnswerVoters({
      messageId: this.poll.message.id,
      answerId: this.id,
      after,
      limit,
    });
  }
}

export { PollAnswer };
export default { PollAnswer };
