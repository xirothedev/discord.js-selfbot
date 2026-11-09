import { Collection } from '@discordjs/collection';
import BaseManager from './BaseManager';
import _errorsModule from '../errors';
const { Error, TypeError } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { ApplicationCommandPermissionTypes, APIErrors } = _ConstantsModule;
import type { APIApplicationCommandPermission, Snowflake } from 'discord-api-types/v10';
import type {
  ApplicationCommandPermissionData,
  ApplicationCommandPermissions,
  ApplicationCommandResolvable,
  GuildApplicationCommandPermissionData,
  GuildResolvable,
  RoleResolvable,
  UserResolvable,
} from '../../typings';
import type ApplicationCommand from '../structures/ApplicationCommand';
import type ApplicationCommandManager from './ApplicationCommandManager';
import type { Guild } from '../structures/Guild';

/**
 * Options for managing permissions for one or more Application Commands.
 */
export interface BaseApplicationCommandPermissionsOptions {
  guild?: GuildResolvable;
  command?: ApplicationCommandResolvable;
}

export interface FetchSingleApplicationCommandPermissionsOptions extends BaseApplicationCommandPermissionsOptions {
  command: ApplicationCommandResolvable;
}

export interface FullApplicationCommandPermissionsOptions extends BaseApplicationCommandPermissionsOptions {
  command?: ApplicationCommandResolvable;
}

type SetApplicationCommandPermissionsOptions<BaseOptions extends BaseApplicationCommandPermissionsOptions> =
  BaseOptions & {
    permissions?: ApplicationCommandPermissionData[];
    fullPermissions?: GuildApplicationCommandPermissionData[];
  };

type RemoveApplicationCommandPermissionsOptions<FetchSingleOptions extends BaseApplicationCommandPermissionsOptions> =
  FetchSingleOptions & {
    users?: UserResolvable | UserResolvable[];
    roles?: RoleResolvable | RoleResolvable[];
  };

type HasApplicationCommandPermissionsOptions<FetchSingleOptions extends BaseApplicationCommandPermissionsOptions> =
  FetchSingleOptions & { permissionId: UserResolvable | RoleResolvable };

type AddApplicationCommandPermissionsOptions<FetchSingleOptions extends BaseApplicationCommandPermissionsOptions> =
  FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] };

type GuildPermissionsPayload = { id: Snowflake; permissions: APIApplicationCommandPermission[] };

/**
 * Manages API methods for permissions of Application Commands.
 * @extends {BaseManager}
 */
class ApplicationCommandPermissionsManager<
  BaseOptions extends BaseApplicationCommandPermissionsOptions = BaseApplicationCommandPermissionsOptions,
  FetchSingleOptions extends BaseApplicationCommandPermissionsOptions = FetchSingleApplicationCommandPermissionsOptions,
  FullPermissionsOptions extends BaseApplicationCommandPermissionsOptions = FullApplicationCommandPermissionsOptions,
  GuildType extends Guild | null = Guild | null,
  CommandIdType extends Snowflake | null = Snowflake | null,
> extends BaseManager {
  declare manager: ApplicationCommand | ApplicationCommandManager;
  declare guild: GuildType;
  declare guildId: Snowflake | null;
  declare commandId: CommandIdType;

  constructor(manager: ApplicationCommand | ApplicationCommandManager) {
    super(manager.client);

    /**
     * The manager or command that this manager belongs to
     * @type {ApplicationCommandManager|ApplicationCommand}
     * @private
     */
    this.manager = manager;

    /**
     * The guild that this manager acts on
     * @type {?Guild}
     */
    this.guild = (manager.guild ?? null) as GuildType;

    /**
     * The id of the guild that this manager acts on
     * @type {?Snowflake}
     */
    this.guildId = manager.guildId ?? manager.guild?.id ?? null;

    /**
     * The id of the command this manager acts on
     * @type {?Snowflake}
     */
    this.commandId = (manager.id ?? null) as CommandIdType;
  }

  /**
   * The APIRouter path to the commands
   * @param {Snowflake} guildId The guild's id to use in the path,
   * @param {Snowflake} [commandId] The application command's id
   * @returns {Object}
   * @private
   */
  permissionsPath(guildId: Snowflake, commandId?: Snowflake) {
    return this.client.api.applications(this.client.application!.id).guilds(guildId).commands(commandId).permissions;
  }

  /**
   * Data for setting the permissions of an application command.
   * @typedef {Object} ApplicationCommandPermissionData
   * @property {Snowflake} id The role or user's id
   * @property {ApplicationCommandPermissionType|number} type Whether this permission is for a role or a user
   * @property {boolean} permission Whether the role or user has the permission to use this command
   */

  /**
   * The object returned when fetching permissions for an application command.
   * @typedef {Object} ApplicationCommandPermissions
   * @property {Snowflake} id The role or user's id
   * @property {ApplicationCommandPermissionType} type Whether this permission is for a role or a user
   * @property {boolean} permission Whether the role or user has the permission to use this command
   */

  /**
   * Options for managing permissions for one or more Application Commands
   * <warn>When passing these options to a manager where `guildId` is `null`,
   * `guild` is a required parameter</warn>
   * @typedef {Object} BaseApplicationCommandPermissionsOptions
   * @property {GuildResolvable} [guild] The guild to modify / check permissions for
   * <warn>Ignored when the manager has a non-null `guildId` property</warn>
   * @property {ApplicationCommandResolvable} [command] The command to modify / check permissions for
   * <warn>Ignored when the manager has a non-null `commandId` property</warn>
   */

  /**
   * Fetches the permissions for one or multiple commands.
   * @param {BaseApplicationCommandPermissionsOptions} [options] Options used to fetch permissions
   * @returns {Promise<ApplicationCommandPermissions[]|Collection<Snowflake, ApplicationCommandPermissions[]>>}
   * @example
   * // Fetch permissions for one command
   * guild.commands.permissions.fetch({ command: '123456789012345678' })
   *   .then(perms => console.log(`Fetched permissions for ${perms.length} users`))
   *   .catch(console.error);
   * @example
   * // Fetch permissions for all commands in a guild
   * client.application!.commands.permissions.fetch({ guild: '123456789012345678' })
   *   .then(perms => console.log(`Fetched permissions for ${perms.size} commands`))
   *   .catch(console.error);
   */
  async fetch(options: FetchSingleOptions): Promise<ApplicationCommandPermissions[]>;
  async fetch(options: BaseOptions): Promise<Collection<Snowflake, ApplicationCommandPermissions[]>>;
  async fetch(options: FetchSingleOptions | BaseOptions) {
    const { guild, command } = options;
    const { guildId, commandId } = this._validateOptions(guild, command);
    if (commandId) return this.fetchSingle(guildId, commandId);

    const data = await this.permissionsPath(guildId).get();
    return data.reduce(
      (
        coll: Collection<Snowflake, ApplicationCommandPermissions[]>,
        perm: { id: Snowflake; permissions: ApplicationCommandPermissionData[] },
      ) =>
        coll.set(
          perm.id,
          perm.permissions.map(p => ApplicationCommandPermissionsManager.transformPermissions(p, true)),
        ),
      new Collection<Snowflake, ApplicationCommandPermissions[]>(),
    );
  }

  private async fetchSingle(guildId: Snowflake, commandId: Snowflake): Promise<ApplicationCommandPermissions[]> {
    const data = await this.permissionsPath(guildId, commandId).get();
    return data.permissions.map((perm: ApplicationCommandPermissionData) =>
      ApplicationCommandPermissionsManager.transformPermissions(perm, true),
    );
  }

  private async setSingle(
    guildId: Snowflake,
    commandId: Snowflake,
    permissions: ApplicationCommandPermissionData[],
  ): Promise<ApplicationCommandPermissions[]> {
    const data = await this.permissionsPath(guildId, commandId).put({
      data: {
        permissions: permissions.map(perm => ApplicationCommandPermissionsManager.transformPermissions(perm)),
      },
    });
    return data.permissions.map((perm: ApplicationCommandPermissionData) =>
      ApplicationCommandPermissionsManager.transformPermissions(perm, true),
    );
  }

  /**
   * Data used for overwriting the permissions for all application commands in a guild.
   * @typedef {Object} GuildApplicationCommandPermissionData
   * @property {Snowflake} id The command's id
   * @property {ApplicationCommandPermissionData[]} permissions The permissions for this command
   */

  /**
   * Options used to set permissions for one or more Application Commands in a guild
   * <warn>One of `command` AND `permissions`, OR `fullPermissions` is required.
   * `fullPermissions` is not a valid option when passing to a manager where `commandId` is non-null</warn>
   * @typedef {BaseApplicationCommandPermissionsOptions} SetApplicationCommandPermissionsOptions
   * @property {ApplicationCommandPermissionData[]} [permissions] The new permissions for the command
   * @property {GuildApplicationCommandPermissionData[]} [fullPermissions] The new permissions for all commands
   * in a guild <warn>When this parameter is set, `permissions` and `command` are ignored</warn>
   */

  /**
   * Sets the permissions for one or more commands.
   * @param {SetApplicationCommandPermissionsOptions} options Options used to set permissions
   * @returns {Promise<ApplicationCommandPermissions[]|Collection<Snowflake, ApplicationCommandPermissions[]>>}
   * @example
   * // Set the permissions for one command
   * client.application!.commands.permissions.set({ guild: '892455839386304532', command: '123456789012345678',
   *  permissions: [
   *    {
   *      id: '876543210987654321',
   *      type: 'USER',
   *      permission: false,
   *    },
   * ]})
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Set the permissions for all commands
   * guild.commands.permissions.set({ fullPermissions: [
   *   {
   *     id: '123456789012345678',
   *     permissions: [{
   *       id: '876543210987654321',
   *       type: 'USER',
   *       permission: false,
   *     }],
   *   },
   * ]})
   *   .then(console.log)
   *   .catch(console.error);
   */
  async set(
    options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] },
  ): Promise<ApplicationCommandPermissions[]>;
  async set(
    options: FullPermissionsOptions & { fullPermissions: GuildApplicationCommandPermissionData[] },
  ): Promise<Collection<Snowflake, ApplicationCommandPermissions[]>>;
  async set(
    options:
      | SetApplicationCommandPermissionsOptions<BaseOptions>
      | SetApplicationCommandPermissionsOptions<FetchSingleOptions>
      | SetApplicationCommandPermissionsOptions<FullPermissionsOptions>,
  ) {
    const { guild, command, permissions, fullPermissions } = options;
    const { guildId, commandId } = this._validateOptions(guild, command);

    if (commandId) {
      if (!Array.isArray(permissions)) {
        throw new TypeError('INVALID_TYPE', 'permissions', 'Array of ApplicationCommandPermissionData', true);
      }
      return this.setSingle(guildId, commandId, permissions);
    }

    if (!Array.isArray(fullPermissions)) {
      throw new TypeError('INVALID_TYPE', 'fullPermissions', 'Array of GuildApplicationCommandPermissionData', true);
    }

    const APIPermissions: GuildPermissionsPayload[] = [];
    for (const perm of fullPermissions) {
      if (!Array.isArray(perm.permissions)) throw new TypeError('INVALID_ELEMENT', 'Array', 'fullPermissions', perm);
      APIPermissions.push({
        id: perm.id,
        permissions: perm.permissions.map(p => ApplicationCommandPermissionsManager.transformPermissions(p)),
      });
    }
    const data = await this.permissionsPath(guildId).put({
      data: APIPermissions,
    });
    return data.reduce(
      (coll: Collection<Snowflake, ApplicationCommandPermissions[]>, perm: GuildPermissionsPayload) =>
        coll.set(
          perm.id,
          perm.permissions.map(p => ApplicationCommandPermissionsManager.transformPermissions(p, true)),
        ),
      new Collection<Snowflake, ApplicationCommandPermissions[]>(),
    );
  }

  /**
   * Options used to add permissions to a command
   * <warn>The `command` parameter is not optional when the managers `commandId` is `null`</warn>
   * @typedef {BaseApplicationCommandPermissionsOptions} AddApplicationCommandPermissionsOptions
   * @property {ApplicationCommandPermissionData[]} permissions The permissions to add to the command
   */

  /**
   * Add permissions to a command.
   * @param {AddApplicationCommandPermissionsOptions} options Options used to add permissions
   * @returns {Promise<ApplicationCommandPermissions[]>}
   * @example
   * // Block a role from the command permissions
   * guild.commands.permissions.add({ command: '123456789012345678', permissions: [
   *   {
   *     id: '876543211234567890',
   *     type: 'ROLE',
   *     permission: false
   *   },
   * ]})
   *   .then(console.log)
   *   .catch(console.error);
   */
  async add({
    guild,
    command,
    permissions,
  }: AddApplicationCommandPermissionsOptions<FetchSingleOptions>): Promise<ApplicationCommandPermissions[]> {
    const { guildId, commandId } = this._validateOptions(guild, command);
    if (!commandId) throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandResolvable');
    if (!Array.isArray(permissions)) {
      throw new TypeError('INVALID_TYPE', 'permissions', 'Array of ApplicationCommandPermissionData', true);
    }

    let existing: ApplicationCommandPermissions[] = [];
    try {
      existing = await this.fetchSingle(guildId, commandId);
    } catch (error) {
      if (!ApplicationCommandPermissionsManager.isUnknownPermissionsError(error)) throw error;
    }

    const newPermissions = permissions.slice();
    for (const perm of existing) {
      if (!newPermissions.some(x => x.id === perm.id)) {
        newPermissions.push(perm);
      }
    }

    return this.setSingle(guildId, commandId, newPermissions);
  }

  /**
   * Options used to remove permissions from a command
   * <warn>The `command` parameter is not optional when the managers `commandId` is `null`</warn>
   * @typedef {BaseApplicationCommandPermissionsOptions} RemoveApplicationCommandPermissionsOptions
   * @property {UserResolvable|UserResolvable[]} [users] The user(s) to remove from the command permissions
   * <warn>One of `users` or `roles` is required</warn>
   * @property {RoleResolvable|RoleResolvable[]} [roles] The role(s) to remove from the command permissions
   * <warn>One of `users` or `roles` is required</warn>
   */

  /**
   * Remove permissions from a command.
   * @param {RemoveApplicationCommandPermissionsOptions} options Options used to remove permissions
   * @returns {Promise<ApplicationCommandPermissions[]>}
   * @example
   * // Remove a user permission from this command
   * guild.commands.permissions.remove({ command: '123456789012345678', users: '876543210123456789' })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Remove multiple roles from this command
   * guild.commands.permissions.remove({
   *   command: '123456789012345678', roles: ['876543210123456789', '765432101234567890']
   * })
   *    .then(console.log)
   *    .catch(console.error);
   */
  async remove({
    guild,
    command,
    users,
    roles,
  }: RemoveApplicationCommandPermissionsOptions<FetchSingleOptions>): Promise<ApplicationCommandPermissions[]> {
    const { guildId, commandId } = this._validateOptions(guild, command);
    if (!commandId) throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandResolvable');

    if (!users && !roles) throw new TypeError('INVALID_TYPE', 'users OR roles', 'Array or Resolvable', true);

    const resolvedIds: Snowflake[] = [];
    if (Array.isArray(users)) {
      users.forEach(user => {
        const userId = this.client.users.resolveId(user);
        if (!userId) throw new TypeError('INVALID_ELEMENT', 'Array', 'users', user);
        resolvedIds.push(userId);
      });
    } else if (users) {
      const userId = this.client.users.resolveId(users);
      if (!userId) {
        throw new TypeError('INVALID_TYPE', 'users', 'Array or UserResolvable');
      }
      resolvedIds.push(userId);
    }

    if (Array.isArray(roles)) {
      roles.forEach(role => {
        if (typeof role === 'string') {
          resolvedIds.push(role);
          return;
        }
        if (!this.guild) throw new Error('GUILD_UNCACHED_ROLE_RESOLVE');
        const roleId = this.guild.roles.resolveId(role);
        if (!roleId) throw new TypeError('INVALID_ELEMENT', 'Array', 'users', role);
        resolvedIds.push(roleId);
      });
    } else if (roles) {
      if (typeof roles === 'string') {
        resolvedIds.push(roles);
      } else {
        if (!this.guild) throw new Error('GUILD_UNCACHED_ROLE_RESOLVE');
        const roleId = this.guild.roles.resolveId(roles);
        if (!roleId) {
          throw new TypeError('INVALID_TYPE', 'users', 'Array or RoleResolvable');
        }
        resolvedIds.push(roleId);
      }
    }

    let existing: ApplicationCommandPermissions[] = [];
    try {
      existing = await this.fetchSingle(guildId, commandId);
    } catch (error) {
      if (!ApplicationCommandPermissionsManager.isUnknownPermissionsError(error)) throw error;
    }

    const permissions = existing.filter(perm => !resolvedIds.includes(perm.id));

    return this.setSingle(guildId, commandId, permissions);
  }

  /**
   * Options used to check the existence of permissions on a command
   * <warn>The `command` parameter is not optional when the managers `commandId` is `null`</warn>
   * @typedef {BaseApplicationCommandPermissionsOptions} HasApplicationCommandPermissionsOptions
   * @property {UserResolvable|RoleResolvable} permissionId The user or role to check if a permission exists for
   * on this command.
   */

  /**
   * Check whether a permission exists for a user or role
   * @param {AddApplicationCommandPermissionsOptions} options Options used to check permissions
   * @returns {Promise<boolean>}
   * @example
   * // Check whether a user has permission to use a command
   * guild.commands.permissions.has({ command: '123456789012345678', permissionId: '876543210123456789' })
   *  .then(console.log)
   *  .catch(console.error);
   */
  async has({
    guild,
    command,
    permissionId,
  }: HasApplicationCommandPermissionsOptions<FetchSingleOptions>): Promise<boolean> {
    const { guildId, commandId } = this._validateOptions(guild, command);
    if (!commandId) throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandResolvable');

    if (!permissionId) throw new TypeError('INVALID_TYPE', 'permissionId', 'UserResolvable or RoleResolvable');
    let resolvedId: string | null = typeof permissionId === 'string' ? permissionId : null;
    if (typeof permissionId !== 'string') {
      resolvedId = this.client.users.resolveId(permissionId);
      if (!resolvedId) {
        if (!this.guild) throw new Error('GUILD_UNCACHED_ROLE_RESOLVE');
        resolvedId = this.guild.roles.resolveId(permissionId);
      }
      if (!resolvedId) {
        throw new TypeError('INVALID_TYPE', 'permissionId', 'UserResolvable or RoleResolvable');
      }
    }

    let existing: ApplicationCommandPermissions[] = [];
    try {
      existing = await this.fetchSingle(guildId, commandId);
    } catch (error) {
      if (!ApplicationCommandPermissionsManager.isUnknownPermissionsError(error)) throw error;
    }

    return existing.some(perm => perm.id === resolvedId);
  }

  _validateOptions(
    guild?: GuildResolvable,
    command?: ApplicationCommandResolvable,
  ): { guildId: Snowflake; commandId: Snowflake | null } {
    const guildId = this.guildId ?? this.client.guilds.resolveId(guild);
    if (!guildId) throw new Error('GLOBAL_COMMAND_PERMISSIONS');
    let commandId: Snowflake | null = this.commandId;
    if (command && !commandId) {
      if ('resolveId' in this.manager) {
        commandId = this.manager.resolveId(command);
      }
      commandId = commandId ?? this.client.application?.commands.resolveId(command) ?? null;
      if (!commandId) {
        throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandResolvable', true);
      }
    }
    return { guildId, commandId };
  }

  /**
   * Transforms an {@link ApplicationCommandPermissionData} object into something that can be used with the API.
   * @param {ApplicationCommandPermissionData} permissions The permissions to transform
   * @param {boolean} [received] Whether these permissions have been received from Discord
   * @returns {APIApplicationCommandPermissions}
   * @private
   */
  static transformPermissions(
    permissions: ApplicationCommandPermissionData | APIApplicationCommandPermission,
    received: true,
  ): ApplicationCommandPermissions;
  static transformPermissions(
    permissions: ApplicationCommandPermissionData | APIApplicationCommandPermission,
    received?: false,
  ): APIApplicationCommandPermission;
  static transformPermissions(
    permissions: ApplicationCommandPermissionData | APIApplicationCommandPermission,
    received = false,
  ): ApplicationCommandPermissions | APIApplicationCommandPermission {
    return {
      id: permissions.id,
      permission: permissions.permission,
      type:
        typeof permissions.type === 'number' && !received
          ? permissions.type
          : ApplicationCommandPermissionTypes[permissions.type],
    };
  }

  private static isUnknownPermissionsError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === APIErrors.UNKNOWN_APPLICATION_COMMAND_PERMISSIONS
    );
  }
}

export default ApplicationCommandPermissionsManager;
export { ApplicationCommandPermissionsManager };

/* eslint-disable max-len */
/**
 * @external APIApplicationCommandPermissions
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure}
 */
