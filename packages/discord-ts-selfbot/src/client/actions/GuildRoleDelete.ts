import Action from './Action';
import type { GatewayGuildRoleDeleteDispatchData } from 'discord-api-types/v10';
import _RoleModule from '../../structures/Role';
const { deletedRoles } = _RoleModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildRoleDeleteAction extends Action {
  handle(data: GatewayGuildRoleDeleteDispatchData) {
    const client = this.client;
    const guild = client.guilds.cache.get(data.guild_id);
    let role;

    if (guild) {
      role = guild.roles.cache.get(data.role_id);
      if (role) {
        guild.roles.cache.delete(data.role_id);
        deletedRoles.add(role);
        /**
         * Emitted whenever a guild role is deleted.
         * @event Client#roleDelete
         * @param {Role} role The role that was deleted
         */
        client.emit(Events.GUILD_ROLE_DELETE, role);
      }
    }

    return { role };
  }
}

export default GuildRoleDeleteAction;
export { GuildRoleDeleteAction };
