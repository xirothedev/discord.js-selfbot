import Action from './Action';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class ThreadCreateAction extends Action {
  handle(data: any) {
    const client = this.client;
    const existing = client.channels.cache.has(data.id);
    const thread = client.channels._add(data);
    if (!existing && thread) {
      /**
       * Emitted whenever a thread is created or when the client user is added to a thread.
       * @event Client#threadCreate
       * @param {ThreadChannel} thread The thread that was created
       * @param {boolean} newlyCreated Whether the thread was newly created
       */
      client.emit(Events.THREAD_CREATE, thread, data.newly_created ?? false);
    }
    return { thread };
  }
}

export default ThreadCreateAction;
export { ThreadCreateAction };
