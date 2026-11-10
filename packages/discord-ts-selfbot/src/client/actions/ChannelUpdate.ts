import Action from './Action';
import type { GatewayChannelUpdateDispatchData } from 'discord-api-types/v10';
import _ChannelModule from '../../structures/Channel';
const { Channel } = _ChannelModule;
import _ConstantsModule from '../../util/Constants';
const { ChannelTypes } = _ConstantsModule;

class ChannelUpdateAction extends Action {
  handle(data: GatewayChannelUpdateDispatchData) {
    const client = this.client;
    let channel = client.channels.cache.get(data.id);

    if (channel) {
      const old = channel._update(data);

      if (ChannelTypes[channel.type] !== data.type) {
        const newChannel = Channel.create(this.client, data, channel.guild);

        if (!newChannel) {
          this.client.channels.cache.delete(channel.id);
          return {};
        }

        if (channel.isText() && newChannel.isText()) {
          for (const [id, message] of channel.messages.cache) newChannel.messages.cache.set(id, message);
        }

        channel = newChannel;
        this.client.channels.cache.set(channel.id, channel);
      }

      return {
        old,
        updated: channel,
      };
    } else {
      client.channels._add(data);
    }

    return {};
  }
}

export default ChannelUpdateAction;
export { ChannelUpdateAction };
