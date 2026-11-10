import Base from './Base';
import _RoleModule from './Role';
const { Role } = _RoleModule;
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { OverwriteTypes } = _ConstantsModule;
import Permissions from '../util/Permissions';
import type { Snowflake } from 'discord-api-types/v10';
import type { OverwriteType, PermissionOverwriteOptions, PermissionResolvable } from '../../typings';
import type GuildChannel from './GuildChannel';

/**
 * Represents a permission overwrite for a role or member in a guild channel.
 * @extends {Base}
 */
class PermissionOverwrites extends Base {
  declare channel: GuildChannel;
  declare id: Snowflake;
  declare type: OverwriteType;
  declare deny: Readonly<Permissions>;
  declare allow: Readonly<Permissions>;

  constructor(client: import('../client/Client').default, data: any, channel: GuildChannel) {
    super(client);

    /**
     * The GuildChannel this overwrite is for
     * @name PermissionOverwrites#channel
     * @type {GuildChannel}
     * @readonly
     */
    Object.defineProperty(this, 'channel', { value: channel });

    if (data) this._patch(data);
  }

  _patch(data: any) {
    /**
     * The overwrite's id, either a {@link User} or a {@link Role} id
     * @type {Snowflake}
     */
    this.id = data.id;

    if ('type' in data) {
      /**
       * The type of this overwrite
       * @type {OverwriteType}
       */
      this.type = typeof data.type === 'number' ? OverwriteTypes[data.type] : data.type;
    }

    if ('deny' in data) {
      /**
       * The permissions that are denied for the user or role.
       * @type {Readonly<Permissions>}
       */
      this.deny = new Permissions(BigInt(data.deny)).freeze();
    }

    if ('allow' in data) {
      /**
       * The permissions that are allowed for the user or role.
       * @type {Readonly<Permissions>}
       */
      this.allow = new Permissions(BigInt(data.allow)).freeze();
    }
  }

  /**
   * Edits this Permission Overwrite.
   * @param {PermissionOverwriteOptions} options The options for the update
   * @param {string} [reason] Reason for creating/editing this overwrite
   * @returns {Promise<PermissionOverwrites>}
   * @example
   * // Update permission overwrites
   * permissionOverwrites.edit({
   *   SEND_MESSAGES: false
   * })
   *   .then(channel => console.log(channel.permissionOverwrites.get(message.author.id)))
   *   .catch(console.error);
   */
  async edit(options: PermissionOverwriteOptions, reason?: string) {
    await this.channel.permissionOverwrites.upsert(this.id, options, { type: OverwriteTypes[this.type], reason }, this);
    return this;
  }

  /**
   * Deletes this Permission Overwrite.
   * @param {string} [reason] Reason for deleting this overwrite
   * @returns {Promise<PermissionOverwrites>}
   */
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

  /**
   * An object mapping permission flags to `true` (enabled), `null` (unset) or `false` (disabled).
   * ```js
   * {
   *  'SEND_MESSAGES': true,
   *  'EMBED_LINKS': null,
   *  'ATTACH_FILES': false,
   * }
   * ```
   * @typedef {Object} PermissionOverwriteOptions
   */

  /**
   * @typedef {Object} ResolvedOverwriteOptions
   * @property {Permissions} allow The allowed permissions
   * @property {Permissions} deny The denied permissions
   */

  /**
   * Resolves bitfield permissions overwrites from an object.
   * @param {PermissionOverwriteOptions} options The options for the update
   * @param {ResolvedOverwriteOptions} initialPermissions The initial permissions
   * @returns {ResolvedOverwriteOptions}
   */
  static resolveOverwriteOptions(
    options: PermissionOverwriteOptions,
    { allow, deny }: { allow?: PermissionResolvable; deny?: PermissionResolvable } = {},
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

  /**
   * The raw data for a permission overwrite
   * @typedef {Object} RawOverwriteData
   * @property {Snowflake} id The id of the {@link Role} or {@link User} this overwrite belongs to
   * @property {string} allow The permissions to allow
   * @property {string} deny The permissions to deny
   * @property {number} type The type of this OverwriteData
   */

  /**
   * Data that can be resolved into {@link RawOverwriteData}. This can be:
   * * PermissionOverwrites
   * * OverwriteData
   * @typedef {PermissionOverwrites|OverwriteData} OverwriteResolvable
   */

  /**
   * Data that can be used for a permission overwrite
   * @typedef {Object} OverwriteData
   * @property {GuildMemberResolvable|RoleResolvable} id Member or role this overwrite is for
   * @property {PermissionResolvable} [allow] The permissions to allow
   * @property {PermissionResolvable} [deny] The permissions to deny
   * @property {OverwriteType} [type] The type of this OverwriteData
   */

  /**
   * Resolves an overwrite into {@link RawOverwriteData}.
   * @param {OverwriteResolvable} overwrite The overwrite-like data to resolve
   * @param {Guild} [guild] The guild to resolve from
   * @returns {RawOverwriteData}
   */
  static resolve(overwrite: unknown, guild: import('./Guild').Guild) {
    if (overwrite instanceof this) return overwrite.toJSON();
    if (typeof overwrite !== 'object' || overwrite === null || !('id' in overwrite)) {
      throw new TypeError('INVALID_TYPE', 'parameter', 'cached User or Role');
    }

    const id = typeof overwrite.id === 'string' ? overwrite.id : undefined;
    const type = 'type' in overwrite ? overwrite.type : undefined;
    const allow = 'allow' in overwrite ? overwrite.allow : undefined;
    const deny = 'deny' in overwrite ? overwrite.deny : undefined;

    if (
      id &&
      type !== undefined &&
      (typeof type === 'number' || (typeof type === 'string' && type in OverwriteTypes))
    ) {
      return {
        id,
        type: typeof type === 'number' ? type : OverwriteTypes[type],
        allow: Permissions.resolve(allow ?? Permissions.defaultBit).toString(),
        deny: Permissions.resolve(deny ?? Permissions.defaultBit).toString(),
      };
    }

    if (!id) throw new TypeError('INVALID_TYPE', 'parameter', 'cached User or Role');
    const userOrRole = guild.roles.resolve(id) ?? guild.client.users.resolve(id);
    if (!userOrRole) {
      throw new TypeError('INVALID_TYPE', 'parameter', 'cached User or Role');
    }
    const resolvedType = userOrRole instanceof Role ? OverwriteTypes.role : OverwriteTypes.member;

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
