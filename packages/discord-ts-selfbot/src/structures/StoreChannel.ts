import GuildChannel from './GuildChannel';
import type { CreateInviteOptions } from '../../typings';

class StoreChannel extends GuildChannel {
  declare nsfw: boolean;
  constructor(
    guild: import('./Guild').Guild,
    data: import('../../typings/rawDataTypes').RawGuildChannelData & { nsfw?: boolean },
    client?: import('../client/Client').default,
  ) {
    super(guild, data, client);

    this.nsfw = Boolean(data.nsfw);
  }

  _patch(data: Parameters<typeof GuildChannel.prototype._patch>[0] & { nsfw?: boolean }) {
    super._patch(data);

    if ('nsfw' in data) {
      this.nsfw = Boolean(data.nsfw);
    }
  }

  createInvite(options?: CreateInviteOptions) {
    return this.guild.invites.create(this.id, options);
  }

  fetchInvites(cache = true) {
    return this.guild.invites.fetch({ channelId: this.id, cache });
  }
}

export default StoreChannel;
export { StoreChannel };
