import { Collection } from '@discordjs/collection';
import Base from './Base';
import _PollAnswerModule from './PollAnswer';
const { PollAnswer } = _PollAnswerModule;
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule, { resolveEnumMember } from '../util/Constants';
const { PollLayoutTypes } = _ConstantsModule;
import type { APIPoll } from 'discord-api-types/v10';
import type { PollQuestionMedia } from '../../typings';
import type { Message } from './Message';

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

    Object.defineProperty(this, 'message', { value: message });

    this.question = {
      text: data.question.text ?? '',
    };

    this.answers = data.answers.reduce<Collection<number, import('./PollAnswer').PollAnswer>>(
      (acc, answer) => acc.set(answer.answer_id, new PollAnswer(this.client, answer, this)),
      new Collection<number, import('./PollAnswer').PollAnswer>(),
    );

    this.expiresTimestamp = data.expiry ? Date.parse(data.expiry) : 0;

    this.allowMultiselect = data.allow_multiselect;

    this.layoutType = resolveEnumMember(PollLayoutTypes, data.layout_type) ?? PollLayoutTypes.DEFAULT;

    this._patch(data);
  }

  _patch(data: APIPoll) {
    if (data.results) {
      this.resultsFinalized = data.results.is_finalized;

      for (const answerResult of data.results.answer_counts) {
        const answer = this.answers.get(answerResult.id);
        answer?._patch(answerResult);
      }
    } else {
      this.resultsFinalized ??= false;
    }
  }

  get expiresAt() {
    return new Date(this.expiresTimestamp);
  }

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
