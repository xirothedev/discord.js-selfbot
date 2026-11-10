import process from 'node:process';
import Base, { patchValue } from './Base';
import _errorsModule from '../errors';

const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';

const { StickerFormatTypes, StickerTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { Snowflake, APISticker } from 'discord-api-types/v10';
import type {
  GuildStickerEditData,
  StickerFormatType,
  StickerType,
} from '../../typings';
import type { RawStickerData } from '../../typings/rawDataTypes';
import type User from './User';
import type Client from '../client/Client';

/**
 * @type {WeakSet<StageInstance>}
 * @private
 * @internal
 */
const deletedStickers = new WeakSet();
let deprecationEmittedForDeleted = false;

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

  constructor(
    client: Client,
    sticker: Partial<RawStickerData> & { id: Snowflake }
  ) {
    super(client);

    this._patch(sticker);
  }

  _patch(sticker: Partial<RawStickerData> & { id: Snowflake }) {
    this.id = sticker.id;
    this.description = patchValue(
      'description' in sticker ? sticker.description : undefined,
      this.description
    );
    this.type =
      'type' in sticker && typeof sticker.type === 'number'
        ? StickerTypes[sticker.type]
        : (this.type ?? null);
    this.format =
      'format_type' in sticker && typeof sticker.format_type === 'number'
        ? StickerFormatTypes[sticker.format_type]
        : this.format;
    this.name =
      'name' in sticker && typeof sticker.name === 'string'
        ? sticker.name
        : this.name;
    this.packId = patchValue(
      'pack_id' in sticker ? sticker.pack_id : undefined,
      this.packId
    );
    this.tags =
      'tags' in sticker && typeof sticker.tags === 'string'
        ? sticker.tags.split(', ')
        : (this.tags ?? null);
    this.available = patchValue(
      'available' in sticker ? sticker.available : undefined,
      this.available
    );
    this.guildId = patchValue(
      'guild_id' in sticker ? sticker.guild_id : undefined,
      this.guildId
    );
    if ('user' in sticker) {
      this.user = sticker.user ? this.client.users._add(sticker.user) : null;
    } else {
      this.user ??= null;
    }
    this.sortValue = patchValue(
      'sort_value' in sticker ? sticker.sort_value : undefined,
      this.sortValue
    );
  }
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

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
        'DeprecationWarning'
      );
    }

    return deletedStickers.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Sticker#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning'
      );
    }

    if (value) {
      deletedStickers.add(this);
    } else {
      deletedStickers.delete(this);
    }
  }

  get partial() {
    return !this.type;
  }

  get guild() {
    return this.client.guilds.resolve(this.guildId);
  }

  get url() {
    return this.client.rest.cdn.Sticker(this.id, this.format);
  }

  async fetch() {
    const data = await this.client.api.stickers(this.id).get<APISticker>();
    this._patch(data);
    return this;
  }

  async fetchPack() {
    if (!this.packId) {
      return null;
    }
    const packs = await this.client.fetchPremiumStickerPacks();
    return packs.get(this.packId) ?? null;
  }

  async fetchUser() {
    if (this.partial) {
      await this.fetch();
    }
    if (!this.guildId) {
      throw new Error('NOT_GUILD_STICKER');
    }
    const { guild } = this;
    if (!guild) {
      return null;
    }
    return guild.stickers.fetchUser(this);
  }

  edit(data: GuildStickerEditData, reason?: string) {
    const { guild } = this;
    if (!guild) {
      throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    }
    return guild.stickers.edit(this, data, reason);
  }

  async delete(reason?: string) {
    const { guild } = this;
    if (!guild) {
      throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    }
    await guild.stickers.delete(this, reason);
    return this;
  }

  equals(other: Sticker | APISticker): boolean {
    return other instanceof Sticker
      ? this.equalsSticker(other)
      : this.equalsRaw(other);
  }

  private equalsSticker(other: Sticker): boolean {
    return (
      other.id === this.id &&
      other.description === this.description &&
      other.type === this.type &&
      other.format === this.format &&
      other.name === this.name &&
      other.packId === this.packId &&
      Sticker.tagsEqual(other.tags, this.tags) &&
      other.available === this.available &&
      other.guildId === this.guildId &&
      other.sortValue === this.sortValue
    );
  }

  private equalsRaw(other: APISticker): boolean {
    return (
      other.id === this.id &&
      other.description === this.description &&
      other.name === this.name &&
      other.tags === this.tags?.join(', ')
    );
  }

  private static tagsEqual(
    left: string[] | null,
    right: string[] | null
  ): boolean {
    return (
      (left?.length ?? 0) === (right?.length ?? 0) &&
      (left ?? []).every((tag) => (right ?? []).includes(tag))
    );
  }
}

export { Sticker, deletedStickers };
export default { Sticker, deletedStickers };
