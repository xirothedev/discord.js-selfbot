import Action from './Action';
import { isTextBasedChannel } from '../../types/channels';
import type { GatewayMessagePollVoteDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class MessagePollVoteAddAction extends Action {
  handle(data: GatewayMessagePollVoteDispatchData) {
    const channel = this.getChannel(data);
    if (!channel || !isTextBasedChannel(channel)) return false;

    const message = this.getMessage(data, channel);
    if (!message) return false;

    const { poll } = message;

    const answer = poll?.answers.get(data.answer_id);
    if (!answer) return false;

    answer.voteCount++;

    /**
     * Emitted whenever a user votes in a poll.
     * @event Client#messagePollVoteAdd
     * @param {PollAnswer} pollAnswer The answer that was voted on
     * @param {Snowflake} userId The id of the user that voted
     */
    this.client.emit(Events.MESSAGE_POLL_VOTE_ADD, answer, data.user_id);

    return { poll };
  }
}

export default MessagePollVoteAddAction;
export { MessagePollVoteAddAction };
