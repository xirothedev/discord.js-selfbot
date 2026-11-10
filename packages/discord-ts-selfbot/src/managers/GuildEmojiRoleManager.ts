import { Collection } from "@discordjs/collection";
import DataManager from "./DataManager";
import _errorsModule from "../errors";

const { TypeError } = _errorsModule;
import _RoleModule from "../structures/Role";

const { Role } = _RoleModule;
import type { Snowflake } from "discord-api-types/v10";
import type { RoleResolvable } from "../../typings";
import type { Guild } from "../structures/Guild";
import type { GuildEmoji } from "../structures/GuildEmoji";
import type { Role as RoleType } from "../structures/Role";

type RoleResolvableSource = InstanceType<typeof Role> | RoleResolvable;
type RoleOrRolesSource =
  | RoleResolvableSource
  | readonly RoleResolvableSource[]
  | Collection<Snowflake, InstanceType<typeof Role>>;

function isRoleArray(
  value: RoleOrRolesSource
): value is readonly RoleResolvableSource[] {
  return Array.isArray(value);
}

function toRoleList(
  roleOrRoles: RoleOrRolesSource
): readonly RoleResolvableSource[] {
  if (roleOrRoles instanceof Collection) {
    return [...roleOrRoles.values()];
  }
  if (isRoleArray(roleOrRoles)) {
    return roleOrRoles;
  }
  return [roleOrRoles];
}

class GuildEmojiRoleManager extends DataManager<RoleType> {
  declare emoji: GuildEmoji;
  declare guild: Guild;

  constructor(emoji: GuildEmoji) {
    super(emoji.client, Role);

    this.emoji = emoji;
    this.guild = emoji.guild;
  }

  get cache(): Collection<Snowflake, InstanceType<typeof Role>> {
    return this.guild.roles.cache.filter((role) =>
      this.emoji._roles.includes(role.id)
    );
  }

  async add(roleOrRoles: RoleOrRolesSource): Promise<GuildEmoji> {
    const roles = toRoleList(roleOrRoles);

    const resolvedRoles: Snowflake[] = [];
    for (const role of roles) {
      const resolvedRole = this.guild.roles.resolveId(role);
      if (!resolvedRole) {
        throw new TypeError(
          "INVALID_ELEMENT",
          "Array or Collection",
          "roles",
          role
        );
      }
      resolvedRoles.push(resolvedRole);
    }

    const newRoles = [...new Set([...resolvedRoles, ...this.cache.keys()])];
    return this.set(newRoles);
  }

  async remove(roleOrRoles: RoleOrRolesSource): Promise<GuildEmoji> {
    const roles = toRoleList(roleOrRoles);

    const resolvedRoleIds: Snowflake[] = [];
    for (const role of roles) {
      const roleId = this.guild.roles.resolveId(role);
      if (!roleId) {
        throw new TypeError(
          "INVALID_ELEMENT",
          "Array or Collection",
          "roles",
          role
        );
      }
      resolvedRoleIds.push(roleId);
    }

    const newRoles = [...this.cache.keys()].filter(
      (id) => !resolvedRoleIds.includes(id)
    );
    return this.set(newRoles);
  }

  set(
    roles:
      | readonly RoleResolvableSource[]
      | Collection<Snowflake, InstanceType<typeof Role>>
  ) {
    return this.emoji.edit({ roles });
  }

  clone(): GuildEmojiRoleManager {
    const clone = new GuildEmojiRoleManager(this.emoji);
    clone._patch([...this.cache.keys()]);
    return clone;
  }

  _patch(roles: Snowflake[]) {
    this.emoji._roles = roles;
  }

  valueOf() {
    return this.cache;
  }
}

export default GuildEmojiRoleManager;
export { GuildEmojiRoleManager };
