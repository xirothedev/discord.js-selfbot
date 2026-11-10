import Action from './Action';
import type { Sticker } from '../../structures/Sticker';
import _StickerModule from '../../structures/Sticker';
const { deletedStickers } = _StickerModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildStickerDeleteAction extends Action {
  handle(sticker: Sticker) {
    if (sticker.guild) sticker.guild.stickers.cache.delete(sticker.id);
    deletedStickers.add(sticker);
    this.client.emit(Events.GUILD_STICKER_DELETE, sticker);
    return { sticker };
  }
}

export default GuildStickerDeleteAction;
export { GuildStickerDeleteAction };
