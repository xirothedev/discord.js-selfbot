import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import CallState from '../../../structures/CallState';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
import type { CallData } from '../../../structures/CallState';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCallData(value: unknown): value is CallData {
  return isRecord(value) && typeof value.channel_id === 'string';
}

export default (client: Client, packet: { d?: unknown }, _shard: WebSocketShard) => {
  if (!isCallData(packet.d)) return;
  const data = packet.d;
  client.emit(Events.CALL_UPDATE, new CallState(client, data));
};
