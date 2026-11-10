import Base from "./Base";
import _EmojiModule from "./Emoji";

const { Emoji } = _EmojiModule;
import type { Guild } from "./Guild";
import type InviteGuild from "./InviteGuild";
import type { RawWelcomeChannelData } from "../../typings/rawDataTypes";

class WelcomeChannel extends Base {
  declare guild: Guild | InviteGuild;
  declare description: string;
  declare _emoji: { name: string | null; id: string | null };
  declare channelId: string;

  constructor(guild: Guild | InviteGuild, data: RawWelcomeChannelData) {
    super(guild.client);

    this.guild = guild;

    this.description = data.description ?? "";

    this._emoji = {
      id: data.emoji_id,
      name: data.emoji_name,
    };

    this.channelId = data.channel_id;
  }

  get channel() {
    return this.client.channels.cache.get(this.channelId) ?? null;
  }

  get emoji() {
    return (
      (this._emoji.id ? this.client.emojis.cache.get(this._emoji.id) : null) ??
      new Emoji(this.client, this._emoji)
    );
  }
}

export default WelcomeChannel;
export { WelcomeChannel };
