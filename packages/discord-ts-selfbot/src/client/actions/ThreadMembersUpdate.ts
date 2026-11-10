import Action from './Action';
import { isThreadChannel } from '../../types/channels';
import type { GatewayThreadMembersUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class ThreadMembersUpdateAction extends Action {
  handle(data: GatewayThreadMembersUpdateDispatchData) {
    const client = this.client;
    const thread = client.channels.cache.get(data.id);
    if (thread && isThreadChannel(thread)) {
      const old = thread.members.cache.clone();
      thread.memberCount = data.member_count;

      data.added_members?.forEach(rawMember => {
        thread.members._add(rawMember);
      });

      data.removed_member_ids?.forEach(memberId => {
        thread.members.cache.delete(memberId);
      });

      /**
       * Emitted whenever members are added or removed from a thread. Requires `GUILD_MEMBERS` privileged intent
       * @event Client#threadMembersUpdate
       * @param {Collection<Snowflake, ThreadMember>} oldMembers The members before the update
       * @param {Collection<Snowflake, ThreadMember>} newMembers The members after the update
       */
      client.emit(Events.THREAD_MEMBERS_UPDATE, old, thread.members.cache);
    }
    return {};
  }
}

export default ThreadMembersUpdateAction;
export { ThreadMembersUpdateAction };
