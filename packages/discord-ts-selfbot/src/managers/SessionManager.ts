import CachedManager from './CachedManager';
import Session from '../structures/Session';
import type { RawSessionData } from '../structures/Session';
import type { Client } from '../client/Client';

class SessionManager extends CachedManager<Session> {
  declare currentSessionIdHash: string | null;
  constructor(client: Client, iterable?: Iterable<Session>) {
    super(client, Session, iterable);

    this.currentSessionIdHash = null;
  }

  fetch() {
    return this.client.api.auth.sessions
      .get<{ user_sessions: RawSessionData[] }>()
      .then((data) => {
        const allData = data.user_sessions;
        this.cache.clear();
        for (const session of allData) {
          this._add(session, true, { id: session.id_hash });
        }
        return this.cache;
      });
  }

  logoutAllDevices() {
    return this.client.api.auth.sessions.logout({
      data: {
        session_id_hashes: this.cache
          .map((session) => session.id)
          .filter((id): id is string => typeof id === 'string'),
      },
    });
  }

  get currentSession() {
    if (!this.currentSessionIdHash) {
      return null;
    }
    return this.cache.get(this.currentSessionIdHash) || null;
  }
}

export default SessionManager;
export { SessionManager };
