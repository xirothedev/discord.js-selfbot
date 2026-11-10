import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
  readComponentBoolean,
  readComponentNumber,
  type ContainerComponentSource,
} from './BaseMessageComponent';
import { ComponentType, type APIContainerComponent } from 'discord-api-types/v10';

function isContainerChild(
  component: import('./BaseMessageComponent').MessageComponentInstance | null,
): component is ContainerComponentSource {
  return component !== null && BaseMessageComponent.isContainerComponent(component);
}

class ContainerComponent extends BaseMessageComponent {
  declare components: ContainerComponentSource[];
  declare accentColor: number | null;
  declare spoiler: boolean;
  /**
   * @typedef {MessageActionRow|TextDisplayComponent|SectionComponent|MediaGalleryComponent|SeparatorComponent|FileComponent} ContainerComponents
   * @property {ContainerComponents[]} [components] Components of the type action row, text display, section, media gallery, separator, or file
   * @property {Number} [accent_color] Color for the accent on the container as RGB from 0x000000 to 0xFFFFFF
   * @property {Boolean} [spoiler] Whether the container should be a spoiler (or blurred out). Defaults to false.
   */

  /**
   * @param {ContainerComponent | APIContainerComponent} [data={}] The data
   */
  constructor(data: unknown = {}) {
    super({ type: 'CONTAINER' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    /**
     * Components of the type action row, text display, section, media gallery, separator, or file
     * @type {ContainerComponents[]}
     */
    this.components = readComponentArray(source, 'components')
      .map(component => BaseMessageComponent.create(component))
      .filter(isContainerChild);

    /**
     * Color for the accent on the container as RGB from 0x000000 to 0xFFFFFF
     * @type {Number}
     */
    this.accentColor = readComponentNumber(source, 'accent_color', 'accentColor') ?? null;

    /**
     * Whether the container should be a spoiler (or blurred out). Defaults to false.
     * @type {Boolean}
     */
    this.spoiler = readComponentBoolean(source, 'spoiler') ?? false;
  }

  /**
   * The hex accent color of this container
   * @type {?string}
   * @readonly
   */
  get hexAccentColor() {
    return typeof this.accentColor === 'number'
      ? `#${this.accentColor.toString(16).padStart(6, '0')}`
      : (this.accentColor ?? null);
  }

  /**
   * @returns {APIContainerComponent}
   */
  toJSON(): APIContainerComponent {
    return {
      type: ComponentType.Container,
      components: this.components.map(component => BaseMessageComponent.serializeContainerComponent(component)),
      accent_color: this.accentColor,
      spoiler: this.spoiler,
    };
  }
}

export default ContainerComponent;
export { ContainerComponent };
