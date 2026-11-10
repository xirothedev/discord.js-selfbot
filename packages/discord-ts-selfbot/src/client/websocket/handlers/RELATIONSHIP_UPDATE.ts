import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import _ConstantsModule from '../../../util/Constants';

const { Events } = _ConstantsModule;
import type { RelationshipData } from '../../../managers/RelationshipManager';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRelationshipData(value: unknown): value is RelationshipData {
  return isRecord(value) && typeof value.id === 'string';
}

export default function handleRelationshipUpdate(
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) {
  if (!isRelationshipData(packet.d)) {
    return;
  }
  const data = packet.d;
  const oldType = client.relationships.cache.get(data.id);
  const oldSince = client.relationships.sinceCache.get(data.id);
  const oldNickname = client.relationships.friendNicknames.get(data.id);
  if (data.type) {
    client.relationships.cache.set(data.id, data.type);
  }
  if (data.nickname) {
    client.relationships.friendNicknames.set(data.id, data.nickname);
  }
  if (data.since) {
    client.relationships.sinceCache.set(data.id, new Date(data.since));
  }
  client.emit(
    Events.RELATIONSHIP_UPDATE,
    data.id,
    { nickname: oldNickname, since: oldSince, type: oldType },
    {
      nickname: data.nickname,
      since: new Date(data.since ?? 0),
      type: data.type,
    }
  );
}
