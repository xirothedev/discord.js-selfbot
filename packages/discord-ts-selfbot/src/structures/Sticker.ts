import process from 'node:process';
import Base from './Base';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { StickerFormatTypes, StickerTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { Snowflake } from 'discord-api-types/v10';
import type { APISticker } from 'discord-api-types/v10';
import type { GuildStickerEditData, StickerFormatType, StickerType } from '../../typings';
import type { RawStickerData } from '../../typings/rawDataTypes';
import type User from './User';

/**
 * @type {WeakSet<StageInstance>}
 * @private
 * @internal
 */
const deletedStickers = new WeakSet();
let deprecationEmittedForDeleted = false;

/**
 * Represents a Sticker.
 * @extends {Base}
 */
class Sticker extends Base {
  declare id: Snowflake;
  declare description: string | null;
  declare type: StickerType | null;
  declare format: StickerFormatType;
  declare name: string;
  declare packId: Snowflake | null;
  declare tags: string[] | null;
  declare available: boolean | null;
  declare guildId: Snowflake | null;
  declare user: User | null;
  declare sortValue: number | null;

  constructor(client: import('../client/Client').default, sticker: Partial<RawStickerData> & { id: Snowflake }) {
    super(client);

    this._patch(sticker);
  }

  _patch(sticker: Partial<RawStickerData> & { id: Snowflake }) {
    /**
     * The sticker's id
     * @type {Snowflake}
     */
    this.id = sticker.id;

    if ('description' in sticker) {
      /**
       * The description of the sticker
       * @type {?string}
       */
      this.description = sticker.description ?? null;
    } else {
      this.description ??= null;
    }

    if ('type' in sticker) {
      /**
       * The type of the sticker
       * @type {?StickerType}
       */
      if (typeof sticker.type === 'number') this.type = StickerTypes[sticker.type];
    } else {
      this.type ??= null;
    }

    if ('format_type' in sticker) {
      /**
       * The format of the sticker
       * @type {StickerFormatType}
       */
      if (typeof sticker.format_type === 'number') this.format = StickerFormatTypes[sticker.format_type];
    }

    if ('name' in sticker) {
      /**
       * The name of the sticker
       * @type {string}
       */
      if (typeof sticker.name === 'string') this.name = sticker.name;
    }

    if ('pack_id' in sticker) {
      /**
       * The id of the pack the sticker is from, for standard stickers
       * @type {?Snowflake}
       */
      this.packId = sticker.pack_id ?? null;
    } else {
      this.packId ??= null;
    }

    if ('tags' in sticker) {
      /**
       * An array of tags for the sticker
       * @type {?string[]}
       */
      if (typeof sticker.tags === 'string') this.tags = sticker.tags.split(', ');
    } else {
      this.tags ??= null;
    }

    if ('available' in sticker) {
      /**
       * Whether or not the guild sticker is available
       * @type {?boolean}
       */
      this.available = sticker.available ?? null;
    } else {
      this.available ??= null;
    }

    if ('guild_id' in sticker) {
      /**
       * The id of the guild that owns this sticker
       * @type {?Snowflake}
       */
      this.guildId = sticker.guild_id ?? null;
    } else {
      this.guildId ??= null;
    }

    if ('user' in sticker) {
      /**
       * The user that uploaded the guild sticker
       * @type {?User}
       */
      this.user = sticker.user ? this.client.users._add(sticker.user) : null;
    } else {
      this.user ??= null;
    }

    if ('sort_value' in sticker) {
      /**
       * The standard sticker's sort order within its pack
       * @type {?number}
       */
      this.sortValue = sticker.sort_value ?? null;
    } else {
      this.sortValue ??= null;
    }
  }

  /**
   * The timestamp the sticker was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id!);
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
   * Whether or not the sticker has been deleted
   * @type {boolean}
   * @deprecated This will be removed in the next major version, see https://github.com/discordjs/discord.js/issues/7091
   */
  get deleted() {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Sticker#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning',
      );
    }

    return deletedStickers.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Sticker#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning',
      );
    }

    if (value) deletedStickers.add(this);
    else deletedStickers.delete(this);
  }

  /**
   * Whether this sticker is partial
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return !this.type;
  }

  /**
   * The guild that owns this sticker
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return this.client.guilds.resolve(this.guildId);
  }

  /**
   * A link to the sticker
   * <info>If the sticker's format is LOTTIE, it returns the URL of the Lottie JSON file.</info>
   * @type {string}
   */
  get url() {
    return this.client.rest.cdn.Sticker(this.id, this.format);
  }

  /**
   * Fetches this sticker.
   * @returns {Promise<Sticker>}
   */
  async fetch() {
    const data = await this.client.api.stickers(this.id).get<APISticker>();
    this._patch(data);
    return this;
  }

  /**
   * Fetches the pack this sticker is part of from Discord, if this is a Nitro sticker.
   * @returns {Promise<?StickerPack>}
   */
  async fetchPack() {
    return (this.packId && (await this.client.fetchPremiumStickerPacks()).get(this.packId)) ?? null;
  }

  /**
   * Fetches the user who uploaded this sticker, if this is a guild sticker.
   * @returns {Promise<?User>}
   */
  async fetchUser() {
    if (this.partial) await this.fetch();
    if (!this.guildId) throw new Error('NOT_GUILD_STICKER');
    const guild = this.guild;
    if (!guild) return null;
    return guild.stickers.fetchUser(this);
  }

  /**
   * Data for editing a sticker.
   * @typedef {Object} GuildStickerEditData
   * @property {string} [name] The name of the sticker
   * @property {?string} [description] The description of the sticker
   * @property {string} [tags] The Discord name of a unicode emoji representing the sticker's expression
   */

  /**
   * Edits the sticker.
   * @param {GuildStickerEditData} [data] The new data for the sticker
   * @param {string} [reason] Reason for editing this sticker
   * @returns {Promise<Sticker>}
   * @example
   * // Update the name of a sticker
   * sticker.edit({ name: 'new name' })
   *   .then(s => console.log(`Updated the name of the sticker to ${s.name}`))
   *   .catch(console.error);
   */
  edit(data: GuildStickerEditData, reason?: string) {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    return guild.stickers.edit(this, data, reason);
  }

  /**
   * Deletes the sticker.
   * @returns {Promise<Sticker>}
   * @param {string} [reason] Reason for deleting this sticker
   * @example
   * // Delete a message
   * sticker.delete()
   *   .then(s => console.log(`Deleted sticker ${s.name}`))
   *   .catch(console.error);
   */
  async delete(reason?: string) {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    await guild.stickers.delete(this, reason);
    return this;
  }

  /**
   * Whether this sticker is the same as another one.
   * @param {Sticker|APISticker} other The sticker to compare it to
   * @returns {boolean}
   */
  equals(other: Sticker | APISticker): boolean {
    if (other instanceof Sticker) {
      return (
        other.id === this.id &&
        other.description === this.description &&
        other.type === this.type &&
        other.format === this.format &&
        other.name === this.name &&
        other.packId === this.packId &&
        (other.tags?.length ?? 0) === (this.tags?.length ?? 0) &&
        (other.tags ?? []).every(tag => (this.tags ?? []).includes(tag)) &&
        other.available === this.available &&
        other.guildId === this.guildId &&
        other.sortValue === this.sortValue
      );
    } else {
      return (
        other.id === this.id &&
        other.description === this.description &&
        other.name === this.name &&
        other.tags === this.tags?.join(', ')
      );
    }
  }
}

/**
 * @external APISticker
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object}
 */

export { Sticker, deletedStickers };
export default { Sticker, deletedStickers };
