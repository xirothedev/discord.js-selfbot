import Action from './Action';
import type { GatewayStageInstanceDeleteDispatchData } from 'discord-api-types/v10';
import _StageInstanceModule from '../../structures/StageInstance';
const { deletedStageInstances } = _StageInstanceModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class StageInstanceDeleteAction extends Action {
  handle(data: GatewayStageInstanceDeleteDispatchData) {
    const client = this.client;
    const channel = this.getChannel({ id: data.channel_id, guild_id: data.guild_id });

    if (channel) {
      const stageInstance = channel.guild.stageInstances._add(data);
      if (stageInstance) {
        channel.guild.stageInstances.cache.delete(stageInstance.id);
        deletedStageInstances.add(stageInstance);

        /**
         * Emitted whenever a stage instance is deleted.
         * @event Client#stageInstanceDelete
         * @param {StageInstance} stageInstance The deleted stage instance
         */
        client.emit(Events.STAGE_INSTANCE_DELETE, stageInstance);

        return { stageInstance };
      }
    }

    return {};
  }
}

export default StageInstanceDeleteAction;
export { StageInstanceDeleteAction };
