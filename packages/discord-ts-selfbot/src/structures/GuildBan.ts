import Base from './Base';
import type { Client } from '../client/Client';
import type { Guild } from './Guild';
import type { RawGuildBanData } from '../../typings/rawDataTypes';

class GuildBan extends Base {
  declare guild: import('./Guild').Guild;
  declare user: import('./User').User;
  declare reason?: string | null;
  constructor(client: Client, data: RawGuildBanData, guild: Guild) {
    super(client);

    this.guild = guild;

    this._patch(data);
  }

  _patch(data: RawGuildBanData) {
    if ('user' in data) {
      this.user = this.client.users._add(data.user, true);
    }

    if ('reason' in data) {
      this.reason = data.reason;
    }
  }

  get partial() {
    return !('reason' in this);
  }

  fetch(force = true) {
    return this.guild.bans.fetch({ user: this.user.id, cache: true, force });
  }
}

export default GuildBan;
export { GuildBan };
