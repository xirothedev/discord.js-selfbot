import BaseMessageComponent, {
  isComponentDataSource,
  readComponentBoolean,
  readComponentNumber,
} from './BaseMessageComponent';
import { ComponentType, SeparatorSpacingSize, type APISeparatorComponent } from 'discord-api-types/v10';

class SeparatorComponent extends BaseMessageComponent {
  declare spacing: 1 | 2;
  declare divider: boolean;

  constructor(data: unknown = {}) {
    super({ type: 'SEPARATOR' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.spacing = readComponentNumber(source, 'spacing') === SeparatorSpacingSize.Large ? 2 : 1;

    this.divider = readComponentBoolean(source, 'divider') ?? true;
  }

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
