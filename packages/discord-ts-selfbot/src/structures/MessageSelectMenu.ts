import BaseMessageComponent from './BaseMessageComponent';
import _ConstantsModule from '../util/Constants';
const { ChannelTypes, MessageComponentTypes } = _ConstantsModule;
import Util from '../util/Util';
import type { MessageSelectOption } from '../../typings';

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

/**
 * Represents a select menu message component
 * @extends {BaseMessageComponent}
 */
class MessageSelectMenu extends BaseMessageComponent {
  declare channelTypes: import('../../typings/enums').ChannelTypes[];
  declare customId: string | null;
  declare disabled: boolean;
  declare maxValues: number | null;
  declare minValues: number | null;
  declare options: import('../../typings').MessageSelectOption[];
  declare placeholder: string | null;
  /**
   * @typedef {BaseMessageComponentOptions} MessageSelectMenuOptions
   * @property {string} [customId] A unique string to be sent in the interaction when clicked
   * @property {string} [placeholder] Custom placeholder text to display when nothing is selected
   * @property {number} [minValues] The minimum number of selections required
   * @property {number} [maxValues] The maximum number of selections allowed
   * @property {MessageSelectOption[]} [options] Options for the select menu
   * @property {boolean} [disabled=false] Disables the select menu to prevent interactions
   * @property {ChannelType[]} [channelTypes] List of channel types to include in the ChannelSelect component
   */

  /**
   * @typedef {Object} MessageSelectOption
   * @property {string} label The text to be displayed on this option
   * @property {string} value The value to be sent for this option
   * @property {?string} description Optional description to show for this option
   * @property {?RawEmoji} emoji Emoji to display for this option
   * @property {boolean} default Render this option as the default selection
   */

  /**
   * @typedef {Object} MessageSelectOptionData
   * @property {string} label The text to be displayed on this option
   * @property {string} value The value to be sent for this option
   * @property {string} [description] Optional description to show for this option
   * @property {EmojiIdentifierResolvable} [emoji] Emoji to display for this option
   * @property {boolean} [default] Render this option as the default selection
   */

  /**
   * @param {MessageSelectMenu|MessageSelectMenuOptions} [data={}] MessageSelectMenu to clone or raw data
   */
  constructor(data: MessageSelectMenuData = {}) {
    super({ type: BaseMessageComponent.resolveType(data.type) ?? 'STRING_SELECT' });

    this.setup(data);
  }

  setup(data: MessageSelectMenuData) {
    super.setup(data);
    /**
     * A unique string to be sent in the interaction when clicked
     * @type {?string}
     */
    this.customId =
      ('custom_id' in data ? data.custom_id : undefined) ?? ('customId' in data ? data.customId : undefined) ?? null;

    /**
     * Custom placeholder text to display when nothing is selected
     * @type {?string}
     */
    this.placeholder = data.placeholder ?? null;

    /**
     * The minimum number of selections required
     * @type {?number}
     */
    this.minValues =
      ('min_values' in data ? data.min_values : undefined) ??
      ('minValues' in data ? data.minValues : undefined) ??
      null;

    /**
     * The maximum number of selections allowed
     * @type {?number}
     */
    this.maxValues =
      ('max_values' in data ? data.max_values : undefined) ??
      ('maxValues' in data ? data.maxValues : undefined) ??
      null;

    /**
     * Options for the STRING_SELECT menu
     * @type {MessageSelectOption[]}
     */
    this.options = MessageSelectMenu.normalizeOptions(...(data.options ?? []));

    /**
     * Whether this select menu is currently disabled
     * @type {boolean}
     */
    this.disabled = data.disabled ?? false;

    /**
     * Channels that are possible to select in CHANNEL_SELECT menu
     * @type {ChannelType[]}
     */
    const channelTypes =
      'channel_types' in data ? (data.channel_types ?? []) : 'channelTypes' in data ? (data.channelTypes ?? []) : [];
    this.channelTypes = channelTypes.map(channelType =>
      typeof channelType === 'string' ? channelType : ChannelTypes[channelType],
    );
  }

  /**
   * Transforms the select menu into a plain object
   * @returns {APIMessageSelectMenu} The raw data of this select menu
   */
  toJSON() {
    return {
      channel_types: this.channelTypes.map(type => (typeof type === 'string' ? ChannelTypes[type] : type)),
      custom_id: this.customId,
      disabled: this.disabled,
      placeholder: this.placeholder,
      min_values: this.minValues,
      max_values: this.maxValues ?? (this.minValues ? this.options.length : undefined),
      options: this.options,
      type: typeof this.type === 'string' ? MessageComponentTypes[this.type] : this.type,
    };
  }

  /**
   * Normalizes option input and resolves strings and emojis.
   * @param {MessageSelectOptionData} option The select menu option to normalize
   * @returns {MessageSelectOption}
   */
  static normalizeOption(option: MessageSelectOptionDataSource): MessageSelectOption {
    let { label, value, description, emoji } = option;

    label = Util.verifyString(label, RangeError, 'SELECT_OPTION_LABEL');
    value = Util.verifyString(value, RangeError, 'SELECT_OPTION_VALUE');
    const resolvedEmoji = emoji ? Util.resolvePartialEmoji(emoji) : null;
    description = description ? Util.verifyString(description, RangeError, 'SELECT_OPTION_DESCRIPTION', true) : null;

    return { label, value, description, emoji: resolvedEmoji, default: option.default ?? false };
  }

  /**
   * Normalizes option input and resolves strings and emojis.
   * @param {...MessageSelectOptionData|MessageSelectOptionData[]} options The select menu options to normalize
   * @returns {MessageSelectOption[]}
   */
  static normalizeOptions(
    ...options: (MessageSelectOptionDataSource | MessageSelectOptionDataSource[])[]
  ): MessageSelectOption[] {
    const flattened: MessageSelectOptionDataSource[] = [];
    for (const option of options) {
      if (Array.isArray(option)) flattened.push(...option);
      else flattened.push(option);
    }
    return flattened.map(option => this.normalizeOption(option));
  }
}

export default MessageSelectMenu;
export { MessageSelectMenu };
