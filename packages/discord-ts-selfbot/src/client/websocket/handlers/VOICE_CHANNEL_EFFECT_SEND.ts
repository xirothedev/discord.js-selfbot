import VoiceChannelEffect from '../../../structures/VoiceChannelEffect';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
export default (client: any, { d: data }: any) => {
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;
  /**
   * Emmited when someone sends an effect, such as an emoji reaction, in a voice channel the client is connected to.
   * @event Client#voiceChannelEffectSend
   * @param {VoiceChannelEffect} voiceChannelEffect The sent voice channel effect
   */
  client.emit(Events.VOICE_CHANNEL_EFFECT_SEND, new VoiceChannelEffect(data, guild));
};
