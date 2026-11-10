import Action from './Action';
import { isTextBasedChannel } from '../../types/channels';
import type { GatewayMessageDeleteDispatchData } from 'discord-api-types/v10';
import _MessageModule from '../../structures/Message';
const { deletedMessages } = _MessageModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class MessageDeleteAction extends Action {
  handle(data: GatewayMessageDeleteDispatchData) {
    const client = this.client;
    const channel = this.getChannel({ id: data.channel_id, ...('guild_id' in data && { guild_id: data.guild_id }) });
    let message;
    if (channel) {
      if (!isTextBasedChannel(channel)) return {};

      message = this.getMessage(data, channel);
      if (message) {
        channel.messages.cache.delete(message.id);
        deletedMessages.add(message);
        /**
         * Emitted whenever a message is deleted.
         * @event Client#messageDelete
         * @param {Message} message The deleted message
         */
        client.emit(Events.MESSAGE_DELETE, message);
      }
    }

    return { message };
  }
}

export default MessageDeleteAction;
export { MessageDeleteAction };
