import Action from './Action';
import { isTextBasedChannel } from '../../types/channels';
import type { GatewayTypingStartDispatchData } from 'discord-api-types/v10';
import Typing from '../../structures/Typing';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class TypingStart extends Action {
  handle(data: GatewayTypingStartDispatchData) {
    const channel = this.getChannel({ id: data.channel_id, ...('guild_id' in data && { guild_id: data.guild_id }) });
    if (!channel) return;

    if (!isTextBasedChannel(channel)) {
      this.client.emit(Events.WARN, `Discord sent a typing packet to a ${channel.type} channel ${channel.id}`);
      return;
    }

    const user = this.getUserFromMember(data);
    if (user) {
      /**
       * Emitted whenever a user starts typing in a channel.
       * @event Client#typingStart
       * @param {Typing} typing The typing state
       */
      this.client.emit(Events.TYPING_START, new Typing(channel, user, data));
    }
  }
}

export default TypingStart;
export { TypingStart };
