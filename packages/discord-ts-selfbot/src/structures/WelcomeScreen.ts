import { Collection } from '@discordjs/collection';
import Base from './Base';
import WelcomeChannel from './WelcomeChannel';
import type { RawWelcomeScreenData } from '../../typings/rawDataTypes';
import { GuildFeature } from 'discord-api-types/v10';
import type { Guild } from './Guild';
import type { InviteGuild } from './InviteGuild';
import type { WelcomeScreenEntity } from '../types/entities/welcome-screen';

/**
 * Represents a welcome screen.
 * @extends {Base}
 */
class WelcomeScreen extends Base implements WelcomeScreenEntity {
  declare guild: WelcomeScreenEntity['guild'];
  declare description: WelcomeScreenEntity['description'];
  declare welcomeChannels: WelcomeScreenEntity['welcomeChannels'];

  constructor(guild: Guild | InviteGuild, data: RawWelcomeScreenData) {
    super(guild.client);

    /**
     * The guild for this welcome screen
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * The description of this welcome screen
     * @type {?string}
     */
    this.description = data.description ?? null;

    /**
     * Collection of welcome channels belonging to this welcome screen
     * @type {Collection<Snowflake, WelcomeChannel>}
     */
    this.welcomeChannels = new Collection<string, WelcomeChannel>();

    for (const channel of data.welcome_channels) {
      const welcomeChannel = new WelcomeChannel(this.guild, channel);
      this.welcomeChannels.set(welcomeChannel.channelId, welcomeChannel);
    }
  }

  /**
   * Whether the welcome screen is enabled on the guild or not
   * @type {boolean}
   */
  get enabled() {
    return this.guild.features.includes(GuildFeature.WelcomeScreenEnabled);
  }
}

export default WelcomeScreen;
export { WelcomeScreen };
