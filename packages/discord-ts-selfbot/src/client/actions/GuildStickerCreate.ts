import Action from './Action';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildStickerCreateAction extends Action {
  handle(guild: any, createdSticker: any) {
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
