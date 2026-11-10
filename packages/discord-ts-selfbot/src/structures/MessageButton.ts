import BaseMessageComponent from './BaseMessageComponent';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import type {
  APIButtonComponent,
  APIMessageComponentEmoji,
  APIPartialEmoji,
} from 'discord-api-types/v10';
import _errorsModule from '../errors';

const { RangeError } = _errorsModule;
import _ConstantsModule from '../util/Constants';

const { MessageButtonStyles } = _ConstantsModule;
import Util from '../util/Util';
import type {
  EmojiIdentifierResolvable,
  MessageButtonOptions,
  MessageButtonStyle,
  MessageButtonStyleResolvable,
} from '../../typings';

interface MessageButtonInput {
  label?: string | null;
  customId?: string | null;
  custom_id?: string | null;
  style?: MessageButtonStyleResolvable | ButtonStyle | null;
  emoji?:
    | EmojiIdentifierResolvable
    | APIPartialEmoji
    | APIMessageComponentEmoji
    | null;
  url?: string | null;
  disabled?: boolean;
}

class MessageButton extends BaseMessageComponent {
  declare customId: string | null;
  declare disabled: boolean;
  declare emoji: APIPartialEmoji | null;
  declare label: string | null;
  declare style: MessageButtonStyle | null;
  declare type: 'BUTTON';
  declare url: string | null;

  constructor(
    data:
      | MessageButton
      | MessageButtonOptions
      | APIButtonComponent
      | MessageButtonInput = {}
  ) {
    super({ type: 'BUTTON' });

    this.setup(data);
  }

  setup(data: MessageButtonInput) {
    super.setup(data);
    this.label = data.label ?? null;

    this.customId = data.custom_id ?? data.customId ?? null;

    this.style = data.style ? MessageButton.resolveStyle(data.style) : null;

    this.emoji = data.emoji ? Util.resolvePartialEmoji(data.emoji) : null;

    this.url = data.url ?? null;

    this.disabled = data.disabled ?? false;
  }

  setCustomId(customId: string) {
    this.customId = Util.verifyString(customId, RangeError, 'BUTTON_CUSTOM_ID');
    return this;
  }

  setDisabled(disabled = true) {
    this.disabled = disabled;
    return this;
  }

  setEmoji(emoji: EmojiIdentifierResolvable) {
    this.emoji = Util.resolvePartialEmoji(emoji);
    return this;
  }

  setLabel(label: string) {
    this.label = Util.verifyString(label, RangeError, 'BUTTON_LABEL');
    return this;
  }

  setStyle(style: MessageButtonStyleResolvable) {
    this.style = MessageButton.resolveStyle(style);
    return this;
  }

  setURL(url: string) {
    this.url = Util.verifyString(url, RangeError, 'BUTTON_URL');
    return this;
  }

  toJSON(): APIButtonComponent {
    const base: {
      disabled: boolean;
      emoji?: APIMessageComponentEmoji;
      label?: string;
      type: ComponentType.Button;
    } = {
      disabled: this.disabled,
      emoji: this.emoji
        ? {
            animated: this.emoji.animated,
            id: this.emoji.id ?? undefined,
            name: this.emoji.name ?? undefined,
          }
        : undefined,
      label: this.label ?? undefined,
      type: ComponentType.Button,
    };
    if (this.style === 'LINK') {
      return { ...base, style: ButtonStyle.Link, url: this.url ?? '' };
    }
    return {
      ...base,
      custom_id: this.customId ?? '',
      style: this.style
        ? MessageButtonStyles[this.style]
        : ButtonStyle.Secondary,
    };
  }

  static resolveStyle(
    style: MessageButtonStyleResolvable | ButtonStyle
  ): MessageButtonStyle {
    return typeof style === 'string' ? style : MessageButtonStyles[style];
  }
}

export default MessageButton;
export { MessageButton };
