import BaseGuildEmoji from './BaseGuildEmoji';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import GuildEmojiRoleManager from '../managers/GuildEmojiRoleManager';
import Permissions from '../util/Permissions';
import type { RawGuildEmojiData } from '../../typings/rawDataTypes';
import type { APIEmoji } from 'discord-api-types/v10';
import type { GuildEmojiEntity } from '../types/entities/guild-emoji';
import type { PatchOf } from '../types/schema';
import type { Guild } from './Guild';

class GuildEmoji extends BaseGuildEmoji implements GuildEmojiEntity {
  declare guild: Guild;
  declare author: GuildEmojiEntity['author'];
  declare _roles: GuildEmojiEntity['_roles'];
  constructor(client: import('../client/Client').default, data: RawGuildEmojiData, guild: import('./Guild').Guild) {
    super(client, data, guild);

    this.author = null;

    Object.defineProperty(this, '_roles', { value: [], writable: true });

    this._patch(data);
  }

  _clone() {
    const clone = super._clone();
    clone._roles = this._roles.slice();
    return clone;
  }

  _patch(data: PatchOf<'GuildEmoji'>) {
    super._patch(data);

    if (data.user) this.author = this.client.users._add(data.user);
    if (data.roles) this._roles = data.roles;
  }

  get deletable() {
    if (!this.guild.members.me) throw new Error('GUILD_UNCACHED_ME');
    return !this.managed && this.guild.members.me.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS);
  }

  get roles() {
    return new GuildEmojiRoleManager(this);
  }

  fetchAuthor() {
    return this.guild.emojis.fetchAuthor(this);
  }

  async edit(data: Record<string, unknown>, reason?: string) {
    const roles = (data.roles as unknown[] | undefined)?.map((r: unknown) => (r as { id?: unknown }).id ?? r);
    const newData = await this.client.api
      .guilds(this.guild.id)
      .emojis(this.id)
      .patch({
        data: {
          name: data.name,
          roles,
        },
        reason,
      });
    const clone = this._clone();
    clone._patch(newData);
    return clone;
  }

  setName(name: unknown, reason?: string) {
    return this.edit({ name }, reason);
  }

  async delete(reason?: string) {
    await this.guild.emojis.delete(this, reason);
    return this;
  }

  equals(other: GuildEmoji | APIEmoji | null) {
    if (other instanceof GuildEmoji) {
      return (
        other.id === this.id &&
        other.name === this.name &&
        other.managed === this.managed &&
        other.available === this.available &&
        other.requiresColons === this.requiresColons &&
        other.roles.cache.size === this.roles.cache.size &&
        other.roles.cache.every((role: unknown) => this.roles.cache.has((role as { id: string }).id))
      );
    } else {
      return (
        other?.id === this.id &&
        other?.name === this.name &&
        (other?.roles?.length ?? 0) === this.roles.cache.size &&
        (other?.roles ?? []).every(role => this.roles.cache.has(role))
      );
    }
  }
}

export default GuildEmoji;
export { GuildEmoji };
