import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import _ConstantsModule from '../../../util/Constants';
const { Events } = _ConstantsModule;
import type { RelationshipData } from '../../../managers/RelationshipManager';
import type { RawUserData } from '../../../../typings/rawDataTypes';

interface RelationshipAddData extends RelationshipData {
  user?: RawUserData;
  should_notify?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRelationshipData(value: unknown): value is RelationshipAddData {
  return isRecord(value) && typeof value.id === 'string' && typeof value.type === 'number';
}

export default (client: Client, packet: { d?: unknown }, _shard: WebSocketShard) => {
  if (!isRelationshipData(packet.d)) return;
  const data = packet.d;
  if (data.user) client.users._add(data.user);
  client.relationships.cache.set(data.id, data.type);
  client.relationships.friendNicknames.set(data.id, data.nickname);
  client.relationships.sinceCache.set(data.id, new Date(data.since ?? 0));
  client.emit(Events.RELATIONSHIP_ADD, data.id, Boolean(data.should_notify));
};
