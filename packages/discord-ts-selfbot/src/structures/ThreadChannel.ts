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
import type { GatewayThreadUpdateDispatchData, Snowflake } from 'discord-api-types/v10';
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

    this.guild = guild;

    this.ownerId = data.owner_id!;

    this.guildId = guild.id ?? data.guild_id!;

    this.messages = new MessageManager(this);

    this.members = new ThreadMemberManager(this);
    if (data) this._patch(data);
  }

  _patch(data: ThreadChannelPatch, partial = false) {
    super._patch(data);

    if (typeof data.name === 'string') {
      this.name = data.name;
    }

    if (data.guild_id) {
      this.guildId = data.guild_id;
    }

    if ('parent_id' in data) {
      this.parentId = data.parent_id ?? null;
    } else {
      this.parentId ??= null;
    }

    if (data.thread_metadata) {
      const metadata = data.thread_metadata;
      this.locked = metadata.locked ?? false;

      this.invitable = this.type === 'GUILD_PRIVATE_THREAD' ? (metadata.invitable ?? false) : null;

      this.archived = metadata.archived ?? null;

      this.autoArchiveDuration = metadata.auto_archive_duration ?? null;

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
      this.lastMessageId = data.last_message_id ?? null;
    } else {
      this.lastMessageId ??= null;
    }

    if ('last_pin_timestamp' in data) {
      this.lastPinTimestamp = data.last_pin_timestamp ? new Date(data.last_pin_timestamp).getTime() : null;
    } else {
      this.lastPinTimestamp ??= null;
    }

    if ('rate_limit_per_user' in data || !partial) {
      this.rateLimitPerUser = data.rate_limit_per_user ?? 0;
    } else {
      this.rateLimitPerUser ??= null;
    }

    if ('message_count' in data) {
      this.messageCount = data.message_count ?? null;
    } else {
      this.messageCount ??= null;
    }

    if ('member_count' in data) {
      this.memberCount = data.member_count ?? null;
    } else {
      this.memberCount ??= null;
    }

    if ('total_message_sent' in data) {
      this.totalMessageSent = data.total_message_sent ?? null;
    } else {
      this.totalMessageSent ??= null;
    }

    if ('applied_tags' in data) {
      this.appliedTags = data.applied_tags ?? [];
    } else {
      this.appliedTags ??= [];
    }

    if (data.member && this.client.user) this.members._add({ user_id: this.client.user!.id, ...data.member });
    if (data.messages) for (const message of data.messages) this.messages._add(message);
  }

  get createdTimestamp() {
    return this._createdTimestamp;
  }

  get guildMembers() {
    return this.members.cache.mapValues((member: ThreadMember) => member.guildMember);
  }

  get archivedAt() {
    if (!this.archiveTimestamp) return null;
    return new Date(this.archiveTimestamp);
  }

  get createdAt(): Date | null {
    return this.createdTimestamp === null ? null : new Date(this.createdTimestamp);
  }

  get parent(): import('./GuildChannel').GuildChannel | null {
    return this.parentId ? this.guild.channels.resolve(this.parentId) : null;
  }

  async join() {
    await this.members.add('@me');
    return this;
  }

  async leave() {
    await this.members.remove('@me');
    return this;
  }

  permissionsFor(memberOrRole: GuildMember | Role | User | Snowflake, checkAdmin = true) {
    return this.parent?.permissionsFor(memberOrRole, checkAdmin) ?? null;
  }

  async fetchOwner({ cache = true, force = false }: BaseFetchOptions = {}): Promise<ThreadMember | null> {
    if (!force) {
      const existing = this.members.cache.get(this.ownerId);
      if (existing) return existing;
    }

    // We cannot fetch a single thread member, as of this commit's date, Discord API responds with 405
    const members = await this.members.fetch({ cache });
    return members.get(this.ownerId) ?? null;
  }

  // eslint-disable-next-line require-await
  async fetchStarterMessage(options?: BaseFetchOptions) {
    const channel = this.parent?.type === 'GUILD_FORUM' ? this : this.parent;
    return channel && isTextBasedChannel(channel) ? (channel.messages.fetch(this.id, options) ?? null) : null;
  }

  async edit(data: ThreadEditDataSource, reason?: string): Promise<ThreadChannel> {
    let autoArchiveDuration: ThreadAutoArchiveDuration | 'MAX' | number | undefined = data.autoArchiveDuration;
    if (autoArchiveDuration === 'MAX') autoArchiveDuration = resolveAutoArchiveMaxLimit(this.guild);

    const newData = await this.client.api.channels(this.id).patch<GatewayThreadUpdateDispatchData>({
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

    const updated = this.client.actions.ChannelUpdate.handle(newData).updated;
    return updated instanceof ThreadChannel ? updated : this;
  }

  setArchived(archived = true, reason?: string) {
    return this.edit({ archived }, reason);
  }

  setAutoArchiveDuration(autoArchiveDuration: ThreadAutoArchiveDuration | 'MAX', reason?: string) {
    return this.edit({ autoArchiveDuration }, reason);
  }

  async setInvitable(invitable = true, reason?: string) {
    if (this.type !== 'GUILD_PRIVATE_THREAD') throw new RangeError('THREAD_INVITABLE_TYPE', this.type);
    return this.edit({ invitable }, reason);
  }

  setLocked(locked = true, reason?: string) {
    return this.edit({ locked }, reason);
  }

  setName(name: string, reason?: string) {
    return this.edit({ name }, reason);
  }

  setRateLimitPerUser(rateLimitPerUser: number, reason?: string) {
    return this.edit({ rateLimitPerUser }, reason);
  }

  pin(reason?: string) {
    return this.edit({ flags: this.flags.add(ChannelFlags.FLAGS.PINNED) }, reason);
  }

  unpin(reason?: string) {
    return this.edit({ flags: this.flags.remove(ChannelFlags.FLAGS.PINNED) }, reason);
  }

  setAppliedTags(appliedTags: Snowflake[], reason?: string) {
    return this.edit({ appliedTags }, reason);
  }

  get joined() {
    return this.client.user?.id ? this.members.cache.has(this.client.user.id) : false;
  }

  get editable() {
    return (
      (this.ownerId === this.client.user!.id && (this.type !== 'GUILD_PRIVATE_THREAD' || this.joined)) ||
      this.manageable
    );
  }

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

  get viewable() {
    if (this.client.user!.id === this.guild.ownerId) return true;
    const permissions = this.client.user ? this.permissionsFor(this.client.user) : null;
    if (!permissions) return false;
    return permissions.has(Permissions.FLAGS.VIEW_CHANNEL, false);
  }

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

  get unarchivable() {
    return this.archived && this.sendable && (!this.locked || this.manageable);
  }

  isPrivate() {
    return this.type === 'GUILD_PRIVATE_THREAD';
  }

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
