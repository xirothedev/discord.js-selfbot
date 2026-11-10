import { Collection } from '@discordjs/collection';
import ApplicationCommandPermissionsManager from './ApplicationCommandPermissionsManager';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import ApplicationCommand from '../structures/ApplicationCommand';
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';
const { ApplicationCommandTypes } = _ConstantsModule;
import Permissions from '../util/Permissions';
import type { Snowflake } from 'discord-api-types/v10';
import type { RawApplicationCommandData } from '../../typings/rawDataTypes';
import type {
  ApplicationCommandDataResolvable,
  ApplicationCommandResolvable,
  FetchApplicationCommandOptions,
} from '../../typings';
import type { Client } from '../client/Client';
import type { Guild } from '../structures/Guild';
import type { ApplicationCommandOptionSource } from '../structures/ApplicationCommand';

type ApplicationCommandResolvableSource = ApplicationCommand | ApplicationCommandResolvable;

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

function isTransformableCommand(value: unknown): value is ApplicationCommandTransformable {
  return typeof value === 'object' && value !== null;
}

/**
 * Manages API methods for application commands and stores their cache.
 * @extends {CachedManager}
 */
class ApplicationCommandManager extends CachedManager<ApplicationCommand> {
  declare permissions: ApplicationCommandPermissionsManager;
  declare guild?: Guild;
  declare guildId?: Snowflake;
  constructor(client: Client, iterable?: Iterable<ApplicationCommand>) {
    super(client, ApplicationCommand, iterable);

    /**
     * The manager for permissions of arbitrary commands on arbitrary guilds
     * @type {ApplicationCommandPermissionsManager}
     */
    this.permissions = new ApplicationCommandPermissionsManager(this);
  }

  /**
   * The cache of this manager
   * @type {Collection<Snowflake, ApplicationCommand>}
   * @name ApplicationCommandManager#cache
   */

  _add(
    data: unknown,
    cache = true,
    guildIdOrOptions?: Snowflake | { id?: string; extras?: unknown[] },
  ): ApplicationCommand {
    const options =
      typeof guildIdOrOptions === 'object' ? guildIdOrOptions : { extras: [this.guild, guildIdOrOptions] };
    return super._add(data, cache, options);
  }

  /**
   * The APIRouter path to the commands
   * @param {Snowflake} [options.id] The application command's id
   * @param {Snowflake} [options.guildId] The guild's id to use in the path,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Object}
   * @private
   */
  commandPath({ id, guildId }: { id?: Snowflake; guildId?: Snowflake } = {}): CommandPath {
    let path = this.client.api.applications(this.client.application!.id);
    if (this.guild ?? guildId) path = path.guilds(this.guild?.id ?? guildId);
    return id ? path.commands(id) : path.commands;
  }

  /**
   * Data that resolves to give an ApplicationCommand object. This can be:
   * * An ApplicationCommand object
   * * A Snowflake
   * @typedef {ApplicationCommand|Snowflake} ApplicationCommandResolvable
   */

  /* eslint-disable max-len */
  /**
   * Data that resolves to the data of an ApplicationCommand
   * @typedef {ApplicationCommandData|APIApplicationCommand|SlashCommandBuilder|ContextMenuCommandBuilder} ApplicationCommandDataResolvable
   */
  /* eslint-enable max-len */

  /**
   * Options used to fetch data from Discord
   * @typedef {Object} BaseFetchOptions
   * @property {boolean} [cache=true] Whether to cache the fetched data if it wasn't already
   * @property {boolean} [force=false] Whether to skip the cache check and request the API
   */

  /**
   * Options used to fetch Application Commands from Discord
   * @typedef {BaseFetchOptions} FetchApplicationCommandOptions
   * @property {Snowflake} [guildId] The guild's id to fetch commands for, for when the guild is not cached
   * @property {LocaleString} [locale] The locale to use when fetching this command
   * @property {boolean} [withLocalizations] Whether to fetch all localization data
   */

  /**
   * Obtains one or multiple application commands from Discord, or the cache if it's already available.
   * @param {Snowflake} [id] The application command's id
   * @param {FetchApplicationCommandOptions} [options] Additional options for this fetch
   * @returns {Promise<ApplicationCommand|Collection<Snowflake, ApplicationCommand>>}
   * @example
   * // Fetch a single command
   * client.application!.commands.fetch('123456789012345678')
   *   .then(command => console.log(`Fetched command ${command.name}`))
   *   .catch(console.error);
   * @example
   * // Fetch all commands
   * guild.commands.fetch()
   *   .then(commands => console.log(`Fetched ${commands.size} commands`))
   *   .catch(console.error);
   */
  async fetch(id: Snowflake, options?: FetchApplicationCommandOptions): Promise<ApplicationCommand>;
  async fetch(options?: FetchApplicationCommandOptions): Promise<Collection<Snowflake, ApplicationCommand>>;
  async fetch(
    id?: Snowflake | FetchApplicationCommandOptions,
    options: FetchApplicationCommandOptions = {},
  ): Promise<ApplicationCommand | Collection<Snowflake, ApplicationCommand>> {
    let guildId = options.guildId;
    let cache = options.cache ?? true;
    let force = options.force ?? false;
    let locale = options.locale;
    let withLocalizations = options.withLocalizations;

    if (typeof id === 'object') {
      ({ guildId, cache = true, force = false, locale, withLocalizations } = id);
    } else if (id) {
      if (!force) {
        const existing = this.cache.get(id);
        if (existing) return existing;
      }
      const command = await this.commandPath({ id, guildId }).get<RawApplicationCommandData>();
      return this._add(command, cache);
    }

    const data = await this.commandPath({ guildId }).get<RawApplicationCommandData[]>({
      headers: {
        'X-Discord-Locale': locale,
      },
      query: typeof withLocalizations === 'boolean' ? { with_localizations: withLocalizations } : undefined,
    });
    return data.reduce(
      (coll, command) => coll.set(command.id, this._add(command, cache, guildId)),
      new Collection<Snowflake, ApplicationCommand>(),
    );
  }

  /**
   * Creates an application command.
   * @param {ApplicationCommandDataResolvable} command The command
   * @param {Snowflake} [guildId] The guild's id to create this command in,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Promise<ApplicationCommand>}
   * @example
   * // Create a new command
   * client.application!.commands.create({
   *   name: 'test',
   *   description: 'A test command',
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async create(command: ApplicationCommandDataResolvable, guildId?: Snowflake): Promise<ApplicationCommand> {
    const data = await this.commandPath({ guildId }).post<RawApplicationCommandData>({
      data: ApplicationCommandManager.transformCommand(command),
    });
    return this._add(data, true, guildId);
  }

  /**
   * Sets all the commands for this application or guild.
   * @param {ApplicationCommandDataResolvable[]} commands The commands
   * @param {Snowflake} [guildId] The guild's id to create the commands in,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Promise<Collection<Snowflake, ApplicationCommand>>}
   * @example
   * // Set all commands to just this one
   * client.application!.commands.set([
   *   {
   *     name: 'test',
   *     description: 'A test command',
   *   },
   * ])
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Remove all commands
   * guild.commands.set([])
   *   .then(console.log)
   *   .catch(console.error);
   */
  async set(
    commands: readonly ApplicationCommandDataResolvable[],
    guildId?: Snowflake,
  ): Promise<Collection<Snowflake, ApplicationCommand>> {
    const data = await this.commandPath({ guildId }).put<RawApplicationCommandData[]>({
      data: commands.map(c => ApplicationCommandManager.transformCommand(c)),
    });
    return data.reduce(
      (coll, command) => coll.set(command.id, this._add(command, true, guildId)),
      new Collection<Snowflake, ApplicationCommand>(),
    );
  }

  /**
   * Edits an application command.
   * @param {ApplicationCommandResolvable} command The command to edit
   * @param {Partial<ApplicationCommandDataResolvable>} data The data to update the command with
   * @param {Snowflake} [guildId] The guild's id where the command registered,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Promise<ApplicationCommand>}
   * @example
   * // Edit an existing command
   * client.application!.commands.edit('123456789012345678', {
   *   description: 'New description',
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async edit(
    command: ApplicationCommandResolvableSource,
    data: Partial<ApplicationCommandDataResolvable>,
    guildId?: Snowflake,
  ): Promise<ApplicationCommand> {
    const id = this.resolveId(command);
    if (!id) throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandResolvable');

    const patched = await this.commandPath({ id, guildId }).patch<RawApplicationCommandData>({
      data: ApplicationCommandManager.transformCommand(data),
    });
    return this._add(patched, true, guildId);
  }

  /**
   * Deletes an application command.
   * @param {ApplicationCommandResolvable} command The command to delete
   * @param {Snowflake} [guildId] The guild's id where the command is registered,
   * ignored when using a {@link GuildApplicationCommandManager}
   * @returns {Promise<?ApplicationCommand>}
   * @example
   * // Delete a command
   * guild.commands.delete('123456789012345678')
   *   .then(console.log)
   *   .catch(console.error);
   */
  async delete(command: ApplicationCommandResolvableSource, guildId?: Snowflake): Promise<ApplicationCommand | null> {
    const id = this.resolveId(command);
    if (!id) throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandResolvable');

    await this.commandPath({ id, guildId }).delete();

    const cached = this.cache.get(id);
    this.cache.delete(id);
    return cached ?? null;
  }

  /**
   * Transforms an {@link ApplicationCommandData} object into something that can be used with the API.
   * @param {ApplicationCommandDataResolvable} command The command to transform
   * @returns {APIApplicationCommand}
   * @private
   */
  static transformCommand(command: unknown) {
    if (!isTransformableCommand(command)) {
      throw new TypeError('INVALID_TYPE', 'command', 'ApplicationCommandDataResolvable');
    }
    if (typeof command.toJSON === 'function') return command.toJSON();

    let default_member_permissions: string | null | undefined;

    if ('default_member_permissions' in command) {
      const value = command.default_member_permissions;
      default_member_permissions =
        typeof value === 'string' || typeof value === 'number'
          ? new Permissions(BigInt(value)).bitfield.toString()
          : value;
    }

    if ('defaultMemberPermissions' in command) {
      default_member_permissions =
        command.defaultMemberPermissions !== null
          ? new Permissions(command.defaultMemberPermissions).bitfield.toString()
          : command.defaultMemberPermissions;
    }

    return {
      name: command.name,
      name_localizations: command.nameLocalizations ?? command.name_localizations,
      description: command.description,
      description_localizations: command.descriptionLocalizations ?? command.description_localizations,
      type:
        typeof command.type === 'number'
          ? command.type
          : typeof command.type === 'string'
            ? resolveEnumValue(ApplicationCommandTypes, command.type)
            : undefined,
      options: command.options?.map(o => ApplicationCommand.transformOption(o)),
      default_permission: command.defaultPermission ?? command.default_permission,
      default_member_permissions,
      dm_permission: command.dmPermission ?? command.dm_permission,
    };
  }
}

export default ApplicationCommandManager;
export { ApplicationCommandManager };

/**
 * @external SlashCommandBuilder
 * @see {@link https://discord.js.org/docs/packages/builders/stable/SlashCommandBuilder:Class}
 */

/**
 * @external ContextMenuCommandBuilder
 * @see {@link https://discord.js.org/docs/packages/builders/stable/ContextMenuCommandBuilder:Class}
 */
