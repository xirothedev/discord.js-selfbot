import ContextMenuInteraction from './ContextMenuInteraction';
import type { CacheType } from '../../typings';

class UserContextMenuInteraction<Cached extends CacheType = CacheType> extends ContextMenuInteraction<Cached> {
  get targetUser() {
    return this.options.getUser('user');
  }

  get targetMember() {
    return this.options.getMember('user');
  }
}

export default UserContextMenuInteraction;
export { UserContextMenuInteraction };
