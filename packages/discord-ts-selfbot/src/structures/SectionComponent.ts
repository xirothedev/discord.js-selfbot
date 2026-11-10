import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
  type MessageComponentInstance,
} from './BaseMessageComponent';
import MessageButton from './MessageButton';
import TextDisplayComponent from './TextDisplayComponent';
import ThumbnailComponent from './ThumbnailComponent';
import { ComponentType, type APISectionComponent } from 'discord-api-types/v10';

class SectionComponent extends BaseMessageComponent {
  declare components: TextDisplayComponent[];
  declare accessory: MessageButton | ThumbnailComponent | null;
  /**
   * @property {TextDisplayComponent[]} [components] One to three text components
   * @property {ThumbnailComponent|MessageButton} [accessory] A thumbnail or a button component, with a future possibility of adding more compatible components
   */

  /**
   * @param {SectionComponent | APISectionComponent} [data={}] The data
   */
  constructor(data: unknown = {}) {
    super({ type: 'SECTION' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    /**
     * One to three text components
     * @type {TextDisplayComponent[]}
     */
    this.components = readComponentArray(source, 'components')
      .map(component => BaseMessageComponent.create(component))
      .filter((component): component is TextDisplayComponent => component instanceof TextDisplayComponent);

    /**
     * A thumbnail or a button component, with a future possibility of adding more compatible components
     * @type {ThumbnailComponent|MessageButton}
     */
    const accessory: MessageComponentInstance | null = BaseMessageComponent.create(source.accessory);
    this.accessory = accessory instanceof MessageButton || accessory instanceof ThumbnailComponent ? accessory : null;
  }

  /**
   * @returns {APISectionComponent}
   */
  toJSON(): APISectionComponent {
    const accessory = this.accessory?.toJSON();
    if (!accessory) throw new Error('SECTION_ACCESSORY_REQUIRED');
    return {
      type: ComponentType.Section,
      components: this.components.map(component => component.toJSON()),
      accessory,
    };
  }
}

export default SectionComponent;
export { SectionComponent };
