import Base from './Base';
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
import type { GatewayInviteCreateDispatchData, GatewayInviteDeleteDispatchData } from 'discord-api-types/v10';
import { Guild } from './Guild';
import type { GuildChannel } from './GuildChannel';

export type RawInviteDataSource =
  | RawInviteData
  | (GatewayInviteCreateDispatchData & { channel: GuildChannel; guild: Guild })
  | (GatewayInviteDeleteDispatchData & { channel: GuildChannel; guild: Guild });
import type { InviteEntity } from '../types/entities/invite';
import type { PatchOf } from '../types/schema';
import { isInviteChannel } from '../types/channels';

// TODO: Convert `inviter` and `channel` in this class to a getter.

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
  static INVITES_PATTERN: RegExp = /./;
  constructor(client: import('../client/Client').default, data: RawInviteDataSource) {
    super(client);
    this._patch(data);
  }

  _patch(data: PatchOf<'Invite'> | RawInviteDataSource) {
    this.guild ??= null;
    if (data.guild) {
      const cached = this.client.guilds.cache.get(data.guild.id);
      if (cached) this.guild = cached;
      else if (data.guild instanceof Guild) this.guild = data.guild;
      else this.guild = new InviteGuild(this.client, data.guild);
    }

    if ('code' in data) {
      this.code = data.code!;
    }

    if ('approximate_presence_count' in data) {
      this.presenceCount = data.approximate_presence_count ?? null;
    } else {
      this.presenceCount ??= null;
    }

    if ('approximate_member_count' in data) {
      this.memberCount = data.approximate_member_count ?? null;
    } else {
      this.memberCount ??= null;
    }

    if ('temporary' in data) {
      this.temporary = data.temporary ?? null;
    } else {
      this.temporary ??= null;
    }

    if ('max_age' in data) {
      this.maxAge = data.max_age ?? null;
    } else {
      this.maxAge ??= null;
    }

    if ('uses' in data) {
      this.uses = data.uses ?? null;
    } else {
      this.uses ??= null;
    }

    if ('max_uses' in data) {
      this.maxUses = data.max_uses ?? null;
    } else {
      this.maxUses ??= null;
    }

    if ('inviter_id' in data) {
      this.inviterId = data.inviter_id ? String(data.inviter_id) : null;
      this.inviter = this.client.users.resolve(data.inviter_id);
    } else {
      this.inviterId ??= null;
    }

    if ('inviter' in data) {
      this.inviter ??= this.client.users._add(data.inviter);
      this.inviterId = data.inviter!.id;
    } else {
      this.inviter ??= null;
    }

    if ('target_user' in data) {
      this.targetUser = this.client.users._add(data.target_user);
    } else {
      this.targetUser ??= null;
    }

    if ('target_application' in data) {
      this.targetApplication = new IntegrationApplication(this.client, data.target_application);
    } else {
      this.targetApplication ??= null;
    }

    if ('target_type' in data) {
      this.targetType = data.target_type ?? null;
    } else {
      this.targetType ??= null;
    }

    if ('type' in data) {
      this.type = data.type ?? null;
    } else {
      this.type ??= null;
    }

    if ('channel_id' in data) {
      this.channelId = data.channel_id;
      const channel = data.channel_id ? this.client.channels.cache.get(data.channel_id) : undefined;
      this.channel = channel && isInviteChannel(channel) ? channel : undefined;
    }

    if ('channel' in data && data.channel !== null) {
      const channel = this.client.channels._add(data.channel, this.guild, { cache: false });
      if (channel && isInviteChannel(channel)) this.channel ??= channel;
      this.channelId ??= data.channel!.id;
    }

    if ('created_at' in data) {
      this.createdTimestamp = new Date(data.created_at!).getTime();
    } else {
      this.createdTimestamp ??= null;
    }

    if ('expires_at' in data) {
      this._expiresTimestamp = data.expires_at ? Date.parse(data.expires_at) : null;
    } else {
      this._expiresTimestamp ??= null;
    }

    if ('stage_instance' in data) {
      this.stageInstance = new InviteStageInstance(this.client, data.stage_instance!, this.channel!.id, this.guild!.id);
    } else {
      this.stageInstance ??= null;
    }

    if ('guild_scheduled_event' in data) {
      this.guildScheduledEvent = new GuildScheduledEvent(this.client, data.guild_scheduled_event!);
    } else {
      this.guildScheduledEvent ??= null;
    }

    if ('flags' in data) {
      this.flags = new InviteFlags(data.flags).freeze();
    } else {
      this.flags ??= new InviteFlags().freeze();
    }
  }

  get createdAt() {
    return this.createdTimestamp ? new Date(this.createdTimestamp) : null;
  }

  get deletable() {
    const guild = this.guild;
    if (!guild || !('members' in guild) || !this.client.guilds.cache.has(guild.id)) return false;
    if (!guild.members.me) throw new Error('GUILD_UNCACHED_ME');
    if (!this.channel || !('permissionsFor' in this.channel)) return false;
    return (
      (this.channel.permissionsFor(this.client.user!.id)?.has(BigInt(Permissions.FLAGS.MANAGE_CHANNELS), false) ??
        false) ||
      guild.members.me.permissions.has(BigInt(Permissions.FLAGS.MANAGE_GUILD))
    );
  }

  get expiresTimestamp() {
    return (
      this._expiresTimestamp ??
      (this.createdTimestamp && this.maxAge ? this.createdTimestamp + this.maxAge * 1_000 : null)
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

  toString() {
    return this.url;
  }

  toJSON() {
    return super.toJSON({
      url: true,
      expiresTimestamp: true,
      presenceCount: false,
      memberCount: false,
      uses: false,
      channel: 'channelId',
      inviter: 'inviterId',
      guild: 'guildId',
    });
  }

  valueOf() {
    return this.code;
  }
}

Invite.INVITES_PATTERN = /discord(?:(?:app)?\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/gi;

export default Invite;
export { Invite };
