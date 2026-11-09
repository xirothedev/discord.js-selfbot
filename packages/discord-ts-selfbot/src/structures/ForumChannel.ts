import ThreadOnlyChannel from './ThreadOnlyChannel';
import _ConstantsModule from '../util/Constants';
const { ForumLayoutTypes } = _ConstantsModule;

/**
 * Represents a forum channel.
 * @extends {ThreadOnlyChannel}
 */
class ForumChannel extends ThreadOnlyChannel {
  declare defaultForumLayout: import('../../typings/enums').ForumLayoutTypes;
  _patch(data: any) {
    super._patch(data);
    /**
     * The default layout type used to display posts
     * @type {ForumLayoutType}
     */
    this.defaultForumLayout = ForumLayoutTypes[data.default_forum_layout];
  }

  /**
   * Sets the default forum layout type used to display posts
   * @param {ForumLayoutType} defaultForumLayout The default forum layout type to set on this channel
   * @param {string} [reason] Reason for changing the default forum layout
   * @returns {Promise<ForumChannel>}
   */
  setDefaultForumLayout(defaultForumLayout: import('../../typings/enums').ForumLayoutTypes, reason?: string) {
    return this.edit({ defaultForumLayout }, reason);
  }
}

export default ForumChannel;
export { ForumChannel };
