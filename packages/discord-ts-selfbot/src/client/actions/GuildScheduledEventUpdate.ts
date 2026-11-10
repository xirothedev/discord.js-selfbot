import Action from './Action';
import type { GatewayGuildScheduledEventUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildScheduledEventUpdateAction extends Action {
  handle(data: GatewayGuildScheduledEventUpdateDispatchData) {
    const client = this.client;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      const oldGuildScheduledEvent = guild.scheduledEvents.cache.get(data.id)?._clone() ?? null;
      const newGuildScheduledEvent = guild.scheduledEvents._add(data);

      /**
       * Emitted whenever a guild scheduled event gets updated.
       * @event Client#guildScheduledEventUpdate
       * @param {?GuildScheduledEvent} oldGuildScheduledEvent The guild scheduled event object before the update
       * @param {GuildScheduledEvent} newGuildScheduledEvent The guild scheduled event object after the update
       */
      client.emit(Events.GUILD_SCHEDULED_EVENT_UPDATE, oldGuildScheduledEvent, newGuildScheduledEvent);

      return { oldGuildScheduledEvent, newGuildScheduledEvent };
    }

    return {};
  }
}

export default GuildScheduledEventUpdateAction;
export { GuildScheduledEventUpdateAction };
