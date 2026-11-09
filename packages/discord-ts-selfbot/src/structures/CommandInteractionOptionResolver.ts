import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import type { Collection } from '@discordjs/collection';
import type { Snowflake } from 'discord-api-types/v10';
import type Client from '../client/Client';
import type MessageAttachment from './MessageAttachment';
import type {
  ApplicationCommandOptionType,
  AutocompleteFocusedOption,
  CacheType,
  CommandInteractionOption as PublicCommandInteractionOption,
  CommandInteractionResolvedData as PublicCommandInteractionResolvedData,
} from '../../typings';

type OptionType = ApplicationCommandOptionType | '_MESSAGE';

/**
 * The source-level option shape. The public typings use the typings
 * `MessageAttachment` class; the runtime builds the source class, so the
 * internal shape keeps the source attachment.
 */
export type CommandInteractionOption<Cached extends CacheType = CacheType> = Omit<
  PublicCommandInteractionOption<Cached>,
  'attachment' | 'options'
> & {
  options?: CommandInteractionOption<Cached>[];
  attachment?: MessageAttachment;
};

export type CommandInteractionResolvedData<Cached extends CacheType = CacheType> = Omit<
  PublicCommandInteractionResolvedData<Cached>,
  'attachments'
> & {
  attachments?: Collection<Snowflake, MessageAttachment>;
};

function isAutocompleteOptionType(type: ApplicationCommandOptionType): type is 'STRING' | 'INTEGER' | 'NUMBER' {
  return type === 'STRING' || type === 'INTEGER' || type === 'NUMBER';
}

/**
 * A resolver for command interaction options.
 */
class CommandInteractionOptionResolver<Cached extends CacheType = CacheType> {
  declare readonly client: Client;
  declare readonly data: readonly CommandInteractionOption<Cached>[];
  declare readonly resolved: Readonly<CommandInteractionResolvedData<Cached>> | null;
  _group: string | null;
  _subcommand: string | null;
  _hoistedOptions: CommandInteractionOption<Cached>[];

  constructor(
    client: Client,
    options: CommandInteractionOption<Cached>[],
    resolved: CommandInteractionResolvedData<Cached> | null = null,
  ) {
    /**
     * The client that instantiated this.
     * @name CommandInteractionOptionResolver#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The name of the subcommand group.
     * @type {?string}
     * @private
     */
    this._group = null;

    /**
     * The name of the subcommand.
     * @type {?string}
     * @private
     */
    this._subcommand = null;

    /**
     * The bottom-level options for the interaction.
     * If there is a subcommand (or subcommand and group), this is the options for the subcommand.
     * @type {CommandInteractionOption[]}
     * @private
     */
    this._hoistedOptions = options;

    // Hoist subcommand group if present
    if (this._hoistedOptions[0]?.type === 'SUB_COMMAND_GROUP') {
      this._group = this._hoistedOptions[0].name;
      this._hoistedOptions = this._hoistedOptions[0].options as CommandInteractionOption<Cached>[];
    }
    // Hoist subcommand if present
    if (this._hoistedOptions[0]?.type === 'SUB_COMMAND') {
      this._subcommand = this._hoistedOptions[0].name;
      this._hoistedOptions = this._hoistedOptions[0].options as CommandInteractionOption<Cached>[];
    }

    /**
     * The interaction options array.
     * @name CommandInteractionOptionResolver#data
     * @type {ReadonlyArray<CommandInteractionOption>}
     * @readonly
     */
    Object.defineProperty(this, 'data', { value: Object.freeze([...options]) });

    /**
     * The interaction resolved data
     * @name CommandInteractionOptionResolver#resolved
     * @type {?Readonly<CommandInteractionResolvedData>}
     */
    Object.defineProperty(this, 'resolved', { value: resolved ? Object.freeze(resolved) : null });
  }

  /**
   * Gets an option by its name.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?CommandInteractionOption} The option, if found.
   */
  get(name: string, required: true): CommandInteractionOption<Cached>;
  get(name: string, required?: boolean): CommandInteractionOption<Cached> | null;
  get(name: string, required = false) {
    const option = this._hoistedOptions.find(opt => opt.name === name);
    if (!option) {
      if (required) {
        throw new TypeError('COMMAND_INTERACTION_OPTION_NOT_FOUND', name);
      }
      return null;
    }
    return option;
  }

  /**
   * Gets an option by name and property and checks its type.
   * @param {string} name The name of the option.
   * @param {ApplicationCommandOptionType} type The type of the option.
   * @param {string[]} properties The properties to check for for `required`.
   * @param {boolean} required Whether to throw an error if the option is not found.
   * @returns {?CommandInteractionOption} The option, if found.
   * @private
   */
  _getTypedOption(
    name: string,
    type: OptionType,
    properties: (keyof CommandInteractionOption)[],
    required: true,
  ): CommandInteractionOption<Cached>;
  _getTypedOption(
    name: string,
    type: OptionType,
    properties: (keyof CommandInteractionOption)[],
    required: boolean,
  ): CommandInteractionOption<Cached> | null;
  _getTypedOption(name: string, type: OptionType, properties: (keyof CommandInteractionOption)[], required: boolean) {
    const option = this.get(name, required);
    if (!option) {
      return null;
    } else if (option.type !== type) {
      throw new TypeError('COMMAND_INTERACTION_OPTION_TYPE', name, option.type, type);
    } else if (required && properties.every(prop => option[prop] === null || typeof option[prop] === 'undefined')) {
      throw new TypeError('COMMAND_INTERACTION_OPTION_EMPTY', name, option.type);
    }
    return option;
  }

  /**
   * Gets the selected subcommand.
   * @param {boolean} [required=true] Whether to throw an error if there is no subcommand.
   * @returns {?string} The name of the selected subcommand, or null if not set and not required.
   */
  getSubcommand(required?: true): string;
  getSubcommand(required: boolean): string | null;
  getSubcommand(required = true) {
    if (required && !this._subcommand) {
      throw new TypeError('COMMAND_INTERACTION_OPTION_NO_SUB_COMMAND');
    }
    return this._subcommand;
  }

  /**
   * Gets the selected subcommand group.
   * @param {boolean} [required=true] Whether to throw an error if there is no subcommand group.
   * @returns {?string} The name of the selected subcommand group, or null if not set and not required.
   */
  getSubcommandGroup(required?: true): string;
  getSubcommandGroup(required: boolean): string | null;
  getSubcommandGroup(required = true) {
    if (required && !this._group) {
      throw new TypeError('COMMAND_INTERACTION_OPTION_NO_SUB_COMMAND_GROUP');
    }
    return this._group;
  }

  /**
   * Gets a boolean option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?boolean} The value of the option, or null if not set and not required.
   */
  getBoolean(name: string, required: true): boolean;
  getBoolean(name: string, required?: boolean): boolean | null;
  getBoolean(name: string, required = false) {
    const option = this._getTypedOption(name, 'BOOLEAN', ['value'], required);
    return option?.value ?? null;
  }

  /**
   * Gets a channel option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?(GuildChannel|ThreadChannel|APIChannel)}
   * The value of the option, or null if not set and not required.
   */
  getChannel(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['channel']>;
  getChannel(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['channel']> | null;
  getChannel(name: string, required = false) {
    const option = this._getTypedOption(name, 'CHANNEL', ['channel'], required);
    return option?.channel ?? null;
  }

  /**
   * Gets a string option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?string} The value of the option, or null if not set and not required.
   */
  getString(name: string, required: true): string;
  getString(name: string, required?: boolean): string | null;
  getString(name: string, required = false) {
    const option = this._getTypedOption(name, 'STRING', ['value'], required);
    return option?.value ?? null;
  }

  /**
   * Gets an integer option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?number} The value of the option, or null if not set and not required.
   */
  getInteger(name: string, required: true): number;
  getInteger(name: string, required?: boolean): number | null;
  getInteger(name: string, required = false) {
    const option = this._getTypedOption(name, 'INTEGER', ['value'], required);
    return option?.value ?? null;
  }

  /**
   * Gets a number option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?number} The value of the option, or null if not set and not required.
   */
  getNumber(name: string, required: true): number;
  getNumber(name: string, required?: boolean): number | null;
  getNumber(name: string, required = false) {
    const option = this._getTypedOption(name, 'NUMBER', ['value'], required);
    return option?.value ?? null;
  }

  /**
   * Gets a user option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?User} The value of the option, or null if not set and not required.
   */
  getUser(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['user']>;
  getUser(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['user']> | null;
  getUser(name: string, required = false) {
    const option = this._getTypedOption(name, 'USER', ['user'], required);
    return option?.user ?? null;
  }

  /**
   * Gets a member option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?(GuildMember|APIGuildMember)}
   * The value of the option, or null if not set and not required.
   */
  getMember(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['member']>;
  getMember(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['member']> | null;
  getMember(name: string, required = false) {
    const option = this._getTypedOption(name, 'USER', ['member'], required);
    return option?.member ?? null;
  }

  /**
   * Gets a role option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?(Role|APIRole)} The value of the option, or null if not set and not required.
   */
  getRole(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['role']>;
  getRole(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['role']> | null;
  getRole(name: string, required = false) {
    const option = this._getTypedOption(name, 'ROLE', ['role'], required);
    return option?.role ?? null;
  }

  /**
   * Gets a mentionable option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?(User|GuildMember|APIGuildMember|Role|APIRole)}
   * The value of the option, or null if not set and not required.
   */
  getMentionable(
    name: string,
    required: true,
  ): NonNullable<CommandInteractionOption<Cached>['member' | 'role' | 'user']>;
  getMentionable(
    name: string,
    required?: boolean,
  ): NonNullable<CommandInteractionOption<Cached>['member' | 'role' | 'user']> | null;
  getMentionable(name: string, required = false) {
    const option = this._getTypedOption(name, 'MENTIONABLE', ['user', 'member', 'role'], required);
    return option?.member ?? option?.user ?? option?.role ?? null;
  }

  /**
   * Gets a message option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?(Message|APIMessage)}
   * The value of the option, or null if not set and not required.
   */
  getMessage(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['message']>;
  getMessage(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['message']> | null;
  getMessage(name: string, required = false) {
    const option = this._getTypedOption(name, '_MESSAGE', ['message'], required);
    return option?.message ?? null;
  }

  /**
   * The full autocomplete option object.
   * @typedef {Object} AutocompleteFocusedOption
   * @property {string} name The name of the option
   * @property {ApplicationCommandOptionType} type The type of the application command option
   * @property {string} value The value of the option
   * @property {boolean} focused Whether this option is currently in focus for autocomplete
   */

  /**
   * Gets the focused option.
   * @param {boolean} [getFull=false] Whether to get the full option object
   * @returns {string|AutocompleteFocusedOption}
   * The value of the option, or the whole option if getFull is true
   */
  getFocused(getFull: true): AutocompleteFocusedOption;
  getFocused(getFull?: boolean): string;
  getFocused(getFull = false): AutocompleteFocusedOption | string {
    const focusedOption = this._hoistedOptions.find(option => option.focused);
    if (!focusedOption) throw new TypeError('AUTOCOMPLETE_INTERACTION_OPTION_NO_FOCUSED_OPTION');
    const value = typeof focusedOption.value === 'string' ? focusedOption.value : String(focusedOption.value ?? '');
    if (getFull) {
      if (!isAutocompleteOptionType(focusedOption.type)) {
        throw new TypeError('AUTOCOMPLETE_INTERACTION_OPTION_NO_FOCUSED_OPTION');
      }
      return { name: focusedOption.name, type: focusedOption.type, value, focused: true };
    }
    return value;
  }

  /**
   * Gets an attachment option.
   * @param {string} name The name of the option.
   * @param {boolean} [required=false] Whether to throw an error if the option is not found.
   * @returns {?MessageAttachment} The value of the option, or null if not set and not required.
   */
  getAttachment(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['attachment']>;
  getAttachment(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['attachment']> | null;
  getAttachment(name: string, required = false) {
    const option = this._getTypedOption(name, 'ATTACHMENT', ['attachment'], required);
    return option?.attachment ?? null;
  }
}

export default CommandInteractionOptionResolver;
export { CommandInteractionOptionResolver };
