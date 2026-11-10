import Base from './Base';
import _RoleModule from './Role';
const { Role } = _RoleModule;
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';
const { OverwriteTypes } = _ConstantsModule;
import Permissions from '../util/Permissions';
import type { Snowflake } from 'discord-api-types/v10';
import type { OverwriteType, PermissionOverwriteOptions } from '../../typings';
import type GuildChannel from './GuildChannel';

interface PermissionOverwriteData {
  id: string;
  type?: string | number;
  allow?: unknown;
  deny?: unknown;
}

class PermissionOverwrites extends Base {
  declare channel: GuildChannel;
  declare id: Snowflake;
  declare type: OverwriteType;
  declare deny: Readonly<Permissions>;
  declare allow: Readonly<Permissions>;

  constructor(
    client: import('../client/Client').default,
    data: PermissionOverwriteData | PermissionOverwrites | undefined,
    channel: GuildChannel,
  ) {
    super(client);

    Object.defineProperty(this, 'channel', { value: channel });

    if (data) this._patch(data);
  }

  _patch(data: PermissionOverwriteData | PermissionOverwrites) {
    this.id = data.id;

    if ('type' in data && data.type !== undefined) {
      const type = typeof data.type === 'number' ? OverwriteTypes[data.type] : data.type;
      if (type === 'role' || type === 'member') this.type = type;
    }

    if ('deny' in data) {
      this.deny = new Permissions(Permissions.resolve(data.deny ?? 0n)).freeze();
    }

    if ('allow' in data) {
      this.allow = new Permissions(Permissions.resolve(data.allow ?? 0n)).freeze();
    }
  }

  async edit(options: PermissionOverwriteOptions, reason?: string) {
    await this.channel.permissionOverwrites.upsert(this.id, options, { type: OverwriteTypes[this.type], reason }, this);
    return this;
  }

  async delete(reason?: string) {
    await this.channel.permissionOverwrites.delete(this.id, reason);
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: OverwriteTypes[this.type],
      allow: this.allow,
      deny: this.deny,
    };
  }

  static resolveOverwriteOptions(
    options: PermissionOverwriteOptions,
    { allow, deny }: { allow?: unknown; deny?: unknown } = {},
  ) {
    const allowPermissions = new Permissions(allow);
    const denyPermissions = new Permissions(deny);

    for (const [perm, value] of Object.entries(options)) {
      if (value === true) {
        allowPermissions.add(perm);
        denyPermissions.remove(perm);
      } else if (value === false) {
        allowPermissions.remove(perm);
        denyPermissions.add(perm);
      } else if (value === null) {
        allowPermissions.remove(perm);
        denyPermissions.remove(perm);
      }
    }

    return { allow: allowPermissions, deny: denyPermissions };
  }

  static resolve(overwrite: unknown, guild: import('./Guild').Guild) {
    if (overwrite instanceof this) return overwrite.toJSON();
    if (typeof overwrite !== 'object' || overwrite === null || !('id' in overwrite)) {
      throw new TypeError('INVALID_TYPE', 'parameter', 'cached User or Role');
    }

    const id = typeof overwrite.id === 'string' ? overwrite.id : undefined;
    const type = 'type' in overwrite ? overwrite.type : undefined;
    const allow = 'allow' in overwrite ? overwrite.allow : undefined;
    const deny = 'deny' in overwrite ? overwrite.deny : undefined;
    let resolvedType =
      typeof type === 'string' || typeof type === 'number' ? resolveEnumValue(OverwriteTypes, type) : undefined;

    if (id && resolvedType !== undefined) {
      return {
        id,
        type: resolvedType,
        allow: Permissions.resolve(allow ?? Permissions.defaultBit).toString(),
        deny: Permissions.resolve(deny ?? Permissions.defaultBit).toString(),
      };
    }

    if (!id) throw new TypeError('INVALID_TYPE', 'parameter', 'cached User or Role');
    const userOrRole = guild.roles.resolve(id) ?? guild.client.users.resolve(id);
    if (!userOrRole) {
      throw new TypeError('INVALID_TYPE', 'parameter', 'cached User or Role');
    }
    resolvedType = userOrRole instanceof Role ? OverwriteTypes.role : OverwriteTypes.member;

    return {
      id: userOrRole.id,
      type: resolvedType,
      allow: Permissions.resolve(allow ?? Permissions.defaultBit).toString(),
      deny: Permissions.resolve(deny ?? Permissions.defaultBit).toString(),
    };
  }
}

export default PermissionOverwrites;
export { PermissionOverwrites };
