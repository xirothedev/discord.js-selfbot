import CachedManager from './CachedManager';
import InteractionResponse from '../structures/interfaces/InteractionResponses';

/**
 * Manages API methods for InteractionResponse and holds their cache.
 * @extends {CachedManager}
 */
class InteractionManager extends CachedManager<InteractionResponse> {
  declare channel: import('../types/channels').TextBasedChannel;
  constructor(channel: import('../types/channels').TextBasedChannel, iterable?: Iterable<InteractionResponse>) {
    super(channel.client, InteractionResponse, iterable);

    /**
     * The channel that the messages belong to
     * @type {TextBasedChannels}
     */
    this.channel = channel;
  }

  /**
   * The cache of InteractionResponse
   * @type {Collection<Snowflake, InteractionResponse>}
   * @name InteractionManager#cache
   */

  _add(data: Record<string, unknown>, cache = true, _options?: unknown) {
    data = {
      ...data,
      channelId: this.channel.id,
      guildId: 'guild' in this.channel && this.channel.guild ? this.channel.guild.id : undefined,
    };
    if (!data.id) return;
    // eslint-disable-next-line consistent-return
    return super._add(data, cache);
  }
}

// `CachedManager#_add` takes `(data, cache, options)`. The merged overloads
// keep this manager assignable to its base.
interface InteractionManager {
  _add(data: unknown, cache?: boolean): InteractionResponse | undefined;
  _add(data: unknown, cache?: boolean, options?: { id?: string; extras?: unknown[] }): InteractionResponse;
}

export default InteractionManager;
export { InteractionManager };
