import Action from './Action';
import _EmojiModule from '../../structures/Emoji';
const { deletedEmojis } = _EmojiModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildEmojiDeleteAction extends Action {
  handle(emoji: any) {
    emoji.guild.emojis.cache.delete(emoji.id);
    deletedEmojis.add(emoji);
    /**
     * Emitted whenever a custom emoji is deleted in a guild.
     * @event Client#emojiDelete
     * @param {GuildEmoji} emoji The emoji that was deleted
     */
    this.client.emit(Events.GUILD_EMOJI_DELETE, emoji);
    return { emoji };
  }
}

export default GuildEmojiDeleteAction;
export { GuildEmojiDeleteAction };
