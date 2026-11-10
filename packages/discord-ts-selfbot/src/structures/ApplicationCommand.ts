import Base from './Base';
import ApplicationCommandPermissionsManager from '../managers/ApplicationCommandPermissionsManager';
import _ConstantsModule from '../util/Constants';
const { ApplicationCommandOptionTypes, ApplicationCommandTypes, ChannelTypes } = _ConstantsModule;
import Permissions from '../util/Permissions';
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { ChannelType, LocalizationMap, Snowflake } from 'discord-api-types/v10';
import type {
  ApplicationCommandData,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionResolvable,
} from '../../typings';
import type { RawApplicationCommandData } from '../../typings/rawDataTypes';
import type { Guild } from './Guild';

type ApplicationCommandPatch = Partial<RawApplicationCommandData> & {
  name_localized?: string;
  description_localized?: string;
};

interface ApplicationCommandOptionChoiceSource {
  name: string;
  nameLocalized?: string | null;
  nameLocalizations?: LocalizationMap | null;
  name_localizations?: LocalizationMap | null;
  name_localized?: string | null;
  value: string | number;
}

export interface ApplicationCommandOptionSource {
  type: ApplicationCommandOptionType | number;
  name: string;
  nameLocalizations?: LocalizationMap | null;
  nameLocalized?: string | null;
  name_localizations?: LocalizationMap | null;
  name_localized?: string | null;
  description: string;
  descriptionLocalizations?: LocalizationMap | null;
  descriptionLocalized?: string | null;
  description_localizations?: LocalizationMap | null;
  description_localized?: string | null;
  required?: boolean;
  autocomplete?: boolean;
  choices?: ApplicationCommandOptionChoiceSource[] | null;
  options?: ApplicationCommandOptionSource[] | null;
  channelTypes?: (ChannelType | number)[] | null;
  channel_types?: (ChannelType | number)[] | null;
  minValue?: number | null;
  maxValue?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  min_length?: number | null;
  max_length?: number | null;
}

interface ApplicationCommandComparable {
  id?: Snowflake;
  name?: string;
  description?: string | null;
  version?: Snowflake;
  autocomplete?: boolean;
  type?: ApplicationCommandType | number;
  options?: ApplicationCommandOptionSource[] | null;
  defaultPermission?: boolean;
  default_permission?: boolean;
  dmPermission?: boolean | null;
  dm_permission?: boolean | null;
  defaultMemberPermissions?: PermissionResolvable | null;
  default_member_permissions?: string | null;
}

class ApplicationCommand extends Base {
  declare id: Snowflake;
  declare applicationId: Snowflake;
  declare guild: Guild | null;
  declare guildId: Snowflake | null;
  declare permissions: ApplicationCommandPermissionsManager;
  declare type: ApplicationCommandType;
  declare name: string;
  declare nameLocalizations: LocalizationMap | null;
  declare nameLocalized: string | null;
  declare description: string;
  declare descriptionLocalizations: LocalizationMap | null;
  declare descriptionLocalized: string | null;
  declare options: ApplicationCommandOptionSource[];
  declare defaultPermission: boolean;
  declare defaultMemberPermissions: Readonly<Permissions> | null;
  declare dmPermission: boolean | null;
  declare version: Snowflake;
  declare autocomplete?: boolean;
  constructor(
    client: import('../client/Client').default,
    data: RawApplicationCommandData,
    guild: Guild | null,
    guildId: Snowflake | null = null,
  ) {
    super(client);

    this.id = data.id;

    this.applicationId = data.application_id;

    this.guild = guild ?? null;

    this.guildId = guild?.id ?? guildId ?? null;

    this.permissions = new ApplicationCommandPermissionsManager(this);

    this.type = ApplicationCommandTypes[data.type];

    this._patch(data);
  }

  _patch(data: ApplicationCommandPatch) {
    if ('name' in data) {
      this.name = data.name!;
    }

    if ('name_localizations' in data) {
      this.nameLocalizations = data.name_localizations ?? null;
    } else {
      this.nameLocalizations ??= null;
    }

    if ('name_localized' in data) {
      this.nameLocalized = data.name_localized ?? null;
    } else {
      this.nameLocalized ??= null;
    }

    if ('description' in data) {
      this.description = data.description!;
    }

    if ('description_localizations' in data) {
      this.descriptionLocalizations = data.description_localizations ?? null;
    } else {
      this.descriptionLocalizations ??= null;
    }

    if ('description_localized' in data) {
      this.descriptionLocalized = data.description_localized ?? null;
    } else {
      this.descriptionLocalized ??= null;
    }

    if ('options' in data) {
      this.options = (data.options ?? []).map(o => ApplicationCommand.transformOption(o, true));
    } else {
      this.options ??= [];
    }

    /* eslint-disable max-len */
    if ('default_permission' in data) {
      /**
       * Whether the command is enabled by default when the app is added to a guild
       * @type {boolean}
       * @deprecated Use {@link ApplicationCommand.defaultMemberPermissions} and {@link ApplicationCommand.dmPermission} instead.
       */
      this.defaultPermission = data.default_permission ?? false;
    }
    /* eslint-disable max-len */

    if ('default_member_permissions' in data) {
      this.defaultMemberPermissions = data.default_member_permissions
        ? new Permissions(BigInt(data.default_member_permissions)).freeze()
        : null;
    } else {
      this.defaultMemberPermissions ??= null;
    }

    if ('dm_permission' in data) {
      this.dmPermission = data.dm_permission ?? null;
    } else {
      this.dmPermission ??= null;
    }

    if ('version' in data) {
      this.version = data.version!;
    }
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  get manager() {
    if (!this.client.application) throw new Error('CLIENT_NOT_READY');
    return this.client.application.commands;
  }

  edit(data: Partial<ApplicationCommandData>) {
    return this.manager.edit(this, data, this.guildId ?? undefined);
  }

  setName(name: string) {
    return this.edit({ name });
  }

  setNameLocalizations(nameLocalizations: LocalizationMap) {
    return this.edit({ nameLocalizations });
  }

  setDescription(description: string) {
    return this.edit({ description });
  }

  setDescriptionLocalizations(descriptionLocalizations: LocalizationMap) {
    return this.edit({ descriptionLocalizations });
  }

  /* eslint-disable max-len */
  /**
   * Edits the default permission of this ApplicationCommand
   * @param {boolean} [defaultPermission=true] The default permission for this command
   * @returns {Promise<ApplicationCommand>}
   * @deprecated Use {@link ApplicationCommand#setDefaultMemberPermissions} and {@link ApplicationCommand#setDMPermission} instead.
   */
  setDefaultPermission(defaultPermission = true) {
    return this.edit({ defaultPermission });
  }
  /* eslint-enable max-len */

  setDefaultMemberPermissions(defaultMemberPermissions: PermissionResolvable | null) {
    return this.edit({ defaultMemberPermissions });
  }

  setDMPermission(dmPermission = true) {
    return this.edit({ dmPermission });
  }

  setOptions(options: ApplicationCommandOptionData[]) {
    return this.edit({ options });
  }

  delete() {
    return this.manager.delete(this, this.guildId ?? undefined);
  }

  equals(command: ApplicationCommand | ApplicationCommandComparable, enforceOptionOrder = false) {
    // If given an id, check if the id matches
    if (command.id && this.id !== command.id) return false;

    let defaultMemberPermissions = null;
    let dmPermission = command.dmPermission ?? ('dm_permission' in command ? command.dm_permission : undefined);

    if ('default_member_permissions' in command) {
      defaultMemberPermissions = command.default_member_permissions
        ? new Permissions(BigInt(command.default_member_permissions)).bitfield
        : null;
    }

    if ('defaultMemberPermissions' in command) {
      defaultMemberPermissions =
        command.defaultMemberPermissions !== null ? new Permissions(command.defaultMemberPermissions).bitfield : null;
    }

    // Check top level parameters
    const commandType =
      typeof command.type === 'string'
        ? command.type
        : typeof command.type === 'number'
          ? ApplicationCommandTypes[command.type]
          : undefined;
    if (
      command.name !== this.name ||
      ('description' in command && command.description !== this.description) ||
      ('version' in command && command.version !== this.version) ||
      ('autocomplete' in command && command.autocomplete !== this.autocomplete) ||
      (commandType && commandType !== this.type) ||
      defaultMemberPermissions !== (this.defaultMemberPermissions?.bitfield ?? null) ||
      (typeof dmPermission !== 'undefined' && dmPermission !== this.dmPermission) ||
      // Future proof for options being nullable
      // TODO: remove ?? 0 on each when nullable
      (command.options?.length ?? 0) !== (this.options?.length ?? 0) ||
      (command.defaultPermission ?? command.default_permission ?? true) !== this.defaultPermission
    ) {
      return false;
    }

    if (command.options) {
      return ApplicationCommand.optionsEqual(this.options, command.options, enforceOptionOrder);
    }
    return true;
  }

  static optionsEqual(
    existing: ApplicationCommandOptionSource[],
    options: ApplicationCommandOptionSource[],
    enforceOptionOrder = false,
  ): boolean {
    if (existing.length !== options.length) return false;
    if (enforceOptionOrder) {
      return existing.every((option, index) => this._optionEquals(option, options[index], enforceOptionOrder));
    }
    const newOptions = new Map(options.map(option => [option.name, option]));
    for (const option of existing) {
      const foundOption = newOptions.get(option.name);
      if (!foundOption || !this._optionEquals(option, foundOption)) return false;
    }
    return true;
  }

  static _optionEquals(
    existing: ApplicationCommandOptionSource,
    option: ApplicationCommandOptionSource,
    enforceOptionOrder = false,
  ): boolean {
    const optionType = typeof option.type === 'string' ? option.type : ApplicationCommandOptionTypes[option.type];
    if (
      option.name !== existing.name ||
      optionType !== existing.type ||
      option.description !== existing.description ||
      option.autocomplete !== existing.autocomplete ||
      (option.required ?? (['SUB_COMMAND', 'SUB_COMMAND_GROUP'].includes(optionType) ? undefined : false)) !==
        existing.required ||
      option.choices?.length !== existing.choices?.length ||
      option.options?.length !== existing.options?.length ||
      (option.channelTypes ?? option.channel_types)?.length !== existing.channelTypes?.length ||
      (option.minValue ?? option.min_value) !== existing.minValue ||
      (option.maxValue ?? option.max_value) !== existing.maxValue ||
      (option.minLength ?? option.min_length) !== existing.minLength ||
      (option.maxLength ?? option.max_length) !== existing.maxLength
    ) {
      return false;
    }

    if (existing.choices) {
      if (
        enforceOptionOrder &&
        !existing.choices.every(
          (choice, index) =>
            choice.name === option.choices?.[index]?.name && choice.value === option.choices?.[index]?.value,
        )
      ) {
        return false;
      }
      if (!enforceOptionOrder) {
        const newChoices = new Map(option.choices?.map(choice => [choice.name, choice]));
        for (const choice of existing.choices) {
          const foundChoice = newChoices.get(choice.name);
          if (!foundChoice || foundChoice.value !== choice.value) return false;
        }
      }
    }

    if (existing.channelTypes) {
      const newTypes: (string | number)[] = (option.channelTypes ?? option.channel_types ?? []).map(type =>
        typeof type === 'number' ? ChannelTypes[type] : type,
      );
      for (const type of existing.channelTypes) {
        if (!newTypes.includes(type)) return false;
      }
    }

    if (existing.options) {
      return this.optionsEqual(existing.options, option.options ?? [], enforceOptionOrder);
    }
    return true;
  }

  static transformOption(option: ApplicationCommandOptionSource, received: true): ApplicationCommandOptionSource;
  static transformOption(option: ApplicationCommandOptionSource, received?: false): Record<string, unknown>;
  static transformOption(
    option: ApplicationCommandOptionSource,
    received: boolean,
  ): ApplicationCommandOptionSource | Record<string, unknown>;
  static transformOption(
    option: ApplicationCommandOptionSource,
    received = false,
  ): ApplicationCommandOptionSource | Record<string, unknown> {
    const stringType = typeof option.type === 'string' ? option.type : ApplicationCommandOptionTypes[option.type];
    const channelTypesKey = received ? 'channelTypes' : 'channel_types';
    const minValueKey = received ? 'minValue' : 'min_value';
    const maxValueKey = received ? 'maxValue' : 'max_value';
    const minLengthKey = received ? 'minLength' : 'min_length';
    const maxLengthKey = received ? 'maxLength' : 'max_length';
    const nameLocalizationsKey = received ? 'nameLocalizations' : 'name_localizations';
    const nameLocalizedKey = received ? 'nameLocalized' : 'name_localized';
    const descriptionLocalizationsKey = received ? 'descriptionLocalizations' : 'description_localizations';
    const descriptionLocalizedKey = received ? 'descriptionLocalized' : 'description_localized';
    return {
      type: typeof option.type === 'number' && !received ? option.type : ApplicationCommandOptionTypes[option.type],
      name: option.name,
      [nameLocalizationsKey]: option.nameLocalizations ?? option.name_localizations,
      [nameLocalizedKey]: option.nameLocalized ?? option.name_localized,
      description: option.description,
      [descriptionLocalizationsKey]: option.descriptionLocalizations ?? option.description_localizations,
      [descriptionLocalizedKey]: option.descriptionLocalized ?? option.description_localized,
      required:
        option.required ?? (stringType === 'SUB_COMMAND' || stringType === 'SUB_COMMAND_GROUP' ? undefined : false),
      autocomplete: option.autocomplete,
      choices: option.choices?.map(choice => ({
        name: choice.name,
        [nameLocalizedKey]: choice.nameLocalized ?? choice.name_localized,
        [nameLocalizationsKey]: choice.nameLocalizations ?? choice.name_localizations,
        value: choice.value,
      })),
      options: option.options?.map(o => this.transformOption(o, received)),
      [channelTypesKey]: received
        ? option.channel_types?.map(type => ChannelTypes[type])
        : (option.channelTypes?.map(type => (typeof type === 'string' ? ChannelTypes[type] : type)) ??
          // When transforming to API data, accept API data
          option.channel_types),
      [minValueKey]: option.minValue ?? option.min_value,
      [maxValueKey]: option.maxValue ?? option.max_value,
      [minLengthKey]: option.minLength ?? option.min_length,
      [maxLengthKey]: option.maxLength ?? option.max_length,
    };
  }
}

export default ApplicationCommand;
export { ApplicationCommand };

/* eslint-disable max-len */
