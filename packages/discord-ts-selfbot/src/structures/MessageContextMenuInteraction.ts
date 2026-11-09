import ContextMenuInteraction from './ContextMenuInteraction';
import type { CacheType } from '../../typings';

/**
 * Represents a message context menu interaction.
 * @extends {ContextMenuInteraction}
 */
class MessageContextMenuInteraction<Cached extends CacheType = CacheType> extends ContextMenuInteraction<Cached> {
  [key: string]: any;
  /**
   * The message this interaction was sent from
   * @type {Message|APIMessage}
   * @readonly
   */
  get targetMessage() {
    return this.options.getMessage('message');
  }
}

export default MessageContextMenuInteraction;
export { MessageContextMenuInteraction };
