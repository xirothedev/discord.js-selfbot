import ContextMenuInteraction from "./ContextMenuInteraction";
import type { CacheType } from "../../typings";

class MessageContextMenuInteraction<
  Cached extends CacheType = CacheType,
> extends ContextMenuInteraction<Cached> {
  get targetMessage() {
    return this.options.getMessage("message");
  }
}

export default MessageContextMenuInteraction;
export { MessageContextMenuInteraction };
