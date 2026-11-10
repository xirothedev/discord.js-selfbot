import Action from './Action';
import type { Snowflake } from 'discord-api-types/v10';

interface GuildChannelsPositionUpdateData {
  guild_id: Snowflake;
  channels: { id?: unknown; position?: unknown }[];
}

class GuildChannelsPositionUpdate extends Action {
  handle(data: GuildChannelsPositionUpdateData) {
    const client = this.client;

    const guild = client.guilds.cache.get(data.guild_id);
    if (guild) {
      for (const partialChannel of data.channels) {
        if (typeof partialChannel.id !== 'string' || typeof partialChannel.position !== 'number') continue;
        const channel = guild.channels.cache.get(partialChannel.id);
        if (channel) channel.rawPosition = partialChannel.position;
      }
    }

    return { guild };
  }
}

export default GuildChannelsPositionUpdate;
export { GuildChannelsPositionUpdate };
