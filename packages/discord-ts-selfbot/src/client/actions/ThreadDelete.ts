import Action from './Action';
import type { GatewayThreadDeleteDispatchData } from 'discord-api-types/v10';
import _ChannelModule from '../../structures/Channel';
const { deletedChannels } = _ChannelModule;
import _MessageModule from '../../structures/Message';
const { deletedMessages } = _MessageModule;
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class ThreadDeleteAction extends Action {
  handle(data: GatewayThreadDeleteDispatchData) {
    const client = this.client;
    const thread = client.channels.cache.get(data.id);

    if (thread) {
      client.channels._remove(thread.id);
      deletedChannels.add(thread);
      for (const message of thread.messages.cache.values()) {
        deletedMessages.add(message);
      }

      /**
       * Emitted whenever a thread is deleted.
       * @event Client#threadDelete
       * @param {ThreadChannel} thread The thread that was deleted
       */
      client.emit(Events.THREAD_DELETE, thread);
    }

    return { thread };
  }
}

export default ThreadDeleteAction;
export { ThreadDeleteAction };
