import ThreadOnlyChannel from './ThreadOnlyChannel';
import _ConstantsModule, { resolveEnumMember } from '../util/Constants';
const { ForumLayoutTypes } = _ConstantsModule;

class ForumChannel extends ThreadOnlyChannel {
  declare defaultForumLayout: import('../../typings/enums').ForumLayoutTypes;
  _patch(data: Parameters<typeof ThreadOnlyChannel.prototype._patch>[0] & { default_forum_layout?: number }) {
    super._patch(data);
    this.defaultForumLayout =
      resolveEnumMember(ForumLayoutTypes, data.default_forum_layout ?? 0) ?? ForumLayoutTypes.NOT_SET;
  }

  setDefaultForumLayout(defaultForumLayout: import('../../typings/enums').ForumLayoutTypes, reason?: string) {
    return this.edit({ defaultForumLayout }, reason);
  }
}

export default ForumChannel;
export { ForumChannel };
