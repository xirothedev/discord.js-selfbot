import Base from "./Base";
import ThreadMemberFlags from "../util/ThreadMemberFlags";
import type { Snowflake } from "discord-api-types/v10";
import type { RawThreadMemberData } from "../../typings/rawDataTypes";
import type { GuildMember } from "./GuildMember";
import type ThreadChannel from "./ThreadChannel";
import type User from "./User";

class ThreadMember extends Base {
  declare thread: ThreadChannel;
  declare joinedTimestamp: number | null;
  declare id: Snowflake;
  declare flags: Readonly<ThreadMemberFlags>;
  declare member: GuildMember | null;

  constructor(
    thread: ThreadChannel,
    data?: RawThreadMemberData,
    extra: { cache?: boolean } = {}
  ) {
    super(thread.client);

    this.thread = thread;

    this.joinedTimestamp = null;

    const userId = data?.user_id ?? this.client.user?.id;
    if (userId === undefined) {
      throw new TypeError(
        "A client user is required to create a thread member"
      );
    }
    this.id = userId;

    if (data) {
      this._patch(data, extra);
    }
  }

  _patch(data: RawThreadMemberData, extra: { cache?: boolean } = {}) {
    if ("join_timestamp" in data) {
      this.joinedTimestamp = new Date(data.join_timestamp).getTime();
    }

    if ("flags" in data) {
      this.flags = new ThreadMemberFlags(data.flags).freeze();
    }

    if ("member" in data && data.member) {
      this.member = this.thread.guild.members._add(data.member, extra.cache);
    } else {
      this.member ??= null;
    }
  }

  get guildMember(): GuildMember | null {
    return this.member ?? this.thread.guild.members.cache.get(this.id) ?? null;
  }

  get joinedAt() {
    return this.joinedTimestamp ? new Date(this.joinedTimestamp) : null;
  }

  get user(): User | null {
    return this.client.users.cache.get(this.id) ?? null;
  }

  get manageable() {
    return !this.thread.archived && this.thread.editable;
  }

  async remove(reason?: string) {
    await this.thread.members.remove(this.id, reason);
    return this;
  }
}

export default ThreadMember;
export { ThreadMember };
