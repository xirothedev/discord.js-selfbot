import Action from './Action';
import type { GatewayStageInstanceCreateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class StageInstanceCreateAction extends Action {
  handle(data: GatewayStageInstanceCreateDispatchData) {
    const client = this.client;
    const channel = this.getChannel({ id: data.channel_id, guild_id: data.guild_id });

    if (channel) {
      const stageInstance = channel.guild.stageInstances._add(data);

      /**
       * Emitted whenever a stage instance is created.
       * @event Client#stageInstanceCreate
       * @param {StageInstance} stageInstance The created stage instance
       */
      client.emit(Events.STAGE_INSTANCE_CREATE, stageInstance);

      return { stageInstance };
    }

    return {};
  }
}

export default StageInstanceCreateAction;
export { StageInstanceCreateAction };
