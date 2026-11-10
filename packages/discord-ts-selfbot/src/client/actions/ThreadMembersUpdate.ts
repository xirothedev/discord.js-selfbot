import Action from './Action';
import { isThreadChannel } from '../../types/channels';
import type { GatewayThreadMembersUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class ThreadMembersUpdateAction extends Action {
  handle(data: GatewayThreadMembersUpdateDispatchData) {
    const { client } = this;
    const thread = client.channels.cache.get(data.id);
    if (thread && isThreadChannel(thread)) {
      const old = thread.members.cache.clone();
      thread.memberCount = data.member_count;

      if (data.added_members) {
        for (const rawMember of data.added_members) {
          thread.members._add(rawMember);
        }
      }

      if (data.removed_member_ids) {
        for (const memberId of data.removed_member_ids) {
          thread.members.cache.delete(memberId);
        }
      }

      client.emit(Events.THREAD_MEMBERS_UPDATE, old, thread.members.cache);
    }
    return {};
  }
}

export default ThreadMembersUpdateAction;
export { ThreadMembersUpdateAction };
