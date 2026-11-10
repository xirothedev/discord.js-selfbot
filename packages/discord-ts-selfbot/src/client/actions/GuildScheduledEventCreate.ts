import Action from './Action';
import type { GatewayGuildScheduledEventCreateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class GuildScheduledEventCreateAction extends Action {
  handle(data: GatewayGuildScheduledEventCreateDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);
    if (guild) {
      const guildScheduledEvent = guild.scheduledEvents._add(data);

      client.emit(Events.GUILD_SCHEDULED_EVENT_CREATE, guildScheduledEvent);

      return { guildScheduledEvent };
    }

    return {};
  }
}

export default GuildScheduledEventCreateAction;
export { GuildScheduledEventCreateAction };
