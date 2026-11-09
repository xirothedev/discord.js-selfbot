import CachedManager from './CachedManager';
import InteractionResponse from '../structures/interfaces/InteractionResponses';

/**
 * Manages API methods for InteractionResponse and holds their cache.
 * @extends {CachedManager}
 */
class InteractionManager extends CachedManager<InteractionResponse> {
  declare channel: import('../structures/interfaces/TextBasedChannel').default;
  constructor(channel: any, iterable?: any) {
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

  _add(data: any, cache: any = true, _options?: unknown) {
    data = {
      ...data,
      channelId: this.channel.id,
      guildId: this.channel.guild?.id,
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
