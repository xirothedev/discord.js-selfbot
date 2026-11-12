import Base, { patchValue } from './Base';
import _GuildScheduledEventModule from './GuildScheduledEvent';

const { GuildScheduledEvent } = _GuildScheduledEventModule;
import IntegrationApplication from './IntegrationApplication';
import InviteStageInstance from './InviteStageInstance';
import _errorsModule from '../errors';

const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';

const { Endpoints } = _ConstantsModule;
import InviteFlags from '../util/InviteFlags';
import Permissions from '../util/Permissions';
import InviteGuild from './InviteGuild';
import type { RawInviteData } from '../../typings/rawDataTypes';
import type {
  GatewayInviteCreateDispatchData,
  GatewayInviteDeleteDispatchData,
} from 'discord-api-types/v10';
import { Guild } from './Guild';
import type { GuildChannel } from './GuildChannel';

export type RawInviteDataSource =
  | RawInviteData
  | (GatewayInviteCreateDispatchData & { channel: GuildChannel; guild: Guild })
  | (GatewayInviteDeleteDispatchData & { channel: GuildChannel; guild: Guild });
import type { InviteEntity } from '../types/entities/invite';
import type { PatchOf } from '../types/schema';
import { isInviteChannel } from '../types/channels';
import type Client from '../client/Client';

// Keep `inviter` and `channel` as assigned fields for v14 parity.

class Invite extends Base implements InviteEntity {
  declare channel: InviteEntity['channel'];
  declare channelId: InviteEntity['channelId'];
  declare code: InviteEntity['code'];
  declare createdTimestamp: InviteEntity['createdTimestamp'];
  declare guild: InviteEntity['guild'];
  declare inviter: InviteEntity['inviter'];
  declare inviterId: InviteEntity['inviterId'];
  declare maxAge: InviteEntity['maxAge'];
  declare maxUses: InviteEntity['maxUses'];
  declare memberCount: InviteEntity['memberCount'];
  declare presenceCount: InviteEntity['presenceCount'];
  declare type: InviteEntity['type'];
  declare targetApplication: InviteEntity['targetApplication'];
  declare targetUser: InviteEntity['targetUser'];
  declare targetType: InviteEntity['targetType'];
  declare temporary: InviteEntity['temporary'];
  declare uses: InviteEntity['uses'];
  declare stageInstance: InviteEntity['stageInstance'];
  declare guildScheduledEvent: InviteEntity['guildScheduledEvent'];
  declare flags: InviteEntity['flags'];
  declare _expiresTimestamp: number | null;
  static INVITES_PATTERN = /./u;
  constructor(client: Client, data: RawInviteDataSource) {
    super(client);
    this._patch(data);
  }

  _patch(data: PatchOf<'Invite'> | RawInviteDataSource) {
    this.patchGuild(data);

    if (data.code !== undefined) {
      this.code = data.code;
    }

    this.patchCounts(data);

    this.patchUsers(data);

    this.patchChannelAndDates(data);
    this.patchStageInstance(data);

    if ('guild_scheduled_event' in data && data.guild_scheduled_event) {
      this.guildScheduledEvent = new GuildScheduledEvent(
        this.client,
        data.guild_scheduled_event
      );
    } else {
      this.guildScheduledEvent ??= null;
    }

    if ('flags' in data) {
      this.flags = new InviteFlags(data.flags).freeze();
    } else {
      this.flags ??= new InviteFlags().freeze();
    }
  }

  private patchChannelAndDates(data: PatchOf<'Invite'> | RawInviteDataSource) {
    if ('channel_id' in data) {
      this.channelId = data.channel_id;
      const channel = data.channel_id
        ? this.client.channels.cache.get(data.channel_id)
        : undefined;
      this.channel = channel && isInviteChannel(channel) ? channel : undefined;
    }

    if ('channel' in data && data.channel) {
      const channel = this.client.channels._add(data.channel, this.guild, {
        cache: false,
      });
      if (channel && isInviteChannel(channel)) {
        this.channel ??= channel;
      }
      this.channelId ??= data.channel.id;
    }

    if ('created_at' in data && data.created_at !== undefined) {
      this.createdTimestamp = new Date(data.created_at).getTime();
    } else {
      this.createdTimestamp ??= null;
    }

    if ('expires_at' in data) {
      this._expiresTimestamp = data.expires_at
        ? Date.parse(data.expires_at)
        : null;
    } else {
      this._expiresTimestamp ??= null;
    }
  }

  private patchCounts(data: PatchOf<'Invite'> | RawInviteDataSource) {
    this.presenceCount = patchValue(
      'approximate_presence_count' in data
        ? data.approximate_presence_count
        : undefined,
      this.presenceCount
    );
    this.memberCount = patchValue(
      'approximate_member_count' in data
        ? data.approximate_member_count
        : undefined,
      this.memberCount
    );
    this.temporary = patchValue(
      'temporary' in data ? data.temporary : undefined,
      this.temporary
    );
    this.maxAge = patchValue(
      'max_age' in data ? data.max_age : undefined,
      this.maxAge
    );
    this.uses = patchValue('uses' in data ? data.uses : undefined, this.uses);
    this.maxUses = patchValue(
      'max_uses' in data ? data.max_uses : undefined,
      this.maxUses
    );
  }

  private patchUsers(data: PatchOf<'Invite'> | RawInviteDataSource) {
    if ('inviter_id' in data) {
      this.inviterId = data.inviter_id ? String(data.inviter_id) : null;
      this.inviter = this.client.users.resolve(data.inviter_id);
    } else {
      this.inviterId ??= null;
    }

    if ('inviter' in data && data.inviter) {
      this.inviter ??= this.client.users._add(data.inviter);
      this.inviterId = data.inviter.id;
    } else {
      this.inviter ??= null;
    }

    if ('target_user' in data && data.target_user) {
      this.targetUser = this.client.users._add(data.target_user);
    } else {
      this.targetUser ??= null;
    }

    if ('target_application' in data && data.target_application) {
      this.targetApplication = new IntegrationApplication(
        this.client,
        data.target_application
      );
    } else {
      this.targetApplication ??= null;
    }

    this.targetType = patchValue(
      'target_type' in data ? data.target_type : undefined,
      this.targetType
    );
    this.type = patchValue('type' in data ? data.type : undefined, this.type);
  }

  private patchGuild(data: PatchOf<'Invite'> | RawInviteDataSource) {
    this.guild ??= null;
    if (!data.guild) {
      return;
    }
    const cached = this.client.guilds.cache.get(data.guild.id);
    if (cached) {
      this.guild = cached;
    } else if (data.guild instanceof Guild) {
      this.guild = data.guild;
    } else {
      this.guild = new InviteGuild(this.client, data.guild);
    }
  }

  private patchStageInstance(data: PatchOf<'Invite'> | RawInviteDataSource) {
    const stageInstance =
      'stage_instance' in data ? data.stage_instance : undefined;
    const stageChannel = this.channel;
    const stageGuild = this.guild;
    if (stageInstance && stageChannel && stageGuild) {
      this.stageInstance = new InviteStageInstance(
        this.client,
        stageInstance,
        stageChannel.id,
        stageGuild.id
      );
    } else {
      this.stageInstance ??= null;
    }
  }

  get createdAt() {
    return this.createdTimestamp ? new Date(this.createdTimestamp) : null;
  }

  get deletable() {
    const { guild } = this;
    if (
      !guild ||
      !('members' in guild) ||
      !this.client.guilds.cache.has(guild.id)
    ) {
      return false;
    }
    if (!guild.members.me) {
      throw new Error('GUILD_UNCACHED_ME');
    }
    if (!this.channel || !('permissionsFor' in this.channel)) {
      return false;
    }
    const { user } = this.client;
    if (!user) {
      return false;
    }
    return (
      (this.channel
        .permissionsFor(user.id)
        ?.has(BigInt(Permissions.FLAGS.MANAGE_CHANNELS), false) ??
        false) ||
      guild.members.me.permissions.has(BigInt(Permissions.FLAGS.MANAGE_GUILD))
    );
  }

  get expiresTimestamp() {
    return (
      this._expiresTimestamp ??
      (this.createdTimestamp && this.maxAge
        ? this.createdTimestamp + this.maxAge * 1000
        : null)
    );
  }

  get expiresAt() {
    const { expiresTimestamp } = this;
    return expiresTimestamp ? new Date(expiresTimestamp) : null;
  }

  get url() {
    return Endpoints.invite(this.client.options.http.invite, this.code);
  }

  async delete(reason?: string) {
    await this.client.api.invites[this.code].delete({ reason });
    return this;
  }

  async fetchFriendMembers(): Promise<{ friend_member_ids: string[] }> {
    return this.client.api.invites[this.code]['friend-members'].get<{
      friend_member_ids: string[];
    }>();
  }

  async fetchTargetUsersJobStatus(): Promise<unknown> {
    return this.client.api.invites[this.code]['target-users'][
      'job-status'
    ].get<unknown>();
  }

  toString() {
    return this.url;
  }

  toJSON() {
    return super.toJSON({
      channel: 'channelId',
      expiresTimestamp: true,
      guild: 'guildId',
      inviter: 'inviterId',
      memberCount: false,
      presenceCount: false,
      url: true,
      uses: false,
    });
  }

  valueOf() {
    return this.code;
  }
}

Invite.INVITES_PATTERN =
  /discord(?:(?:app)?\.com\/invite|\.gg(?:\/invite)?)\/(?<code>[\w-]{2,255})/giu;

export default Invite;
export { Invite };
