import { Collection } from "@discordjs/collection";
import BaseManager from "./BaseManager";
import _errorsModule from "../errors";

const { Error, TypeError } = _errorsModule;
import _ConstantsModule from "../util/Constants";

const { ApplicationCommandPermissionTypes, APIErrors } = _ConstantsModule;
import type {
  APIApplicationCommandPermission,
  APIGuildApplicationCommandPermissions,
  RESTGetAPIApplicationCommandPermissionsResult,
  RESTGetAPIGuildApplicationCommandsPermissionsResult,
  RESTPutAPIApplicationCommandPermissionsResult,
  RESTPutAPIGuildApplicationCommandsPermissionsResult,
  Snowflake,
} from "discord-api-types/v10";
import type {
  ApplicationCommandPermissionData,
  ApplicationCommandPermissions,
  ApplicationCommandResolvable,
  GuildApplicationCommandPermissionData,
  GuildResolvable,
  RoleResolvable,
  UserResolvable,
} from "../../typings";
import type ApplicationCommand from "../structures/ApplicationCommand";
import type ApplicationCommandManager from "./ApplicationCommandManager";
import type { Guild } from "../structures/Guild";

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

type SetApplicationCommandPermissionsOptions<
  BaseOptions extends BaseApplicationCommandPermissionsOptions,
> = BaseOptions & {
  permissions?: ApplicationCommandPermissionData[];
  fullPermissions?: GuildApplicationCommandPermissionData[];
};

type RemoveApplicationCommandPermissionsOptions<
  FetchSingleOptions extends BaseApplicationCommandPermissionsOptions,
> = FetchSingleOptions & {
  users?: UserResolvable | UserResolvable[];
  roles?: RoleResolvable | RoleResolvable[];
};

type HasApplicationCommandPermissionsOptions<
  FetchSingleOptions extends BaseApplicationCommandPermissionsOptions,
> = FetchSingleOptions & { permissionId: UserResolvable | RoleResolvable };

type AddApplicationCommandPermissionsOptions<
  FetchSingleOptions extends BaseApplicationCommandPermissionsOptions,
> = FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] };

interface GuildPermissionsPayload {
  id: Snowflake;
  permissions: APIApplicationCommandPermission[];
}

class ApplicationCommandPermissionsManager<
  BaseOptions extends BaseApplicationCommandPermissionsOptions =
    BaseApplicationCommandPermissionsOptions,
  FetchSingleOptions extends BaseApplicationCommandPermissionsOptions =
    FetchSingleApplicationCommandPermissionsOptions,
  FullPermissionsOptions extends BaseApplicationCommandPermissionsOptions =
    FullApplicationCommandPermissionsOptions,
  GuildType extends Guild | null = Guild | null,
  CommandIdType extends Snowflake | null = Snowflake | null,
> extends BaseManager {
  declare manager: ApplicationCommand | ApplicationCommandManager;
  declare guild: GuildType;
  declare guildId: Snowflake | null;
  declare commandId: CommandIdType;

  constructor(manager: ApplicationCommand | ApplicationCommandManager) {
    super(manager.client);

    this.manager = manager;

    this.guild = (manager.guild ?? null) as GuildType;

    this.guildId = manager.guildId ?? manager.guild?.id ?? null;

    const managerId = "id" in manager ? manager.id : null;
    this.commandId = (managerId ? String(managerId) : null) as CommandIdType;
  }

  permissionsPath(guildId: Snowflake, commandId?: Snowflake) {
    return this.client.api
      .applications(this.client.application!.id)
      .guilds(guildId)
      .commands(commandId).permissions;
  }

  async fetch(
    options: FetchSingleOptions
  ): Promise<ApplicationCommandPermissions[]>;
  async fetch(
    options: BaseOptions
  ): Promise<Collection<Snowflake, ApplicationCommandPermissions[]>>;
  async fetch(options: FetchSingleOptions | BaseOptions) {
    const { guild, command } = options;
    const { guildId, commandId } = this._validateOptions(guild, command);
    if (commandId) {
      return this.fetchSingle(guildId, commandId);
    }

    const data =
      await this.permissionsPath(
        guildId
      ).get<RESTGetAPIGuildApplicationCommandsPermissionsResult>();
    return data.reduce(
      (
        coll: Collection<Snowflake, ApplicationCommandPermissions[]>,
        perm: APIGuildApplicationCommandPermissions
      ) =>
        coll.set(
          perm.id,
          perm.permissions.map((p) =>
            ApplicationCommandPermissionsManager.transformPermissions(p, true)
          )
        ),
      new Collection<Snowflake, ApplicationCommandPermissions[]>()
    );
  }

  private async fetchSingle(
    guildId: Snowflake,
    commandId: Snowflake
  ): Promise<ApplicationCommandPermissions[]> {
    const data = await this.permissionsPath(
      guildId,
      commandId
    ).get<RESTGetAPIApplicationCommandPermissionsResult>();
    return data.permissions.map((perm: APIApplicationCommandPermission) =>
      ApplicationCommandPermissionsManager.transformPermissions(perm, true)
    );
  }

  private async setSingle(
    guildId: Snowflake,
    commandId: Snowflake,
    permissions: ApplicationCommandPermissionData[]
  ): Promise<ApplicationCommandPermissions[]> {
    const data = await this.permissionsPath(
      guildId,
      commandId
    ).put<RESTPutAPIApplicationCommandPermissionsResult>({
      data: {
        permissions: permissions.map((perm) =>
          ApplicationCommandPermissionsManager.transformPermissions(perm)
        ),
      },
    });
    return data.permissions.map((perm: APIApplicationCommandPermission) =>
      ApplicationCommandPermissionsManager.transformPermissions(perm, true)
    );
  }

  async set(
    options: FetchSingleOptions & {
      permissions: ApplicationCommandPermissionData[];
    }
  ): Promise<ApplicationCommandPermissions[]>;
  async set(
    options: FullPermissionsOptions & {
      fullPermissions: GuildApplicationCommandPermissionData[];
    }
  ): Promise<Collection<Snowflake, ApplicationCommandPermissions[]>>;
  async set(
    options:
      | SetApplicationCommandPermissionsOptions<BaseOptions>
      | SetApplicationCommandPermissionsOptions<FetchSingleOptions>
      | SetApplicationCommandPermissionsOptions<FullPermissionsOptions>
  ) {
    const { guild, command, permissions, fullPermissions } = options;
    const { guildId, commandId } = this._validateOptions(guild, command);

    if (commandId) {
      if (!Array.isArray(permissions)) {
        throw new TypeError(
          "INVALID_TYPE",
          "permissions",
          "Array of ApplicationCommandPermissionData",
          true
        );
      }
      return this.setSingle(guildId, commandId, permissions);
    }

    if (!Array.isArray(fullPermissions)) {
      throw new TypeError(
        "INVALID_TYPE",
        "fullPermissions",
        "Array of GuildApplicationCommandPermissionData",
        true
      );
    }

    const APIPermissions: GuildPermissionsPayload[] = [];
    for (const perm of fullPermissions) {
      if (!Array.isArray(perm.permissions)) {
        throw new TypeError(
          "INVALID_ELEMENT",
          "Array",
          "fullPermissions",
          perm
        );
      }
      APIPermissions.push({
        id: perm.id,
        permissions: perm.permissions.map((p) =>
          ApplicationCommandPermissionsManager.transformPermissions(p)
        ),
      });
    }
    const data = await this.permissionsPath(
      guildId
    ).put<RESTPutAPIGuildApplicationCommandsPermissionsResult>({
      data: APIPermissions,
    });
    return data.reduce(
      (
        coll: Collection<Snowflake, ApplicationCommandPermissions[]>,
        perm: GuildPermissionsPayload
      ) =>
        coll.set(
          perm.id,
          perm.permissions.map((p) =>
            ApplicationCommandPermissionsManager.transformPermissions(p, true)
          )
        ),
      new Collection<Snowflake, ApplicationCommandPermissions[]>()
    );
  }

  async add({
    guild,
    command,
    permissions,
  }: AddApplicationCommandPermissionsOptions<FetchSingleOptions>): Promise<
    ApplicationCommandPermissions[]
  > {
    const { guildId, commandId } = this._validateOptions(guild, command);
    if (!commandId) {
      throw new TypeError(
        "INVALID_TYPE",
        "command",
        "ApplicationCommandResolvable"
      );
    }
    if (!Array.isArray(permissions)) {
      throw new TypeError(
        "INVALID_TYPE",
        "permissions",
        "Array of ApplicationCommandPermissionData",
        true
      );
    }

    let existing: ApplicationCommandPermissions[] = [];
    try {
      existing = await this.fetchSingle(guildId, commandId);
    } catch (error) {
      if (
        !ApplicationCommandPermissionsManager.isUnknownPermissionsError(error)
      ) {
        throw error;
      }
    }

    const newPermissions = [...permissions];
    for (const perm of existing) {
      if (!newPermissions.some((x) => x.id === perm.id)) {
        newPermissions.push(perm);
      }
    }

    return this.setSingle(guildId, commandId, newPermissions);
  }

  async remove({
    guild,
    command,
    users,
    roles,
  }: RemoveApplicationCommandPermissionsOptions<FetchSingleOptions>): Promise<
    ApplicationCommandPermissions[]
  > {
    const { guildId, commandId } = this._validateOptions(guild, command);
    if (!commandId) {
      throw new TypeError(
        "INVALID_TYPE",
        "command",
        "ApplicationCommandResolvable"
      );
    }

    if (!users && !roles) {
      throw new TypeError(
        "INVALID_TYPE",
        "users OR roles",
        "Array or Resolvable",
        true
      );
    }

    const resolvedIds: Snowflake[] = [];
    if (Array.isArray(users)) {
      users.forEach((user) => {
        const userId = this.client.users.resolveId(user);
        if (!userId) {
          throw new TypeError("INVALID_ELEMENT", "Array", "users", user);
        }
        resolvedIds.push(userId);
      });
    } else if (users) {
      const userId = this.client.users.resolveId(users);
      if (!userId) {
        throw new TypeError("INVALID_TYPE", "users", "Array or UserResolvable");
      }
      resolvedIds.push(userId);
    }

    if (Array.isArray(roles)) {
      roles.forEach((role) => {
        if (typeof role === "string") {
          resolvedIds.push(role);
          return;
        }
        if (!this.guild) {
          throw new Error("GUILD_UNCACHED_ROLE_RESOLVE");
        }
        const roleId = this.guild.roles.resolveId(role);
        if (!roleId) {
          throw new TypeError("INVALID_ELEMENT", "Array", "users", role);
        }
        resolvedIds.push(roleId);
      });
    } else if (roles) {
      if (typeof roles === "string") {
        resolvedIds.push(roles);
      } else {
        if (!this.guild) {
          throw new Error("GUILD_UNCACHED_ROLE_RESOLVE");
        }
        const roleId = this.guild.roles.resolveId(roles);
        if (!roleId) {
          throw new TypeError(
            "INVALID_TYPE",
            "users",
            "Array or RoleResolvable"
          );
        }
        resolvedIds.push(roleId);
      }
    }

    let existing: ApplicationCommandPermissions[] = [];
    try {
      existing = await this.fetchSingle(guildId, commandId);
    } catch (error) {
      if (
        !ApplicationCommandPermissionsManager.isUnknownPermissionsError(error)
      ) {
        throw error;
      }
    }

    const permissions = existing.filter(
      (perm) => !resolvedIds.includes(perm.id)
    );

    return this.setSingle(guildId, commandId, permissions);
  }

  async has({
    guild,
    command,
    permissionId,
  }: HasApplicationCommandPermissionsOptions<FetchSingleOptions>): Promise<boolean> {
    const { guildId, commandId } = this._validateOptions(guild, command);
    if (!commandId) {
      throw new TypeError(
        "INVALID_TYPE",
        "command",
        "ApplicationCommandResolvable"
      );
    }

    if (!permissionId) {
      throw new TypeError(
        "INVALID_TYPE",
        "permissionId",
        "UserResolvable or RoleResolvable"
      );
    }
    let resolvedId: string | null =
      typeof permissionId === "string" ? permissionId : null;
    if (typeof permissionId !== "string") {
      resolvedId = this.client.users.resolveId(permissionId);
      if (!resolvedId) {
        if (!this.guild) {
          throw new Error("GUILD_UNCACHED_ROLE_RESOLVE");
        }
        resolvedId = this.guild.roles.resolveId(permissionId);
      }
      if (!resolvedId) {
        throw new TypeError(
          "INVALID_TYPE",
          "permissionId",
          "UserResolvable or RoleResolvable"
        );
      }
    }

    let existing: ApplicationCommandPermissions[] = [];
    try {
      existing = await this.fetchSingle(guildId, commandId);
    } catch (error) {
      if (
        !ApplicationCommandPermissionsManager.isUnknownPermissionsError(error)
      ) {
        throw error;
      }
    }

    return existing.some((perm) => perm.id === resolvedId);
  }

  _validateOptions(
    guild?: GuildResolvable,
    command?: ApplicationCommandResolvable
  ): { guildId: Snowflake; commandId: Snowflake | null } {
    const guildId = this.guildId ?? this.client.guilds.resolveId(guild);
    if (!guildId) {
      throw new Error("GLOBAL_COMMAND_PERMISSIONS");
    }
    let commandId: Snowflake | null = this.commandId;
    if (command && !commandId) {
      if ("id" in this.manager) {
        const { id } = this.manager;
        commandId = typeof id === "string" ? id : null;
      } else if ("resolveId" in this.manager) {
        commandId = this.manager.resolveId(command);
      }
      commandId =
        commandId ??
        this.client.application?.commands.resolveId(command) ??
        null;
      if (!commandId) {
        throw new TypeError(
          "INVALID_TYPE",
          "command",
          "ApplicationCommandResolvable",
          true
        );
      }
    }
    return { commandId, guildId };
  }

  static transformPermissions(
    permissions:
      | ApplicationCommandPermissionData
      | APIApplicationCommandPermission,
    received: true
  ): ApplicationCommandPermissions;
  static transformPermissions(
    permissions:
      | ApplicationCommandPermissionData
      | APIApplicationCommandPermission,
    received?: false
  ): APIApplicationCommandPermission;
  static transformPermissions(
    permissions:
      | ApplicationCommandPermissionData
      | APIApplicationCommandPermission,
    received = false
  ): ApplicationCommandPermissions | APIApplicationCommandPermission {
    return {
      id: permissions.id,
      permission: permissions.permission,
      type:
        typeof permissions.type === "number" && !received
          ? permissions.type
          : ApplicationCommandPermissionTypes[permissions.type],
    };
  }

  private static isUnknownPermissionsError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === APIErrors.UNKNOWN_APPLICATION_COMMAND_PERMISSIONS
    );
  }
}

export default ApplicationCommandPermissionsManager;
export { ApplicationCommandPermissionsManager };

/* eslint-disable max-len */
