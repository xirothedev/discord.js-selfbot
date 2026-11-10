import Action from './Action';
import type { APIPartialEmoji, GatewayMessageReactionAddDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
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

type MessageReactionAddData = Omit<Partial<GatewayMessageReactionAddDispatchData>, 'emoji'> & {
  emoji?: APIPartialEmoji | null;
  [key: string]: unknown;
};

class MessageReactionAdd extends Action {
  handle(data: MessageReactionAddData, fromStructure = false) {
    if (!data.emoji) return false;

    const user = this.getUserFromMember(data);
    if (!user) return false;

    // Verify channel
    const channel = this.getChannel({
      id: data.channel_id,
      user_id: data.user_id,
      ...('guild_id' in data && { guild_id: data.guild_id }),
    });
    if (!channel || !channel.isText()) return false;

    // Verify message
    const message = this.getMessage(data, channel);
    if (!message) return false;

    // Verify reaction
    const includePartial = this.client.options.partials.includes(PartialTypes.REACTION);
    if (message.partial && !includePartial) return false;
    const reaction = message.reactions._add({
      ...data,
      emoji: data.emoji,
      count: message.partial ? null : 0,
      me: user.id === this.client.user!.id,
    });
    if (!reaction) return false;
    reaction._add(user, data.burst);
    if (fromStructure) return { message, reaction, user };
    /**
     * Provides additional information about altered reaction
     * @typedef {Object} MessageReactionEventDetails
     * @property {ReactionType} type The type of the reaction
     * @property {boolean} burst Determines whether a super reaction was used
     */
    /**
     * Emitted whenever a reaction is added to a cached message.
     * @event Client#messageReactionAdd
     * @param {MessageReaction} messageReaction The reaction object
     * @param {User} user The user that applied the guild or reaction emoji
     * @param {MessageReactionEventDetails} details Details of adding the reaction
     */
    this.client.emit(Events.MESSAGE_REACTION_ADD, reaction, user, { type: data.type, burst: data.burst });

    return { message, reaction, user };
  }
}

export default MessageReactionAdd;
export { MessageReactionAdd };
