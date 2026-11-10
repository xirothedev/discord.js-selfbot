import BaseGuildTextChannel from './BaseGuildTextChannel';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import type { TextChannelResolvable } from '../../typings';

class NewsChannel extends BaseGuildTextChannel {
  async addFollower(channel: TextChannelResolvable, reason?: string) {
    const channelId = this.guild.channels.resolveId(channel);
    if (!channelId) throw new Error('GUILD_CHANNEL_RESOLVE');
    await this.client.api.channels(this.id).followers.post({ data: { webhook_channel_id: channelId }, reason });
    return this;
  }
}

export default NewsChannel;
export { NewsChannel };
