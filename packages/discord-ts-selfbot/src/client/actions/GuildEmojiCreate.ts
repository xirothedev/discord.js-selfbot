import Action from './Action';
import _errorsModule from '../../errors';
const { TypeError } = _errorsModule;
import type { RawGuildEmojiData } from '../../../typings/rawDataTypes';
import type { Guild } from '../../structures/Guild';
import type { GuildEmoji } from '../../structures/GuildEmoji';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildEmojiCreateAction extends Action {
  handle(guild: Guild, createdEmoji: RawGuildEmojiData): { emoji: GuildEmoji } {
    if (!createdEmoji.id) throw new TypeError('INVALID_TYPE', 'createdEmoji.id', 'string');
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
