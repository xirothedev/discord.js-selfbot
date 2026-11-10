import Action from './Action';
import type { GatewayGuildScheduledEventUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class GuildScheduledEventUpdateAction extends Action {
  handle(data: GatewayGuildScheduledEventUpdateDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      const oldGuildScheduledEvent =
        guild.scheduledEvents.cache.get(data.id)?._clone() ?? null;
      const newGuildScheduledEvent = guild.scheduledEvents._add(data);

      client.emit(
        Events.GUILD_SCHEDULED_EVENT_UPDATE,
        oldGuildScheduledEvent,
        newGuildScheduledEvent
      );

      return { newGuildScheduledEvent, oldGuildScheduledEvent };
    }

    return {};
  }
}

export default GuildScheduledEventUpdateAction;
export { GuildScheduledEventUpdateAction };
