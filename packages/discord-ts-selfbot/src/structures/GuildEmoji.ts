import BaseGuildEmoji from './BaseGuildEmoji';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import GuildEmojiRoleManager from '../managers/GuildEmojiRoleManager';
import Permissions from '../util/Permissions';
import type { RawGuildEmojiData } from '../../typings/rawDataTypes';
import type { GuildEmojiEntity } from '../types/entities/guild-emoji';
import type { PatchOf } from '../types/schema';
import type { Guild } from './Guild';

/**
 * Represents a custom emoji.
 * @extends {BaseGuildEmoji}
 */
class GuildEmoji extends BaseGuildEmoji implements GuildEmojiEntity {
  declare guild: Guild;
  declare author: GuildEmojiEntity['author'];
  declare _roles: GuildEmojiEntity['_roles'];
  constructor(client: import('../client/Client').default, data: RawGuildEmojiData, guild: import('./Guild').Guild) {
    super(client, data, guild);

    /**
     * The user who created this emoji
     * @type {?User}
     */
    this.author = null;

    /**
     * Array of role ids this emoji is active for
     * @name GuildEmoji#_roles
     * @type {Snowflake[]}
     * @private
     */
    Object.defineProperty(this, '_roles', { value: [], writable: true });

    this._patch(data);
  }

  /**
   * The guild this emoji is part of
   * @type {Guild}
   * @name GuildEmoji#guild
   */

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

  /**
   * Whether the emoji is deletable by the client user
   * @type {boolean}
   * @readonly
   */
  get deletable() {
    if (!this.guild.members.me) throw new Error('GUILD_UNCACHED_ME');
    return !this.managed && this.guild.members.me.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS);
  }

  /**
   * A manager for roles this emoji is active for.
   * @type {GuildEmojiRoleManager}
   * @readonly
   */
  get roles() {
    return new GuildEmojiRoleManager(this);
  }

  /**
   * Fetches the author for this emoji
   * @returns {Promise<User>}
   */
  fetchAuthor() {
    return this.guild.emojis.fetchAuthor(this);
  }

  /**
   * Data for editing an emoji.
   * @typedef {Object} GuildEmojiEditData
   * @property {string} [name] The name of the emoji
   * @property {Collection<Snowflake, Role>|RoleResolvable[]} [roles] Roles to restrict emoji to
   */

  /**
   * Edits the emoji.
   * @param {GuildEmojiEditData} data The new data for the emoji
   * @param {string} [reason] Reason for editing this emoji
   * @returns {Promise<GuildEmoji>}
   * @example
   * // Edit an emoji
   * emoji.edit({ name: 'newemoji' })
   *   .then(e => console.log(`Edited emoji ${e}`))
   *   .catch(console.error);
   */
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

  /**
   * Sets the name of the emoji.
   * @param {string} name The new name for the emoji
   * @param {string} [reason] Reason for changing the emoji's name
   * @returns {Promise<GuildEmoji>}
   */
  setName(name: unknown, reason?: string) {
    return this.edit({ name }, reason);
  }

  /**
   * Deletes the emoji.
   * @param {string} [reason] Reason for deleting the emoji
   * @returns {Promise<GuildEmoji>}
   */
  async delete(reason?: string) {
    await this.guild.emojis.delete(this, reason);
    return this;
  }

  /**
   * Whether this emoji is the same as another one.
   * @param {GuildEmoji|APIEmoji} other The emoji to compare it to
   * @returns {boolean}
   */
  equals(other: GuildEmoji | Record<string, unknown> | null) {
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
      const o = other as { id?: unknown; name?: unknown; roles?: unknown[] } | null;
      return (
        o?.id === this.id &&
        o?.name === this.name &&
        (o?.roles?.length ?? 0) === this.roles.cache.size &&
        (o?.roles ?? []).every((role: unknown) => this.roles.cache.has(role as string))
      );
    }
  }
}

export default GuildEmoji;
export { GuildEmoji };
