import AnonymousGuild from "./AnonymousGuild";
import WelcomeScreen from "./WelcomeScreen";
import type { RawInviteGuildData } from "../../typings/rawDataTypes";
import type Client from "../client/Client";

class InviteGuild extends AnonymousGuild {
  declare welcomeScreen: WelcomeScreen | null;

  constructor(client: Client, data: RawInviteGuildData) {
    super(client, data);

    this.welcomeScreen =
      data.welcome_screen !== undefined
        ? new WelcomeScreen(this, data.welcome_screen)
        : null;
  }
}

export default InviteGuild;
export { InviteGuild };
