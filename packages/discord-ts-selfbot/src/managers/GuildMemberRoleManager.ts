import { Collection } from '@discordjs/collection';
import DataManager from './DataManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _RoleModule from '../structures/Role';
const { Role } = _RoleModule;
import type { Role as RoleType } from '../structures/Role';
import type { Snowflake } from 'discord-api-types/v10';
import type { GuildMember } from '../structures/GuildMember';
import type { Guild } from '../structures/Guild';

type RoleResolvableSource = RoleType | Snowflake;

/**
 * Manages API methods for roles of a GuildMember and stores their cache.
 * @extends {DataManager}
 */
class GuildMemberRoleManager extends DataManager<import('../structures/Role').Role> {
  declare member: GuildMember;
  declare guild: Guild;

  constructor(member: GuildMember) {
    super(member.client, Role);

    /**
     * The GuildMember this manager belongs to
     * @type {GuildMember}
     */
    this.member = member;

    /**
     * The Guild this manager belongs to
     * @type {Guild}
     */
    this.guild = member.guild;
  }

  /**
   * The roles of this member
   * @type {Collection<Snowflake, RoleType>}
   * @readonly
   */
  get cache(): Collection<Snowflake, RoleType> {
    const everyone = this.guild.roles.everyone;
    const cache = this.guild.roles.cache.filter(role => this.member._roles.includes(role.id));
    return everyone ? cache.set(everyone.id, everyone) : cache;
  }

  /**
   * The role of the member used to hoist them in a separate category in the users list
   * @type {?RoleType}
   * @readonly
   */
  get hoist(): RoleType | null {
    const hoistedRoles = this.cache.filter(role => role.hoist);
    if (!hoistedRoles.size) return null;
    return hoistedRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
  }

  /**
   * The role of the member used to set their role icon
   * @type {?RoleType}
   * @readonly
   */
  get icon(): RoleType | null {
    const iconRoles = this.cache.filter(role => role.icon || role.unicodeEmoji);
    if (!iconRoles.size) return null;
    return iconRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
  }

  /**
   * The role of the member used to set their color
   * @type {?RoleType}
   * @readonly
   */
  get color(): RoleType | null {
    const coloredRoles = this.cache.filter(role => role.colors.primaryColor);
    if (!coloredRoles.size) return null;
    return coloredRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
  }

  /**
   * The role of the member with the highest position
   * @type {RoleType}
   * @readonly
   */
  get highest(): RoleType {
    const first = this.cache.first();
    if (!first) throw new Error('GUILD_UNCACHED_ROLE_RESOLVE');
    return this.cache.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev), first);
  }

  /**
   * The premium subscriber role of the guild, if present on the member
   * @type {?RoleType}
   * @readonly
   */
  get premiumSubscriberRole(): RoleType | null {
    return this.cache.find(role => role.tags?.premiumSubscriberRole) ?? null;
  }

  /**
   * The managed role this member created when joining the guild, if any
   * <info>Only ever available on bots</info>
   * @type {?RoleType}
   * @readonly
   */
  get botRole(): RoleType | null {
    if (!this.member.user.bot) return null;
    return this.cache.find(role => role.tags?.botId === this.member.user.id) ?? null;
  }

  /**
   * Adds a role (or multiple roles) to the member.
   *
   * <info>Uses the idempotent PUT route for singular roles, otherwise PATCHes the underlying guild member</info>
   * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, RoleType>} roleOrRoles The role or roles to add
   * @param {string} [reason] Reason for adding the role(s)
   * @returns {Promise<GuildMember>}
   */
  async add(
    roleOrRoles: RoleResolvableSource | readonly RoleResolvableSource[] | Collection<Snowflake, RoleType>,
    reason?: string,
  ): Promise<GuildMember> {
    const roles = roleOrRoles instanceof Collection ? [...roleOrRoles.values()] : roleOrRoles;
    if (Array.isArray(roles)) {
      const resolvedRoles: Snowflake[] = [];
      for (const role of roles) {
        const resolvedRole = this.guild.roles.resolveId(role);
        if (!resolvedRole) throw new TypeError('INVALID_ELEMENT', 'Array or Collection', 'roles', role);
        resolvedRoles.push(resolvedRole);
      }

      const newRoles = [...new Set(resolvedRoles.concat(...this.cache.keys()))];
      return this.set(newRoles, reason);
    } else {
      const roleId = this.guild.roles.resolveId(roles);
      if (roleId === null) {
        throw new TypeError(
          'INVALID_TYPE',
          'roles',
          'RoleType, Snowflake or Array or Collection of Roles or Snowflakes',
        );
      }

      await this.client.api.guilds[this.guild.id].members[this.member.id].roles[roleId].put({ reason });

      const clone = this.member._clone();
      clone._roles = [...this.cache.keys(), roleId];
      return clone;
    }
  }

  /**
   * Removes a role (or multiple roles) from the member.
   *
   * <info>Uses the idempotent DELETE route for singular roles, otherwise PATCHes the underlying guild member</info>
   * @param {RoleResolvable|RoleResolvable[]|Collection<Snowflake, RoleType>} roleOrRoles The role or roles to remove
   * @param {string} [reason] Reason for removing the role(s)
   * @returns {Promise<GuildMember>}
   */
  async remove(
    roleOrRoles: RoleResolvableSource | readonly RoleResolvableSource[] | Collection<Snowflake, RoleType>,
    reason?: string,
  ): Promise<GuildMember> {
    const roles = roleOrRoles instanceof Collection ? [...roleOrRoles.values()] : roleOrRoles;
    if (Array.isArray(roles)) {
      const resolvedRoles: Snowflake[] = [];
      for (const role of roles) {
        const resolvedRole = this.guild.roles.resolveId(role);
        if (!resolvedRole) throw new TypeError('INVALID_ELEMENT', 'Array or Collection', 'roles', role);
        resolvedRoles.push(resolvedRole);
      }

      const newRoles = this.cache.filter(role => !resolvedRoles.includes(role.id));
      return this.set(newRoles, reason);
    } else {
      const roleId = this.guild.roles.resolveId(roles);
      if (roleId === null) {
        throw new TypeError(
          'INVALID_TYPE',
          'roles',
          'RoleType, Snowflake or Array or Collection of Roles or Snowflakes',
        );
      }

      await this.client.api.guilds[this.guild.id].members[this.member.id].roles[roleId].delete({ reason });

      const clone = this.member._clone();
      const newRoles = this.cache.filter(role => role.id !== roleId);
      clone._roles = [...newRoles.keys()];
      return clone;
    }
  }

  /**
   * Sets the roles applied to the member.
   * @param {Collection<Snowflake, RoleType>|RoleResolvable[]} roles The roles or role ids to apply
   * @param {string} [reason] Reason for applying the roles
   * @returns {Promise<GuildMember>}
   * @example
   * // Set the member's roles to a single role
   * guildMember.roles.set(['391156570408615936'])
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Remove all the roles from a member
   * guildMember.roles.set([])
   *   .then(member => console.log(`Member roles is now of ${member.roles.cache.size} size`))
   *   .catch(console.error);
   */
  set(roles: readonly RoleResolvableSource[] | Collection<Snowflake, RoleType>, reason?: string): Promise<GuildMember> {
    return this.member.edit({ roles }, reason);
  }

  clone(): GuildMemberRoleManager {
    const clone = new GuildMemberRoleManager(this.member);
    clone.member._roles = [...this.cache.keys()];
    return clone;
  }
}

export default GuildMemberRoleManager;
export { GuildMemberRoleManager };
