import CachedManager from './CachedManager';
import MessageReaction from '../structures/MessageReaction';
import type { Message } from '../structures/Message';
import type { RawMessageReactionSource } from '../structures/MessageReaction';

class ReactionManager extends CachedManager<MessageReaction> {
  declare message: import('../structures/Message').Message;
  constructor(message: Message, iterable?: Iterable<MessageReaction>) {
    super(message.client, MessageReaction, iterable);

    this.message = message;
  }

  _add(data: RawMessageReactionSource, cache = true): MessageReaction {
    return super._add(data, cache, { id: data.emoji.id ?? data.emoji.name ?? undefined, extras: [this.message] });
  }

  async removeAll() {
    await this.client.api.channels(this.message.channelId).messages(this.message.id).reactions.delete();
    return this.message;
  }
}

export default ReactionManager;
export { ReactionManager };
