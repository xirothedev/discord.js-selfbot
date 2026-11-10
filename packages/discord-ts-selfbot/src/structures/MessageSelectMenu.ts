import BaseMessageComponent from './BaseMessageComponent';
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';

const { ChannelTypes } = _ConstantsModule;
import { ChannelType, ComponentType } from 'discord-api-types/v10';
import type {
  APISelectMenuComponent,
  APISelectMenuOption,
} from 'discord-api-types/v10';

type PublicChannelType = ChannelTypesType;

const SELECT_MENU_TYPES: Record<string, APISelectMenuComponent['type']> = {
  CHANNEL_SELECT: ComponentType.ChannelSelect,
  MENTIONABLE_SELECT: ComponentType.MentionableSelect,
  ROLE_SELECT: ComponentType.RoleSelect,
  STRING_SELECT: ComponentType.StringSelect,
  USER_SELECT: ComponentType.UserSelect,
};

function isChannelType(value: unknown): value is ChannelType {
  return typeof value === 'number' && value in ChannelType;
}

function resolveChannelType(value: string | number): ChannelType | undefined {
  if (typeof value === 'number') {
    return isChannelType(value) ? value : undefined;
  }
  const resolved = resolveEnumValue(ChannelTypes, value);
  return typeof resolved === 'number' && isChannelType(resolved)
    ? resolved
    : undefined;
}

function isPublicChannelType(value: unknown): value is PublicChannelType {
  return typeof value === 'number' && value in ChannelType;
}

function resolvePublicChannelType(
  value: string | number
): PublicChannelType | undefined {
  const resolved = resolveEnumValue(ChannelTypes, value);
  return isPublicChannelType(resolved) ? resolved : undefined;
}

function serializeSelectOption(
  option: MessageSelectOption
): APISelectMenuOption {
  return {
    default: option.default,
    description: option.description ?? undefined,
    emoji: option.emoji
      ? {
          animated: option.emoji.animated,
          id: option.emoji.id ?? undefined,
          name: option.emoji.name ?? undefined,
        }
      : undefined,
    label: option.label,
    value: option.value,
  };
}
import Util from '../util/Util';
import type { MessageSelectOption } from '../../typings';
import type { ChannelTypes as ChannelTypesType } from '../../typings/enums';

interface MessageSelectOptionDataSource {
  label: string;
  value: string;
  description?: string | null;
  emoji?: unknown;
  default?: boolean;
}

interface MessageSelectMenuDataSource {
  type?: string | number;
  custom_id?: string;
  customId?: string;
  placeholder?: string;
  min_values?: number;
  minValues?: number;
  max_values?: number;
  maxValues?: number;
  options?: (MessageSelectOptionDataSource | MessageSelectOptionDataSource[])[];
  disabled?: boolean;
  channel_types?: (string | number)[];
  channelTypes?: (string | number)[];
}

type MessageSelectMenuData = MessageSelectMenu | MessageSelectMenuDataSource;

class MessageSelectMenu extends BaseMessageComponent {
  declare channelTypes: ChannelTypesType[];
  declare customId: string | null;
  declare disabled: boolean;
  declare maxValues: number | null;
  declare minValues: number | null;
  declare options: MessageSelectOption[];
  declare placeholder: string | null;

  constructor(data: MessageSelectMenuData = {}) {
    super({
      type:
        BaseMessageComponent.resolveType(data.type ?? undefined) ??
        'STRING_SELECT',
    });

    this.setup(data);
  }

  setup(data: MessageSelectMenuData) {
    super.setup(data);
    this.customId =
      ('custom_id' in data ? data.custom_id : undefined) ??
      ('customId' in data ? data.customId : undefined) ??
      null;

    this.placeholder = data.placeholder ?? null;

    this.minValues =
      ('min_values' in data ? data.min_values : undefined) ??
      ('minValues' in data ? data.minValues : undefined) ??
      null;

    this.maxValues =
      ('max_values' in data ? data.max_values : undefined) ??
      ('maxValues' in data ? data.maxValues : undefined) ??
      null;

    this.options = MessageSelectMenu.normalizeOptions(...(data.options ?? []));

    this.disabled = data.disabled ?? false;

    let channelTypes: (string | number)[] = [];
    if ('channel_types' in data) {
      channelTypes = data.channel_types ?? [];
    } else if ('channelTypes' in data) {
      channelTypes = data.channelTypes ?? [];
    }
    this.channelTypes = channelTypes
      .map(resolvePublicChannelType)
      .filter(
        (channelType): channelType is PublicChannelType =>
          channelType !== undefined
      );
  }

  toJSON(): APISelectMenuComponent {
    const type = this.type
      ? (SELECT_MENU_TYPES[this.type] ?? ComponentType.StringSelect)
      : ComponentType.StringSelect;
    const common = {
      custom_id: this.customId ?? '',
      disabled: this.disabled,
      max_values:
        this.maxValues ?? (this.minValues ? this.options.length : undefined),
      min_values: this.minValues ?? undefined,
      placeholder: this.placeholder ?? undefined,
    };

    switch (type) {
      case ComponentType.StringSelect: {
        return {
          ...common,
          options: this.options.map(serializeSelectOption),
          type,
        };
      }
      case ComponentType.ChannelSelect: {
        return {
          ...common,
          channel_types: this.channelTypes
            .map(resolveChannelType)
            .filter(
              (channelType): channelType is ChannelType =>
                channelType !== undefined
            ),
          type,
        };
      }
      default: {
        return { ...common, type };
      }
    }
  }

  static normalizeOption(
    option: MessageSelectOptionDataSource
  ): MessageSelectOption {
    const { emoji } = option;
    let { label, value, description } = option;

    label = Util.verifyString(label, RangeError, 'SELECT_OPTION_LABEL');
    value = Util.verifyString(value, RangeError, 'SELECT_OPTION_VALUE');
    const resolvedEmoji = emoji ? Util.resolvePartialEmoji(emoji) : null;
    description = description
      ? Util.verifyString(
          description,
          RangeError,
          'SELECT_OPTION_DESCRIPTION',
          true
        )
      : null;

    return {
      default: option.default ?? false,
      description,
      emoji: resolvedEmoji,
      label,
      value,
    };
  }

  static normalizeOptions(
    ...options: (
      | MessageSelectOptionDataSource
      | MessageSelectOptionDataSource[]
    )[]
  ): MessageSelectOption[] {
    const flattened: MessageSelectOptionDataSource[] = [];
    for (const option of options) {
      if (Array.isArray(option)) {
        flattened.push(...option);
      } else {
        flattened.push(option);
      }
    }
    return flattened.map((option) => this.normalizeOption(option));
  }
}

export default MessageSelectMenu;
export { MessageSelectMenu };
