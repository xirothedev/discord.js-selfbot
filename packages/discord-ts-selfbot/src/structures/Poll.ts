import { Collection } from '@discordjs/collection';
import Base from './Base';
import _PollAnswerModule from './PollAnswer';
const { PollAnswer } = _PollAnswerModule;
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { PollLayoutTypes } = _ConstantsModule;
import type { APIPoll } from 'discord-api-types/v10';
import type { PollQuestionMedia } from '../../typings';
import type { Message } from './Message';

/**
 * Represents a Poll
 * @extends {Base}
 */
class Poll extends Base {
  declare message: Message;
  declare question: PollQuestionMedia;
  declare answers: Collection<number, import('./PollAnswer').PollAnswer>;
  declare expiresTimestamp: number;
  declare allowMultiselect: boolean;
  declare layoutType: import('../../typings/enums').PollLayoutTypes;
  declare resultsFinalized: boolean;

  constructor(client: import('../client/Client').default, data: APIPoll, message: Message) {
    super(client);

    /**
     * The message that started this poll
     * @name Poll#message
     * @type {Message}
     * @readonly
     */

    Object.defineProperty(this, 'message', { value: message });

    /**
     * The media for a poll's question
     * @typedef {Object} PollQuestionMedia
     * @property {string} text The text of this question
     */

    /**
     * The media for this poll's question
     * @type {PollQuestionMedia}
     */
    this.question = {
      text: data.question.text ?? '',
    };

    /**
     * The answers of this poll
     * @type {Collection<number, PollAnswer>}
     */
    this.answers = data.answers.reduce<Collection<number, import('./PollAnswer').PollAnswer>>(
      (acc, answer) => acc.set(answer.answer_id, new PollAnswer(this.client, answer, this)),
      new Collection<number, import('./PollAnswer').PollAnswer>(),
    );

    /**
     * The timestamp when this poll expires
     * @type {number}
     */
    this.expiresTimestamp = data.expiry ? Date.parse(data.expiry) : 0;

    /**
     * Whether this poll allows multiple answers
     * @type {boolean}
     */
    this.allowMultiselect = data.allow_multiselect;

    /**
     * The layout type of this poll
     * @type {PollLayoutType}
     */
    this.layoutType = PollLayoutTypes[data.layout_type];

    this._patch(data);
  }

  _patch(data: APIPoll) {
    if (data.results) {
      /**
       * Whether this poll's results have been precisely counted
       * @type {boolean}
       */
      this.resultsFinalized = data.results.is_finalized;

      for (const answerResult of data.results.answer_counts) {
        const answer = this.answers.get(answerResult.id);
        answer?._patch(answerResult);
      }
    } else {
      this.resultsFinalized ??= false;
    }
  }

  /**
   * The date when this poll expires
   * @type {Date}
   * @readonly
   */
  get expiresAt() {
    return new Date(this.expiresTimestamp);
  }

  /**
   * Ends this poll.
   * @returns {Promise<Message>}
   */
  async end() {
    if (Date.now() > this.expiresTimestamp) {
      throw new Error('POLL_ALREADY_EXPIRED');
    }
    const channel = this.message.channel;
    if (!channel) throw new Error('CHANNEL_NOT_CACHED');
    return channel.messages.endPoll(this.message.id);
  }
}

export { Poll };
export default { Poll };
