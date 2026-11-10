import BaseMessageComponent, {
  isComponentDataSource,
  readComponentBoolean,
  readComponentNumber,
  readComponentString,
} from './BaseMessageComponent';
import _errorsModule from '../errors';
const { RangeError } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { TextInputStyles } = _ConstantsModule;
import Util from '../util/Util';
import { ComponentType, TextInputStyle, type APITextInputComponent } from 'discord-api-types/v10';

function isTextInputStyle(value: unknown): value is import('../../typings').TextInputStyle {
  return typeof value === 'string' && value in TextInputStyles;
}

/**
 * Represents a text input component in a modal
 * @extends {BaseMessageComponent}
 */

class TextInputComponent extends BaseMessageComponent {
  declare customId: string | null;
  declare label: string | null;
  declare maxLength: number | null;
  declare minLength: number | null;
  declare placeholder: string | null;
  declare required: boolean;
  declare style: import('../../typings').TextInputStyle | null;
  declare value: string | null;
  /**
   * @typedef {BaseMessageComponentOptions} TextInputComponentOptions
   * @property {string} [customId] A unique string to be sent in the interaction when submitted
   * @property {string} [label] The text to be displayed above this text input component
   * @property {number} [maxLength] Maximum length of text that can be entered
   * @property {number} [minLength] Minimum length of text required to be entered
   * @property {string} [placeholder] Custom placeholder text to display when no text is entered
   * @property {boolean} [required] Whether or not this text input component is required
   * @property {TextInputStyleResolvable} [style] The style of this text input component
   * @property {string} [value] Value of this text input component
   */

  /**
   * @param {TextInputComponent|TextInputComponentOptions} [data={}] TextInputComponent to clone or raw data
   */
  constructor(data: unknown = {}) {
    super({ type: 'TEXT_INPUT' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    /**
     * A unique string to be sent in the interaction when submitted
     * @type {?string}
     */
    this.customId = readComponentString(source, 'custom_id', 'customId') ?? null;

    /**
     * The text to be displayed above this text input component
     * @type {?string}
     */
    this.label = readComponentString(source, 'label') ?? null;

    /**
     * Maximum length of text that can be entered
     * @type {?number}
     */
    this.maxLength = readComponentNumber(source, 'max_length', 'maxLength') ?? null;

    /**
     * Minimum length of text required to be entered
     * @type {?string}
     */
    this.minLength = readComponentNumber(source, 'min_length', 'minLength') ?? null;

    /**
     * Custom placeholder text to display when no text is entered
     * @type {?string}
     */
    this.placeholder = readComponentString(source, 'placeholder') ?? null;

    /**
     * Whether or not this text input component is required
     * @type {?boolean}
     */
    this.required = readComponentBoolean(source, 'required') ?? false;

    /**
     * The style of this text input component
     * @type {?TextInputStyle}
     */
    const style = source.style;
    this.style =
      typeof style === 'string' || typeof style === 'number' ? (TextInputComponent.resolveStyle(style) ?? null) : null;

    /**
     * Value of this text input component
     * @type {?string}
     */
    this.value = readComponentString(source, 'value') ?? null;
  }

  /**
   * Sets the value of this text input component
   * @param {string} value Value of this text input component
   * @returns {TextInputComponent}
   */
  setValue(value: string) {
    this.value = Util.verifyString(value, RangeError, 'TEXT_INPUT_VALUE');
    return this;
  }

  /**
   * Transforms the text input component into a plain object
   * @returns {APITextInput} The raw data of this text input component
   */
  toJSON(): APITextInputComponent {
    return {
      custom_id: this.customId ?? '',
      label: this.label ?? undefined,
      max_length: this.maxLength ?? undefined,
      min_length: this.minLength ?? undefined,
      placeholder: this.placeholder ?? undefined,
      required: this.required,
      style: this.style === 'PARAGRAPH' ? TextInputStyle.Paragraph : TextInputStyle.Short,
      type: ComponentType.TextInput,
      value: this.value ?? undefined,
    };
  }

  /**
   * Data that can be resolved to a TextInputStyle. This can be
   * * TextInputStyle
   * * number
   * @typedef {number|TextInputStyle} TextInputStyleResolvable
   */

  /**
   * Resolves the style of a text input component
   * @param {TextInputStyleResolvable} style The style to resolve
   * @returns {TextInputStyle}
   * @private
   */
  static resolveStyle(style: string | number | undefined): import('../../typings').TextInputStyle | undefined {
    if (typeof style === 'number') {
      const name = TextInputStyles[style];
      return isTextInputStyle(name) ? name : undefined;
    }
    return isTextInputStyle(style) ? style : undefined;
  }
}

export default TextInputComponent;
export { TextInputComponent };
