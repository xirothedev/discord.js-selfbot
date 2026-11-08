const BaseGuild = require('./BaseGuild');
const Permissions = require('../util/Permissions');

/**
 * A partial guild received when using {@link GuildManager#fetch} to fetch multiple guilds.
 * @extends {BaseGuild}
 */
class OAuth2Guild extends BaseGuild {
  [key: string]: any;
  constructor(client: any, data: any) {
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

export = OAuth2Guild;
