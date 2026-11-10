import BaseMessageComponent, {
  isComponentDataSource,
  readComponentBoolean,
  readComponentNumber,
} from './BaseMessageComponent';
import { ComponentType, SeparatorSpacingSize, type APISeparatorComponent } from 'discord-api-types/v10';

class SeparatorComponent extends BaseMessageComponent {
  declare spacing: 1 | 2;
  declare divider: boolean;
  /**
   * @property {SeparatorSpacingSizes} [spacing] Size of separator padding — SeparatorSpacingSizes.SMALL for small padding, SeparatorSpacingSizes.LARGE for large padding. Defaults to SeparatorSpacingSizes.SMALL
   * @property {Boolean} [divider] Whether a visual divider should be displayed in the component. Defaults to true
   */

  /**
   * @param {SeparatorComponent | APISeparatorComponent} [data={}] The data
   */
  constructor(data: unknown = {}) {
    super({ type: 'SEPARATOR' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    /**
     * Size of separator padding — SeparatorSpacingSizes.SMALL for small padding, SeparatorSpacingSizes.LARGE for large padding. Defaults to SeparatorSpacingSizes.SMALL
     * @type {SeparatorSpacingSizes}
     */
    this.spacing = readComponentNumber(source, 'spacing') === SeparatorSpacingSize.Large ? 2 : 1;

    /**
     * Whether a visual divider should be displayed in the component. Defaults to true
     * @type {Boolean}
     */
    this.divider = readComponentBoolean(source, 'divider') ?? true;
  }

  /**
   * @returns {APISeparatorComponent}
   */
  toJSON(): APISeparatorComponent {
    return {
      type: ComponentType.Separator,
      spacing: this.spacing,
      divider: this.divider,
    };
  }
}

export default SeparatorComponent;
export { SeparatorComponent };
