import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import MessagePayload from '../structures/MessagePayload';
import _StickerModule from '../structures/Sticker';

const { Sticker } = _StickerModule;
import type {
  RESTPostAPIGuildStickerResult,
  Snowflake,
} from 'discord-api-types/v10';
import type { RawStickerData } from '../../typings/rawDataTypes';
import type {
  BaseFetchOptions,
  BufferResolvable,
  GuildStickerCreateOptions,
  GuildStickerEditData,
  StickerResolvable,
  FileOptions,
  MessageAttachment,
} from '../../typings';
import type { Guild } from '../structures/Guild';
import type { User } from '../structures/User';
import type { Stream } from 'node:stream';
import type { Sticker as StickerType } from '../structures/Sticker';

type StickerResolvableSource = InstanceType<typeof Sticker> | StickerResolvable;

class GuildStickerManager extends CachedManager<StickerType> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<InstanceType<typeof Sticker>>) {
    super(guild.client, Sticker, iterable);

    this.guild = guild;
  }

  _add(data: RawStickerData, cache = true): InstanceType<typeof Sticker> {
    return super._add(data, cache, { extras: [this.guild] });
  }

  async create(
    file: BufferResolvable | Stream | FileOptions | MessageAttachment,
    name: string,
    tags: string,
    { description, reason }: GuildStickerCreateOptions = {}
  ): Promise<InstanceType<typeof Sticker>> {
    const resolvedFile = await MessagePayload.resolveFile(file);
    if (!resolvedFile) {
      throw new TypeError('REQ_RESOURCE_TYPE');
    }
    const payloadFile = { ...resolvedFile, key: 'file' };

    const data = { description: description ?? '', name, tags };

    const sticker = await this.client.api
      .guilds(this.guild.id)
      .stickers.post<RESTPostAPIGuildStickerResult>({
        data,
        dontUsePayloadJSON: true,
        files: [payloadFile],
        reason,
      });
    return this.client.actions.GuildStickerCreate.handle(this.guild, sticker)
      .sticker;
  }

  async edit(
    sticker: StickerResolvableSource,
    data: GuildStickerEditData,
    reason?: string
  ): Promise<InstanceType<typeof Sticker>> {
    const stickerId = this.resolveId(sticker);
    if (!stickerId) {
      throw new TypeError('INVALID_TYPE', 'sticker', 'StickerResolvable');
    }

    const d: RawStickerData = await this.client.api
      .guilds(this.guild.id)
      .stickers(stickerId)
      .patch({
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

  async delete(
    sticker: StickerResolvableSource,
    reason?: string
  ): Promise<void> {
    const stickerId = this.resolveId(sticker);
    if (!stickerId) {
      throw new TypeError('INVALID_TYPE', 'sticker', 'StickerResolvable');
    }

    await this.client.api
      .guilds(this.guild.id)
      .stickers(stickerId)
      .delete({ reason });
  }

  async fetch(
    id: Snowflake,
    options?: BaseFetchOptions
  ): Promise<InstanceType<typeof Sticker>>;
  async fetch(
    id?: undefined,
    options?: BaseFetchOptions
  ): Promise<Collection<Snowflake, InstanceType<typeof Sticker>>>;
  async fetch(
    id?: Snowflake,
    { cache = true, force = false }: BaseFetchOptions = {}
  ): Promise<
    | InstanceType<typeof Sticker>
    | Collection<Snowflake, InstanceType<typeof Sticker>>
  > {
    if (id) {
      if (!force) {
        const existing = this.cache.get(id);
        if (existing) {
          return existing;
        }
      }
      const sticker: RawStickerData = await this.client.api
        .guilds(this.guild.id)
        .stickers(id)
        .get();
      return this._add(sticker, cache);
    }

    const data: RawStickerData[] = await this.client.api
      .guilds(this.guild.id)
      .stickers.get();
    return new Collection(
      data
        .filter((sticker): sticker is RawStickerData & { id: Snowflake } =>
          Boolean(sticker.id)
        )
        .map((sticker) => [sticker.id, this._add(sticker, cache)])
    );
  }

  async fetchUser(sticker: StickerResolvableSource): Promise<User | null> {
    const resolved = this.resolve(sticker);
    if (!resolved) {
      throw new TypeError('INVALID_TYPE', 'sticker', 'StickerResolvable');
    }
    const data: RawStickerData = await this.client.api
      .guilds(this.guild.id)
      .stickers(resolved.id)
      .get();
    resolved._patch(data);
    return resolved.user;
  }
}

export default GuildStickerManager;
export { GuildStickerManager };
