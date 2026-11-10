import { Collection } from '@discordjs/collection';
import Action from './Action';
import type { GatewayMessageDeleteBulkDispatchData } from 'discord-api-types/v10';
import _MessageModule from '../../structures/Message';
const { deletedMessages } = _MessageModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class MessageDeleteBulkAction extends Action {
  handle(data: GatewayMessageDeleteBulkDispatchData) {
    const client = this.client;
    const channel = client.channels.cache.get(data.channel_id);

    if (channel) {
      if (!channel.isText()) return {};

      const ids = data.ids;
      const messages = new Collection();
      for (const id of ids) {
        const message = this.getMessage(
          {
            id,
            guild_id: data.guild_id,
          },
          channel,
          false,
        );
        if (message) {
          deletedMessages.add(message);
          messages.set(message.id, message);
          channel.messages.cache.delete(id);
        }
      }

      /**
       * Emitted whenever messages are deleted in bulk.
       * @event Client#messageDeleteBulk
       * @param {Collection<Snowflake, Message>} messages The deleted messages, mapped by their id
       */
      if (messages.size > 0) client.emit(Events.MESSAGE_BULK_DELETE, messages);
      return { messages };
    }
    return {};
  }
}

export default MessageDeleteBulkAction;
export { MessageDeleteBulkAction };
