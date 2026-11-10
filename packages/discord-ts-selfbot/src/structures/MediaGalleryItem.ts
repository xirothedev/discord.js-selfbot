import UnfurledMediaItem from './UnfurledMediaItem';
import { isComponentDataSource, readComponentBoolean, readComponentString } from './BaseMessageComponent';

class MediaGalleryItem {
  declare media: UnfurledMediaItem;
  declare description: string | null;
  declare spoiler: boolean;

  /**
   * @property {UnfurledMediaItem} [media] A url or attachment
   * @property {String} [description] Alt text for the media, max 1024 characters
   * @property {Boolean} [spoiler] Whether the media should be a spoiler (or blurred out). Defaults to false
   */

  /**
   * @param {MediaGalleryItem | APIMediaGalleryItem} [data={}] The data
   */
  constructor(data: unknown = {}) {
    const source = isComponentDataSource(data) ? data : {};
    /**
     * A url or attachment
     * @type {UnfurledMediaItem}
     */
    this.media = new UnfurledMediaItem(source.media);

    /**
     * Alt text for the media, max 1024 characters
     * @type {String}
     */
    this.description = readComponentString(source, 'description') ?? null;

    /**
     * Whether the media should be a spoiler (or blurred out). Defaults to false
     * @type {Boolean}
     */
    this.spoiler = readComponentBoolean(source, 'spoiler') ?? false;
  }

  /**
   * @returns {APIMediaGalleryItem}
   */
  toJSON() {
    return {
      media: this.media.toJSON(),
      description: this.description,
      spoiler: this.spoiler,
    };
  }
}

export default MediaGalleryItem;
export { MediaGalleryItem };
