import Action from './Action';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class GuildStickerUpdateAction extends Action {
  handle(current: any, data: any) {
    const old = current._update(data);
    /**
     * Emitted whenever a custom sticker is updated in a guild.
     * @event Client#stickerUpdate
     * @param {Sticker} oldSticker The old sticker
     * @param {Sticker} newSticker The new sticker
     */
    this.client.emit(Events.GUILD_STICKER_UPDATE, old, current);
    return { sticker: current };
  }
}

export default GuildStickerUpdateAction;
export { GuildStickerUpdateAction };
