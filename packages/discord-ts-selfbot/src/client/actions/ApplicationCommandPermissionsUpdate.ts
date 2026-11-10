import Action from './Action';
import type { GatewayApplicationCommandPermissionsUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class ApplicationCommandPermissionsUpdateAction extends Action {
  handle(data: GatewayApplicationCommandPermissionsUpdateDispatchData) {
    const { client } = this;
    client.emit(Events.APPLICATION_COMMAND_PERMISSIONS_UPDATE, {
      applicationId: data.application_id,
      guildId: data.guild_id,
      id: data.id,
      permissions: data.permissions,
    });
  }
}

export default ApplicationCommandPermissionsUpdateAction;
export { ApplicationCommandPermissionsUpdateAction };
