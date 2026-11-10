import Action from "./Action";
import { isTextBasedChannel } from "../../types/channels";
import type { GatewayMessageUpdateDispatchData } from "discord-api-types/v10";

class MessageUpdateAction extends Action {
  handle(data: GatewayMessageUpdateDispatchData) {
    const channel = this.getChannel({
      id: data.channel_id,
      ...("guild_id" in data && { guild_id: data.guild_id }),
    });
    if (channel) {
      if (!isTextBasedChannel(channel)) {
        return {};
      }

      const { id, channel_id, guild_id, author, timestamp, type } = data;
      const message = this.getMessage(
        { author, channel_id, guild_id, id, timestamp, type },
        channel
      );
      if (message) {
        const old = message._update(data);
        return {
          old,
          updated: message,
        };
      }
    }

    return {};
  }
}

export default MessageUpdateAction;
export { MessageUpdateAction };
