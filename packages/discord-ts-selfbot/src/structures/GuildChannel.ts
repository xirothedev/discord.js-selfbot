import { Collection } from '@discordjs/collection';
import { isCategoryChannel } from '../types/channels';
import _ChannelModule from './Channel';
const { Channel } = _ChannelModule;
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import PermissionOverwriteManager from '../managers/PermissionOverwriteManager';
import _ConstantsModule from '../util/Constants';
const { VoiceBasedChannelTypes } = _ConstantsModule;
import Permissions from '../util/Permissions';
import Util from '../util/Util';
import type { Snowflake } from 'discord-api-types/v10';
import type {
  CategoryChannelResolvable,
  ChannelData,
  GuildChannelCloneOptions,
  SetChannelPositionOptions,
  SetParentOptions,
} from '../../typings';
import type { RawGuildChannelData } from '../../typings/rawDataTypes';
import type { GuildChannelEntity } from '../types/entities/guild-channel';
import type { PatchOf } from '../types/schema';
import type { Guild } from './Guild';
import type { GuildMember } from './GuildMember';
import type { Role } from './Role';
import type { User } from './User';
import type { CategoryChannel } from './CategoryChannel';
import type PermissionOverwrites from './PermissionOverwrites';

class GuildChannel extends Channel implements GuildChannelEntity {
  declare guild: GuildChannelEntity['guild'];
  declare guildId: GuildChannelEntity['guildId'];
  declare name: GuildChannelEntity['name'];
  declare parentId: GuildChannelEntity['parentId'];
  declare permissionOverwrites: GuildChannelEntity['permissionOverwrites'];
  declare rawPosition: GuildChannelEntity['rawPosition'];
  declare topic?: string | null;
  declare nsfw?: boolean;
  declare bitrate?: number;
  declare userLimit?: number;
  declare rateLimitPerUser?: number | null;
  declare defaultAutoArchiveDuration?: import('../../typings').ThreadAutoArchiveDuration | null;
  declare messages?: import('../managers/MessageManager').default;

  constructor(
    guild: Guild,
    data?: RawGuildChannelData,
    client?: import('../client/Client').default,
    immediatePatch = true,
  ) {
    super(guild.client ?? client, data, false);

    this.guild = guild;

    this.guildId = guild.id;

    this.parentId = this.parentId ?? null;
    this.permissionOverwrites = new PermissionOverwriteManager(this);

    if (data && immediatePatch) this._patch(data);
  }

  _patch(data: PatchOf<'GuildChannel'>) {
    super._patch(data);

    if ('name' in data && typeof data.name === 'string') {
      this.name = data.name;
    }

    if ('position' in data && data.position !== undefined) {
      this.rawPosition = data.position;
    }

    if ('guild_id' in data && data.guild_id !== undefined) {
      this.guildId = data.guild_id;
    }

    if ('parent_id' in data && data.parent_id !== undefined) {
      this.parentId = data.parent_id;
    }

    if ('permission_overwrites' in data) {
      this.permissionOverwrites.cache.clear();
      for (const overwrite of data.permission_overwrites ?? []) {
        this.permissionOverwrites._add(overwrite);
      }
    }
  }

  _clone() {
    const clone = super._clone();
    clone.permissionOverwrites = new PermissionOverwriteManager(clone, this.permissionOverwrites.cache.values());
    return clone;
  }

  get parent(): CategoryChannel | null {
    const parent = this.parentId ? this.guild.channels.resolve(this.parentId) : null;
    return parent && isCategoryChannel(parent) ? parent : null;
  }

  get permissionsLocked(): boolean | null {
    const parent = this.parent;
    if (!parent) return null;

    // Get all overwrites
    const overwriteIds = new Set([
      ...this.permissionOverwrites.cache.keys(),
      ...parent.permissionOverwrites.cache.keys(),
    ]);

    // Compare all overwrites
    return [...overwriteIds].every(key => {
      const channelVal = this.permissionOverwrites.cache.get(key);
      const parentVal = parent.permissionOverwrites.cache.get(key);

      // Handle empty overwrite
      if (!channelVal) {
        if (!parentVal) return true;
        return (
          parentVal.deny.bitfield === Permissions.defaultBit && parentVal.allow.bitfield === Permissions.defaultBit
        );
      }
      if (!parentVal) {
        return (
          channelVal.deny.bitfield === Permissions.defaultBit && channelVal.allow.bitfield === Permissions.defaultBit
        );
      }

      // Compare overwrites
      return (
        channelVal.deny.bitfield === parentVal.deny.bitfield && channelVal.allow.bitfield === parentVal.allow.bitfield
      );
    });
  }

  get position(): number {
    const selfIsCategory = this.type === 'GUILD_CATEGORY';
    const types = Util.getSortableGroupTypes(this.type);

    let count = 0;
    for (const channel of this.guild.channels.cache.values()) {
      if (!types.includes(channel.type)) continue;
      if (!selfIsCategory && channel.parentId !== this.parentId) continue;
      if (this.rawPosition === channel.rawPosition) {
        if (BigInt(channel.id) < BigInt(this.id)) count++;
      } else if (this.rawPosition > channel.rawPosition) {
        count++;
      }
    }

    return count;
  }

  permissionsFor(memberOrRole: GuildMember | Role | User | Snowflake, checkAdmin = true): Readonly<Permissions> | null {
    const member = this.guild.members.resolve(memberOrRole);
    if (member) return this.memberPermissions(member, checkAdmin);
    const role = this.guild.roles.resolve(memberOrRole);
    return role && this.rolePermissions(role, checkAdmin);
  }

  overwritesFor(
    member: GuildMember,
    verified = false,
    roles: Collection<Snowflake, Role> | null = null,
  ): { everyone?: PermissionOverwrites; roles: PermissionOverwrites[]; member?: PermissionOverwrites } {
    const resolved = verified ? member : this.guild.members.resolve(member);
    if (!resolved) return { roles: [] };

    const memberRoles = roles ?? resolved.roles.cache;
    const roleOverwrites: PermissionOverwrites[] = [];
    let memberOverwrites: PermissionOverwrites | undefined;
    let everyoneOverwrites: PermissionOverwrites | undefined;

    for (const overwrite of this.permissionOverwrites.cache.values()) {
      if (overwrite.id === this.guild.id) {
        everyoneOverwrites = overwrite;
      } else if (memberRoles.has(overwrite.id)) {
        roleOverwrites.push(overwrite);
      } else if (overwrite.id === resolved.id) {
        memberOverwrites = overwrite;
      }
    }

    return {
      everyone: everyoneOverwrites,
      roles: roleOverwrites,
      member: memberOverwrites,
    };
  }

  memberPermissions(member: GuildMember, checkAdmin: boolean): Readonly<Permissions> {
    if (checkAdmin && member.id === this.guild.ownerId) return new Permissions(Permissions.ALL).freeze();

    const roles = member.roles.cache;
    const permissions = new Permissions(roles.map((role: Role) => role.permissions));

    if (checkAdmin && permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return new Permissions(Permissions.ALL).freeze();
    }

    const overwrites = this.overwritesFor(member, true, roles);

    return permissions
      .remove(overwrites.everyone?.deny ?? Permissions.defaultBit)
      .add(overwrites.everyone?.allow ?? Permissions.defaultBit)
      .remove(overwrites.roles.length > 0 ? overwrites.roles.map(role => role.deny) : Permissions.defaultBit)
      .add(overwrites.roles.length > 0 ? overwrites.roles.map(role => role.allow) : Permissions.defaultBit)
      .remove(overwrites.member?.deny ?? Permissions.defaultBit)
      .add(overwrites.member?.allow ?? Permissions.defaultBit)
      .freeze();
  }

  rolePermissions(role: Role, checkAdmin: boolean): Readonly<Permissions> {
    if (checkAdmin && role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return new Permissions(Permissions.ALL).freeze();
    }

    const basePermissions = new Permissions([
      role.permissions,
      role.guild.roles.everyone?.permissions ?? Permissions.defaultBit,
    ]);
    const everyoneOverwrites = this.permissionOverwrites.cache.get(this.guild.id);
    const roleOverwrites = this.permissionOverwrites.cache.get(role.id);

    return basePermissions
      .remove(everyoneOverwrites?.deny ?? Permissions.defaultBit)
      .add(everyoneOverwrites?.allow ?? Permissions.defaultBit)
      .remove(roleOverwrites?.deny ?? Permissions.defaultBit)
      .add(roleOverwrites?.allow ?? Permissions.defaultBit)
      .freeze();
  }

  async lockPermissions(): Promise<this> {
    if (!this.parent) throw new Error('GUILD_CHANNEL_ORPHAN');
    const permissionOverwrites: import('../../typings').OverwriteData[] = this.parent.permissionOverwrites.cache.map(
      (overwrite: PermissionOverwrites) => ({
        id: overwrite.id,
        type: overwrite.type,
        allow: BigInt(overwrite.allow.bitfield),
        deny: BigInt(overwrite.deny.bitfield),
      }),
    );
    return this.edit({ permissionOverwrites });
  }

  get members(): Collection<Snowflake, GuildMember> {
    return this.guild.members.cache.filter(
      (member: GuildMember) => this.permissionsFor(member)?.has(Permissions.FLAGS.VIEW_CHANNEL, false) ?? false,
    );
  }

  edit(data: ChannelData, reason?: string): Promise<this>;
  edit(data: import('../managers/GuildChannelManager').ChannelDataSource, reason?: string): Promise<this>;
  edit(
    data: ChannelData | import('../managers/GuildChannelManager').ChannelDataSource,
    reason?: string,
  ): Promise<this> {
    return this.guild.channels.edit<this>(this, data, reason);
  }

  setName(name: string, reason?: string): Promise<this> {
    return this.edit({ name }, reason);
  }

  setParent(
    channel: CategoryChannelResolvable | null,
    { lockPermissions = true, reason }: SetParentOptions = {},
  ): Promise<this> {
    return this.edit(
      {
        parent: channel ?? null,
        lockPermissions,
      },
      reason,
    );
  }

  async setPosition(position: number, options: SetChannelPositionOptions = {}): Promise<this> {
    await this.guild.channels.setPosition(this, position, options);
    return this;
  }

  async clone(options: GuildChannelCloneOptions = {}): Promise<this> {
    return this.guild.channels.create<this>(options.name ?? this.name, {
      permissionOverwrites: this.permissionOverwrites.cache,
      topic: this.topic,
      type: this.type,
      nsfw: this.nsfw,
      parent: this.parent,
      bitrate: this.bitrate,
      userLimit: this.userLimit,
      rateLimitPerUser: this.rateLimitPerUser,
      position: this.rawPosition,
      reason: null,
      ...options,
    });
  }

  equals(channel: GuildChannel): boolean {
    let equal =
      channel &&
      this.id === channel.id &&
      this.type === channel.type &&
      this.topic === channel.topic &&
      this.position === channel.position &&
      this.name === channel.name;

    if (equal) {
      if (this.permissionOverwrites && channel.permissionOverwrites) {
        equal = this.permissionOverwrites.cache.equals(channel.permissionOverwrites.cache);
      } else {
        equal = !this.permissionOverwrites && !channel.permissionOverwrites;
      }
    }

    return equal;
  }

  get deletable(): boolean {
    return this.manageable && this.guild.rulesChannelId !== this.id && this.guild.publicUpdatesChannelId !== this.id;
  }

  get manageable(): boolean {
    if (this.client.user!.id === this.guild.ownerId) return true;
    const permissions = this.permissionsFor(this.client.user!);
    if (!permissions) return false;

    // This flag allows managing even if timed out
    if (permissions.has(Permissions.FLAGS.ADMINISTRATOR, false)) return true;
    const me = this.guild.members.me;
    if (me && me.communicationDisabledUntilTimestamp !== null && me.communicationDisabledUntilTimestamp > Date.now()) {
      return false;
    }

    const bitfield = VoiceBasedChannelTypes.includes(this.type)
      ? Number(Permissions.FLAGS.MANAGE_CHANNELS) | Number(Permissions.FLAGS.CONNECT)
      : Number(Permissions.FLAGS.VIEW_CHANNEL) | Number(Permissions.FLAGS.MANAGE_CHANNELS);
    return permissions.has(bitfield, false);
  }

  get viewable(): boolean {
    if (this.client.user!.id === this.guild.ownerId) return true;
    const permissions = this.permissionsFor(this.client.user!);
    if (!permissions) return false;
    return permissions.has(Permissions.FLAGS.VIEW_CHANNEL, false);
  }

  async delete(reason?: string): Promise<this> {
    await this.guild.channels.delete(this.id, reason);
    return this;
  }
}

export default GuildChannel;
export { GuildChannel };
