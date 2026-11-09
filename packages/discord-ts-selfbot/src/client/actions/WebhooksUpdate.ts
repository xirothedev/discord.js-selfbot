import Action from './Action';
import _ConstantsModule from '../../util/Constants';
const { Events } = _ConstantsModule;

class WebhooksUpdate extends Action {
  handle(data: any) {
    const client = this.client;
    const channel = client.channels.cache.get(data.channel_id);
    /**
     * Emitted whenever a channel has its webhooks changed.
     * @event Client#webhookUpdate
     * @param {TextChannel|NewsChannel|VoiceChannel|StageChannel|ForumChannel|MediaChannel} channel
     * The channel that had a webhook update
     */
    if (channel) client.emit(Events.WEBHOOKS_UPDATE, channel);
  }
}

export default WebhooksUpdate;
export { WebhooksUpdate };
