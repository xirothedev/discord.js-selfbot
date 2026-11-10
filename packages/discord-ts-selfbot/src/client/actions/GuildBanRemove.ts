import Action from './Action';
import type { GatewayGuildBanRemoveDispatchData } from 'discord-api-types/v10';
import GuildBan from '../../structures/GuildBan';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class GuildBanRemove extends Action {
  handle(data: GatewayGuildBanRemoveDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      const ban =
        guild.bans.cache.get(data.user.id) ?? new GuildBan(client, data, guild);
      guild.bans.cache.delete(ban.user.id);
      client.emit(Events.GUILD_BAN_REMOVE, ban);
    }
  }
}

export default GuildBanRemove;
export { GuildBanRemove };
