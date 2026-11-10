import process from 'node:process';
import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import PermissionOverwrites from '../structures/PermissionOverwrites';
import _RoleModule from '../structures/Role';
const { Role } = _RoleModule;
import _ConstantsModule from '../util/Constants';
const { OverwriteTypes } = _ConstantsModule;
import type { Snowflake } from 'discord-api-types/v10';
import type { RawPermissionOverwriteData } from '../../typings/rawDataTypes';
import type {
  GuildChannelOverwriteOptions,
  OverwriteResolvable,
  PermissionOverwriteOptions,
  RoleResolvable,
  UserResolvable,
} from '../../typings';
import type { GuildChannel } from '../structures/GuildChannel';

type UserOrRoleResolvableSource = RoleResolvable | UserResolvable;
type OverwriteResolvableSource = PermissionOverwrites | OverwriteResolvable;

let cacheWarningEmitted = false;

class PermissionOverwriteManager extends CachedManager<PermissionOverwrites> {
  declare channel: GuildChannel;
  constructor(channel: GuildChannel, iterable?: Iterable<PermissionOverwrites>) {
    super(channel.client, PermissionOverwrites);
    if (!cacheWarningEmitted && this._cache.constructor.name !== 'Collection') {
      cacheWarningEmitted = true;
      process.emitWarning(
        `Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
        'UnsupportedCacheOverwriteWarning',
      );
    }

    this.channel = channel;

    if (iterable) {
      for (const item of iterable) {
        this._add(item);
      }
    }
  }

  _add(data: RawPermissionOverwriteData | PermissionOverwrites, cache = true): PermissionOverwrites {
    return super._add(data, cache, { extras: [this.channel] });
  }

  async set(
    overwrites: readonly OverwriteResolvableSource[] | Collection<Snowflake, OverwriteResolvableSource>,
    reason?: string,
  ) {
    if (!Array.isArray(overwrites) && !(overwrites instanceof Collection)) {
      throw new TypeError('INVALID_TYPE', 'overwrites', 'Array or Collection of Permission Overwrites', true);
    }
    return this.channel.edit({ permissionOverwrites: overwrites }, reason);
  }

  async upsert(
    userOrRole: UserOrRoleResolvableSource,
    options: PermissionOverwriteOptions,
    overwriteOptions: GuildChannelOverwriteOptions = {},
    existing?: PermissionOverwrites,
  ): Promise<GuildChannel> {
    const userOrRoleId = this.channel.guild.roles.resolveId(userOrRole) ?? this.client.users.resolveId(userOrRole);
    let { type, reason } = overwriteOptions;
    if (typeof type !== 'number') {
      const resolved = this.channel.guild.roles.resolve(userOrRole) ?? this.client.users.resolve(userOrRole);
      if (!resolved) throw new TypeError('INVALID_TYPE', 'parameter', 'User nor a Role');
      type = resolved instanceof Role ? OverwriteTypes.role : OverwriteTypes.member;
    }

    const { allow, deny } = PermissionOverwrites.resolveOverwriteOptions(options, existing);

    await this.client.api
      .channels(this.channel.id)
      .permissions(userOrRoleId)
      .put({
        data: { id: userOrRoleId, type, allow, deny },
        reason,
      });
    return this.channel;
  }

  create(
    userOrRole: UserOrRoleResolvableSource,
    options: PermissionOverwriteOptions,
    overwriteOptions?: GuildChannelOverwriteOptions,
  ) {
    return this.upsert(userOrRole, options, overwriteOptions);
  }

  edit(
    userOrRole: UserOrRoleResolvableSource,
    options: PermissionOverwriteOptions,
    overwriteOptions?: GuildChannelOverwriteOptions,
  ) {
    const id = this.channel.guild.roles.resolveId(userOrRole) ?? this.client.users.resolveId(userOrRole);
    const existing = id ? this.cache.get(id) : undefined;
    return this.upsert(userOrRole, options, overwriteOptions, existing);
  }

  async delete(userOrRole: UserOrRoleResolvableSource, reason?: string): Promise<GuildChannel> {
    const userOrRoleId = this.channel.guild.roles.resolveId(userOrRole) ?? this.client.users.resolveId(userOrRole);
    if (!userOrRoleId) throw new TypeError('INVALID_TYPE', 'parameter', 'User nor a Role');

    await this.client.api.channels(this.channel.id).permissions(userOrRoleId).delete({ reason });
    return this.channel;
  }
}

export default PermissionOverwriteManager;
export { PermissionOverwriteManager };
