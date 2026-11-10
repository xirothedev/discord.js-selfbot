import { Collection } from "@discordjs/collection";
import ApplicationCommandPermissionsManager from "./ApplicationCommandPermissionsManager";
import CachedManager from "./CachedManager";
import _errorsModule from "../errors";

const { TypeError } = _errorsModule;
import ApplicationCommand from "../structures/ApplicationCommand";
import _ConstantsModule, { resolveEnumValue } from "../util/Constants";

const { ApplicationCommandTypes } = _ConstantsModule;
import Permissions from "../util/Permissions";
import type { Snowflake } from "discord-api-types/v10";
import type { RawApplicationCommandData } from "../../typings/rawDataTypes";
import type {
  ApplicationCommandDataResolvable,
  ApplicationCommandResolvable,
  FetchApplicationCommandOptions,
} from "../../typings";
import type { Client } from "../client/Client";
import type { Guild } from "../structures/Guild";
import type { ApplicationCommandOptionSource } from "../structures/ApplicationCommand";

type ApplicationCommandResolvableSource =
  | ApplicationCommand
  | ApplicationCommandResolvable;

interface CommandPath {
  get<T = unknown>(options?: unknown): Promise<T>;
  post<T = unknown>(options?: unknown): Promise<T>;
  put<T = unknown>(options?: unknown): Promise<T>;
  patch<T = unknown>(options?: unknown): Promise<T>;
  delete<T = unknown>(options?: unknown): Promise<T>;
}

interface ApplicationCommandTransformable {
  toJSON?(): unknown;
  name?: string;
  nameLocalizations?: Record<string, string> | null;
  name_localizations?: Record<string, string> | null;
  description?: string;
  descriptionLocalizations?: Record<string, string> | null;
  description_localizations?: Record<string, string> | null;
  type?: string | number;
  options?: ApplicationCommandOptionSource[];
  defaultPermission?: boolean;
  default_permission?: boolean;
  defaultMemberPermissions?: unknown;
  default_member_permissions?: string | null;
  dmPermission?: boolean | null;
  dm_permission?: boolean | null;
}

function isTransformableCommand(
  value: unknown
): value is ApplicationCommandTransformable {
  return typeof value === "object" && value !== null;
}

class ApplicationCommandManager extends CachedManager<ApplicationCommand> {
  declare permissions: ApplicationCommandPermissionsManager;
  declare guild?: Guild;
  declare guildId?: Snowflake;
  constructor(client: Client, iterable?: Iterable<ApplicationCommand>) {
    super(client, ApplicationCommand, iterable);

    this.permissions = new ApplicationCommandPermissionsManager(this);
  }

  _add(
    data: unknown,
    cache = true,
    guildIdOrOptions?: Snowflake | { id?: string; extras?: unknown[] }
  ): ApplicationCommand {
    const options =
      typeof guildIdOrOptions === "object"
        ? guildIdOrOptions
        : { extras: [this.guild, guildIdOrOptions] };
    return super._add(data, cache, options);
  }

  commandPath({
    id,
    guildId,
  }: { id?: Snowflake; guildId?: Snowflake } = {}): CommandPath {
    let path = this.client.api.applications(this.client.application!.id);
    if (this.guild ?? guildId) {
      path = path.guilds(this.guild?.id ?? guildId);
    }
    return id ? path.commands(id) : path.commands;
  }

  /* eslint-disable max-len */
  /* eslint-enable max-len */

  async fetch(
    id: Snowflake,
    options?: FetchApplicationCommandOptions
  ): Promise<ApplicationCommand>;
  async fetch(
    options?: FetchApplicationCommandOptions
  ): Promise<Collection<Snowflake, ApplicationCommand>>;
  async fetch(
    id?: Snowflake | FetchApplicationCommandOptions,
    options: FetchApplicationCommandOptions = {}
  ): Promise<ApplicationCommand | Collection<Snowflake, ApplicationCommand>> {
    let { guildId } = options;
    let cache = options.cache ?? true;
    let force = options.force ?? false;
    let { locale } = options;
    let { withLocalizations } = options;

    if (typeof id === "object") {
      ({
        guildId,
        cache = true,
        force = false,
        locale,
        withLocalizations,
      } = id);
    } else if (id) {
      if (!force) {
        const existing = this.cache.get(id);
        if (existing) {
          return existing;
        }
      }
      const command = await this.commandPath({
        guildId,
        id,
      }).get<RawApplicationCommandData>();
      return this._add(command, cache);
    }

    const data = await this.commandPath({ guildId }).get<
      RawApplicationCommandData[]
    >({
      headers: {
        "X-Discord-Locale": locale,
      },
      query:
        typeof withLocalizations === "boolean"
          ? { with_localizations: withLocalizations }
          : undefined,
    });
    return data.reduce(
      (coll, command) =>
        coll.set(command.id, this._add(command, cache, guildId)),
      new Collection<Snowflake, ApplicationCommand>()
    );
  }

  async create(
    command: ApplicationCommandDataResolvable,
    guildId?: Snowflake
  ): Promise<ApplicationCommand> {
    const data = await this.commandPath({
      guildId,
    }).post<RawApplicationCommandData>({
      data: ApplicationCommandManager.transformCommand(command),
    });
    return this._add(data, true, guildId);
  }

  async set(
    commands: readonly ApplicationCommandDataResolvable[],
    guildId?: Snowflake
  ): Promise<Collection<Snowflake, ApplicationCommand>> {
    const data = await this.commandPath({ guildId }).put<
      RawApplicationCommandData[]
    >({
      data: commands.map((c) => ApplicationCommandManager.transformCommand(c)),
    });
    return data.reduce(
      (coll, command) =>
        coll.set(command.id, this._add(command, true, guildId)),
      new Collection<Snowflake, ApplicationCommand>()
    );
  }

  async edit(
    command: ApplicationCommandResolvableSource,
    data: Partial<ApplicationCommandDataResolvable>,
    guildId?: Snowflake
  ): Promise<ApplicationCommand> {
    const id = this.resolveId(command);
    if (!id) {
      throw new TypeError(
        "INVALID_TYPE",
        "command",
        "ApplicationCommandResolvable"
      );
    }

    const patched = await this.commandPath({
      guildId,
      id,
    }).patch<RawApplicationCommandData>({
      data: ApplicationCommandManager.transformCommand(data),
    });
    return this._add(patched, true, guildId);
  }

  async delete(
    command: ApplicationCommandResolvableSource,
    guildId?: Snowflake
  ): Promise<ApplicationCommand | null> {
    const id = this.resolveId(command);
    if (!id) {
      throw new TypeError(
        "INVALID_TYPE",
        "command",
        "ApplicationCommandResolvable"
      );
    }

    await this.commandPath({ guildId, id }).delete();

    const cached = this.cache.get(id);
    this.cache.delete(id);
    return cached ?? null;
  }

  static transformCommand(command: unknown) {
    if (!isTransformableCommand(command)) {
      throw new TypeError(
        "INVALID_TYPE",
        "command",
        "ApplicationCommandDataResolvable"
      );
    }
    if (typeof command.toJSON === "function") {
      return command.toJSON();
    }

    let default_member_permissions: string | null | undefined;

    if ("default_member_permissions" in command) {
      const value = command.default_member_permissions;
      default_member_permissions =
        typeof value === "string" || typeof value === "number"
          ? new Permissions(BigInt(value)).bitfield.toString()
          : value;
    }

    if ("defaultMemberPermissions" in command) {
      default_member_permissions =
        command.defaultMemberPermissions === null
          ? command.defaultMemberPermissions
          : new Permissions(
              command.defaultMemberPermissions
            ).bitfield.toString();
    }

    return {
      default_member_permissions,
      default_permission:
        command.defaultPermission ?? command.default_permission,
      description: command.description,
      description_localizations:
        command.descriptionLocalizations ?? command.description_localizations,
      dm_permission: command.dmPermission ?? command.dm_permission,
      name: command.name,
      name_localizations:
        command.nameLocalizations ?? command.name_localizations,
      options: command.options?.map((o) =>
        ApplicationCommand.transformOption(o)
      ),
      type:
        typeof command.type === "number"
          ? command.type
          : typeof command.type === "string"
            ? resolveEnumValue(ApplicationCommandTypes, command.type)
            : undefined,
    };
  }
}

export default ApplicationCommandManager;
export { ApplicationCommandManager };
