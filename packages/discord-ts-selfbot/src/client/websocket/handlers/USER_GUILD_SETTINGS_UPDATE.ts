import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import type { RawGuildSettingsData } from "../../../../typings";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGuildSettingsData(
  value: unknown
): value is Partial<RawGuildSettingsData> & { guild_id: string } {
  return isRecord(value) && typeof value.guild_id === "string";
}

export default (
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) => {
  if (!isGuildSettingsData(packet.d)) {
    return;
  }
  const guild = client.guilds.cache.get(packet.d.guild_id);
  if (guild) {
    guild.settings._patch(packet.d);
  }
};
