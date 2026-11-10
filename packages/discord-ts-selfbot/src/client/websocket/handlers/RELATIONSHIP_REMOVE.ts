import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import _ConstantsModule from "../../../util/Constants";

const { Events } = _ConstantsModule;
import type { RelationshipData } from "../../../managers/RelationshipManager";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRelationshipData(value: unknown): value is RelationshipData {
  return isRecord(value) && typeof value.id === "string";
}

export default (
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) => {
  if (!isRelationshipData(packet.d)) {
    return;
  }
  const data = packet.d;
  client.relationships.cache.delete(data.id);
  client.relationships.friendNicknames.delete(data.id);
  client.relationships.sinceCache.delete(data.id);
  client.emit(Events.RELATIONSHIP_REMOVE, data.id, data.type, data.nickname);
};
