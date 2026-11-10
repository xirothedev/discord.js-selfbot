import BaseGuild from "./BaseGuild";
import Permissions from "../util/Permissions";
import type { RawOAuth2GuildData } from "../../typings/rawDataTypes";
import type Client from "../client/Client";

class OAuth2Guild extends BaseGuild {
  declare owner: boolean;
  declare permissions: Readonly<Permissions>;

  constructor(client: Client, data: RawOAuth2GuildData) {
    super(client, data);

    this.owner = data.owner;

    this.permissions = new Permissions(BigInt(data.permissions)).freeze();
  }
}

export default OAuth2Guild;
export { OAuth2Guild };
