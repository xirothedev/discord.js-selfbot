import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import MessagePayload from '../structures/MessagePayload';
import _StickerModule from '../structures/Sticker';
const { Sticker } = _StickerModule;
import type { Snowflake } from 'discord-api-types/v10';
import type { RawStickerData } from '../../typings/rawDataTypes';
import type {
  BaseFetchOptions,
  BufferResolvable,
  GuildStickerCreateOptions,
  GuildStickerEditData,
  StickerResolvable,
} from '../../typings';
import type { Guild } from '../structures/Guild';
import type { User } from '../structures/User';
import type { Stream } from 'node:stream';
import type { FileOptions, MessageAttachment } from '../../typings';

type StickerResolvableSource = InstanceType<typeof Sticker> | StickerResolvable;

/**
 * Manages API methods for Guild Stickers and stores their cache.
 * @extends {CachedManager}
 */
class GuildStickerManager extends CachedManager<import('../structures/Sticker').Sticker> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<InstanceType<typeof Sticker>>) {
    super(guild.client, Sticker, iterable);

    /**
     * The guild this manager belongs to
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The cache of Guild Stickers
   * @type {Collection<Snowflake, Sticker>}
   * @name GuildStickerManager#cache
   */

  _add(data: RawStickerData, cache = true): InstanceType<typeof Sticker> {
    return super._add(data, cache, { extras: [this.guild] });
  }

  /**
   * Options for creating a guild sticker.
   * @typedef {Object} GuildStickerCreateOptions
   * @property {?string} [description] The description for the sticker
   * @property {string} [reason] Reason for creating the sticker
   */

  /**
   * Creates a new custom sticker in the guild.
   * @param {BufferResolvable|Stream|FileOptions|MessageAttachment} file The file for the sticker
   * @param {string} name The name for the sticker
   * @param {string} tags The Discord name of a unicode emoji representing the sticker's expression
   * @param {GuildStickerCreateOptions} [options] Options
   * @returns {Promise<Sticker>} The created sticker
   * @example
   * // Create a new sticker from a URL
   * guild.stickers.create('https://i.imgur.com/w3duR07.png', 'rip', 'headstone')
   *   .then(sticker => console.log(`Created new sticker with name ${sticker.name}!`))
   *   .catch(console.error);
   * @example
   * // Create a new sticker from a file on your computer
   * guild.stickers.create('./memes/banana.png', 'banana', 'banana')
   *   .then(sticker => console.log(`Created new sticker with name ${sticker.name}!`))
   *   .catch(console.error);
   */
  async create(
    file: BufferResolvable | Stream | FileOptions | MessageAttachment,
    name: string,
    tags: string,
    { description, reason }: GuildStickerCreateOptions = {},
  ): Promise<InstanceType<typeof Sticker>> {
    const resolvedFile = await MessagePayload.resolveFile(file);
    if (!resolvedFile) throw new TypeError('REQ_RESOURCE_TYPE');
    const payloadFile = { ...resolvedFile, key: 'file' };

    const data = { name, tags, description: description ?? '' };

    const sticker = await this.client.api
      .guilds(this.guild.id)
      .stickers.post({ data, files: [payloadFile], reason, dontUsePayloadJSON: true });
    return this.client.actions.GuildStickerCreate.handle(this.guild, sticker).sticker;
  }

  /**
   * Data that resolves to give a Sticker object. This can be:
   * * A Sticker object
   * * A Snowflake
   * @typedef {Sticker|Snowflake} StickerResolvable
   */

  /**
   * Resolves a StickerResolvable to a Sticker object.
   * @method resolve
   * @memberof GuildStickerManager
   * @instance
   * @param {StickerResolvable} sticker The Sticker resolvable to identify
   * @returns {?Sticker}
   */

  /**
   * Resolves a StickerResolvable to a Sticker id string.
   * @method resolveId
   * @memberof GuildStickerManager
   * @instance
   * @param {StickerResolvable} sticker The Sticker resolvable to identify
   * @returns {?Snowflake}
   */

  /**
   * Edits a sticker.
   * @param {StickerResolvable} sticker The sticker to edit
   * @param {GuildStickerEditData} [data] The new data for the sticker
   * @param {string} [reason] Reason for editing this sticker
   * @returns {Promise<Sticker>}
   */
  async edit(
    sticker: StickerResolvableSource,
    data: GuildStickerEditData,
    reason?: string,
  ): Promise<InstanceType<typeof Sticker>> {
    const stickerId = this.resolveId(sticker);
    if (!stickerId) throw new TypeError('INVALID_TYPE', 'sticker', 'StickerResolvable');

    const d: RawStickerData = await this.client.api.guilds(this.guild.id).stickers(stickerId).patch({
      data,
      reason,
    });

    const existing = this.cache.get(stickerId);
    if (existing) {
      const clone = existing._clone();
      clone._patch(d);
      return clone;
    }
    return this._add(d);
  }

  /**
   * Deletes a sticker.
   * @param {StickerResolvable} sticker The sticker to delete
   * @param {string} [reason] Reason for deleting this sticker
   * @returns {Promise<void>}
   */
  async delete(sticker: StickerResolvableSource, reason?: string): Promise<void> {
    const stickerId = this.resolveId(sticker);
    if (!stickerId) throw new TypeError('INVALID_TYPE', 'sticker', 'StickerResolvable');

    await this.client.api.guilds(this.guild.id).stickers(stickerId).delete({ reason });
  }

  /**
   * Obtains one or more stickers from Discord, or the sticker cache if they're already available.
   * @param {Snowflake} [id] The Sticker's id
   * @param {BaseFetchOptions} [options] Additional options for this fetch
   * @returns {Promise<Sticker|Collection<Snowflake, Sticker>>}
   * @example
   * // Fetch all stickers from the guild
   * message.guild.stickers.fetch()
   *   .then(stickers => console.log(`There are ${stickers.size} stickers.`))
   *   .catch(console.error);
   * @example
   * // Fetch a single sticker
   * message.guild.stickers.fetch('222078108977594368')
   *   .then(sticker => console.log(`The sticker name is: ${sticker.name}`))
   *   .catch(console.error);
   */
  async fetch(id: Snowflake, options?: BaseFetchOptions): Promise<InstanceType<typeof Sticker>>;
  async fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<Snowflake, InstanceType<typeof Sticker>>>;
  async fetch(
    id?: Snowflake,
    { cache = true, force = false }: BaseFetchOptions = {},
  ): Promise<InstanceType<typeof Sticker> | Collection<Snowflake, InstanceType<typeof Sticker>>> {
    if (id) {
      if (!force) {
        const existing = this.cache.get(id);
        if (existing) return existing;
      }
      const sticker: RawStickerData = await this.client.api.guilds(this.guild.id).stickers(id).get();
      return this._add(sticker, cache);
    }

    const data: RawStickerData[] = await this.client.api.guilds(this.guild.id).stickers.get();
    return new Collection(
      data
        .filter((sticker): sticker is RawStickerData & { id: Snowflake } => Boolean(sticker.id))
        .map(sticker => [sticker.id, this._add(sticker, cache)]),
    );
  }

  /**
   * Fetches the user who uploaded this sticker, if this is a guild sticker.
   * @param {StickerResolvable} sticker The sticker to fetch the user for
   * @returns {Promise<?User>}
   */
  async fetchUser(sticker: StickerResolvableSource): Promise<User | null> {
    const resolved = this.resolve(sticker);
    if (!resolved) throw new TypeError('INVALID_TYPE', 'sticker', 'StickerResolvable');
    const data: RawStickerData = await this.client.api.guilds(this.guild.id).stickers(resolved.id).get();
    resolved._patch(data);
    return resolved.user;
  }
}

export default GuildStickerManager;
export { GuildStickerManager };
