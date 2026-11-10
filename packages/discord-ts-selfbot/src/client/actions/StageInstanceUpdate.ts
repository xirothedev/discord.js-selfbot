import Action from './Action';
import { isGuildBasedChannel } from '../../types/channels';
import type { GatewayStageInstanceUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class StageInstanceUpdateAction extends Action {
  handle(data: GatewayStageInstanceUpdateDispatchData) {
    const { client } = this;
    const channel = this.getChannel({
      guild_id: data.guild_id,
      id: data.channel_id,
    });

    if (channel && isGuildBasedChannel(channel)) {
      const oldStageInstance =
        channel.guild.stageInstances.cache.get(data.id)?._clone() ?? null;
      const newStageInstance = channel.guild.stageInstances._add(data);

      client.emit(
        Events.STAGE_INSTANCE_UPDATE,
        oldStageInstance,
        newStageInstance
      );

      return { newStageInstance, oldStageInstance };
    }

    return {};
  }
}

export default StageInstanceUpdateAction;
export { StageInstanceUpdateAction };
