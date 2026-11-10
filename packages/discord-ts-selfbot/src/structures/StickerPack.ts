import { Collection } from "@discordjs/collection";
import Base from "./Base";
import _StickerModule from "./Sticker";

const { Sticker } = _StickerModule;
import SnowflakeUtil from "../util/SnowflakeUtil";
import type { RawStickerPackData } from "../../typings/rawDataTypes";
import type { StaticImageURLOptions } from "../../typings";
import type { StickerPackEntity } from "../types/entities/sticker-pack";
import type Client from "../client/Client";

class StickerPack extends Base implements StickerPackEntity {
  declare bannerId: StickerPackEntity["bannerId"];
  declare coverStickerId: StickerPackEntity["coverStickerId"];
  declare description: StickerPackEntity["description"];
  declare id: StickerPackEntity["id"];
  declare name: StickerPackEntity["name"];
  declare skuId: StickerPackEntity["skuId"];
  declare stickers: StickerPackEntity["stickers"];

  constructor(client: Client, pack: RawStickerPackData) {
    super(client);
    this.id = pack.id;

    this.stickers = new Collection<string, InstanceType<typeof Sticker>>(
      pack.stickers.map((s) => [s.id, new Sticker(client, s)])
    );

    this.name = pack.name;

    this.skuId = pack.sku_id;

    this.coverStickerId = pack.cover_sticker_id ?? null;

    this.description = pack.description;

    this.bannerId = pack.banner_asset_id ?? null;
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  get coverSticker() {
    return this.coverStickerId
      ? (this.stickers.get(this.coverStickerId) ?? null)
      : null;
  }

  bannerURL({ format = "webp", size }: StaticImageURLOptions = {}) {
    return (
      this.bannerId &&
      this.client.rest.cdn.StickerPackBanner(this.bannerId, format, size)
    );
  }
}

export default StickerPack;
export { StickerPack };
