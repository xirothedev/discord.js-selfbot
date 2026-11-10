import Action from './Action';
import type { RawStickerData } from '../../../typings/rawDataTypes';
import type { Guild } from '../../structures/Guild';
import type { Sticker } from '../../structures/Sticker';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildStickerCreateAction extends Action {
  handle(guild: Guild, createdSticker: RawStickerData): { sticker: Sticker } {
    const already = guild.stickers.cache.has(createdSticker.id);
    const sticker = guild.stickers._add(createdSticker);
    /**
     * Emitted whenever a custom sticker is created in a guild.
     * @event Client#stickerCreate
     * @param {Sticker} sticker The sticker that was created
     */
    if (!already) this.client.emit(Events.GUILD_STICKER_CREATE, sticker);
    return { sticker };
  }
}

export default GuildStickerCreateAction;
export { GuildStickerCreateAction };
