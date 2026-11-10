import _EmojiModule from './Emoji';
const { Emoji } = _EmojiModule;
import Util from '../util/Util';
import type MessageReaction from './MessageReaction';
import type { RawReactionEmojiData } from '../../typings/rawDataTypes';

class ReactionEmoji extends Emoji {
  declare reaction: MessageReaction;

  constructor(reaction: MessageReaction, emoji: RawReactionEmojiData) {
    super(reaction.message.client, emoji);
    this.reaction = reaction;
  }

  toJSON() {
    return Util.flatten(this, { identifier: true });
  }

  valueOf() {
    return this.id ?? '';
  }
}

export default ReactionEmoji;
export { ReactionEmoji };
