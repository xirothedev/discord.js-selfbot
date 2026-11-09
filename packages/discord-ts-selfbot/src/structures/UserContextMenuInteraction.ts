import ContextMenuInteraction from './ContextMenuInteraction';

/**
 * Represents a user context menu interaction.
 * @extends {ContextMenuInteraction}
 */
class UserContextMenuInteraction extends ContextMenuInteraction {
  [key: string]: any;
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
