import Action from "./Action";
import type { GatewayGuildBanAddDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class GuildBanAdd extends Action {
  handle(data: GatewayGuildBanAddDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      client.emit(Events.GUILD_BAN_ADD, guild.bans._add(data));
    }
  }
}

export default GuildBanAdd;
export { GuildBanAdd };
