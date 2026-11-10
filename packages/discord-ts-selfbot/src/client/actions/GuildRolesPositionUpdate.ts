import Action from './Action';
import type { Snowflake } from 'discord-api-types/v10';

interface GuildRolesPositionUpdateData {
  guild_id: Snowflake;
  roles: { id?: unknown; position?: unknown }[];
}

class GuildRolesPositionUpdate extends Action {
  handle(data: GuildRolesPositionUpdateData) {
    const client = this.client;

    const guild = client.guilds.cache.get(data.guild_id);
    if (guild) {
      for (const partialRole of data.roles) {
        if (typeof partialRole.id !== 'string' || typeof partialRole.position !== 'number') continue;
        const role = guild.roles.cache.get(partialRole.id);
        if (role) role.rawPosition = partialRole.position;
      }
    }

    return { guild };
  }
}

export default GuildRolesPositionUpdate;
export { GuildRolesPositionUpdate };
