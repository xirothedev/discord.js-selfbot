const CachedManager = require('./CachedManager');
const InteractionResponse = require('../structures/InteractionResponse');

/**
 * Manages API methods for InteractionResponse and holds their cache.
 * @extends {CachedManager}
 */
class InteractionManager extends CachedManager {
  constructor(channel: any, iterable: any) {
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

  _add(data: any, cache: any = true) {
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

export = InteractionManager;
