import process from 'node:process';
import Action from './Action';
import type { GatewayMessageCreateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

let deprecationEmitted = false;

class MessageCreateAction extends Action {
  handle(data: GatewayMessageCreateDispatchData) {
    const client = this.client;
    const channel = this.getChannel({
      id: data.channel_id,
      author: data.author,
      ...('guild_id' in data && { guild_id: data.guild_id }),
    });
    if (channel) {
      if (!channel.isText()) return {};

      const existing = channel.messages.cache.get(data.id);
      if (existing && existing.author?.id !== this.client.user!.id) return { message: existing };
      const message = existing ?? channel.messages._add(data);
      channel.lastMessageId = data.id;

      /**
       * Emitted whenever a message is created.
       * @event Client#messageCreate
       * @param {Message} message The created message
       */
      client.emit(Events.MESSAGE_CREATE, message);

      /**
       * Emitted whenever a message is created.
       * @event Client#message
       * @param {Message} message The created message
       * @deprecated Use {@link Client#event:messageCreate} instead
       */
      if (client.emit('message', message) && !deprecationEmitted) {
        deprecationEmitted = true;
        process.emitWarning('The message event is deprecated. Use messageCreate instead', 'DeprecationWarning');
      }

      return { message };
    }

    return {};
  }
}

export default MessageCreateAction;
export { MessageCreateAction };
