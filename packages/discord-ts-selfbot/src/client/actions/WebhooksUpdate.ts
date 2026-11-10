import Action from "./Action";
import type { GatewayWebhooksUpdateDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class WebhooksUpdate extends Action {
  handle(data: GatewayWebhooksUpdateDispatchData) {
    const { client } = this;
    const channel = client.channels.cache.get(data.channel_id);
    if (channel) {
      client.emit(Events.WEBHOOKS_UPDATE, channel);
    }
  }
}

export default WebhooksUpdate;
export { WebhooksUpdate };
