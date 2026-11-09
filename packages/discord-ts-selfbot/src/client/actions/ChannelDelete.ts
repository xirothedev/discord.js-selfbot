import Action from './Action';
import _ChannelModule from '../../structures/Channel';
const { deletedChannels } = _ChannelModule;
import DMChannel from '../../structures/DMChannel';
import _MessageModule from '../../structures/Message';
const { deletedMessages } = _MessageModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class ChannelDeleteAction extends Action {
  declare deleted: Map<any, any>;

  constructor(client: any) {
    super(client);
    this.deleted = new Map();
  }

  handle(data: any) {
    const client = this.client;
    const channel = client.channels.cache.get(data.id);

    if (channel) {
      client.channels._remove(channel.id);
      deletedChannels.add(channel);
      if (channel.messages && !(channel instanceof DMChannel)) {
        for (const message of channel.messages.cache.values()) {
          deletedMessages.add(message);
        }
      }
      /**
       * Emitted whenever a channel is deleted.
       * @event Client#channelDelete
       * @param {DMChannel|GuildChannel} channel The channel that was deleted
       */
      client.emit(Events.CHANNEL_DELETE, channel);
    }

    return { channel };
  }
}

export default ChannelDeleteAction;
export { ChannelDeleteAction };
