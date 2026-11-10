import Action from './Action';
import { isGuildBasedChannel } from '../../types/channels';
import type { GatewayStageInstanceCreateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class StageInstanceCreateAction extends Action {
  handle(data: GatewayStageInstanceCreateDispatchData) {
    const { client } = this;
    const channel = this.getChannel({
      guild_id: data.guild_id,
      id: data.channel_id,
    });

    if (channel && isGuildBasedChannel(channel)) {
      const stageInstance = channel.guild.stageInstances._add(data);

      client.emit(Events.STAGE_INSTANCE_CREATE, stageInstance);

      return { stageInstance };
    }

    return {};
  }
}

export default StageInstanceCreateAction;
export { StageInstanceCreateAction };
