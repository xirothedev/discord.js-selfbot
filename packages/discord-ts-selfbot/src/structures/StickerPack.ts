import { Collection } from '@discordjs/collection';
import Base from './Base';
import _StickerModule from './Sticker';
const { Sticker } = _StickerModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawStickerPackData } from '../../typings/rawDataTypes';
import type { StaticImageURLOptions } from '../../typings';
import type { StickerPackEntity } from '../types/entities/sticker-pack';

/**
 * Represents a pack of standard stickers.
 * @extends {Base}
 */
class StickerPack extends Base implements StickerPackEntity {
  declare bannerId: StickerPackEntity['bannerId'];
  declare coverStickerId: StickerPackEntity['coverStickerId'];
  declare description: StickerPackEntity['description'];
  declare id: StickerPackEntity['id'];
  declare name: StickerPackEntity['name'];
  declare skuId: StickerPackEntity['skuId'];
  declare stickers: StickerPackEntity['stickers'];

  constructor(client: import('../client/Client').default, pack: RawStickerPackData) {
    super(client);
    /**
     * The Sticker pack's id
     * @type {Snowflake}
     */
    this.id = pack.id;

    /**
     * The stickers in the pack
     * @type {Collection<Snowflake, Sticker>}
     */
    this.stickers = new Collection<string, InstanceType<typeof Sticker>>(
      pack.stickers.map(s => [s.id, new Sticker(client, s)]),
    );

    /**
     * The name of the sticker pack
     * @type {string}
     */
    this.name = pack.name;

    /**
     * The id of the pack's SKU
     * @type {Snowflake}
     */
    this.skuId = pack.sku_id;

    /**
     * The id of a sticker in the pack which is shown as the pack's icon
     * @type {?Snowflake}
     */
    this.coverStickerId = pack.cover_sticker_id ?? null;

    /**
     * The description of the sticker pack
     * @type {string}
     */
    this.description = pack.description;

    /**
     * The id of the sticker pack's banner image
     * @type {?Snowflake}
     */
    this.bannerId = pack.banner_asset_id ?? null;
  }

  /**
   * The timestamp the sticker was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  /**
   * The time the sticker was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The sticker which is shown as the pack's icon
   * @type {?Sticker}
   * @readonly
   */
  get coverSticker() {
    return this.coverStickerId ? (this.stickers.get(this.coverStickerId) ?? null) : null;
  }

  /**
   * The URL to this sticker pack's banner.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  bannerURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    return this.bannerId && this.client.rest.cdn.StickerPackBanner(this.bannerId, format, size);
  }
}

export default StickerPack;
export { StickerPack };
