import { Collection } from '@discordjs/collection';
import Base from './Base';
import WelcomeChannel from './WelcomeChannel';

/**
 * Represents a welcome screen.
 * @extends {Base}
 */
class WelcomeScreen extends Base {
  [key: string]: any;
  constructor(guild: any, data: any) {
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
    this.welcomeChannels = new Collection();

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
    return this.guild.features.includes('WELCOME_SCREEN_ENABLED');
  }
}

export default WelcomeScreen;
export { WelcomeScreen };
