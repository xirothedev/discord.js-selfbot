import Action from './Action';
import { isThreadChannel } from '../../types/channels';
import type { GatewayThreadMemberUpdateDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class ThreadMemberUpdateAction extends Action {
  handle(data: GatewayThreadMemberUpdateDispatchData) {
    const client = this.client;
    // Discord sends the thread id as id in this object
    const thread = data.id ? client.channels.cache.get(data.id) : undefined;
    if (thread && isThreadChannel(thread) && data.user_id) {
      const member = thread.members.cache.get(data.user_id);
      if (!member) {
        const newMember = thread.members._add(data);
        return { newMember };
      }
      const old = member._update(data);
      /**
       * Emitted whenever the client user's thread member is updated.
       * @event Client#threadMemberUpdate
       * @param {ThreadMember} oldMember The member before the update
       * @param {ThreadMember} newMember The member after the update
       */
      client.emit(Events.THREAD_MEMBER_UPDATE, old, member);
    }
    return {};
  }
}

export default ThreadMemberUpdateAction;
export { ThreadMemberUpdateAction };
