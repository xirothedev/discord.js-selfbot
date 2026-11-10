import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import type { Collection } from '@discordjs/collection';
import type {
  APIMessage,
  APIRole,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  Snowflake,
} from 'discord-api-types/v10';
import type Client from '../client/Client';
import type MessageAttachment from './MessageAttachment';
import type {
  ApplicationCommandOptionType,
  AutocompleteFocusedOption,
  CacheType,
  CommandInteractionOption as PublicCommandInteractionOption,
} from '../../typings';

type OptionType = ApplicationCommandOptionType | '_MESSAGE';

export type CommandInteractionOption<Cached extends CacheType = CacheType> = Omit<
  PublicCommandInteractionOption<Cached>,
  'attachment' | 'options' | 'user' | 'member' | 'channel' | 'role' | 'message'
> & {
  options?: CommandInteractionOption<Cached>[];
  attachment?: MessageAttachment;
  user?: import('./User').default;
  member?: import('./GuildMember').GuildMember | APIInteractionDataResolvedGuildMember;
  channel?: import('./Channel').Channel | APIInteractionDataResolvedChannel;
  role?: import('./Role').Role | APIRole;
  message?: import('./Message').Message | APIMessage;
};

export type CommandInteractionResolvedData<_Cached extends CacheType = CacheType> = {
  users?: Collection<Snowflake, import('./User').default>;
  members?: Collection<Snowflake, import('./GuildMember').GuildMember | APIInteractionDataResolvedGuildMember>;
  roles?: Collection<Snowflake, import('./Role').Role | APIRole>;
  channels?: Collection<Snowflake, import('./Channel').Channel | APIInteractionDataResolvedChannel>;
  messages?: Collection<Snowflake, import('./Message').Message | APIMessage>;
  attachments?: Collection<Snowflake, MessageAttachment>;
};

function isAutocompleteOptionType(type: ApplicationCommandOptionType): type is 'STRING' | 'INTEGER' | 'NUMBER' {
  return type === 'STRING' || type === 'INTEGER' || type === 'NUMBER';
}

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
    Object.defineProperty(this, 'client', { value: client });

    this._group = null;

    this._subcommand = null;

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

    Object.defineProperty(this, 'data', { value: Object.freeze([...options]) });

    Object.defineProperty(this, 'resolved', { value: resolved ? Object.freeze(resolved) : null });
  }

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

  getSubcommand(required?: true): string;
  getSubcommand(required: boolean): string | null;
  getSubcommand(required = true) {
    if (required && !this._subcommand) {
      throw new TypeError('COMMAND_INTERACTION_OPTION_NO_SUB_COMMAND');
    }
    return this._subcommand;
  }

  getSubcommandGroup(required?: true): string;
  getSubcommandGroup(required: boolean): string | null;
  getSubcommandGroup(required = true) {
    if (required && !this._group) {
      throw new TypeError('COMMAND_INTERACTION_OPTION_NO_SUB_COMMAND_GROUP');
    }
    return this._group;
  }

  getBoolean(name: string, required: true): boolean;
  getBoolean(name: string, required?: boolean): boolean | null;
  getBoolean(name: string, required = false) {
    const option = this._getTypedOption(name, 'BOOLEAN', ['value'], required);
    return option?.value ?? null;
  }

  getChannel(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['channel']>;
  getChannel(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['channel']> | null;
  getChannel(name: string, required = false) {
    const option = this._getTypedOption(name, 'CHANNEL', ['channel'], required);
    return option?.channel ?? null;
  }

  getString(name: string, required: true): string;
  getString(name: string, required?: boolean): string | null;
  getString(name: string, required = false) {
    const option = this._getTypedOption(name, 'STRING', ['value'], required);
    return option?.value ?? null;
  }

  getInteger(name: string, required: true): number;
  getInteger(name: string, required?: boolean): number | null;
  getInteger(name: string, required = false) {
    const option = this._getTypedOption(name, 'INTEGER', ['value'], required);
    return option?.value ?? null;
  }

  getNumber(name: string, required: true): number;
  getNumber(name: string, required?: boolean): number | null;
  getNumber(name: string, required = false) {
    const option = this._getTypedOption(name, 'NUMBER', ['value'], required);
    return option?.value ?? null;
  }

  getUser(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['user']>;
  getUser(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['user']> | null;
  getUser(name: string, required = false) {
    const option = this._getTypedOption(name, 'USER', ['user'], required);
    return option?.user ?? null;
  }

  getMember(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['member']>;
  getMember(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['member']> | null;
  getMember(name: string, required = false) {
    const option = this._getTypedOption(name, 'USER', ['member'], required);
    return option?.member ?? null;
  }

  getRole(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['role']>;
  getRole(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['role']> | null;
  getRole(name: string, required = false) {
    const option = this._getTypedOption(name, 'ROLE', ['role'], required);
    return option?.role ?? null;
  }

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

  getMessage(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['message']>;
  getMessage(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['message']> | null;
  getMessage(name: string, required = false) {
    const option = this._getTypedOption(name, '_MESSAGE', ['message'], required);
    return option?.message ?? null;
  }

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

  getAttachment(name: string, required: true): NonNullable<CommandInteractionOption<Cached>['attachment']>;
  getAttachment(name: string, required?: boolean): NonNullable<CommandInteractionOption<Cached>['attachment']> | null;
  getAttachment(name: string, required = false) {
    const option = this._getTypedOption(name, 'ATTACHMENT', ['attachment'], required);
    return option?.attachment ?? null;
  }
}

export default CommandInteractionOptionResolver;
export { CommandInteractionOptionResolver };
