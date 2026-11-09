import MessageComponentInteraction from './MessageComponentInteraction';
import type { CacheType } from '../../typings';

/**
 * Represents a button interaction.
 * @extends {MessageComponentInteraction}
 */
class ButtonInteraction<Cached extends CacheType = CacheType> extends MessageComponentInteraction<Cached> {}

export default ButtonInteraction;
export { ButtonInteraction };
