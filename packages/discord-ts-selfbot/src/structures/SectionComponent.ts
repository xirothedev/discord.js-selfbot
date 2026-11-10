import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
} from './BaseMessageComponent';
import type { MessageComponentInstance } from './BaseMessageComponent';
import MessageButton from './MessageButton';
import TextDisplayComponent from './TextDisplayComponent';
import ThumbnailComponent from './ThumbnailComponent';
import { ComponentType } from 'discord-api-types/v10';
import type { APISectionComponent } from 'discord-api-types/v10';

class SectionComponent extends BaseMessageComponent {
  declare components: TextDisplayComponent[];
  declare accessory: MessageButton | ThumbnailComponent | null;

  constructor(data: unknown = {}) {
    super({ type: 'SECTION' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.components = readComponentArray(source, 'components')
      .map((component) => BaseMessageComponent.create(component))
      .filter(
        (component): component is TextDisplayComponent =>
          component instanceof TextDisplayComponent
      );

    const accessory: MessageComponentInstance | null =
      BaseMessageComponent.create(source.accessory);
    this.accessory =
      accessory instanceof MessageButton ||
      accessory instanceof ThumbnailComponent
        ? accessory
        : null;
  }

  toJSON(): APISectionComponent {
    const accessory = this.accessory?.toJSON();
    if (!accessory) {
      throw new Error('SECTION_ACCESSORY_REQUIRED');
    }
    return {
      accessory,
      components: this.components.map((component) => component.toJSON()),
      type: ComponentType.Section,
    };
  }
}

export default SectionComponent;
export { SectionComponent };
