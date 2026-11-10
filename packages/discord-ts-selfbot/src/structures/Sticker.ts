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
    this.id = sticker.id;

    if ('description' in sticker) {
      this.description = sticker.description ?? null;
    } else {
      this.description ??= null;
    }

    if ('type' in sticker) {
      if (typeof sticker.type === 'number') this.type = StickerTypes[sticker.type];
    } else {
      this.type ??= null;
    }

    if ('format_type' in sticker) {
      if (typeof sticker.format_type === 'number') this.format = StickerFormatTypes[sticker.format_type];
    }

    if ('name' in sticker) {
      if (typeof sticker.name === 'string') this.name = sticker.name;
    }

    if ('pack_id' in sticker) {
      this.packId = sticker.pack_id ?? null;
    } else {
      this.packId ??= null;
    }

    if ('tags' in sticker) {
      if (typeof sticker.tags === 'string') this.tags = sticker.tags.split(', ');
    } else {
      this.tags ??= null;
    }

    if ('available' in sticker) {
      this.available = sticker.available ?? null;
    } else {
      this.available ??= null;
    }

    if ('guild_id' in sticker) {
      this.guildId = sticker.guild_id ?? null;
    } else {
      this.guildId ??= null;
    }

    if ('user' in sticker) {
      this.user = sticker.user ? this.client.users._add(sticker.user) : null;
    } else {
      this.user ??= null;
    }

    if ('sort_value' in sticker) {
      this.sortValue = sticker.sort_value ?? null;
    } else {
      this.sortValue ??= null;
    }
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id!);
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
    return (this.packId && (await this.client.fetchPremiumStickerPacks()).get(this.packId)) ?? null;
  }

  async fetchUser() {
    if (this.partial) await this.fetch();
    if (!this.guildId) throw new Error('NOT_GUILD_STICKER');
    const guild = this.guild;
    if (!guild) return null;
    return guild.stickers.fetchUser(this);
  }

  edit(data: GuildStickerEditData, reason?: string) {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    return guild.stickers.edit(this, data, reason);
  }

  async delete(reason?: string) {
    const guild = this.guild;
    if (!guild) throw new Error('INVALID_TYPE', 'guildId', 'Guild');
    await guild.stickers.delete(this, reason);
    return this;
  }

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

export { Sticker, deletedStickers };
export default { Sticker, deletedStickers };
