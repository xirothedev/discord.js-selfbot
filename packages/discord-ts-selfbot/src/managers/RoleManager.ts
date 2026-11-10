import process from 'node:process';
import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _RoleModule from '../structures/Role';
const { Role } = _RoleModule;
import DataResolver from '../util/DataResolver';
import Permissions from '../util/Permissions';
import _UtilModule from '../util/Util';
const { resolveColor } = _UtilModule;
import Util from '../util/Util';
import type { Snowflake } from 'discord-api-types/v10';
import type { RawRoleData } from '../../typings/rawDataTypes';
import type {
  BaseFetchOptions,
  CreateRoleOptions,
  RoleData,
  RoleResolvable,
  SetRolePositionOptions,
  UserResolvable,
} from '../../typings';
import type { Guild } from '../structures/Guild';
import type { Role as RoleStructure } from '../structures/Role';

type RoleResolvableSource = RoleStructure | RoleResolvable;

interface RolePositionSource {
  role: RoleResolvableSource;
  position: number;
}

let cacheWarningEmitted = false;
let deprecationEmittedForCreate = false;
let deprecationEmittedForEdit = false;

/**
 * Manages API methods for roles and stores their cache.
 * @extends {CachedManager}
 */
class RoleManager extends CachedManager<import('../structures/Role').Role> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<RoleStructure>) {
    super(guild.client, Role, iterable);
    if (!cacheWarningEmitted && this._cache.constructor.name !== 'Collection') {
      cacheWarningEmitted = true;
      process.emitWarning(
        `Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
        'UnsupportedCacheOverwriteWarning',
      );
    }

    /**
     * The guild belonging to this manager
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The role cache of this manager
   * @type {Collection<Snowflake, Role>}
   * @name RoleManager#cache
   */

  _add(data: RawRoleData, cache = true): RoleStructure {
    return super._add(data, cache, { extras: [this.guild] });
  }

  /**
   * Obtains a role from Discord, or the role cache if they're already available.
   * @param {Snowflake} [id] The role's id
   * @param {BaseFetchOptions} [options] Additional options for this fetch
   * @returns {Promise<?Role|Collection<Snowflake, Role>>}
   * @example
   * // Fetch all roles from the guild
   * message.guild.roles.fetch()
   *   .then(roles => console.log(`There are ${roles.size} roles.`))
   *   .catch(console.error);
   * @example
   * // Fetch a single role
   * message.guild.roles.fetch('222078108977594368')
   *   .then(role => console.log(`The role color is: ${role.colors.primaryColor}`))
   *   .catch(console.error);
   */
  async fetch(id: Snowflake, options?: BaseFetchOptions): Promise<RoleStructure | null>;
  async fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<Snowflake, RoleStructure>>;
  async fetch(
    id?: Snowflake,
    { cache = true, force = false }: BaseFetchOptions = {},
  ): Promise<RoleStructure | Collection<Snowflake, RoleStructure> | null> {
    if (id && !force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }

    // We cannot fetch a single role, as of this commit's date, Discord API throws with 405
    const data: RawRoleData[] = await this.client.api.guilds(this.guild.id).roles.get();
    const roles = new Collection<Snowflake, RoleStructure>();
    for (const role of data) roles.set(role.id, this._add(role, cache));
    return id ? (roles.get(id) ?? null) : roles;
  }

  /**
   * Fetches the member counts for each role in the guild.
   * @returns {Promise<Record<Snowflake, number>>}
   */
  async fetchMemberCounts() {
    const data = await this.client.api.guilds(this.guild.id).roles('member-counts').get();

    return data;
  }

  /**
   * Fetches the member ids for a role in the guild.
   * <info>This only returns 100 member ids</info>
   * @param {RoleResolvable} role The role to fetch member ids for
   * @returns {Promise<Snowflake[]>}
   */
  async fetchMemberIds(role: RoleResolvableSource): Promise<Snowflake[]> {
    const id = this.resolveId(role);
    if (!id) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');

    const data: Snowflake[] = await this.client.api.guilds(this.guild.id).roles(id, 'member-ids').get();

    return data;
  }

  /**
   * Data that can be resolved to a Role object. This can be:
   * * A Role
   * * A Snowflake
   * @typedef {Role|Snowflake} RoleResolvable
   */

  /**
   * Resolves a {@link RoleResolvable} to a {@link Role} object.
   * @method resolve
   * @memberof RoleManager
   * @instance
   * @param {RoleResolvable} role The role resolvable to resolve
   * @returns {?Role}
   */

  /**
   * Resolves a {@link RoleResolvable} to a {@link Role} id.
   * @method resolveId
   * @memberof RoleManager
   * @instance
   * @param {RoleResolvable} role The role resolvable to resolve
   * @returns {?Snowflake}
   */

  /**
   * @typedef {Object} RoleColorsResolvable
   * @property {ColorResolvable} primaryColor The primary color of the role
   * @property {ColorResolvable} [secondaryColor] The secondary color of the role.
   * This will make the role a gradient between the other provided colors
   * @property {ColorResolvable} [tertiaryColor] The tertiary color of the role.
   * When sending `tertiaryColor` the API enforces the role color to be a holographic style
   * with values of `primaryColor = 11127295`, `secondaryColor = 16759788`, and `tertiaryColor = 16761760`.
   * These values are available as a constant: `Constants.HolographicStyle`
   */

  /**
   * Options used to create a new role.
   * @typedef {Object} CreateRoleOptions
   * @property {string} [name] The name of the new role
   * @property {ColorResolvable} [color] The data to create the role with
   * <warn>This property is deprecated. Use `colors` instead.</warn>
   * @property {RoleColorsResolvable} [colors] The colors to create the role with
   * @property {boolean} [hoist] Whether or not the new role should be hoisted
   * @property {PermissionResolvable} [permissions] The permissions for the new role
   * @property {number} [position] The position of the new role
   * @property {boolean} [mentionable] Whether or not the new role should be mentionable
   * @property {?(BufferResolvable|Base64Resolvable|EmojiResolvable)} [icon] The icon for the role
   * <warn>The `EmojiResolvable` should belong to the same guild as the role.
   * If not, pass the emoji's URL directly</warn>
   * @property {?string} [unicodeEmoji] The unicode emoji for the role
   * @property {string} [reason] The reason for creating this role
   */

  /**
   * Creates a new role in the guild with given information.
   * <warn>The position will silently reset to 1 if an invalid one is provided, or none.</warn>
   * @param {CreateRoleOptions} [options] Options for creating the new role
   * @returns {Promise<Role>}
   * @example
   * // Create a new role
   * guild.roles.create()
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Create a new role with data and a reason
   * guild.roles.create({
   *   name: 'Super Cool Blue People',
   *   colors: {
   *     primaryColor: 'BLUE',
   *   },
   *   reason: 'we needed a role for Super Cool People',
   * })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Create a role with holographic colors
   * guild.roles.create({
   *   name: 'Holographic Role',
   *   reason: 'Creating a role with holographic effect',
   *   colors: {
   *     primaryColor: Constants.HolographicStyles.PRIMARY,
   *     secondaryColor: Constants.HolographicStyles.SECONDARY,
   *     tertiaryColor: Constants.HolographicStyles.TERTIARY,
   *   },
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async create(options: CreateRoleOptions = {}): Promise<RoleStructure> {
    let { icon } = options;
    let permissions: unknown = options.permissions;
    const { name, color, hoist, position, mentionable, reason, unicodeEmoji } = options;

    if (typeof permissions !== 'undefined') permissions = new Permissions(permissions);
    if (icon) {
      const guildEmojiURL = this.guild.emojis.resolve(icon)?.url;
      icon = guildEmojiURL ? await DataResolver.resolveImage(guildEmojiURL) : await DataResolver.resolveImage(icon);
      if (typeof icon !== 'string') icon = undefined;
    }

    let colors: { primary_color: number; secondary_color: number | null; tertiary_color: number | null } | undefined =
      options.colors && {
        primary_color: resolveColor(options.colors.primaryColor),
        secondary_color: options.colors.secondaryColor ? resolveColor(options.colors.secondaryColor) : null,
        tertiary_color: options.colors.tertiaryColor ? resolveColor(options.colors.tertiaryColor) : null,
      };

    if (color !== undefined) {
      if (!deprecationEmittedForCreate) {
        process.emitWarning(`Passing "color" to RoleManager#create() is deprecated. Use "colors" instead.`);
      }

      deprecationEmittedForCreate = true;

      colors = {
        primary_color: resolveColor(color),
        secondary_color: null,
        tertiary_color: null,
      };
    }

    const data = await this.client.api.guilds(this.guild.id).roles.post({
      data: {
        name,
        colors,
        hoist,
        permissions,
        mentionable,
        icon,
        unicode_emoji: unicodeEmoji,
      },
      reason,
    });
    const { role } = this.client.actions.GuildRoleCreate.handle({
      guild_id: this.guild.id,
      role: data,
    });
    if (!role) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');
    if (position) return this.setPosition(role, position, { reason });
    return role;
  }

  /**
   * Edits a role of the guild.
   * @param {RoleResolvable} role The role to edit
   * @param {RoleData} data The new data for the role
   * @param {string} [reason] Reason for editing this role
   * @returns {Promise<Role>}
   * @example
   * // Edit a role
   * guild.roles.edit('222079219327434752', { name: 'buddies' })
   *   .then(updated => console.log(`Edited role name to ${updated.name}`))
   *   .catch(console.error);
   */
  async edit(role: RoleResolvableSource, data: RoleData, reason?: string): Promise<RoleStructure> {
    const resolved = this.resolve(role);
    if (!resolved) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');

    if (typeof data.position === 'number') await this.setPosition(resolved, data.position, { reason });

    let icon = data.icon;
    if (icon) {
      const guildEmojiURL = this.guild.emojis.resolve(icon)?.url;
      icon = guildEmojiURL ? await DataResolver.resolveImage(guildEmojiURL) : await DataResolver.resolveImage(icon);
      if (typeof icon !== 'string') icon = undefined;
    }

    let colors: { primary_color: number; secondary_color: number | null; tertiary_color: number | null } | undefined =
      data.colors && {
        primary_color: resolveColor(data.colors.primaryColor),
        secondary_color: data.colors.secondaryColor ? resolveColor(data.colors.secondaryColor) : null,
        tertiary_color: data.colors.tertiaryColor ? resolveColor(data.colors.tertiaryColor) : null,
      };

    if (data.color !== undefined) {
      if (!deprecationEmittedForEdit) {
        process.emitWarning(`Passing "color" to RoleManager#edit() is deprecated. Use "colors" instead.`);
      }

      deprecationEmittedForEdit = true;

      colors = {
        primary_color: resolveColor(data.color),
        secondary_color: null,
        tertiary_color: null,
      };
    }

    const _data = {
      name: data.name,
      colors,
      hoist: data.hoist,
      permissions: typeof data.permissions === 'undefined' ? undefined : new Permissions(data.permissions),
      mentionable: data.mentionable,
      icon,
      unicode_emoji: data.unicodeEmoji,
    };

    const d = await this.client.api.guilds(this.guild.id).roles(resolved.id).patch({ data: _data, reason });

    const clone = resolved._clone();
    clone._patch(d);
    return clone;
  }

  /**
   * Deletes a role.
   * @param {RoleResolvable} role The role to delete
   * @param {string} [reason] Reason for deleting the role
   * @returns {Promise<void>}
   * @example
   * // Delete a role
   * guild.roles.delete('222079219327434752', 'The role needed to go')
   *   .then(() => console.log('Deleted the role.'))
   *   .catch(console.error);
   */
  async delete(role: RoleResolvableSource, reason?: string): Promise<void> {
    const id = this.resolveId(role);
    if (!id) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');
    await this.client.api.guilds[this.guild.id].roles[id].delete({ reason });
    this.client.actions.GuildRoleDelete.handle({ guild_id: this.guild.id, role_id: id });
  }

  /**
   * Sets the new position of the role.
   * @param {RoleResolvable} role The role to change the position of
   * @param {number} position The new position for the role
   * @param {SetRolePositionOptions} [options] Options for setting the position
   * @returns {Promise<Role>}
   * @example
   * // Set the position of the role
   * guild.roles.setPosition('222197033908436994', 1)
   *   .then(updated => console.log(`Role position: ${updated.position}`))
   *   .catch(console.error);
   */
  async setPosition(
    role: RoleResolvableSource,
    position: number,
    { relative, reason }: SetRolePositionOptions = {},
  ): Promise<RoleStructure> {
    const resolved = this.resolve(role);
    if (!resolved) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');
    const updatedRoles = await Util.setPosition(
      resolved,
      position,
      Boolean(relative),
      this.guild._sortedRoles(),
      this.client.api.guilds(this.guild.id).roles,
      reason,
    );

    this.client.actions.GuildRolesPositionUpdate.handle({
      guild_id: this.guild.id,
      roles: updatedRoles,
    });
    return resolved;
  }

  /**
   * The data needed for updating a guild role's position
   * @typedef {Object} GuildRolePosition
   * @property {RoleResolvable} role The role's id
   * @property {number} position The position to update
   */

  /**
   * Batch-updates the guild's role positions
   * @param {GuildRolePosition[]} rolePositions Role positions to update
   * @returns {Promise<Guild>}
   * @example
   * guild.roles.setPositions([{ role: roleId, position: updatedRoleIndex }])
   *  .then(guild => console.log(`Role positions updated for ${guild}`))
   *  .catch(console.error);
   */
  async setPositions(rolePositions: readonly RolePositionSource[]) {
    // Make sure rolePositions are prepared for API
    const positions = rolePositions.map(o => ({
      id: this.resolveId(o.role),
      position: o.position,
    }));

    // Call the API to update role positions
    await this.client.api.guilds(this.guild.id).roles.patch({
      data: positions,
    });
    return this.client.actions.GuildRolesPositionUpdate.handle({
      guild_id: this.guild.id,
      roles: positions,
    }).guild;
  }

  /**
   * Compares the positions of two roles.
   * @param {RoleResolvable} role1 First role to compare
   * @param {RoleResolvable} role2 Second role to compare
   * @returns {number} Negative number if the first role's position is lower (second role's is higher),
   * positive number if the first's is higher (second's is lower), 0 if equal
   */
  comparePositions(role1: unknown, role2: unknown): number {
    const resolvedRole1 = this.resolve(role1);
    const resolvedRole2 = this.resolve(role2);
    if (!resolvedRole1 || !resolvedRole2) throw new TypeError('INVALID_TYPE', 'role', 'Role nor a Snowflake');

    const role1Position = resolvedRole1.position;
    const role2Position = resolvedRole2.position;

    if (role1Position === role2Position) {
      return Number(BigInt(resolvedRole2.id) - BigInt(resolvedRole1.id));
    }

    return role1Position - role2Position;
  }

  /**
   * Gets the managed role a user created when joining the guild, if any
   * <info>Only ever available for bots</info>
   * @param {UserResolvable} user The user to access the bot role for
   * @returns {?Role}
   */
  botRoleFor(user: UserResolvable): RoleStructure | null {
    const userId = this.client.users.resolveId(user);
    if (!userId) return null;
    return this.cache.find(role => role.tags?.botId === userId) ?? null;
  }

  /**
   * The `@everyone` role of the guild
   * @type {Role}
   * @readonly
   */
  get everyone() {
    return this.cache.get(this.guild.id);
  }

  /**
   * The premium subscriber role of the guild, if any
   * @type {?Role}
   * @readonly
   */
  get premiumSubscriberRole(): RoleStructure | null {
    return this.cache.find(role => role.tags?.premiumSubscriberRole) ?? null;
  }

  /**
   * The role with the highest position in the cache
   * @type {Role}
   * @readonly
   */
  get highest(): RoleStructure {
    const first = this.cache.first();
    if (!first) throw new Error('GUILD_UNCACHED_ROLE_RESOLVE');
    return this.cache.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev), first);
  }
}

export default RoleManager;
export { RoleManager };
