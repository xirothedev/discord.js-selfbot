import Action from './Action';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildEmojiCreateAction extends Action {
  handle(guild: any, createdEmoji: any) {
    const already = guild.emojis.cache.has(createdEmoji.id);
    const emoji = guild.emojis._add(createdEmoji);
    /**
     * Emitted whenever a custom emoji is created in a guild.
     * @event Client#emojiCreate
     * @param {GuildEmoji} emoji The emoji that was created
     */
    if (!already) this.client.emit(Events.GUILD_EMOJI_CREATE, emoji);
    return { emoji };
  }
}

export default GuildEmojiCreateAction;
export { GuildEmojiCreateAction };
