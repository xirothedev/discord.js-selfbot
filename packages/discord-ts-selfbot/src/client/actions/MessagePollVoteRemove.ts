import Action from './Action';
import { isTextBasedChannel } from '../../types/channels';
import type { GatewayMessagePollVoteDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class MessagePollVoteRemoveAction extends Action {
  handle(data: GatewayMessagePollVoteDispatchData) {
    const channel = this.getChannel(data);
    if (!channel || !isTextBasedChannel(channel)) return false;

    const message = this.getMessage(data, channel);
    if (!message) return false;

    const { poll } = message;

    const answer = poll?.answers.get(data.answer_id);
    if (!answer) return false;

    answer.voteCount--;

    this.client.emit(Events.MESSAGE_POLL_VOTE_REMOVE, answer, data.user_id);

    return { poll };
  }
}

export default MessagePollVoteRemoveAction;
export { MessagePollVoteRemoveAction };
