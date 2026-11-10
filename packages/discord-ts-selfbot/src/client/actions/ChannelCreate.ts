import Action from './Action';
import type { GatewayChannelCreateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class ChannelCreateAction extends Action {
  handle(data: GatewayChannelCreateDispatchData) {
    const client = this.client;
    const existing = client.channels.cache.has(data.id);
    const channel = client.channels._add(data);
    if (!existing && channel) {
      client.emit(Events.CHANNEL_CREATE, channel);
    }
    return { channel };
  }
}

export default ChannelCreateAction;
export { ChannelCreateAction };
