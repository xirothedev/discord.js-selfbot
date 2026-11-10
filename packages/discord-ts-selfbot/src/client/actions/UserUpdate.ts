import Action from "./Action";
import type { GatewayUserUpdateDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class UserUpdateAction extends Action {
  handle(data: GatewayUserUpdateDispatchData) {
    const { client } = this;

    const newUser =
      data.id === client.user?.id
        ? client.user
        : client.users.cache.get(data.id);
    if (!newUser) {
      return { old: null, updated: null };
    }
    const oldUser = newUser._update(data);

    if (!oldUser.equals(newUser)) {
      client.emit(Events.USER_UPDATE, oldUser, newUser);
      return {
        old: oldUser,
        updated: newUser,
      };
    }

    return {
      old: null,
      updated: null,
    };
  }
}

export default UserUpdateAction;
export { UserUpdateAction };
