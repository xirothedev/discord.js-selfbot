import Action from "./Action";
import type { GatewayGuildScheduledEventUserRemoveDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class GuildScheduledEventUserRemoveAction extends Action {
  handle(data: GatewayGuildScheduledEventUserRemoveDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      const guildScheduledEvent = this.getScheduledEvent(data, guild);
      const user = this.getUser(data);

      if (guildScheduledEvent && user) {
        client.emit(
          Events.GUILD_SCHEDULED_EVENT_USER_REMOVE,
          guildScheduledEvent,
          user
        );

        return { guildScheduledEvent, user };
      }
    }

    return {};
  }
}

export default GuildScheduledEventUserRemoveAction;
export { GuildScheduledEventUserRemoveAction };
