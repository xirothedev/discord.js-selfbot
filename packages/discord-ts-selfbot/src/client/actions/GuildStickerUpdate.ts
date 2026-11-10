import Action from "./Action";
import type { RawStickerData } from "../../../typings/rawDataTypes";
import type { Sticker } from "../../structures/Sticker";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class GuildStickerUpdateAction extends Action {
  handle(current: Sticker, data: RawStickerData) {
    const old = current._update(data);
    this.client.emit(Events.GUILD_STICKER_UPDATE, old, current);
    return { sticker: current };
  }
}

export default GuildStickerUpdateAction;
export { GuildStickerUpdateAction };
