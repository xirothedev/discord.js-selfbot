import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import _ConstantsModule from '../../../util/Constants';

const { Events } = _ConstantsModule;
import BaseGuildVoiceChannel from '../../../structures/BaseGuildVoiceChannel';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStatusData(
  value: unknown
): value is { id: string; status?: string } {
  return isRecord(value) && typeof value.id === 'string';
}

export default function handleVoiceChannelStatusUpdate(
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) {
  if (!isStatusData(packet.d)) {
    return;
  }
  const data = packet.d;
  const channel = client.channels.cache.get(data.id);
  if (channel instanceof BaseGuildVoiceChannel) {
    const old = channel._clone();
    channel.status = data.status;
    client.emit(Events.CHANNEL_UPDATE, old, channel);
  }
}
