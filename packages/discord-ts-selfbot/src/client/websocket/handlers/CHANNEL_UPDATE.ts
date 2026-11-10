import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import _ConstantsModule from "../../../util/Constants";

const { Events } = _ConstantsModule;
import type { GatewayChannelUpdateDispatchData } from "discord-api-types/v10";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isData(value: unknown): value is GatewayChannelUpdateDispatchData {
  return isRecord(value) && typeof value.id === "string";
}

export default (
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) => {
  if (!isData(packet.d)) {
    return;
  }
  const { old, updated } = client.actions.ChannelUpdate.handle(packet.d);
  if (old && updated) {
    client.emit(Events.CHANNEL_UPDATE, old, updated);
  }
};
