import ContextMenuInteraction from './ContextMenuInteraction';
import type { CacheType } from '../../typings';

/**
 * Represents a user context menu interaction.
 * @extends {ContextMenuInteraction}
 */
class UserContextMenuInteraction<Cached extends CacheType = CacheType> extends ContextMenuInteraction<Cached> {
  /**
   * The target user from this interaction
   * @type {User}
   * @readonly
   */
  get targetUser() {
    return this.options.getUser('user');
  }

  /**
   * The target member from this interaction
   * @type {?(GuildMember|APIGuildMember)}
   * @readonly
   */
  get targetMember() {
    return this.options.getMember('user');
  }
}

export default UserContextMenuInteraction;
export { UserContextMenuInteraction };
