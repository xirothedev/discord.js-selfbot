import AnonymousGuild from './AnonymousGuild';
import WelcomeScreen from './WelcomeScreen';
import type { RawInviteGuildData } from '../../typings/rawDataTypes';

/**
 * Represents a guild received from an invite, includes welcome screen data if available.
 * @extends {AnonymousGuild}
 */
class InviteGuild extends AnonymousGuild {
  declare welcomeScreen: WelcomeScreen | null;

  constructor(client: import('../client/Client').default, data: RawInviteGuildData) {
    super(client, data);

    /**
     * The welcome screen for this invite guild
     * @type {?WelcomeScreen}
     */
    this.welcomeScreen =
      typeof data.welcome_screen !== 'undefined' ? new WelcomeScreen(this, data.welcome_screen) : null;
  }
}

export default InviteGuild;
export { InviteGuild };
