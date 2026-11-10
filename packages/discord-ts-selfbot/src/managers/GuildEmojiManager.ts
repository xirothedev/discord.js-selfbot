import { Collection } from '@discordjs/collection';
import BaseGuildEmojiManager from './BaseGuildEmojiManager';
import _errorsModule from '../errors';
const { Error, TypeError } = _errorsModule;
import DataResolver from '../util/DataResolver';
import Permissions from '../util/Permissions';
import type { RESTPatchAPIGuildEmojiResult, RESTPostAPIGuildEmojiResult, Snowflake } from 'discord-api-types/v10';
import type { RawGuildEmojiData } from '../../typings/rawDataTypes';
import type {
  BaseFetchOptions,
  BufferResolvable,
  Base64Resolvable,
  EmojiResolvable,
  GuildEmojiCreateOptions,
  GuildEmojiEditData,
} from '../../typings';
import type { Guild } from '../structures/Guild';
import type { GuildEmoji } from '../structures/GuildEmoji';
import type { ReactionEmoji } from '../structures/ReactionEmoji';
import type { User } from '../structures/User';

type EmojiResolvableSource = GuildEmoji | ReactionEmoji | Snowflake | EmojiResolvable;

class GuildEmojiManager extends BaseGuildEmojiManager {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<GuildEmoji>) {
    super(guild.client, iterable);

    this.guild = guild;
  }

  _add(data: RawGuildEmojiData, cache = true): GuildEmoji {
    return super._add(data, cache, { extras: [this.guild] });
  }

  async create(
    attachment: BufferResolvable | Base64Resolvable,
    name: string,
    { roles, reason }: GuildEmojiCreateOptions = {},
  ): Promise<GuildEmoji> {
    const resolvedImage = await DataResolver.resolveImage(attachment);
    if (!resolvedImage) throw new TypeError('REQ_RESOURCE_TYPE');

    const data: { image: string; name: string; roles?: Snowflake[] } = { image: resolvedImage, name };
    if (roles) {
      if (!Array.isArray(roles) && !(roles instanceof Collection)) {
        throw new TypeError('INVALID_TYPE', 'options.roles', 'Array or Collection of Roles or Snowflakes', true);
      }
      data.roles = [];
      for (const role of roles.values()) {
        const resolvedRole = this.guild.roles.resolveId(role);
        if (!resolvedRole) throw new TypeError('INVALID_ELEMENT', 'Array or Collection', 'options.roles', role);
        data.roles.push(resolvedRole);
      }
    }

    const emoji = await this.client.api.guilds(this.guild.id).emojis.post<RESTPostAPIGuildEmojiResult>({
      data,
      reason,
    });
    return this.client.actions.GuildEmojiCreate.handle(this.guild, emoji).emoji;
  }

  async fetch(id: Snowflake, options?: BaseFetchOptions): Promise<GuildEmoji>;
  async fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<Snowflake, GuildEmoji>>;
  async fetch(
    id?: Snowflake,
    { cache = true, force = false }: BaseFetchOptions = {},
  ): Promise<GuildEmoji | Collection<Snowflake, GuildEmoji>> {
    if (id) {
      if (!force) {
        const existing = this.cache.get(id);
        if (existing) return existing;
      }
      const emoji: RawGuildEmojiData = await this.client.api.guilds(this.guild.id).emojis(id).get();
      return this._add(emoji, cache);
    }

    const data: RawGuildEmojiData[] = await this.client.api.guilds(this.guild.id).emojis.get();
    const emojis = new Collection<Snowflake, GuildEmoji>();
    for (const emoji of data) {
      if (emoji.id) emojis.set(emoji.id, this._add(emoji, cache));
    }
    return emojis;
  }

  async delete(emoji: EmojiResolvableSource, reason?: string): Promise<void> {
    const id = this.resolveId(emoji);
    if (!id) throw new TypeError('INVALID_TYPE', 'emoji', 'EmojiResolvable', true);
    await this.client.api.guilds(this.guild.id).emojis(id).delete({ reason });
  }

  async edit(emoji: EmojiResolvableSource, data: GuildEmojiEditData, reason?: string): Promise<GuildEmoji> {
    const id = this.resolveId(emoji);
    if (!id) throw new TypeError('INVALID_TYPE', 'emoji', 'EmojiResolvable', true);
    const roles = data.roles
      ? (data.roles instanceof Collection ? [...data.roles.values()] : data.roles).map(r =>
          this.guild.roles.resolveId(r),
        )
      : undefined;
    const newData = await this.client.api
      .guilds(this.guild.id)
      .emojis(id)
      .patch<RESTPatchAPIGuildEmojiResult>({
        data: {
          name: data.name,
          roles,
        },
        reason,
      });
    const existing = this.cache.get(id);
    if (existing) {
      const clone = existing._clone();
      clone._patch(newData);
      return clone;
    }
    return this._add(newData);
  }

  async fetchAuthor(emoji: EmojiResolvableSource): Promise<User> {
    const resolved = this.resolve(emoji);
    if (!resolved) throw new TypeError('INVALID_TYPE', 'emoji', 'EmojiResolvable', true);
    if (resolved.managed) {
      throw new Error('EMOJI_MANAGED');
    }

    const { me } = this.guild.members;
    if (!me) throw new Error('GUILD_UNCACHED_ME');
    if (!me.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
      throw new Error('MISSING_MANAGE_EMOJIS_AND_STICKERS_PERMISSION', this.guild);
    }

    const data: RawGuildEmojiData = await this.client.api.guilds(this.guild.id).emojis(resolved.id).get();
    resolved._patch(data);
    if (!resolved.author) throw new Error('EMOJI_AUTHOR_UNKNOWN');
    return resolved.author;
  }
}

export default GuildEmojiManager;
export { GuildEmojiManager };
