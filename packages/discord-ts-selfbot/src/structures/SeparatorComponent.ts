import BaseMessageComponent from './BaseMessageComponent';
import _ConstantsModule from '../util/Constants';
const { MessageComponentTypes, SeparatorSpacingSizes } = _ConstantsModule;

class SeparatorComponent extends BaseMessageComponent {
  declare spacing: import('../../typings/enums').SeparatorSpacingSizes;
  declare divider: boolean;
  /**
   * @property {SeparatorSpacingSizes} [spacing] Size of separator padding — SeparatorSpacingSizes.SMALL for small padding, SeparatorSpacingSizes.LARGE for large padding. Defaults to SeparatorSpacingSizes.SMALL
   * @property {Boolean} [divider] Whether a visual divider should be displayed in the component. Defaults to true
   */

  /**
   * @param {SeparatorComponent | APISeparatorComponent} [data={}] The data
   */
  constructor(data: any = {}) {
    super({ type: 'SEPARATOR' });

    this.setup(data);
  }

  setup(data: any) {
    super.setup(data);
    /**
     * Size of separator padding — SeparatorSpacingSizes.SMALL for small padding, SeparatorSpacingSizes.LARGE for large padding. Defaults to SeparatorSpacingSizes.SMALL
     * @type {SeparatorSpacingSizes}
     */
    this.spacing = data.spacing ?? SeparatorSpacingSizes.SMALL;

    /**
     * Whether a visual divider should be displayed in the component. Defaults to true
     * @type {Boolean}
     */
    this.divider = data.divider ?? true;
  }

  /**
   * @returns {APISeparatorComponent}
   */
  toJSON() {
    return {
      type: MessageComponentTypes[this.type!],
      spacing: this.spacing,
      divider: this.divider,
    };
  }
}

export default SeparatorComponent;
export { SeparatorComponent };
