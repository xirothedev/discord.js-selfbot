import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export default function handleVoiceServerUpdate(
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) {
  client.emit(
    'debug',
    `[VOICE] received voice server: ${JSON.stringify(packet)}`
  );
  if (isRecord(packet.d)) {
    client.voice.onVoiceServer(packet.d);
  }
}
