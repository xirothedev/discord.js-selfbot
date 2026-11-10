import BaseMessageComponent, {
  isComponentDataSource,
  readComponentBoolean,
  readComponentString,
} from './BaseMessageComponent';
import UnfurledMediaItem from './UnfurledMediaItem';
import { ComponentType, type APIThumbnailComponent } from 'discord-api-types/v10';

class ThumbnailComponent extends BaseMessageComponent {
  declare media: UnfurledMediaItem;
  declare description: string | null;
  declare spoiler: boolean;
  /**
   * @property {UnfurledMediaItem} [media] A url or attachment
   * @property {String} [description] Alt text for the media, max 1024 characters
   * @property {Boolean} [spoiler] Whether the thumbnail should be a spoiler (or blurred out). Defaults to false
   */

  /**
   * @param {ThumbnailComponent | APIThumbnailComponent} [data={}] The data
   */
  constructor(data: unknown = {}) {
    super({ type: 'THUMBNAIL' });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
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
     * Whether the thumbnail should be a spoiler (or blurred out). Defaults to false
     * @type {Boolean}
     */
    this.spoiler = readComponentBoolean(source, 'spoiler') ?? false;
  }

  /**
   * @returns {APIThumbnailComponent}
   */
  toJSON(): APIThumbnailComponent {
    return {
      type: ComponentType.Thumbnail,
      media: this.media.toJSON(),
      description: this.description ?? undefined,
      spoiler: this.spoiler,
    };
  }
}

export default ThumbnailComponent;
export { ThumbnailComponent };
