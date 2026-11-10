import BaseMessageComponent, {
  isComponentDataSource,
  readComponentBoolean,
  readComponentString,
} from "./BaseMessageComponent";
import UnfurledMediaItem from "./UnfurledMediaItem";
import { ComponentType } from "discord-api-types/v10";
import type { APIThumbnailComponent } from "discord-api-types/v10";

class ThumbnailComponent extends BaseMessageComponent {
  declare media: UnfurledMediaItem;
  declare description: string | null;
  declare spoiler: boolean;

  constructor(data: unknown = {}) {
    super({ type: "THUMBNAIL" });

    this.setup(data);
  }

  setup(data: unknown) {
    super.setup(data);
    const source = isComponentDataSource(data) ? data : {};
    this.media = new UnfurledMediaItem(source.media);

    this.description = readComponentString(source, "description") ?? null;

    this.spoiler = readComponentBoolean(source, "spoiler") ?? false;
  }

  toJSON(): APIThumbnailComponent {
    return {
      description: this.description ?? undefined,
      media: this.media.toJSON(),
      spoiler: this.spoiler,
      type: ComponentType.Thumbnail,
    };
  }
}

export default ThumbnailComponent;
export { ThumbnailComponent };
