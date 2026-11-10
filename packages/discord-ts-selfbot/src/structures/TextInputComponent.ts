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
import { ComponentType, TextInputStyle } from 'discord-api-types/v10';
import type { APITextInputComponent } from 'discord-api-types/v10';
import type { TextInputStyle as TextInputStyleType } from '../../typings';

function isTextInputStyle(value: unknown): value is TextInputStyleType {
  return typeof value === 'string' && value in TextInputStyles;
}

class TextInputComponent extends BaseMessageComponent {
  declare customId: string | null;
  declare label: string | null;
  declare maxLength: number | null;
  declare minLength: number | null;
  declare placeholder: string | null;
  declare required: boolean;
  declare style: TextInputStyleType | null;
  declare value: string | null;

  constructor(data: unknown = {}) {
    super({ type: 'TEXT_INPUT' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.customId =
      readComponentString(source, 'custom_id', 'customId') ?? null;

    this.label = readComponentString(source, 'label') ?? null;

    this.maxLength =
      readComponentNumber(source, 'max_length', 'maxLength') ?? null;

    this.minLength =
      readComponentNumber(source, 'min_length', 'minLength') ?? null;

    this.placeholder = readComponentString(source, 'placeholder') ?? null;

    this.required = readComponentBoolean(source, 'required') ?? false;

    const { style } = source;
    this.style =
      typeof style === 'string' || typeof style === 'number'
        ? (TextInputComponent.resolveStyle(style) ?? null)
        : null;

    this.value = readComponentString(source, 'value') ?? null;
  }

  setValue(value: string) {
    this.value = Util.verifyString(value, RangeError, 'TEXT_INPUT_VALUE');
    return this;
  }

  toJSON(): APITextInputComponent {
    return {
      custom_id: this.customId ?? '',
      label: this.label ?? undefined,
      max_length: this.maxLength ?? undefined,
      min_length: this.minLength ?? undefined,
      placeholder: this.placeholder ?? undefined,
      required: this.required,
      style:
        this.style === 'PARAGRAPH'
          ? TextInputStyle.Paragraph
          : TextInputStyle.Short,
      type: ComponentType.TextInput,
      value: this.value ?? undefined,
    };
  }

  static resolveStyle(
    style: string | number | undefined
  ): TextInputStyleType | undefined {
    if (typeof style === 'number') {
      const name = TextInputStyles[style];
      return isTextInputStyle(name) ? name : undefined;
    }
    return isTextInputStyle(style) ? style : undefined;
  }
}

export default TextInputComponent;
export { TextInputComponent };
