import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import _ConstantsModule from '../../../util/Constants';

const { Events } = _ConstantsModule;
import type { RawApplicationCommandData } from '../../../../typings/rawDataTypes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApplicationCommandData(
  value: unknown
): value is RawApplicationCommandData {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  );
}

export default function handleApplicationCommandUpdate(
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) {
  if (!isApplicationCommandData(packet.d)) {
    return;
  }
  const data = packet.d;
  const { application } = client;
  if (!application) {
    return;
  }
  const oldCommand = application.commands.cache.get(data.id)?._clone() ?? null;
  const newCommand = application.commands._add(
    data,
    data.application_id === application.id
  );
  client.emit(Events.APPLICATION_COMMAND_UPDATE, oldCommand, newCommand);
}
