import BaseMessageComponent, {
  isComponentDataSource,
  readComponentBoolean,
} from './BaseMessageComponent';
import UnfurledMediaItem from './UnfurledMediaItem';
import { ComponentType } from 'discord-api-types/v10';
import type { APIFileComponent } from 'discord-api-types/v10';

class FileComponent extends BaseMessageComponent {
  declare file: UnfurledMediaItem;
  declare spoiler: boolean;

  constructor(data: unknown = {}) {
    super({ type: 'FILE' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.file = new UnfurledMediaItem(source.file);

    this.spoiler = readComponentBoolean(source, 'spoiler') ?? false;
  }

  toJSON(): APIFileComponent {
    return {
      file: this.file.toJSON(),
      spoiler: this.spoiler,
      type: ComponentType.File,
    };
  }
}

export default FileComponent;
export { FileComponent };
