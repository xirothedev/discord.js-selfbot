import BaseMessageComponent from './BaseMessageComponent';
import UnfurledMediaItem from './UnfurledMediaItem';
import _ConstantsModule from '../util/Constants';
const { MessageComponentTypes } = _ConstantsModule;

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
  constructor(data: any = {}) {
    super({ type: 'FILE' });

    this.setup(data);
  }

  setup(data: any) {
    super.setup(data);
    /**
     * This unfurled media item is unique in that it only supports attachment references using the attachment://<filename> syntax
     * @type {UnfurledMediaItem}
     */
    this.file = new UnfurledMediaItem(data.file);

    /**
     * Whether the container should be a spoiler (or blurred out). Defaults to false.
     * @type {Boolean}
     */
    this.spoiler = data.spoiler ?? false;
  }

  /**
   * @returns {APIFileComponent}
   */
  toJSON() {
    return {
      type: MessageComponentTypes[this.type!],
      file: this.file.toJSON(),
      spoiler: this.spoiler,
    };
  }
}

export default FileComponent;
export { FileComponent };
