import Base from './Base';
import _EmojiModule from './Emoji';
const { Emoji } = _EmojiModule;
import type { Guild } from './Guild';
import type InviteGuild from './InviteGuild';
import type { RawWelcomeChannelData } from '../../typings/rawDataTypes';

/**
 * Represents a channel link in a guild's welcome screen.
 * @extends {Base}
 */
class WelcomeChannel extends Base {
  declare guild: Guild | InviteGuild;
  declare description: string;
  declare _emoji: { name: string | null; id: string | null };
  declare channelId: string;

  constructor(guild: Guild | InviteGuild, data: RawWelcomeChannelData) {
    super(guild.client);

    /**
     * The guild for this welcome channel
     * @type {Guild|InviteGuild}
     */
    this.guild = guild;

    /**
     * The description of this welcome channel
     * @type {string}
     */
    this.description = data.description ?? '';

    /**
     * The raw emoji data
     * @type {Object}
     * @private
     */
    this._emoji = {
      name: data.emoji_name,
      id: data.emoji_id,
    };

    /**
     * The id of this welcome channel
     * @type {Snowflake}
     */
    this.channelId = data.channel_id;
  }

  /**
   * The channel of this welcome channel
   * @type {?(TextChannel|NewsChannel|StoreChannel|ForumChannel|MediaChannel)}
   */
  get channel() {
    return this.client.channels.cache.get(this.channelId) ?? null;
  }

  /**
   * The emoji of this welcome channel
   * @type {GuildEmoji|Emoji}
   */
  get emoji() {
    return (
      (this._emoji.id ? this.client.emojis.cache.get(this._emoji.id) : null) ?? new Emoji(this.client, this._emoji)
    );
  }
}

export default WelcomeChannel;
export { WelcomeChannel };
