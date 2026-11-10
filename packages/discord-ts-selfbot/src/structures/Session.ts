import Base from "./Base";
import type { SessionClientInfo } from "../../typings";
import type Client from "../client/Client";

export interface RawSessionData {
  id_hash?: string;
  approx_last_used_time?: string;
  client_info?: SessionClientInfo;
}

class Session extends Base {
  declare id?: string;
  declare approxLastUsedTime: string;
  declare clientInfo?: SessionClientInfo;

  constructor(client: Client, data: RawSessionData) {
    super(client);
    this._patch(data);
  }

  _patch(data: RawSessionData) {
    if ("id_hash" in data) {
      this.id = data.id_hash;
    }
    if (
      "approx_last_used_time" in data &&
      data.approx_last_used_time !== undefined
    ) {
      this.approxLastUsedTime = data.approx_last_used_time;
    }
    if ("client_info" in data) {
      this.clientInfo = data.client_info;
    }
  }

  get createdTimestamp() {
    return this.createdAt.getTime();
  }

  get createdAt() {
    return new Date(this.approxLastUsedTime);
  }

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
