import BaseMessageComponent, { isComponentDataSource, readComponentString } from './BaseMessageComponent';
import { ComponentType, type APITextDisplayComponent } from 'discord-api-types/v10';

class TextDisplayComponent extends BaseMessageComponent {
  declare content: string | null;

  constructor(data: unknown = {}) {
    super({ type: 'TEXT_DISPLAY' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.content = readComponentString(source, 'content') ?? null;
  }

  toJSON(): APITextDisplayComponent {
    return {
      type: ComponentType.TextDisplay,
      content: this.content ?? '',
    };
  }
}

export default TextDisplayComponent;
export { TextDisplayComponent };
