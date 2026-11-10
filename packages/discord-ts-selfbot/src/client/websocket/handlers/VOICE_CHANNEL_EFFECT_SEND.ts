import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import VoiceChannelEffect from '../../../structures/VoiceChannelEffect';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
import type { GatewayVoiceChannelEffectSendDispatchData } from 'discord-api-types/v10';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isEffectData(value: unknown): value is GatewayVoiceChannelEffectSendDispatchData {
  return isRecord(value) && typeof value.guild_id === 'string';
}

export default (client: Client, packet: { d?: unknown }, _shard: WebSocketShard) => {
  if (!isEffectData(packet.d)) return;
  const data = packet.d;
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) return;
  client.emit(Events.VOICE_CHANNEL_EFFECT_SEND, new VoiceChannelEffect(data, guild));
};
