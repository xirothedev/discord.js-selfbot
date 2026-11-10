import { Collection } from "@discordjs/collection";
import _ConstantsModule from "../../../util/Constants";

const { Events } = _ConstantsModule;
import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import type { GatewayGuildMembersChunkDispatchData } from "discord-api-types/v10";
import type { GuildMember } from "../../../structures/GuildMember";

function isChunkData(
  value: unknown
): value is GatewayGuildMembersChunkDispatchData {
  return (
    typeof value === "object" &&
    value !== null &&
    "guild_id" in value &&
    typeof value.guild_id === "string"
  );
}

export default function handleGuildMembersChunk(
  client: Client,
  packet: { d?: unknown },
  _shard: WebSocketShard
) {
  if (!isChunkData(packet.d)) {
    return;
  }
  const data = packet.d;
  const guild = client.guilds.cache.get(data.guild_id);
  if (!guild) {
    return;
  }
  const members = new Collection<string, GuildMember>();
  for (const member of data.members) {
    if (member.user?.id) {
      members.set(member.user.id, guild.members._add(member));
    }
  }
  if (data.presences) {
    for (const presence of data.presences) {
      guild.presences._add(Object.assign(presence, { guild }));
    }
  }
  client.emit(Events.GUILD_MEMBERS_CHUNK, members, guild, {
    count: data.chunk_count,
    index: data.chunk_index,
    nonce: data.nonce,
    notFound: data.not_found,
  });
}
