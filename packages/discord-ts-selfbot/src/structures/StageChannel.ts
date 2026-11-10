import BaseGuildVoiceChannel from './BaseGuildVoiceChannel';
import type { StageInstanceCreateOptions } from '../../typings';
import type { PatchOf } from '../types/schema';

class StageChannel extends BaseGuildVoiceChannel {
  _patch(data: PatchOf<'GuildChannel'> & { topic?: string | null }) {
    super._patch(data);

    if ('topic' in data) {
      this.topic = data.topic;
    }
  }

  get stageInstance() {
    return (
      this.guild.stageInstances.cache.find(
        (stageInstance) => stageInstance.channelId === this.id
      ) ?? null
    );
  }

  createStageInstance(options: StageInstanceCreateOptions) {
    return this.guild.stageInstances.create(this.id, options);
  }

  setTopic(topic: string, reason?: string) {
    return this.edit({ topic }, reason);
  }
}

export default StageChannel;
export { StageChannel };
