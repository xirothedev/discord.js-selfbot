import { Collection } from '@discordjs/collection';
import BaseManager from './BaseManager';
import type { Snowflake } from 'discord-api-types/v10';
import type { BaseFetchOptions } from '../../typings';
import type { Client } from '../client/Client';

/**
 * Manages API methods for Client and stores their cache.
 * @extends {BaseManager}
 */
class UserNoteManager extends BaseManager {
  declare cache: Collection<string, string>;

  constructor(client: Client, data: Record<string, string> = {}) {
    super(client);
    /**
     * Cache User Note
     * @type {Collection<Snowflake, string>}
     */
    this.cache = new Collection(Object.entries(data));
  }

  _reload(data: Record<string, string> = {}) {
    this.cache = new Collection(Object.entries(data));
    return this;
  }

  resolveId(user: unknown) {
    return this.client.users.resolveId(user);
  }

  async updateNote(id: Snowflake, note: string | null = null) {
    await this.client.api.users['@me'].notes(id).put({ data: { note } });
    if (!note) this.cache.delete(id);
    else this.cache.set(id, note);
    return this;
  }

  /**
   * Obtains a user from Discord, or the user cache if it's already available.
   * @param {UserResolvable} user The user to fetch
   * @param {BaseFetchOptions} [options] Additional options for this fetch
   * @returns {Promise<string>}
   */
  async fetch(user: unknown, { cache = true, force = false }: BaseFetchOptions = {}): Promise<string> {
    const id = this.resolveId(user);
    if (!id) return '';
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }
    const data = await this.client.api.users['@me'].notes[id]
      .get()
      .then((d: { note?: string }) => d.note ?? '')
      .catch(() => '');
    if (cache) this.cache.set(id, data);
    return data;
  }
}

export default UserNoteManager;
export { UserNoteManager };
