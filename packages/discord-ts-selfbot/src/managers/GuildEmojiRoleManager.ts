import { Collection } from '@discordjs/collection';
import DataManager from './DataManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _RoleModule from '../structures/Role';
const { Role } = _RoleModule;
import type { Snowflake } from 'discord-api-types/v10';
import type { RoleResolvable } from '../../typings';
import type { Guild } from '../structures/Guild';
import type { GuildEmoji } from '../structures/GuildEmoji';

type RoleResolvableSource = InstanceType<typeof Role> | RoleResolvable;
type RoleOrRolesSource =
  RoleResolvableSource | readonly RoleResolvableSource[] | Collection<Snowflake, InstanceType<typeof Role>>;

/**
 * Manages API methods for roles belonging to emojis and stores their cache.
 * @extends {DataManager}
 */
class GuildEmojiRoleManager extends DataManager<import('../structures/Role').Role> {
  declare emoji: GuildEmoji;
  declare guild: Guild;

  constructor(emoji: GuildEmoji) {
    super(emoji.client, Role);

    /**
     * The emoji belonging to this manager
     * @type {GuildEmoji}
     */
    this.emoji = emoji;
    /**
     * The guild belonging to this manager
     * @type {Guild}
     */
    this.guild = emoji.guild;
  }

  /**
   * The cache of roles belonging to this emoji
   * @type {Collection<Snowflake, Role>}
   * @readonly
   */
  get cache(): Collection<Snowflake, InstanceType<typeof Role>> {
    return this.guild.roles.cache.filter(role => this.emoji._roles.includes(role.id));
  }

  /**
   * Adds a role (or multiple roles) to the list of roles that can use this emoji.
   * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, Role>} roleOrRoles The role or roles to add
   * @returns {Promise<GuildEmoji>}
   */
  async add(roleOrRoles: RoleOrRolesSource): Promise<GuildEmoji> {
    const roles =
      roleOrRoles instanceof Collection
        ? [...roleOrRoles.values()]
        : Array.isArray(roleOrRoles)
          ? roleOrRoles
          : [roleOrRoles];

    const resolvedRoles: Snowflake[] = [];
    for (const role of roles) {
      const resolvedRole = this.guild.roles.resolveId(role);
      if (!resolvedRole) {
        throw new TypeError('INVALID_ELEMENT', 'Array or Collection', 'roles', role);
      }
      resolvedRoles.push(resolvedRole);
    }

    const newRoles = [...new Set([...resolvedRoles, ...this.cache.keys()])];
    return this.set(newRoles);
  }

  /**
   * Removes a role (or multiple roles) from the list of roles that can use this emoji.
   * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, Role>} roleOrRoles The role or roles to remove
   * @returns {Promise<GuildEmoji>}
   */
  async remove(roleOrRoles: RoleOrRolesSource): Promise<GuildEmoji> {
    const roles =
      roleOrRoles instanceof Collection
        ? [...roleOrRoles.values()]
        : Array.isArray(roleOrRoles)
          ? roleOrRoles
          : [roleOrRoles];

    const resolvedRoleIds: Snowflake[] = [];
    for (const role of roles) {
      const roleId = this.guild.roles.resolveId(role);
      if (!roleId) {
        throw new TypeError('INVALID_ELEMENT', 'Array or Collection', 'roles', role);
      }
      resolvedRoleIds.push(roleId);
    }

    const newRoles = [...this.cache.keys()].filter(id => !resolvedRoleIds.includes(id));
    return this.set(newRoles);
  }

  /**
   * Sets the role(s) that can use this emoji.
   * @param {Collection<Snowflake, Role>|RoleResolvable[]} roles The roles or role ids to apply
   * @returns {Promise<GuildEmoji>}
   * @example
   * // Set the emoji's roles to a single role
   * guildEmoji.roles.set(['391156570408615936'])
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Remove all roles from an emoji
   * guildEmoji.roles.set([])
   *    .then(console.log)
   *    .catch(console.error);
   */
  set(roles: readonly RoleResolvableSource[] | Collection<Snowflake, InstanceType<typeof Role>>) {
    return this.emoji.edit({ roles });
  }

  clone(): GuildEmojiRoleManager {
    const clone = new GuildEmojiRoleManager(this.emoji);
    clone._patch([...this.cache.keys()]);
    return clone;
  }

  /**
   * Patches the roles for this manager's cache
   * @param {Snowflake[]} roles The new roles
   * @private
   */
  _patch(roles: Snowflake[]) {
    this.emoji._roles = roles;
  }

  valueOf() {
    return this.cache;
  }
}

export default GuildEmojiRoleManager;
export { GuildEmojiRoleManager };
