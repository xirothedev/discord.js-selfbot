import ThreadOnlyChannel from './ThreadOnlyChannel';
import _ConstantsModule, { resolveEnumMember } from '../util/Constants';
import type { ForumLayoutTypes as ForumLayoutTypesType } from '../../typings/enums';

const { ForumLayoutTypes } = _ConstantsModule;

class ForumChannel extends ThreadOnlyChannel {
  declare defaultForumLayout: ForumLayoutTypesType;
  _patch(
    data: Parameters<typeof ThreadOnlyChannel.prototype._patch>[0] & {
      default_forum_layout?: number;
    }
  ) {
    super._patch(data);
    this.defaultForumLayout =
      resolveEnumMember(ForumLayoutTypes, data.default_forum_layout ?? 0) ??
      ForumLayoutTypes.NOT_SET;
  }

  setDefaultForumLayout(
    defaultForumLayout: ForumLayoutTypesType,
    reason?: string
  ) {
    return this.edit({ defaultForumLayout }, reason);
  }
}

export default ForumChannel;
export { ForumChannel };
