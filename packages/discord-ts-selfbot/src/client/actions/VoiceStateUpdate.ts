import Action from './Action';
import type { GatewayVoiceStateUpdateDispatchData } from 'discord-api-types/v10';
import VoiceState from '../../structures/VoiceState';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class VoiceStateUpdate extends Action {
  handle(data: GatewayVoiceStateUpdateDispatchData) {
    const { client } = this;
    const guild = data.guild_id
      ? client.guilds.cache.get(data.guild_id)
      : undefined;

    const voiceStates = guild ? guild.voiceStates : client.voiceStates;
    const oldState =
      voiceStates.cache.get(data.user_id)?._clone() ??
      new VoiceState(guild ? guild.client : client, guild ?? null, {
        user_id: data.user_id,
      });

    const newState = voiceStates._add(data);

    if (guild) {
      // Get the member
      let member = guild.members.cache.get(data.user_id);
      if (member && data.member) {
        member._patch(data.member);
      } else if (data.member?.user && data.member.joined_at) {
        member = guild.members._add(data.member);
      }
    }

    client.emit(Events.VOICE_STATE_UPDATE, oldState, newState);
    // Emit event
    if (data.user_id === client.user?.id) {
      client.emit(
        'debug',
        `[VOICE] received voice state update: ${JSON.stringify(data)}`
      );
      client.voice.onVoiceStateUpdate(data);
    }
  }
}

export default VoiceStateUpdate;
export { VoiceStateUpdate };
