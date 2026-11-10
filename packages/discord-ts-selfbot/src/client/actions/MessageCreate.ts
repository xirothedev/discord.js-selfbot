import process from "node:process";
import Action from "./Action";
import { isTextBasedChannel } from "../../types/channels";
import type { GatewayMessageCreateDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

let deprecationEmitted = false;

class MessageCreateAction extends Action {
  handle(data: GatewayMessageCreateDispatchData) {
    const { client } = this;
    const channel = this.getChannel({
      author: data.author,
      id: data.channel_id,
      ...("guild_id" in data && { guild_id: data.guild_id }),
    });
    if (channel) {
      if (!isTextBasedChannel(channel)) {
        return {};
      }

      const existing = channel.messages.cache.get(data.id);
      if (existing && existing.author?.id !== this.client.user?.id) {
        return { message: existing };
      }
      const message = existing ?? channel.messages._add(data);
      channel.lastMessageId = data.id;

      client.emit(Events.MESSAGE_CREATE, message);

      /**
       * Emitted whenever a message is created.
       * @event Client#message
       * @param {Message} message The created message
       * @deprecated Use {@link Client#event:messageCreate} instead
       */
      if (client.emit("message", message) && !deprecationEmitted) {
        deprecationEmitted = true;
        process.emitWarning(
          "The message event is deprecated. Use messageCreate instead",
          "DeprecationWarning"
        );
      }

      return { message };
    }

    return {};
  }
}

export default MessageCreateAction;
export { MessageCreateAction };
