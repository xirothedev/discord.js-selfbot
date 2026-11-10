import _ConstantsModule from "../../../util/Constants";

const { Events, Status } = _ConstantsModule;
import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import type { GatewayGuildMemberAddDispatchData } from "discord-api-types/v10";

function isMemberAddData(
  value: unknown
): value is GatewayGuildMemberAddDispatchData {
  return (
    typeof value === "object" &&
    value !== null &&
    "guild_id" in value &&
    typeof value.guild_id === "string"
  );
}

export default function handleGuildMemberAdd(
  client: Client,
  packet: { d?: unknown },
  shard: WebSocketShard
) {
  if (!isMemberAddData(packet.d)) {
    return;
  }
  const data = packet.d;
  const guild = client.guilds.cache.get(data.guild_id);
  if (guild) {
    guild.memberCount++;
    const member = guild.members._add(data);
    if (shard.status === Status.READY) {
      client.emit(Events.GUILD_MEMBER_ADD, member);
    }
  }
}
