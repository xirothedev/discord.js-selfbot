import BaseMessageComponent, { isComponentDataSource, readComponentBoolean } from './BaseMessageComponent';
import UnfurledMediaItem from './UnfurledMediaItem';
import { ComponentType, type APIFileComponent } from 'discord-api-types/v10';

class FileComponent extends BaseMessageComponent {
  declare file: UnfurledMediaItem;
  declare spoiler: boolean;
  /**
   * @property {UnfurledMediaItem} [file] This unfurled media item is unique in that it only supports attachment references using the attachment://<filename> syntax
   * @property {Boolean} [spoiler] Whether the container should be a spoiler (or blurred out). Defaults to false.
   */

  /**
   * @param {FileComponent | APIFileComponent} [data={}] The data
   */
  constructor(data: unknown = {}) {
    super({ type: 'FILE' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    /**
     * This unfurled media item is unique in that it only supports attachment references using the attachment://<filename> syntax
     * @type {UnfurledMediaItem}
     */
    this.file = new UnfurledMediaItem(source.file);

    /**
     * Whether the container should be a spoiler (or blurred out). Defaults to false.
     * @type {Boolean}
     */
    this.spoiler = readComponentBoolean(source, 'spoiler') ?? false;
  }

  /**
   * @returns {APIFileComponent}
   */
  toJSON(): APIFileComponent {
    return {
      type: ComponentType.File,
      file: this.file.toJSON(),
      spoiler: this.spoiler,
    };
  }
}

export default FileComponent;
export { FileComponent };
