import Action from './Action';
import type { GatewayGuildScheduledEventDeleteDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildScheduledEventDeleteAction extends Action {
  handle(data: GatewayGuildScheduledEventDeleteDispatchData) {
    const client = this.client;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      const guildScheduledEvent = this.getScheduledEvent(data, guild);
      if (guildScheduledEvent) {
        guild.scheduledEvents.cache.delete(guildScheduledEvent.id);

        /**
         * Emitted whenever a guild scheduled event is deleted.
         * @event Client#guildScheduledEventDelete
         * @param {GuildScheduledEvent} guildScheduledEvent The deleted guild scheduled event
         */
        client.emit(Events.GUILD_SCHEDULED_EVENT_DELETE, guildScheduledEvent);

        return { guildScheduledEvent };
      }
    }

    return {};
  }
}

export default GuildScheduledEventDeleteAction;
export { GuildScheduledEventDeleteAction };
