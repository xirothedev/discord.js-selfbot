import UnfurledMediaItem from "./UnfurledMediaItem";
import {
  isComponentDataSource,
  readComponentBoolean,
  readComponentString,
} from "./BaseMessageComponent";

class MediaGalleryItem {
  declare media: UnfurledMediaItem;
  declare description: string | null;
  declare spoiler: boolean;

  constructor(data: unknown = {}) {
    const source = isComponentDataSource(data) ? data : {};
    this.media = new UnfurledMediaItem(source.media);

    this.description = readComponentString(source, "description") ?? null;

    this.spoiler = readComponentBoolean(source, "spoiler") ?? false;
  }

  toJSON() {
    return {
      description: this.description,
      media: this.media.toJSON(),
      spoiler: this.spoiler,
    };
  }
}

export default MediaGalleryItem;
export { MediaGalleryItem };
