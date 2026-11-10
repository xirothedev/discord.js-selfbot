import BaseMessageComponent, { isComponentDataSource, readComponentArray } from './BaseMessageComponent';
import MediaGalleryItem from './MediaGalleryItem';
import { ComponentType, type APIMediaGalleryComponent } from 'discord-api-types/v10';

class MediaGalleryComponent extends BaseMessageComponent {
  declare items: MediaGalleryItem[];
  /**
   * @property {MediaGalleryItem[]} [items] 1 to 10 media gallery items
   */

  /**
   * @param {MediaGalleryComponent | APIMediaGalleryComponent} [data={}] The data
   */
  constructor(data: unknown = {}) {
    super({ type: 'MEDIA_GALLERY' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    /**
     * 1 to 10 media gallery items
     * @type {MediaGalleryItem[]}
     */
    this.items = readComponentArray(source, 'items').map(item => new MediaGalleryItem(item));
  }

  /**
   * @returns {APIMediaGalleryComponent}
   */
  toJSON(): APIMediaGalleryComponent {
    return {
      type: ComponentType.MediaGallery,
      items: this.items.map(item => item.toJSON()),
    };
  }
}

export default MediaGalleryComponent;
export { MediaGalleryComponent };
