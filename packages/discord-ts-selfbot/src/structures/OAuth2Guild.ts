import BaseGuild from './BaseGuild';
import Permissions from '../util/Permissions';
import type { RawOAuth2GuildData } from '../../typings/rawDataTypes';

/**
 * A partial guild received when using {@link GuildManager#fetch} to fetch multiple guilds.
 * @extends {BaseGuild}
 */
class OAuth2Guild extends BaseGuild {
  declare owner: boolean;
  declare permissions: Readonly<Permissions>;

  constructor(client: import('../client/Client').default, data: RawOAuth2GuildData) {
    super(client, data);

    /**
     * Whether the client user is the owner of the guild
     * @type {boolean}
     */
    this.owner = data.owner;

    /**
     * The permissions that the client user has in this guild
     * @type {Readonly<Permissions>}
     */
    this.permissions = new Permissions(BigInt(data.permissions)).freeze();
  }
}

export default OAuth2Guild;
export { OAuth2Guild };
