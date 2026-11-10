import Action from './Action';
import type { Client } from '../Client';
import type { Channel } from '../../structures/Channel';
import type { GatewayChannelDeleteDispatchData } from 'discord-api-types/v10';
import _ChannelModule from '../../structures/Channel';

const { deletedChannels } = _ChannelModule;
import DMChannel from '../../structures/DMChannel';
import { isTextBasedChannel } from '../../types/channels';
import _MessageModule from '../../structures/Message';

const { deletedMessages } = _MessageModule;
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class ChannelDeleteAction extends Action {
  declare deleted: Map<string, Channel>;

  constructor(client: Client) {
    super(client);
    this.deleted = new Map<string, Channel>();
  }

  handle(data: GatewayChannelDeleteDispatchData) {
    const { client } = this;
    const channel = client.channels.cache.get(data.id);

    if (channel) {
      client.channels._remove(channel.id);
      deletedChannels.add(channel);
      if (isTextBasedChannel(channel) && !(channel instanceof DMChannel)) {
        for (const message of channel.messages.cache.values()) {
          deletedMessages.add(message);
        }
      }
      client.emit(Events.CHANNEL_DELETE, channel);
    }

    return { channel };
  }
}

export default ChannelDeleteAction;
export { ChannelDeleteAction };
