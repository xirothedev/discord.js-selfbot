import Base from './Base';
import ThreadMemberFlags from '../util/ThreadMemberFlags';
import type { Snowflake } from 'discord-api-types/v10';
import type { RawThreadMemberData } from '../../typings/rawDataTypes';
import type { GuildMember } from './GuildMember';
import type ThreadChannel from './ThreadChannel';

/**
 * Represents a Member for a Thread.
 * @extends {Base}
 */
class ThreadMember extends Base {
  declare thread: ThreadChannel;
  declare joinedTimestamp: number | null;
  declare id: Snowflake;
  declare flags: Readonly<ThreadMemberFlags>;
  declare member: GuildMember | null;

  constructor(thread: ThreadChannel, data?: RawThreadMemberData, extra: { cache?: boolean } = {}) {
    super(thread.client);

    /**
     * The thread that this member is a part of
     * @type {ThreadChannel}
     */
    this.thread = thread;

    /**
     * The timestamp the member last joined the thread at
     * @type {?number}
     */
    this.joinedTimestamp = null;

    /**
     * The id of the thread member
     * @type {Snowflake}
     */
    this.id = data?.user_id ?? this.client.user!.id;

    if (data) this._patch(data, extra);
  }

  _patch(data: RawThreadMemberData, extra: { cache?: boolean } = {}) {
    if ('join_timestamp' in data) this.joinedTimestamp = new Date(data.join_timestamp).getTime();

    if ('flags' in data) {
      /**
       * The flags for this thread member
       * @type {ThreadMemberFlags}
       */
      this.flags = new ThreadMemberFlags(data.flags).freeze();
    }

    if ('member' in data && data.member) {
      /**
       * The guild member associated with this thread member.
       * @type {?GuildMember}
       * @private
       */
      this.member = this.thread.guild.members._add(data.member, extra.cache);
    } else {
      this.member ??= null;
    }
  }

  /**
   * The guild member associated with this thread member
   * @type {?GuildMember}
   * @readonly
   */
  get guildMember(): import('./GuildMember').GuildMember | null {
    return this.member ?? this.thread.guild.members.cache.get(this.id) ?? null;
  }

  /**
   * The last time this member joined the thread
   * @type {?Date}
   * @readonly
   */
  get joinedAt() {
    return this.joinedTimestamp ? new Date(this.joinedTimestamp) : null;
  }

  /**
   * The user associated with this thread member
   * @type {?User}
   * @readonly
   */
  get user(): import('./User').default | null {
    return this.client.users.cache.get(this.id) ?? null;
  }

  /**
   * Whether the client user can manage this thread member
   * @type {boolean}
   * @readonly
   */
  get manageable() {
    return !this.thread.archived && this.thread.editable;
  }

  /**
   * Removes this member from the thread.
   * @param {string} [reason] Reason for removing the member
   * @returns {ThreadMember}
   */
  async remove(reason?: string) {
    await this.thread.members.remove(this.id, reason);
    return this;
  }
}

export default ThreadMember;
export { ThreadMember };
