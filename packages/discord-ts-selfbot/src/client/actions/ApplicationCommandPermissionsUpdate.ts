import Action from './Action';
import type { GatewayApplicationCommandPermissionsUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class ApplicationCommandPermissionsUpdateAction extends Action {
  handle(data: GatewayApplicationCommandPermissionsUpdateDispatchData) {
    const client = this.client;
    client.emit(Events.APPLICATION_COMMAND_PERMISSIONS_UPDATE, {
      permissions: data.permissions,
      id: data.id,
      guildId: data.guild_id,
      applicationId: data.application_id,
    });
  }
}

export default ApplicationCommandPermissionsUpdateAction;
export { ApplicationCommandPermissionsUpdateAction };
