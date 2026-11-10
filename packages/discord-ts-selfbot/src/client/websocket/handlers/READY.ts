import USER_REQUIRED_ACTION from "./USER_REQUIRED_ACTION_UPDATE";
import type { UserRequiredActionData } from "./USER_REQUIRED_ACTION_UPDATE";
import Application from "../../../structures/interfaces/Application";
import _ConstantsModule from "../../../util/Constants";

const { Opcodes } = _ConstantsModule;
import ClientUser from "../../../structures/ClientUser";
import type { Snowflake } from "discord-api-types/v10";
import type { Client } from "../../Client";
import type { WebSocketShard } from "../WebSocketShard";
import type {
  RawApplicationData,
  RawChannelData,
  RawGuildData,
  RawUserData,
} from "../../../../typings/rawDataTypes";
import type {
  RawGuildSettingsData,
  RawUserSettingsData,
} from "../../../../typings";
import type { RelationshipData } from "../../../managers/RelationshipManager";

type ReadyGuildData = RawGuildData & { shardId?: number };

interface ReadyGuildSettingsData extends Partial<RawGuildSettingsData> {
  guild_id: Snowflake;
}

interface GuildSubscription {
  typing: boolean;
  threads: boolean;
  activities: boolean;
  member_updates: boolean;
  thread_member_lists: unknown[];
  members: unknown[];
  channels: Record<string, unknown>;
}

interface ReadyData extends UserRequiredActionData {
  user: RawUserData;
  application?: RawApplicationData;
  private_channels: RawChannelData[];
  guilds: ReadyGuildData[];
  notes: Record<string, string>;
  relationships: RelationshipData[];
  user_settings: Partial<RawUserSettingsData>;
  user_guild_settings: ReadyGuildSettingsData[];
  auth_session_id_hash: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReadyData(value: unknown): value is ReadyData {
  return (
    isRecord(value) &&
    isRecord(value.user) &&
    typeof value.user.id === "string" &&
    Array.isArray(value.private_channels) &&
    Array.isArray(value.guilds)
  );
}

function buildSubscriptions(
  guilds: readonly ReadyGuildData[]
): Record<string, GuildSubscription> {
  const subscriptions: Record<string, GuildSubscription> = {};
  for (const guild of guilds) {
    subscriptions[guild.id] = {
      activities: true,
      channels: {},
      member_updates: true,
      members: [],
      thread_member_lists: [],
      threads: true,
      typing: true,
    };
  }
  return subscriptions;
}

export default (
  client: Client,
  packet: { d?: unknown },
  shard: WebSocketShard
) => {
  if (!isReadyData(packet.d)) {
    return;
  }
  const data = packet.d;
  // Check
  USER_REQUIRED_ACTION(client, { d: data });
  // Overwrite ClientPresence
  client.presence.userId = data.user.id;
  if (client.user) {
    client.user._patch(data.user);
  } else {
    client.user = new ClientUser(client, data.user);
    client.users.cache.set(client.user.id, client.user);
  }
  if (data.application) {
    if (client.application) {
      client.application._patch(data.application);
    } else {
      client.application = new Application(client, data.application);
    }
  }
  for (const private_channel of data.private_channels) {
    client.channels._add(private_channel);
  }
  for (const guild of data.guilds) {
    guild.shardId = shard.id;
    client.guilds._add(guild);
  }
  // User Notes
  client.notes._reload(data.notes);
  // Relationship
  client.relationships._setup(data.relationships);
  // ClientSetting
  client.settings._patch(data.user_settings);
  // GuildSetting
  for (const gSetting of Array.isArray(data.user_guild_settings)
    ? data.user_guild_settings
    : []) {
    const guild = client.guilds.cache.get(gSetting.guild_id);
    if (guild) {
      guild.settings._patch(gSetting);
    }
  }
  // Todo: data.auth_session_id_hash
  client.sessions.currentSessionIdHash = data.auth_session_id_hash;
  if (data.guilds.length) {
    if (data.guilds.length > 80) {
      // Split data bc 15kb
      const data1 = data.guilds.slice(0, Math.floor(data.guilds.length / 2));
      const data2 = data.guilds.slice(Math.floor(data.guilds.length / 2));
      client.ws.broadcast({
        d: { subscriptions: buildSubscriptions(data1) },
        op: Opcodes.GUILD_SUBSCRIPTIONS_BULK,
      });
      client.ws.broadcast({
        d: { subscriptions: buildSubscriptions(data2) },
        op: Opcodes.GUILD_SUBSCRIPTIONS_BULK,
      });
    } else {
      client.ws.broadcast({
        d: { subscriptions: buildSubscriptions(data.guilds) },
        op: Opcodes.GUILD_SUBSCRIPTIONS_BULK,
      });
    }
  }
  Promise.all(
    data.private_channels.map(async (channel, index) => {
      if (client.options.DMChannelVoiceStatusSync < 1) {
        return;
      }
      client.ws.broadcast({
        d: {
          channel_id: channel.id,
        },
        op: Opcodes.DM_UPDATE,
      });
      await client.sleep(client.options.DMChannelVoiceStatusSync * index);
    })
  ).then(() => shard.checkReady());
};
