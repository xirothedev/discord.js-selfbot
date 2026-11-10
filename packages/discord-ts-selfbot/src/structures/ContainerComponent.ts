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

  constructor(data: unknown = {}) {
    super({ type: 'CONTAINER' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.components = readComponentArray(source, 'components')
      .map(component => BaseMessageComponent.create(component))
      .filter(isContainerChild);

    this.accentColor = readComponentNumber(source, 'accent_color', 'accentColor') ?? null;

    this.spoiler = readComponentBoolean(source, 'spoiler') ?? false;
  }

  get hexAccentColor() {
    return typeof this.accentColor === 'number'
      ? `#${this.accentColor.toString(16).padStart(6, '0')}`
      : (this.accentColor ?? null);
  }

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
