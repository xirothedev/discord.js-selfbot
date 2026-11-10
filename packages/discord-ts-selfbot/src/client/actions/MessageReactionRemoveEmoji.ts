import Action from './Action';
import { isTextBasedChannel } from '../../types/channels';
import type { GatewayMessageReactionRemoveEmojiDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class MessageReactionRemoveEmoji extends Action {
  handle(data: GatewayMessageReactionRemoveEmojiDispatchData) {
    const channel = this.getChannel({
      id: data.channel_id,
      ...('guild_id' in data && { guild_id: data.guild_id }),
    });
    if (!channel || !isTextBasedChannel(channel)) {
      return false;
    }

    const message = this.getMessage(data, channel);
    if (!message) {
      return false;
    }

    const reaction = this.getReaction(data, message);
    if (!reaction) {
      return false;
    }
    if (!message.partial) {
      message.reactions.cache.delete(
        reaction.emoji.id ?? reaction.emoji.name ?? ''
      );
    }

    this.client.emit(Events.MESSAGE_REACTION_REMOVE_EMOJI, reaction);
    return { reaction };
  }
}

export default MessageReactionRemoveEmoji;
export { MessageReactionRemoveEmoji };
