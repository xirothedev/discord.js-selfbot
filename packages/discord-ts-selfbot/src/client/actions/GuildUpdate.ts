import Action from "./Action";
import type { GatewayGuildUpdateDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class GuildUpdateAction extends Action {
  handle(data: GatewayGuildUpdateDispatchData) {
    const { client } = this;

    const guild = client.guilds.cache.get(data.id);
    if (guild) {
      const old = guild._update(data);
      client.emit(Events.GUILD_UPDATE, old, guild);
      return {
        old,
        updated: guild,
      };
    }

    return {
      old: null,
      updated: null,
    };
  }
}

export default GuildUpdateAction;
export { GuildUpdateAction };
