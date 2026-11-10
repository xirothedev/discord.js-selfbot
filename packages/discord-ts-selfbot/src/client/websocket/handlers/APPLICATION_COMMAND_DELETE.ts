import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import _ConstantsModule from "../../../util/Constants";

const { Events } = _ConstantsModule;
import type { RawApplicationCommandData } from "../../../../typings/rawDataTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApplicationCommandData(
  value: unknown
): value is RawApplicationCommandData {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string"
  );
}

export default (
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) => {
  if (!isApplicationCommandData(packet.d)) {
    return;
  }
  const data = packet.d;
  const commandManager = client.application!.commands;
  if (!commandManager) {
    return;
  }
  const isOwn = data.application_id === client.application!.id;
  const command = commandManager._add(data, isOwn);
  if (isOwn) {
    commandManager.cache.delete(data.id);
  }
  client.emit(Events.APPLICATION_COMMAND_DELETE, command);
};
