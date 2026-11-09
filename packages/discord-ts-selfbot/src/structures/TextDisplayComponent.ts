import BaseMessageComponent from './BaseMessageComponent';
import _ConstantsModule from '../util/Constants';
const { MessageComponentTypes } = _ConstantsModule;

class TextDisplayComponent extends BaseMessageComponent {
  declare content: string | null;
  /**
   * @property {String} [content] Text that will be displayed similar to a message
   */

  /**
   * @param {TextDisplayComponent | APITextDisplayComponent} [data={}] The data
   */
  constructor(data: any = {}) {
    super({ type: 'TEXT_DISPLAY' });

    this.setup(data);
  }

  setup(data: any) {
    super.setup(data);
    /**
     * Text that will be displayed similar to a message
     * @type {String}
     */
    this.content = data.content ?? null;
  }

  /**
   * @returns {APITextDisplayComponent}
   */
  toJSON() {
    return {
      type: MessageComponentTypes[this.type!],
      content: this.content,
    };
  }
}

export default TextDisplayComponent;
export { TextDisplayComponent };
