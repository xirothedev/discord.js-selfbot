import Action from "./Action";
import type { GatewayThreadCreateDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class ThreadCreateAction extends Action {
  handle(data: GatewayThreadCreateDispatchData) {
    const { client } = this;
    const existing = client.channels.cache.has(data.id);
    const thread = client.channels._add(data);
    if (!existing && thread) {
      client.emit(Events.THREAD_CREATE, thread, data.newly_created ?? false);
    }
    return { thread };
  }
}

export default ThreadCreateAction;
export { ThreadCreateAction };
