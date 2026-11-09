import Action from './Action';
import _StickerModule from '../../structures/Sticker';
const { deletedStickers } = _StickerModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildStickerDeleteAction extends Action {
  handle(sticker: any) {
    sticker.guild.stickers.cache.delete(sticker.id);
    deletedStickers.add(sticker);
    /**
     * Emitted whenever a custom sticker is deleted in a guild.
     * @event Client#stickerDelete
     * @param {Sticker} sticker The sticker that was deleted
     */
    this.client.emit(Events.GUILD_STICKER_DELETE, sticker);
    return { sticker };
  }
}

export default GuildStickerDeleteAction;
export { GuildStickerDeleteAction };
