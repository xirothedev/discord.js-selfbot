import Base from "./Base";
import type { TextBasedChannel } from "../types/channels";
import type User from "./User";
import type { RawTypingData } from "../../typings/rawDataTypes";

class Typing extends Base {
  declare channel: TextBasedChannel;
  declare user: User;
  declare startedTimestamp: number;

  constructor(channel: TextBasedChannel, user: User, data: RawTypingData) {
    super(channel.client);

    this.channel = channel;

    this.user = user;

    this._patch(data);
  }

  _patch(data: RawTypingData) {
    if ("timestamp" in data) {
      this.startedTimestamp = data.timestamp * 1000;
    }
  }

  inGuild() {
    return this.guild !== null;
  }

  get startedAt() {
    return new Date(this.startedTimestamp);
  }

  get guild() {
    return "guild" in this.channel ? this.channel.guild : null;
  }

  get member() {
    return this.guild?.members.resolve(this.user) ?? null;
  }
}

export default Typing;
export { Typing };
