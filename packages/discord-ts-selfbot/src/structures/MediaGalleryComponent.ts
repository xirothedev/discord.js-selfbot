import BaseMessageComponent from './BaseMessageComponent';
import MediaGalleryItem from './MediaGalleryItem';
import _ConstantsModule from '../util/Constants';
const { MessageComponentTypes } = _ConstantsModule;

class MediaGalleryComponent extends BaseMessageComponent {
  /**
   * @property {MediaGalleryItem[]} [items] 1 to 10 media gallery items
   */

  /**
   * @param {MediaGalleryComponent | APIMediaGalleryComponent} [data={}] The data
   */
  constructor(data: any = {}) {
    super({ type: 'MEDIA_GALLERY' });

    this.setup(data);
  }

  setup(data: any) {
    super.setup(data);
    /**
     * 1 to 10 media gallery items
     * @type {MediaGalleryItem[]}
     */
    this.items = data.items?.map((item: any) => new MediaGalleryItem(item)) ?? [];
  }

  /**
   * @returns {APIMediaGalleryComponent}
   */
  toJSON() {
    return {
      type: MessageComponentTypes[this.type],
      items: this.items.map((c: any) => c.toJSON()),
    };
  }
}

export default MediaGalleryComponent;
export { MediaGalleryComponent };
