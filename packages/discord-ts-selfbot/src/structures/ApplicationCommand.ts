import Base, { patchValue } from "./Base";
import ApplicationCommandPermissionsManager from "../managers/ApplicationCommandPermissionsManager";
import _ConstantsModule from "../util/Constants";

const { ApplicationCommandOptionTypes, ApplicationCommandTypes, ChannelTypes } =
  _ConstantsModule;
import Permissions from "../util/Permissions";
import SnowflakeUtil from "../util/SnowflakeUtil";
import type {
  ChannelType,
  LocalizationMap,
  Snowflake,
} from "discord-api-types/v10";
import type {
  ApplicationCommandData,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionResolvable,
} from "../../typings";
import type { RawApplicationCommandData } from "../../typings/rawDataTypes";
import type { Guild } from "./Guild";
import type Client from "../client/Client";

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
    client: Client,
    data: RawApplicationCommandData,
    guild: Guild | null,
    guildId: Snowflake | null = null
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
    if (data.name !== undefined) {
      this.name = data.name;
    }

    this.nameLocalizations = patchValue(
      data.name_localizations,
      this.nameLocalizations
    );
    this.nameLocalized = patchValue(data.name_localized, this.nameLocalized);

    if (data.description !== undefined) {
      this.description = data.description;
    }

    this.descriptionLocalizations = patchValue(
      data.description_localizations,
      this.descriptionLocalizations
    );
    this.descriptionLocalized = patchValue(
      data.description_localized,
      this.descriptionLocalized
    );
    this.options =
      "options" in data
        ? (data.options ?? []).map((option) =>
            ApplicationCommand.transformOption(option, true)
          )
        : (this.options ?? []);

    if ("default_permission" in data) {
      /**
       * Whether the command is enabled by default when the app is added to a guild
       * @type {boolean}
       * @deprecated Use {@link ApplicationCommand.defaultMemberPermissions} and {@link ApplicationCommand.dmPermission} instead.
       */
      this.defaultPermission = data.default_permission ?? false;
    }

    if ("default_member_permissions" in data) {
      this.defaultMemberPermissions = data.default_member_permissions
        ? new Permissions(BigInt(data.default_member_permissions)).freeze()
        : null;
    } else {
      this.defaultMemberPermissions ??= null;
    }

    this.dmPermission = patchValue(data.dm_permission, this.dmPermission);

    if (data.version !== undefined) {
      this.version = data.version;
    }
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  get manager() {
    if (!this.client.application) {
      throw new Error("CLIENT_NOT_READY");
    }
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

  /**
   * Edits the default permission of this ApplicationCommand
   * @param {boolean} [defaultPermission=true] The default permission for this command
   * @returns {Promise<ApplicationCommand>}
   * @deprecated Use {@link ApplicationCommand#setDefaultMemberPermissions} and {@link ApplicationCommand#setDMPermission} instead.
   */
  setDefaultPermission(defaultPermission = true) {
    return this.edit({ defaultPermission });
  }

  setDefaultMemberPermissions(
    defaultMemberPermissions: PermissionResolvable | null
  ) {
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

  equals(
    command: ApplicationCommand | ApplicationCommandComparable,
    enforceOptionOrder = false
  ) {
    // If given an id, check if the id matches
    if (command.id && this.id !== command.id) {
      return false;
    }

    const defaultMemberPermissions =
      ApplicationCommand.resolveDefaultMemberPermissions(command);
    const dmPermission =
      command.dmPermission ??
      ("dm_permission" in command ? command.dm_permission : undefined);
    const commandType = ApplicationCommand.resolveComparableType(command);

    // Check top level parameters
    if (
      !ApplicationCommand.topLevelPropertiesEqual(
        this,
        command,
        commandType,
        dmPermission,
        defaultMemberPermissions
      )
    ) {
      return false;
    }

    if (command.options) {
      return ApplicationCommand.optionsEqual(
        this.options,
        command.options,
        enforceOptionOrder
      );
    }
    return true;
  }

  static topLevelPropertiesEqual(
    self: ApplicationCommand,
    command: ApplicationCommand | ApplicationCommandComparable,
    commandType: string | undefined,
    dmPermission: boolean | null | undefined,
    defaultMemberPermissions: bigint | number | null
  ) {
    return (
      !ApplicationCommand.coreFieldsDiffer(self, command, commandType) &&
      !ApplicationCommand.permissionFieldsDiffer(
        self,
        command,
        dmPermission,
        defaultMemberPermissions
      )
    );
  }

  static coreFieldsDiffer(
    self: ApplicationCommand,
    command: ApplicationCommand | ApplicationCommandComparable,
    commandType: string | undefined
  ) {
    return (
      command.name !== self.name ||
      ("description" in command && command.description !== self.description) ||
      ("version" in command && command.version !== self.version) ||
      ("autocomplete" in command &&
        command.autocomplete !== self.autocomplete) ||
      Boolean(commandType && commandType !== self.type)
    );
  }

  static permissionFieldsDiffer(
    self: ApplicationCommand,
    command: ApplicationCommand | ApplicationCommandComparable,
    dmPermission: boolean | null | undefined,
    defaultMemberPermissions: bigint | number | null
  ) {
    return (
      defaultMemberPermissions !==
        (self.defaultMemberPermissions?.bitfield ?? null) ||
      (dmPermission !== undefined && dmPermission !== self.dmPermission) ||
      // Options may become nullable; keep the ?? 0 fallbacks until then.
      (command.options?.length ?? 0) !== (self.options?.length ?? 0) ||
      (command.defaultPermission ?? command.default_permission ?? true) !==
        self.defaultPermission
    );
  }

  static resolveComparableType(
    command: ApplicationCommand | ApplicationCommandComparable
  ) {
    let resolvedType;
    if (typeof command.type === "string") {
      resolvedType = command.type;
    } else if (typeof command.type === "number") {
      resolvedType = ApplicationCommandTypes[command.type];
    }
    return resolvedType;
  }

  static resolveDefaultMemberPermissions(
    command: ApplicationCommand | ApplicationCommandComparable
  ) {
    let defaultMemberPermissions = null;

    if ("default_member_permissions" in command) {
      defaultMemberPermissions = command.default_member_permissions
        ? new Permissions(BigInt(command.default_member_permissions)).bitfield
        : null;
    }

    if ("defaultMemberPermissions" in command) {
      defaultMemberPermissions =
        command.defaultMemberPermissions === null
          ? null
          : new Permissions(command.defaultMemberPermissions).bitfield;
    }

    return defaultMemberPermissions;
  }

  static optionsEqual(
    existing: ApplicationCommandOptionSource[],
    options: ApplicationCommandOptionSource[],
    enforceOptionOrder = false
  ): boolean {
    if (existing.length !== options.length) {
      return false;
    }
    if (enforceOptionOrder) {
      return existing.every((option, index) =>
        this._optionEquals(option, options[index], enforceOptionOrder)
      );
    }
    const newOptions = new Map(options.map((option) => [option.name, option]));
    for (const option of existing) {
      const foundOption = newOptions.get(option.name);
      if (!foundOption || !this._optionEquals(option, foundOption)) {
        return false;
      }
    }
    return true;
  }

  static _optionEquals(
    existing: ApplicationCommandOptionSource,
    option: ApplicationCommandOptionSource,
    enforceOptionOrder = false
  ): boolean {
    const optionType =
      typeof option.type === "string"
        ? option.type
        : ApplicationCommandOptionTypes[option.type];
    if (
      !ApplicationCommand._optionPropertiesEqual(existing, option, optionType)
    ) {
      return false;
    }

    if (
      !ApplicationCommand._optionChoicesEqual(
        existing,
        option,
        enforceOptionOrder
      )
    ) {
      return false;
    }

    if (!ApplicationCommand._optionChannelTypesEqual(existing, option)) {
      return false;
    }

    if (existing.options) {
      return this.optionsEqual(
        existing.options,
        option.options ?? [],
        enforceOptionOrder
      );
    }
    return true;
  }

  static _optionPropertiesEqual(
    existing: ApplicationCommandOptionSource,
    option: ApplicationCommandOptionSource,
    optionType: string
  ) {
    return (
      !ApplicationCommand._optionBasicsDiffer(existing, option, optionType) &&
      !ApplicationCommand._optionBoundsDiffer(existing, option)
    );
  }

  static _optionBasicsDiffer(
    existing: ApplicationCommandOptionSource,
    option: ApplicationCommandOptionSource,
    optionType: string
  ) {
    return (
      option.name !== existing.name ||
      optionType !== existing.type ||
      option.description !== existing.description ||
      option.autocomplete !== existing.autocomplete ||
      (option.required ??
        (["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(optionType)
          ? undefined
          : false)) !== existing.required
    );
  }

  static _optionBoundsDiffer(
    existing: ApplicationCommandOptionSource,
    option: ApplicationCommandOptionSource
  ) {
    return (
      option.choices?.length !== existing.choices?.length ||
      option.options?.length !== existing.options?.length ||
      (option.channelTypes ?? option.channel_types)?.length !==
        existing.channelTypes?.length ||
      (option.minValue ?? option.min_value) !== existing.minValue ||
      (option.maxValue ?? option.max_value) !== existing.maxValue ||
      (option.minLength ?? option.min_length) !== existing.minLength ||
      (option.maxLength ?? option.max_length) !== existing.maxLength
    );
  }

  static _optionChoicesEqual(
    existing: ApplicationCommandOptionSource,
    option: ApplicationCommandOptionSource,
    enforceOptionOrder: boolean
  ): boolean {
    if (!existing.choices) {
      return true;
    }

    if (
      enforceOptionOrder &&
      !existing.choices.every(
        (choice, index) =>
          choice.name === option.choices?.[index]?.name &&
          choice.value === option.choices?.[index]?.value
      )
    ) {
      return false;
    }

    if (!enforceOptionOrder) {
      const newChoices = new Map(
        option.choices?.map((choice) => [choice.name, choice])
      );
      for (const choice of existing.choices) {
        const foundChoice = newChoices.get(choice.name);
        if (!foundChoice || foundChoice.value !== choice.value) {
          return false;
        }
      }
    }

    return true;
  }

  static _optionChannelTypesEqual(
    existing: ApplicationCommandOptionSource,
    option: ApplicationCommandOptionSource
  ): boolean {
    if (!existing.channelTypes) {
      return true;
    }

    const newTypes: (string | number)[] = (
      option.channelTypes ??
      option.channel_types ??
      []
    ).map((type) => (typeof type === "number" ? ChannelTypes[type] : type));
    for (const type of existing.channelTypes) {
      if (!newTypes.includes(type)) {
        return false;
      }
    }
    return true;
  }

  static resolveRequiredValue(
    option: ApplicationCommandOptionSource,
    stringType: string
  ) {
    return (
      option.required ??
      (["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(stringType)
        ? undefined
        : false)
    );
  }

  static resolveChannelTypesValue(
    option: ApplicationCommandOptionSource,
    received: boolean
  ) {
    if (received) {
      return option.channel_types?.map((type) => ChannelTypes[type]);
    }
    return (
      option.channelTypes?.map((type) =>
        typeof type === "string" ? ChannelTypes[type] : type
      ) ??
      // When transforming to API data, accept API data
      option.channel_types
    );
  }

  static transformOptionKeys(received: boolean) {
    return {
      channelTypesKey: received ? "channelTypes" : "channel_types",
      descriptionLocalizationsKey: received
        ? "descriptionLocalizations"
        : "description_localizations",
      descriptionLocalizedKey: received
        ? "descriptionLocalized"
        : "description_localized",
      maxLengthKey: received ? "maxLength" : "max_length",
      maxValueKey: received ? "maxValue" : "max_value",
      minLengthKey: received ? "minLength" : "min_length",
      minValueKey: received ? "minValue" : "min_value",
      nameLocalizationsKey: received
        ? "nameLocalizations"
        : "name_localizations",
      nameLocalizedKey: received ? "nameLocalized" : "name_localized",
    };
  }

  static transformOption(
    option: ApplicationCommandOptionSource,
    received: true
  ): ApplicationCommandOptionSource;
  static transformOption(
    option: ApplicationCommandOptionSource,
    received?: false
  ): Record<string, unknown>;
  static transformOption(
    option: ApplicationCommandOptionSource,
    received: boolean
  ): ApplicationCommandOptionSource | Record<string, unknown>;
  static transformOption(
    option: ApplicationCommandOptionSource,
    received = false
  ): ApplicationCommandOptionSource | Record<string, unknown> {
    const stringType =
      typeof option.type === "string"
        ? option.type
        : ApplicationCommandOptionTypes[option.type];
    const {
      channelTypesKey,
      descriptionLocalizationsKey,
      descriptionLocalizedKey,
      maxLengthKey,
      maxValueKey,
      minLengthKey,
      minValueKey,
      nameLocalizationsKey,
      nameLocalizedKey,
    } = ApplicationCommand.transformOptionKeys(received);
    return {
      autocomplete: option.autocomplete,
      choices: option.choices?.map((choice) => ({
        name: choice.name,
        [nameLocalizedKey]: choice.nameLocalized ?? choice.name_localized,
        [nameLocalizationsKey]:
          choice.nameLocalizations ?? choice.name_localizations,
        value: choice.value,
      })),
      description: option.description,
      [descriptionLocalizationsKey]:
        option.descriptionLocalizations ?? option.description_localizations,
      [descriptionLocalizedKey]:
        option.descriptionLocalized ?? option.description_localized,
      name: option.name,
      [nameLocalizationsKey]:
        option.nameLocalizations ?? option.name_localizations,
      [nameLocalizedKey]: option.nameLocalized ?? option.name_localized,
      options: option.options?.map((o) => this.transformOption(o, received)),
      required: ApplicationCommand.resolveRequiredValue(option, stringType),
      type:
        typeof option.type === "number" && !received
          ? option.type
          : ApplicationCommandOptionTypes[option.type],
      [channelTypesKey]: ApplicationCommand.resolveChannelTypesValue(
        option,
        received
      ),
      [minValueKey]: option.minValue ?? option.min_value,
      [maxValueKey]: option.maxValue ?? option.max_value,
      [minLengthKey]: option.minLength ?? option.min_length,
      [maxLengthKey]: option.maxLength ?? option.max_length,
    };
  }
}

export default ApplicationCommand;
export { ApplicationCommand };
