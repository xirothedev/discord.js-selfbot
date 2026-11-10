import GuildChannel from "./GuildChannel";
import type { CreateInviteOptions } from "../../typings";
import type { Guild } from "./Guild";
import type { RawGuildChannelData } from "../../typings/rawDataTypes";
import type Client from "../client/Client";

class StoreChannel extends GuildChannel {
  declare nsfw: boolean;
  constructor(
    guild: Guild,
    data: RawGuildChannelData & {
      nsfw?: boolean;
    },
    client?: Client
  ) {
    super(guild, data, client);

    this.nsfw = Boolean(data.nsfw);
  }

  _patch(
    data: Parameters<typeof GuildChannel.prototype._patch>[0] & {
      nsfw?: boolean;
    }
  ) {
    super._patch(data);

    if ("nsfw" in data) {
      this.nsfw = Boolean(data.nsfw);
    }
  }

  createInvite(options?: CreateInviteOptions) {
    return this.guild.invites.create(this.id, options);
  }

  fetchInvites(cache = true) {
    return this.guild.invites.fetch({ cache, channelId: this.id });
  }
}

export default StoreChannel;
export { StoreChannel };
