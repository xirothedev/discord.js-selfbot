import { Collection } from "@discordjs/collection";
import Base from "./Base";
import type { Snowflake } from "discord-api-types/v10";
import type { Client } from "../client/Client";
import type { User } from "./User";
import type { RawVoiceStateData } from "../../typings/rawDataTypes";

export interface CallData {
  channel_id: Snowflake;
  region?: string;
  ringing?: Snowflake[];
  voice_states?: RawVoiceStateData[];
}

class CallState extends Base {
  declare channelId: Snowflake;
  declare region: string;
  declare _ringing: Snowflake[];
  constructor(client: Client, data: CallData) {
    super(client);
    this.channelId = data.channel_id;

    this._ringing = [];

    this._patch(data);
  }

  _patch(data: Partial<CallData>) {
    if (typeof data.region === "string") {
      this.region = data.region;
    }
    if (Array.isArray(data.ringing)) {
      this._ringing = data.ringing;
    }
  }

  get channel() {
    return this.client.channels.cache.get(this.channelId);
  }

  setRTCRegion(region: string) {
    return this.client.api
      .channels(this.channelId, "call")
      .patch({ data: { region } });
  }

  get ringing(): Collection<Snowflake, User> {
    const users = new Collection<Snowflake, User>();
    for (const id of this._ringing) {
      const user = this.client.users.cache.get(id);
      if (user) {
        users.set(id, user);
      }
    }
    return users;
  }
}

export default CallState;
export { CallState };
