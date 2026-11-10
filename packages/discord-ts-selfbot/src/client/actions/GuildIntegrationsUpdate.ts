import Action from './Action';
import type { GatewayGuildIntegrationsUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildIntegrationsUpdate extends Action {
  handle(data: GatewayGuildIntegrationsUpdateDispatchData) {
    const client = this.client;
    const guild = client.guilds.cache.get(data.guild_id);
    /**
     * Emitted whenever a guild integration is updated
     * @event Client#guildIntegrationsUpdate
     * @param {Guild} guild The guild whose integrations were updated
     */
    if (guild) client.emit(Events.GUILD_INTEGRATIONS_UPDATE, guild);
  }
}

export default GuildIntegrationsUpdate;
export { GuildIntegrationsUpdate };
