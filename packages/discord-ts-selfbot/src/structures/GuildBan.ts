import Base from './Base';
import type { Client } from '../client/Client';
import type { Guild } from './Guild';
import type { RawGuildBanData } from '../../typings/rawDataTypes';
import type { User } from './User';

class GuildBan extends Base {
  declare guild: Guild;
  declare user: User;
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
    return this.guild.bans.fetch({ cache: true, force, user: this.user.id });
  }
}

export default GuildBan;
export { GuildBan };
