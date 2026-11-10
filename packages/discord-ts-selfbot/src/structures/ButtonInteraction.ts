import MessageComponentInteraction from './MessageComponentInteraction';
import type { CacheType } from '../../typings';

class ButtonInteraction<Cached extends CacheType = CacheType> extends MessageComponentInteraction<Cached> {}

export default ButtonInteraction;
export { ButtonInteraction };
