import Action from "./Action";
import { isTextBasedChannel } from "../../types/channels";
import type {
  APIPartialEmoji,
  GatewayMessageReactionAddDispatchData,
} from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;
const { PartialTypes } = _ConstantsModule;

/*
{ user_id: 'id',
     message_id: 'id',
     emoji: { name: '�', id: null },
     channel_id: 'id',
     burst: boolean
     // If originating from a guild
     guild_id: 'id',
     member: { ..., user: { ... } } }
*/

type MessageReactionAddData = Omit<
  Partial<GatewayMessageReactionAddDispatchData>,
  "emoji"
> & {
  emoji?: APIPartialEmoji | null;
  [key: string]: unknown;
};

class MessageReactionAdd extends Action {
  handle(data: MessageReactionAddData, fromStructure = false) {
    if (!data.emoji) {
      return false;
    }

    const user = this.getUserFromMember(data);
    if (!user) {
      return false;
    }

    // Verify channel
    const channel = this.getChannel({
      id: data.channel_id,
      user_id: data.user_id,
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

    // Verify reaction
    const includePartial = this.client.options.partials.includes(
      PartialTypes.REACTION
    );
    if (message.partial && !includePartial) {
      return false;
    }
    const reaction = message.reactions._add({
      ...data,
      count: message.partial ? null : 0,
      emoji: data.emoji,
      me: user.id === this.client.user!.id,
    });
    if (!reaction) {
      return false;
    }
    reaction._add(user, data.burst);
    if (fromStructure) {
      return { message, reaction, user };
    }
    this.client.emit(Events.MESSAGE_REACTION_ADD, reaction, user, {
      burst: data.burst,
      type: data.type,
    });

    return { message, reaction, user };
  }
}

export default MessageReactionAdd;
export { MessageReactionAdd };
