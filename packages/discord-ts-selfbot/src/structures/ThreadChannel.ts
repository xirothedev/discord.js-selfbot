import _ChannelModule from './Channel';
const { Channel } = _ChannelModule;
import TextBasedChannel from './interfaces/TextBasedChannel';
import _errorsModule from '../errors';
const { RangeError } = _errorsModule;
import MessageManager from '../managers/MessageManager';
import ThreadMemberManager from '../managers/ThreadMemberManager';
import ChannelFlags from '../util/ChannelFlags';
import Permissions from '../util/Permissions';
import _UtilModule from '../util/Util';
import { isTextBasedChannel } from '../types/channels';
const { resolveAutoArchiveMaxLimit } = _UtilModule;
import type { Snowflake } from 'discord-api-types/v10';
import type {
  BaseFetchOptions,
  ChannelFlagsResolvable,
  ThreadAutoArchiveDuration,
  ThreadEditData,
} from '../../typings';
import type { BitFieldResolvable } from '../util/BitField';
import type { RawChannelData, RawMessageData, RawThreadMemberData } from '../../typings/rawDataTypes';
import type { PatchOf } from '../types/schema';
import type { GuildMember } from './GuildMember';
import type { Role } from './Role';
import type { User } from './User';
import type { ThreadMember } from './ThreadMember';

type ThreadChannelPatch = PatchOf<'Channel'> & {
  owner_id?: Snowflake;
  guild_id?: Snowflake;
  name?: string;
  parent_id?: Snowflake | null;
  thread_metadata?: {
    locked?: boolean;
    invitable?: boolean;
    archived?: boolean;
    auto_archive_duration?: ThreadAutoArchiveDuration;
    archive_timestamp?: string;
    create_timestamp?: string;
  };
  last_message_id?: Snowflake | null;
  last_pin_timestamp?: string | null;
  rate_limit_per_user?: number;
  message_count?: number;
  member_count?: number;
  total_message_sent?: number;
  applied_tags?: Snowflake[];
  member?: RawThreadMemberData;
  messages?: RawMessageData[];
};

type ThreadEditDataSource = Omit<ThreadEditData, 'flags'> & {
  flags?: BitFieldResolvable | ChannelFlagsResolvable;
};
import type { Guild } from './Guild';

/**
 * Represents a thread channel on Discord.
 * @extends {Channel}
 * @implements {TextBasedChannel}
 */
class ThreadChannel extends Channel {
  declare guild: Guild;
  declare ownerId: Snowflake;
  declare guildId: Snowflake;
  declare messages: MessageManager;
  declare members: ThreadMemberManager;
  declare name: string;
  declare parentId: Snowflake | null;
  declare locked: boolean | null;
  declare invitable: boolean | null;
  declare archived: boolean | null;
  declare autoArchiveDuration: ThreadAutoArchiveDuration | null;
  declare archiveTimestamp: number | null;
  declare _createdTimestamp: number | null;
  declare lastMessageId: Snowflake | null;
  declare lastPinTimestamp: number | null;
  declare rateLimitPerUser: number | null;
  declare messageCount: number | null;
  declare memberCount: number | null;
  declare totalMessageSent: number | null;
  declare appliedTags: Snowflake[];

  constructor(guild: Guild, data: ThreadChannelPatch & RawChannelData, client?: import('../client/Client').default) {
    super(guild?.client ?? client, data, false);

    /**
     * The guild the thread is in
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * The id of the member who created this thread
     * @type {Snowflake}
     */
    this.ownerId = data.owner_id!;

    /**
     * The id of the guild the channel is in
     * @type {Snowflake}
     */
    this.guildId = guild.id ?? data.guild_id!;

    /**
     * A manager of the messages sent to this thread
     * @type {MessageManager}
     */
    this.messages = new MessageManager(this);

    /**
     * A manager of the members that are part of this thread
     * @type {ThreadMemberManager}
     */
    this.members = new ThreadMemberManager(this);
    if (data) this._patch(data);
  }

  _patch(data: ThreadChannelPatch, partial = false) {
    super._patch(data);

    if (typeof data.name === 'string') {
      /**
       * The name of the thread
       * @type {string}
       */
      this.name = data.name;
    }

    if (data.guild_id) {
      this.guildId = data.guild_id;
    }

    if ('parent_id' in data) {
      /**
       * The id of the parent channel of this thread
       * @type {?Snowflake}
       */
      this.parentId = data.parent_id ?? null;
    } else {
      this.parentId ??= null;
    }

    if (data.thread_metadata) {
      const metadata = data.thread_metadata;
      /**
       * Whether the thread is locked
       * @type {?boolean}
       */
      this.locked = metadata.locked ?? false;

      /**
       * Whether members without `MANAGE_THREADS` can invite other members without `MANAGE_THREADS`
       * <info>Always `null` in public threads</info>
       * @type {?boolean}
       */
      this.invitable = this.type === 'GUILD_PRIVATE_THREAD' ? (metadata.invitable ?? false) : null;

      /**
       * Whether the thread is archived
       * @type {?boolean}
       */
      this.archived = metadata.archived ?? null;

      /**
       * The amount of time (in minutes) after which the thread will automatically archive in case of no recent activity
       * @type {?number}
       */
      this.autoArchiveDuration = metadata.auto_archive_duration ?? null;

      /**
       * The timestamp when the thread's archive status was last changed
       * <info>If the thread was never archived or unarchived, this is the timestamp at which the thread was
       * created</info>
       * @type {?number}
       */
      this.archiveTimestamp = metadata.archive_timestamp ? Date.parse(metadata.archive_timestamp) : null;

      if (metadata.create_timestamp) {
        // Note: this is needed because we can't assign directly to getters
        this._createdTimestamp = Date.parse(metadata.create_timestamp);
      }
    } else {
      this.locked ??= null;
      this.archived ??= null;
      this.autoArchiveDuration ??= null;
      this.archiveTimestamp ??= null;
      this.invitable ??= null;
    }

    this._createdTimestamp ??= this.type === 'GUILD_PRIVATE_THREAD' ? super.createdTimestamp : null;

    if ('last_message_id' in data) {
      /**
       * The last message id sent in this thread, if one was sent
       * @type {?Snowflake}
       */
      this.lastMessageId = data.last_message_id ?? null;
    } else {
      this.lastMessageId ??= null;
    }

    if ('last_pin_timestamp' in data) {
      /**
       * The timestamp when the last pinned message was pinned, if there was one
       * @type {?number}
       */
      this.lastPinTimestamp = data.last_pin_timestamp ? new Date(data.last_pin_timestamp).getTime() : null;
    } else {
      this.lastPinTimestamp ??= null;
    }

    if ('rate_limit_per_user' in data || !partial) {
      /**
       * The rate limit per user (slowmode) for this thread in seconds
       * @type {?number}
       */
      this.rateLimitPerUser = data.rate_limit_per_user ?? 0;
    } else {
      this.rateLimitPerUser ??= null;
    }

    if ('message_count' in data) {
      /**
       * <info>Threads created before July 1, 2022 may have an inaccurate count.
       * If you need an approximate value higher than that, use `ThreadChannel#messages.cache.size`</info>
       * @type {?number}
       */
      this.messageCount = data.message_count ?? null;
    } else {
      this.messageCount ??= null;
    }

    if ('member_count' in data) {
      /**
       * The approximate count of users in this thread
       * <info>This stops counting at 50. If you need an approximate value higher than that, use
       * `ThreadChannel#members.cache.size`</info>
       * @type {?number}
       */
      this.memberCount = data.member_count ?? null;
    } else {
      this.memberCount ??= null;
    }

    if ('total_message_sent' in data) {
      /**
       * The number of messages ever sent in a thread, similar to {@link ThreadChannel#messageCount} except it
       * will not decrement whenever a message is deleted
       * @type {?number}
       */
      this.totalMessageSent = data.total_message_sent ?? null;
    } else {
      this.totalMessageSent ??= null;
    }

    if ('applied_tags' in data) {
      /**
       * The tags applied to this thread
       * @type {Snowflake[]}
       */
      this.appliedTags = data.applied_tags ?? [];
    } else {
      this.appliedTags ??= [];
    }

    if (data.member && this.client.user) this.members._add({ user_id: this.client.user!.id, ...data.member });
    if (data.messages) for (const message of data.messages) this.messages._add(message);
  }

  /**
   * The timestamp when this thread was created. This isn't available for threads
   * created before 2022-01-09
   * @type {?number}
   * @readonly
   */
  get createdTimestamp() {
    return this._createdTimestamp;
  }

  /**
   * A collection of associated guild member objects of this thread's members
   * @type {Collection<Snowflake, GuildMember>}
   * @readonly
   */
  get guildMembers() {
    return this.members.cache.mapValues((member: ThreadMember) => member.guildMember);
  }

  /**
   * The time at which this thread's archive status was last changed
   * <info>If the thread was never archived or unarchived, this is the time at which the thread was created</info>
   * @type {?Date}
   * @readonly
   */
  get archivedAt() {
    if (!this.archiveTimestamp) return null;
    return new Date(this.archiveTimestamp);
  }

  /**
   * The time the thread was created at
   * @type {?Date}
   * @readonly
   */
  get createdAt(): Date | null {
    return this.createdTimestamp === null ? null : new Date(this.createdTimestamp);
  }

  /**
   * The parent channel of this thread
   * @type {?(NewsChannel|TextChannel|ForumChannel|MediaChannel)}
   * @readonly
   */
  get parent(): import('./GuildChannel').GuildChannel | null {
    return this.parentId ? this.guild.channels.resolve(this.parentId) : null;
  }

  /**
   * Makes the client user join the thread.
   * @returns {Promise<ThreadChannel>}
   */
  async join() {
    await this.members.add('@me');
    return this;
  }

  /**
   * Makes the client user leave the thread.
   * @returns {Promise<ThreadChannel>}
   */
  async leave() {
    await this.members.remove('@me');
    return this;
  }

  /**
   * Gets the overall set of permissions for a member or role in this thread's parent channel, taking overwrites into
   * account.
   * @param {GuildMemberResolvable|RoleResolvable} memberOrRole The member or role to obtain the overall permissions for
   * @param {boolean} [checkAdmin=true] Whether having `ADMINISTRATOR` will return all permissions
   * @returns {?Readonly<Permissions>}
   */
  permissionsFor(memberOrRole: GuildMember | Role | User | Snowflake, checkAdmin = true) {
    return this.parent?.permissionsFor(memberOrRole, checkAdmin) ?? null;
  }

  /**
   * Fetches the owner of this thread. If the thread member object isn't needed,
   * use {@link ThreadChannel#ownerId} instead.
   * @param {BaseFetchOptions} [options] The options for fetching the member
   * @returns {Promise<?ThreadMember>}
   */
  async fetchOwner({ cache = true, force = false }: BaseFetchOptions = {}): Promise<ThreadMember | null> {
    if (!force) {
      const existing = this.members.cache.get(this.ownerId);
      if (existing) return existing;
    }

    // We cannot fetch a single thread member, as of this commit's date, Discord API responds with 405
    const members = await this.members.fetch({ cache });
    return members.get(this.ownerId) ?? null;
  }

  /**
   * Fetches the message that started this thread, if any.
   * <info>The `Promise` will reject if the original message in a forum post is deleted
   * or when the original message in the parent channel is deleted.
   * If you just need the id of that message, use {@link ThreadChannel#id} instead.</info>
   * @param {BaseFetchOptions} [options] Additional options for this fetch
   * @returns {Promise<Message|null>}
   */
  // eslint-disable-next-line require-await
  async fetchStarterMessage(options?: BaseFetchOptions) {
    const channel = this.parent?.type === 'GUILD_FORUM' ? this : this.parent;
    return channel && isTextBasedChannel(channel) ? (channel.messages.fetch(this.id, options) ?? null) : null;
  }

  /**
   * The options used to edit a thread channel
   * @typedef {Object} ThreadEditData
   * @property {string} [name] The new name for the thread
   * @property {boolean} [archived] Whether the thread is archived
   * @property {ThreadAutoArchiveDuration} [autoArchiveDuration] The amount of time (in minutes) after which the thread
   * should automatically archive in case of no recent activity
   * @property {number} [rateLimitPerUser] The rate limit per user (slowmode) for the thread in seconds
   * @property {boolean} [locked] Whether the thread is locked
   * @property {boolean} [invitable] Whether non-moderators can add other non-moderators to a thread
   * <info>Can only be edited on `GUILD_PRIVATE_THREAD`</info>
   * @property {Snowflake[]} [appliedTags] The tags to apply to the thread
   * @property {ChannelFlagsResolvable} [flags] The flags to set on the channel
   */

  /**
   * Edits this thread.
   * @param {ThreadEditData} data The new data for this thread
   * @param {string} [reason] Reason for editing this thread
   * @returns {Promise<ThreadChannel>}
   * @example
   * // Edit a thread
   * thread.edit({ name: 'new-thread' })
   *   .then(editedThread => console.log(editedThread))
   *   .catch(console.error);
   */
  async edit(data: ThreadEditDataSource, reason?: string): Promise<ThreadChannel> {
    let autoArchiveDuration: ThreadAutoArchiveDuration | 'MAX' | number | undefined = data.autoArchiveDuration;
    if (autoArchiveDuration === 'MAX') autoArchiveDuration = resolveAutoArchiveMaxLimit(this.guild);

    const newData = await this.client.api.channels(this.id).patch({
      data: {
        name: data.name,
        archived: data.archived,
        auto_archive_duration: autoArchiveDuration,
        rate_limit_per_user: data.rateLimitPerUser,
        locked: data.locked,
        invitable: this.type === 'GUILD_PRIVATE_THREAD' ? data.invitable : undefined,
        applied_tags: data.appliedTags,
        flags: 'flags' in data ? ChannelFlags.resolve(data.flags) : undefined,
      },
      reason,
    });

    return this.client.actions.ChannelUpdate.handle(newData).updated;
  }

  /**
   * Sets whether the thread is archived.
   * @param {boolean} [archived=true] Whether the thread is archived
   * @param {string} [reason] Reason for archiving or unarchiving
   * @returns {Promise<ThreadChannel>}
   * @example
   * // Archive the thread
   * thread.setArchived(true)
   *   .then(newThread => console.log(`Thread is now ${newThread.archived ? 'archived' : 'active'}`))
   *   .catch(console.error);
   */
  setArchived(archived = true, reason?: string) {
    return this.edit({ archived }, reason);
  }

  /**
   * Sets the duration after which the thread will automatically archive in case of no recent activity.
   * @param {ThreadAutoArchiveDuration} autoArchiveDuration The amount of time (in minutes) after which the thread
   * should automatically archive in case of no recent activity
   * @param {string} [reason] Reason for changing the auto archive duration
   * @returns {Promise<ThreadChannel>}
   * @example
   * // Set the thread's auto archive time to 1 hour
   * thread.setAutoArchiveDuration(60)
   *   .then(newThread => {
   *     console.log(`Thread will now archive after ${newThread.autoArchiveDuration} minutes of inactivity`);
   *    });
   *   .catch(console.error);
   */
  setAutoArchiveDuration(autoArchiveDuration: ThreadAutoArchiveDuration | 'MAX', reason?: string) {
    return this.edit({ autoArchiveDuration }, reason);
  }

  /**
   * Sets whether members without the `MANAGE_THREADS` permission can invite other members without the
   * `MANAGE_THREADS` permission to this thread.
   * @param {boolean} [invitable=true] Whether non-moderators can invite non-moderators to this thread
   * @param {string} [reason] Reason for changing invite
   * @returns {Promise<ThreadChannel>}
   */
  async setInvitable(invitable = true, reason?: string) {
    if (this.type !== 'GUILD_PRIVATE_THREAD') throw new RangeError('THREAD_INVITABLE_TYPE', this.type);
    return this.edit({ invitable }, reason);
  }

  /**
   * Sets whether the thread can be **unarchived** by anyone with `SEND_MESSAGES` permission.
   * When a thread is locked only members with `MANAGE_THREADS` can unarchive it.
   * @param {boolean} [locked=true] Whether the thread is locked
   * @param {string} [reason] Reason for locking or unlocking the thread
   * @returns {Promise<ThreadChannel>}
   * @example
   * // Set the thread to locked
   * thread.setLocked(true)
   *   .then(newThread => console.log(`Thread is now ${newThread.locked ? 'locked' : 'unlocked'}`))
   *   .catch(console.error);
   */
  setLocked(locked = true, reason?: string) {
    return this.edit({ locked }, reason);
  }

  /**
   * Sets a new name for this thread.
   * @param {string} name The new name for the thread
   * @param {string} [reason] Reason for changing the thread's name
   * @returns {Promise<ThreadChannel>}
   * @example
   * // Change the thread's name
   * thread.setName('not_general')
   *   .then(newThread => console.log(`Thread's new name is ${newThread.name}`))
   *   .catch(console.error);
   */
  setName(name: string, reason?: string) {
    return this.edit({ name }, reason);
  }

  /**
   * Sets the rate limit per user (slowmode) for this thread.
   * @param {number} rateLimitPerUser The new rate limit in seconds
   * @param {string} [reason] Reason for changing the thread's rate limit
   * @returns {Promise<ThreadChannel>}
   */
  setRateLimitPerUser(rateLimitPerUser: number, reason?: string) {
    return this.edit({ rateLimitPerUser }, reason);
  }

  /**
   * Pins this thread from the forum channel.
   * @param {string} [reason] Reason for pinning
   * @returns {Promise<ThreadChannel>}
   */
  pin(reason?: string) {
    return this.edit({ flags: this.flags.add(ChannelFlags.FLAGS.PINNED) }, reason);
  }

  /**
   * Unpins this thread from the forum channel.
   * @param {string} [reason] Reason for unpinning
   * @returns {Promise<ThreadChannel>}
   */
  unpin(reason?: string) {
    return this.edit({ flags: this.flags.remove(ChannelFlags.FLAGS.PINNED) }, reason);
  }

  /**
   * Set the applied tags for this channel (only applicable to forum threads)
   * @param {Snowflake[]} appliedTags The tags to set for this channel
   * @param {string} [reason] Reason for changing the thread's applied tags
   * @returns {Promise<ThreadChannel>}
   */
  setAppliedTags(appliedTags: Snowflake[], reason?: string) {
    return this.edit({ appliedTags }, reason);
  }

  /**
   * Whether the client user is a member of the thread.
   * @type {boolean}
   * @readonly
   */
  get joined() {
    return this.client.user?.id ? this.members.cache.has(this.client.user.id) : false;
  }

  /**
   * Whether the thread is editable by the client user (name, archived, autoArchiveDuration)
   * @type {boolean}
   * @readonly
   */
  get editable() {
    return (
      (this.ownerId === this.client.user!.id && (this.type !== 'GUILD_PRIVATE_THREAD' || this.joined)) ||
      this.manageable
    );
  }

  /**
   * Whether the thread is joinable by the client user
   * @type {boolean}
   * @readonly
   */
  get joinable() {
    return (
      !this.archived &&
      !this.joined &&
      (this.client.user ? this.permissionsFor(this.client.user) : null)?.has(
        this.type === 'GUILD_PRIVATE_THREAD' ? Permissions.FLAGS.MANAGE_THREADS : Permissions.FLAGS.VIEW_CHANNEL,
        false,
      )
    );
  }

  /**
   * Whether the thread is manageable by the client user, for deleting or editing rateLimitPerUser or locked.
   * @type {boolean}
   * @readonly
   */
  get manageable() {
    const permissions = this.client.user ? this.permissionsFor(this.client.user) : null;
    if (!permissions) return false;
    // This flag allows managing even if timed out
    if (permissions.has(Permissions.FLAGS.ADMINISTRATOR, false)) return true;

    const me = this.guild.members.me;
    return Boolean(
      me &&
      me.communicationDisabledUntilTimestamp !== null &&
      me.communicationDisabledUntilTimestamp < Date.now() &&
      permissions.has(Permissions.FLAGS.MANAGE_THREADS, false),
    );
  }

  /**
   * Whether the thread is viewable by the client user
   * @type {boolean}
   * @readonly
   */
  get viewable() {
    if (this.client.user!.id === this.guild.ownerId) return true;
    const permissions = this.client.user ? this.permissionsFor(this.client.user) : null;
    if (!permissions) return false;
    return permissions.has(Permissions.FLAGS.VIEW_CHANNEL, false);
  }

  /**
   * Whether the client user can send messages in this thread
   * @type {boolean}
   * @readonly
   */
  get sendable() {
    const permissions = this.client.user ? this.permissionsFor(this.client.user) : null;
    if (!permissions) return false;
    // This flag allows sending even if timed out
    if (permissions.has(Permissions.FLAGS.ADMINISTRATOR, false)) return true;

    return (
      !(this.archived && this.locked && !this.manageable) &&
      (this.type !== 'GUILD_PRIVATE_THREAD' || this.joined || this.manageable) &&
      permissions.has(Permissions.FLAGS.SEND_MESSAGES_IN_THREADS, false) &&
      Boolean(this.guild.members.me?.isCommunicationDisabled() !== true)
    );
  }

  /**
   * Whether the thread is unarchivable by the client user
   * @type {boolean}
   * @readonly
   */
  get unarchivable() {
    return this.archived && this.sendable && (!this.locked || this.manageable);
  }

  /**
   * Whether this thread is a private thread
   * @returns {boolean}
   */
  isPrivate() {
    return this.type === 'GUILD_PRIVATE_THREAD';
  }

  /**
   * Deletes this thread.
   * @param {string} [reason] Reason for deleting this thread
   * @returns {Promise<ThreadChannel>}
   * @example
   * // Delete the thread
   * thread.delete('cleaning out old threads')
   *   .then(deletedThread => console.log(deletedThread))
   *   .catch(console.error);
   */
  async delete(reason?: string) {
    await this.guild.channels.delete(this.id, reason);
    return this;
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  /* eslint-disable no-empty-function */
  get lastMessage() {
    return undefined;
  }
  get lastPinAt() {
    return undefined;
  }
  declare send: (options: import('../types/channels').SendOptions) => import('../types/channels').SendResult;
  sendTyping() {}
  createMessageCollector() {}
  awaitMessages() {}
  // Doesn't work on Thread channels; setRateLimitPerUser() {}
  // Doesn't work on Thread channels; setNSFW() {}
}

TextBasedChannel.applyToClass(ThreadChannel, true, ['fetchWebhooks', 'setRateLimitPerUser', 'setNSFW']);

export default ThreadChannel;
export { ThreadChannel };
