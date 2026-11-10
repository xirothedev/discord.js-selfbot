import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
} from "./BaseMessageComponent";
import MediaGalleryItem from "./MediaGalleryItem";
import { ComponentType } from "discord-api-types/v10";
import type { APIMediaGalleryComponent } from "discord-api-types/v10";

class MediaGalleryComponent extends BaseMessageComponent {
  declare items: MediaGalleryItem[];

  constructor(data: unknown = {}) {
    super({ type: "MEDIA_GALLERY" });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.items = readComponentArray(source, "items").map(
      (item) => new MediaGalleryItem(item)
    );
  }

  toJSON(): APIMediaGalleryComponent {
    return {
      items: this.items.map((item) => item.toJSON()),
      type: ComponentType.MediaGallery,
    };
  }
}

export default MediaGalleryComponent;
export { MediaGalleryComponent };
