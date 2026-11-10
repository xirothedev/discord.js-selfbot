import Action from "./Action";
import { isTextBasedChannel } from "../../types/channels";
import type { GatewayMessageReactionRemoveAllDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class MessageReactionRemoveAll extends Action {
  handle(data: GatewayMessageReactionRemoveAllDispatchData) {
    // Verify channel
    const channel = this.getChannel({
      id: data.channel_id,
      ...("guild_id" in data && { guild_id: data.guild_id }),
    });
    if (!channel || !isTextBasedChannel(channel)) {
      return false;
    }

    // Verify message
    const message = this.getMessage(data, channel);
    if (!message) {
      return false;
    }

    // Copy removed reactions to emit for the event.
    const removed = message.reactions.cache.clone();

    message.reactions.cache.clear();
    this.client.emit(Events.MESSAGE_REACTION_REMOVE_ALL, message, removed);

    return { message };
  }
}

export default MessageReactionRemoveAll;
export { MessageReactionRemoveAll };
