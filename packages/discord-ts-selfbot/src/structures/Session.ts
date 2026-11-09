import Base from './Base';
import type { SessionClientInfo } from '../../typings';

type RawSessionData = {
  id_hash?: string;
  approx_last_used_time?: string;
  client_info?: SessionClientInfo;
};

/**
 * @typedef {Object} SessionClientInfo
 * @property {string} location Location of the client (using IP address)
 * @property {string} platform Platform of the client
 * @property {string} os Operating system of the client
 */

/**
 * Represents a Client OAuth2 Application Team.
 * @extends {Base}
 */
class Session extends Base {
  declare id?: string;
  declare approxLastUsedTime: string;
  declare clientInfo?: SessionClientInfo;

  constructor(client: import('../client/Client').default, data: RawSessionData) {
    super(client);
    this._patch(data);
  }

  _patch(data: RawSessionData) {
    if ('id_hash' in data) {
      /**
       * The session hash id
       * @type {string}
       */
      this.id = data.id_hash;
    }
    if ('approx_last_used_time' in data) {
      /**
       * The approximate last used time
       * @type {string}
       */
      this.approxLastUsedTime = data.approx_last_used_time!;
    }
    if ('client_info' in data) {
      /**
       * The client info
       * @type {SessionClientInfo}
       */
      this.clientInfo = data.client_info;
    }
  }

  /**
   * The timestamp the client was last used at.
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return this.createdAt.getTime();
  }

  /**
   * The time the client was last used at.
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.approxLastUsedTime);
  }

  /**
   * Logout the client (remote).
   * @returns {Promise<void>}
   */
  logout() {
    return this.client.api.auth.sessions.logout({
      data: {
        session_id_hashes: [this.id],
      },
    });
  }

  toJSON() {
    return super.toJSON();
  }
}

export default Session;
export { Session };
