import _ConstantsModule from '../../../util/Constants';
const { Events, Opcodes, Status } = _ConstantsModule;
import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import type { GatewayGuildCreateDispatchData } from 'discord-api-types/v10';

interface GuildCreateData extends GatewayGuildCreateDispatchData {
  shardId?: number;
}

interface GuildLike {
  id: string;
}

function isGuildCreateData(value: unknown): value is GuildCreateData {
  return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string';
}

const run = (client: Client, guild: GuildLike) => {
  const subs: Record<string, unknown> = {};
  subs[guild.id] = {
    typing: true,
    threads: true,
    activities: true,
    member_updates: true,
    thread_member_lists: [],
    members: [],
    channels: {},
  };
  client.ws.broadcast({
    op: Opcodes.GUILD_SUBSCRIPTIONS_BULK,
    d: {
      subscriptions: subs,
    },
  });
};
export default (client: Client, packet: { d?: unknown }, shard: WebSocketShard) => {
  if (!isGuildCreateData(packet.d)) return;
  const data = packet.d;
  let guild = client.guilds.cache.get(data.id);
  run(client, data);
  if (guild) {
    if (!guild.available && !data.unavailable) {
      // A newly available guild
      guild._patch(data);
      client.emit(Events.GUILD_AVAILABLE, guild);
    }
  } else {
    // A new guild
    data.shardId = shard.id;
    guild = client.guilds._add(data);
    if (client.ws.status === Status.READY) {
      client.emit(Events.GUILD_CREATE, guild);
      run(client, guild);
    }
  }
};
