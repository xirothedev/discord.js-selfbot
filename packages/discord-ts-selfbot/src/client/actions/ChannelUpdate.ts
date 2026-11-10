import Action from "./Action";
import { isTextBasedChannel, isGuildBasedChannel } from "../../types/channels";
import type {
  GatewayChannelUpdateDispatchData,
  GatewayThreadUpdateDispatchData,
} from "discord-api-types/v10";
import _ChannelModule from "../../structures/Channel";

const { Channel } = _ChannelModule;
import _ConstantsModule, { resolveEnumValue } from "../../util/Constants";

const { ChannelTypes } = _ConstantsModule;

class ChannelUpdateAction extends Action {
  handle(
    data: GatewayChannelUpdateDispatchData | GatewayThreadUpdateDispatchData
  ) {
    const { client } = this;
    let channel = client.channels.cache.get(data.id);

    if (channel) {
      const old = channel._update(data);

      if (resolveEnumValue(ChannelTypes, channel.type) !== data.type) {
        const guild = isGuildBasedChannel(channel) ? channel.guild : undefined;
        const newChannel = Channel.create(this.client, data, guild);

        if (!newChannel) {
          this.client.channels.cache.delete(channel.id);
          return {};
        }

        if (isTextBasedChannel(channel) && isTextBasedChannel(newChannel)) {
          for (const [id, message] of channel.messages.cache) {
            newChannel.messages.cache.set(id, message);
          }
        }

        channel = newChannel;
        this.client.channels.cache.set(newChannel.id, newChannel);
      }

      return {
        old,
        updated: channel,
      };
    }
    client.channels._add(data);

    return {};
  }
}

export default ChannelUpdateAction;
export { ChannelUpdateAction };
