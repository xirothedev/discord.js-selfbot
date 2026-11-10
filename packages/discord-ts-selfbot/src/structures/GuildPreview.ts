import { Collection } from '@discordjs/collection';
import Base from './Base';
import GuildPreviewEmoji from './GuildPreviewEmoji';
import _StickerModule from './Sticker';
const { Sticker } = _StickerModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawGuildPreviewData } from '../../typings/rawDataTypes';
import type { ImageURLOptions, StaticImageURLOptions } from '../../typings';
import type { GuildPreviewEntity } from '../types/entities/guild-preview';
import type { PatchOf } from '../types/schema';

/**
 * Represents the data about the guild any bot can preview, connected to the specified guild.
 * @extends {Base}
 */
class GuildPreview extends Base implements GuildPreviewEntity {
  declare approximateMemberCount: GuildPreviewEntity['approximateMemberCount'];
  declare approximatePresenceCount: GuildPreviewEntity['approximatePresenceCount'];
  declare description: GuildPreviewEntity['description'];
  declare discoverySplash: GuildPreviewEntity['discoverySplash'];
  declare emojis: GuildPreviewEntity['emojis'];
  declare stickers: GuildPreviewEntity['stickers'];
  declare features: GuildPreviewEntity['features'];
  declare icon: GuildPreviewEntity['icon'];
  declare id: GuildPreviewEntity['id'];
  declare name: GuildPreviewEntity['name'];
  declare splash: GuildPreviewEntity['splash'];

  constructor(client: import('../client/Client').default, data: RawGuildPreviewData) {
    super(client);

    if (!data) return;

    this._patch(data);
  }

  _patch(data: PatchOf<'GuildPreview'>) {
    /**
     * The id of this guild
     * @type {string}
     */
    if (data.id !== undefined) this.id = data.id;

    if (data.name !== undefined) {
      /**
       * The name of this guild
       * @type {string}
       */
      this.name = data.name;
    }

    if (data.icon !== undefined) {
      /**
       * The icon of this guild
       * @type {?string}
       */
      this.icon = data.icon;
    }

    if (data.splash !== undefined) {
      /**
       * The splash icon of this guild
       * @type {?string}
       */
      this.splash = data.splash;
    }

    if (data.discovery_splash !== undefined) {
      /**
       * The discovery splash icon of this guild
       * @type {?string}
       */
      this.discoverySplash = data.discovery_splash;
    }

    if (data.features !== undefined) {
      /**
       * An array of enabled guild features
       * @type {Features[]}
       */
      this.features = data.features;
    }

    if (data.approximate_member_count !== undefined) {
      /**
       * The approximate count of members in this guild
       * @type {number}
       */
      this.approximateMemberCount = data.approximate_member_count;
    }

    if (data.approximate_presence_count !== undefined) {
      /**
       * The approximate count of online members in this guild
       * @type {number}
       */
      this.approximatePresenceCount = data.approximate_presence_count;
    }

    if (data.description !== undefined) {
      /**
       * The description for this guild
       * @type {?string}
       */
      this.description = data.description;
    } else {
      this.description ??= null;
    }

    if (!this.emojis) {
      /**
       * Collection of emojis belonging to this guild
       * @type {Collection<Snowflake, GuildPreviewEmoji>}
       */
      this.emojis = new Collection<string, GuildPreviewEmoji>();
    } else {
      this.emojis.clear();
    }
    for (const emoji of data.emojis ?? []) {
      if (!emoji.id) continue;
      this.emojis.set(emoji.id, new GuildPreviewEmoji(this.client, emoji, this));
    }

    /**
     * Collection of stickers belonging to this guild
     * @type {Collection<Snowflake, Sticker>}
     */
    this.stickers = (data.stickers ?? []).reduce(
      (stickers, sticker) => stickers.set(sticker.id, new Sticker(this.client, sticker)),
      new Collection<string, InstanceType<typeof Sticker>>(),
    );
  }
  /**
   * The timestamp this guild was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  /**
   * The time this guild was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The URL to this guild's splash.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  splashURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    return this.splash && this.client.rest.cdn.Splash(this.id, this.splash, format, size);
  }

  /**
   * The URL to this guild's discovery splash.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  discoverySplashURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    return this.discoverySplash && this.client.rest.cdn.DiscoverySplash(this.id, this.discoverySplash, format, size);
  }

  /**
   * The URL to this guild's icon.
   * @param {ImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  iconURL({ format = 'webp', size, dynamic }: ImageURLOptions = {}) {
    return this.icon && this.client.rest.cdn.Icon(this.id, this.icon, format, size, dynamic);
  }

  /**
   * Fetches this guild.
   * @returns {Promise<GuildPreview>}
   */
  async fetch() {
    const data = await this.client.api.guilds(this.id).preview.get<RawGuildPreviewData>();
    this._patch(data);
    return this;
  }

  /**
   * When concatenated with a string, this automatically returns the guild's name instead of the Guild object.
   * @returns {string}
   * @example
   * // Logs: Hello from My Guild!
   * console.log(`Hello from ${previewGuild}!`);
   */
  toString() {
    return this.name;
  }

  toJSON() {
    const json = super.toJSON();
    json.iconURL = this.iconURL();
    json.splashURL = this.splashURL();
    return json;
  }
}

export default GuildPreview;
export { GuildPreview };
