import CachedManager from './CachedManager';
import Session, { type RawSessionData } from '../structures/Session';
import type { Client } from '../client/Client';

/**
 * Manages API methods for users and stores their cache.
 * @extends {CachedManager}
 */
class SessionManager extends CachedManager<Session> {
  declare currentSessionIdHash: string | null;
  constructor(client: Client, iterable?: Iterable<Session>) {
    super(client, Session, iterable);

    /**
     * The current session ID hash of the client.
     * @type {string}
     */
    this.currentSessionIdHash = null;
  }
  /**
   * The cache of Sessions
   * @type {Collection<string, Session>}
   * @name SessionManager#cache
   */

  /**
   * Fetch all sessions of the client.
   * @returns {Promise<Collection<string, Session>>}
   */
  fetch() {
    return this.client.api.auth.sessions.get().then((data: { user_sessions: RawSessionData[] }) => {
      const allData = data.user_sessions;
      this.cache.clear();
      for (const session of allData) {
        this._add(session, true, { id: session.id_hash });
      }
      return this.cache;
    });
  }

  /**
   * Logout all client (remote).
   * @returns {Promise<void>}
   */
  logoutAllDevices() {
    return this.client.api.auth.sessions.logout({
      data: {
        session_id_hashes: this.cache.map(session => session.id).filter((id): id is string => typeof id === 'string'),
      },
    });
  }

  /**
   * Get the current session of the client.
   * You must call `fetch()` first to populate the cache.
   * @type {?Session}
   */
  get currentSession() {
    if (!this.currentSessionIdHash) {
      return null;
    }
    return this.cache.get(this.currentSessionIdHash) || null;
  }
}

export default SessionManager;
export { SessionManager };
