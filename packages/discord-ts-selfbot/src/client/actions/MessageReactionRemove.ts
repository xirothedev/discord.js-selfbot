import Action from './Action';
import { isTextBasedChannel } from '../../types/channels';
import type { GatewayMessageReactionRemoveDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

/*
{ user_id: 'id',
     message_id: 'id',
     emoji: { name: '�', id: null },
     channel_id: 'id',
     guild_id: 'id' }
*/

class MessageReactionRemove extends Action {
  handle(data: GatewayMessageReactionRemoveDispatchData) {
    if (!data.emoji) {
      return false;
    }

    const user = this.getUser(data);
    if (!user) {
      return false;
    }

    // Verify channel
    const channel = this.getChannel({
      id: data.channel_id,
      user_id: data.user_id,
      ...('guild_id' in data && { guild_id: data.guild_id }),
    });
    if (!channel || !isTextBasedChannel(channel)) {
      return false;
    }

    // Verify message
    const message = this.getMessage(data, channel);
    if (!message) {
      return false;
    }

    // Verify reaction
    const reaction = this.getReaction(data, message, user);
    if (!reaction) {
      return false;
    }
    reaction._remove(user, data.burst);
    this.client.emit(Events.MESSAGE_REACTION_REMOVE, reaction, user, {
      burst: data.burst,
      type: data.type,
    });

    return { message, reaction, user };
  }
}

export default MessageReactionRemove;
export { MessageReactionRemove };
