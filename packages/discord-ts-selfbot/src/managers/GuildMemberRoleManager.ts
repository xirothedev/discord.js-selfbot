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

function findHighestRole(
  roles: Collection<Snowflake, RoleType>
): RoleType | null {
  let highest: RoleType | null = null;
  for (const role of roles.values()) {
    if (!highest || role.comparePositionTo(highest) > 0) {
      highest = role;
    }
  }
  return highest;
}

class GuildMemberRoleManager extends DataManager<RoleType> {
  declare member: GuildMember;
  declare guild: Guild;

  constructor(member: GuildMember) {
    super(member.client, Role);

    this.member = member;

    this.guild = member.guild;
  }

  get cache(): Collection<Snowflake, RoleType> {
    const { everyone } = this.guild.roles;
    const cache = this.guild.roles.cache.filter((role) =>
      this.member._roles.includes(role.id)
    );
    return everyone ? cache.set(everyone.id, everyone) : cache;
  }

  get hoist(): RoleType | null {
    const hoistedRoles = this.cache.filter((role) => role.hoist);
    return findHighestRole(hoistedRoles);
  }

  get icon(): RoleType | null {
    const iconRoles = this.cache.filter(
      (role) => role.icon || role.unicodeEmoji
    );
    return findHighestRole(iconRoles);
  }

  get color(): RoleType | null {
    const coloredRoles = this.cache.filter((role) => role.colors.primaryColor);
    return findHighestRole(coloredRoles);
  }

  get highest(): RoleType {
    const highest = findHighestRole(this.cache);
    if (!highest) {
      throw new Error('GUILD_UNCACHED_ROLE_RESOLVE');
    }
    return highest;
  }

  get premiumSubscriberRole(): RoleType | null {
    return this.cache.find((role) => role.tags?.premiumSubscriberRole) ?? null;
  }

  get botRole(): RoleType | null {
    if (!this.member.user.bot) {
      return null;
    }
    return (
      this.cache.find((role) => role.tags?.botId === this.member.user.id) ??
      null
    );
  }

  async add(
    roleOrRoles:
      | RoleResolvableSource
      | readonly RoleResolvableSource[]
      | Collection<Snowflake, RoleType>,
    reason?: string
  ): Promise<GuildMember> {
    const roles =
      roleOrRoles instanceof Collection
        ? [...roleOrRoles.values()]
        : roleOrRoles;
    if (Array.isArray(roles)) {
      const resolvedRoles: Snowflake[] = [];
      for (const role of roles) {
        const resolvedRole = this.guild.roles.resolveId(role);
        if (!resolvedRole) {
          throw new TypeError(
            'INVALID_ELEMENT',
            'Array or Collection',
            'roles',
            role
          );
        }
        resolvedRoles.push(resolvedRole);
      }

      const newRoles = [...new Set([...resolvedRoles, ...this.cache.keys()])];
      return this.set(newRoles, reason);
    }
    const roleId = this.guild.roles.resolveId(roles);
    if (roleId === null) {
      throw new TypeError(
        'INVALID_TYPE',
        'roles',
        'RoleType, Snowflake or Array or Collection of Roles or Snowflakes'
      );
    }

    await this.client.api.guilds[this.guild.id].members[this.member.id].roles[
      roleId
    ].put({ reason });

    const clone = this.member._clone();
    clone._roles = [...this.cache.keys(), roleId];
    return clone;
  }

  async remove(
    roleOrRoles:
      | RoleResolvableSource
      | readonly RoleResolvableSource[]
      | Collection<Snowflake, RoleType>,
    reason?: string
  ): Promise<GuildMember> {
    const roles =
      roleOrRoles instanceof Collection
        ? [...roleOrRoles.values()]
        : roleOrRoles;
    if (Array.isArray(roles)) {
      const resolvedRoles: Snowflake[] = [];
      for (const role of roles) {
        const resolvedRole = this.guild.roles.resolveId(role);
        if (!resolvedRole) {
          throw new TypeError(
            'INVALID_ELEMENT',
            'Array or Collection',
            'roles',
            role
          );
        }
        resolvedRoles.push(resolvedRole);
      }

      const newRoles = this.cache.filter(
        (role) => !resolvedRoles.includes(role.id)
      );
      return this.set(newRoles, reason);
    }
    const roleId = this.guild.roles.resolveId(roles);
    if (roleId === null) {
      throw new TypeError(
        'INVALID_TYPE',
        'roles',
        'RoleType, Snowflake or Array or Collection of Roles or Snowflakes'
      );
    }

    await this.client.api.guilds[this.guild.id].members[this.member.id].roles[
      roleId
    ].delete({ reason });

    const clone = this.member._clone();
    const newRoles = this.cache.filter((role) => role.id !== roleId);
    clone._roles = [...newRoles.keys()];
    return clone;
  }

  set(
    roles: readonly RoleResolvableSource[] | Collection<Snowflake, RoleType>,
    reason?: string
  ): Promise<GuildMember> {
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
