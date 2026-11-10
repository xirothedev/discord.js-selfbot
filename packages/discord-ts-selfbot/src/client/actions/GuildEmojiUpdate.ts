import Action from './Action';
import type { RawGuildEmojiData } from '../../../typings/rawDataTypes';
import type { GuildEmoji } from '../../structures/GuildEmoji';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildEmojiUpdateAction extends Action {
  handle(current: GuildEmoji, data: RawGuildEmojiData) {
    const old = current._update(data);
    /**
     * Emitted whenever a custom emoji is updated in a guild.
     * @event Client#emojiUpdate
     * @param {GuildEmoji} oldEmoji The old emoji
     * @param {GuildEmoji} newEmoji The new emoji
     */
    this.client.emit(Events.GUILD_EMOJI_UPDATE, old, current);
    return { emoji: current };
  }
}

export default GuildEmojiUpdateAction;
export { GuildEmojiUpdateAction };
