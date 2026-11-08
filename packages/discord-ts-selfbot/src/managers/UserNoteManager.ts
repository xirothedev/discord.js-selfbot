const { Collection } = require('@discordjs/collection');
const BaseManager = require('./BaseManager');

/**
 * Manages API methods for Client and stores their cache.
 * @extends {BaseManager}
 */
class UserNoteManager extends BaseManager {
  constructor(client: any, data: any = {}) {
    super(client);
    /**
     * Cache User Note
     * @type {Collection<Snowflake, string>}
     */
    this.cache = new Collection(Object.entries(data));
  }

  _reload(data: any = {}) {
    this.cache = new Collection(Object.entries(data));
    return this;
  }

  async updateNote(id: any, note: any = null) {
    await this.client.api.users['@me'].notes(id).put({ data: { note } });
    if (!note) this.cache.delete(id, note);
    else this.cache.set(id, note);
    return this;
  }

  /**
   * Obtains a user from Discord, or the user cache if it's already available.
   * @param {UserResolvable} user The user to fetch
   * @param {BaseFetchOptions} [options] Additional options for this fetch
   * @returns {Promise<string>}
   */
  async fetch(user: any, { cache = true, force = false }: any = {}) {
    const id = this.resolveId(user);
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) return existing;
    }
    const data = await this.client.api.users['@me'].notes[id]
      .get()
      .then((d: any) => d.note)
      .catch(() => '');
    if (cache) this.cache.set(id, data);
    return data;
  }
}

export = UserNoteManager;
