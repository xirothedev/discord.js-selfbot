import CachedManager from './CachedManager';
import _PresenceModule from '../structures/Presence';
const { Presence } = _PresenceModule;
import type { RawPresenceData } from '../../typings/rawDataTypes';
import type { GatewayGuildMembersChunkPresence } from 'discord-api-types/v10';
import type { Client } from '../client/Client';

/**
 * Manages API methods for Presences and holds their cache.
 * @extends {CachedManager}
 */
class PresenceManager extends CachedManager<import('../structures/Presence').Presence> {
  constructor(client: Client, iterable?: Iterable<InstanceType<typeof Presence>>) {
    super(client, Presence, iterable);
  }

  /**
   * The cache of Presences
   * @type {Collection<Snowflake, Presence>}
   * @name PresenceManager#cache
   */

  _add(data: RawPresenceData | GatewayGuildMembersChunkPresence, cache = true): InstanceType<typeof Presence> {
    return super._add(data, cache, { id: data.user.id });
  }

  /**
   * Data that can be resolved to a Presence object. This can be:
   * * A Presence
   * * A UserResolvable
   * * A Snowflake
   * @typedef {Presence|UserResolvable|Snowflake} PresenceResolvable
   */

  /**
   * Resolves a {@link PresenceResolvable} to a {@link Presence} object.
   * @param {PresenceResolvable} presence The presence resolvable to resolve
   * @returns {?Presence}
   */
  resolve(presence: unknown): InstanceType<typeof Presence> | null {
    const presenceResolvable = super.resolve(presence);
    if (presenceResolvable) return presenceResolvable;
    const userId = this.client.users.resolveId(presence);
    return userId ? (this.cache.get(userId) ?? null) : null;
  }

  /**
   * Resolves a {@link PresenceResolvable} to a {@link Presence} id.
   * @param {PresenceResolvable} presence The presence resolvable to resolve
   * @returns {?Snowflake}
   */
  resolveId(presence: unknown): string | null {
    const presenceResolvable = super.resolveId(presence);
    if (presenceResolvable) return presenceResolvable;
    const userId = this.client.users.resolveId(presence);
    if (!userId) return null;
    return this.cache.has(userId) ? userId : null;
  }

  /**
   * Fetches the overall user presence for all of the user's non-offline friends and implicit relationships.
   * @returns {Promise<Collection<Snowflake, Presence>>}
   */
  async fetch() {
    const data: { presences: RawPresenceData[] } = await this.client.api.presences.get();
    // https://docs.discord.food/resources/presence#endpoints
    data.presences.forEach(presence => {
      this._add(presence, true);
    });
    return this.cache;
  }
}

export default PresenceManager;
export { PresenceManager };
