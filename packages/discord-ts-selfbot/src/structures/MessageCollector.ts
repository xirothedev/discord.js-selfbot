import type { Snowflake } from 'discord-api-types/v10';
import { Collection } from '@discordjs/collection';
import Collector from './interfaces/Collector';
import type { CollectorOptions } from '../../typings';
import type TextBasedChannel from './interfaces/TextBasedChannel';
import type { Guild } from './Guild';
import type GuildChannel from './GuildChannel';
import type { Message } from './Message';
import type ThreadChannel from './ThreadChannel';
import _ConstantsModule from '../util/Constants';
const { Events } = _ConstantsModule;

/**
 * The source shape of {@link MessageCollectorOptions}.
 *
 * The public options use the public `Message` class; the source collector
 * operates on the concrete class instead.
 */
export type MessageCollectorSourceOptions = CollectorOptions<[Message]> & {
  max?: number;
  maxProcessed?: number;
};

/**
 * @typedef {CollectorOptions} MessageCollectorOptions
 * @property {number} max The maximum amount of messages to collect
 * @property {number} maxProcessed The maximum amount of messages to process
 */

/**
 * Collects messages on a channel.
 * Will automatically stop if the channel ({@link Client#event:channelDelete channelDelete}),
 * thread ({@link Client#event:threadDelete threadDelete}), or
 * guild ({@link Client#event:guildDelete guildDelete}) is deleted.
 * @extends {Collector}
 */
class MessageCollector extends Collector<Snowflake, Message> {
  declare options: MessageCollectorSourceOptions;
  declare channel: TextBasedChannel;
  declare received: number;

  /**
   * @param {TextBasedChannels} channel The channel
   * @param {MessageCollectorOptions} options The options to be applied to this collector
   * @emits MessageCollector#message
   */
  constructor(channel: TextBasedChannel, options: MessageCollectorSourceOptions = {}) {
    super(channel.client, options);

    /**
     * The channel
     * @type {TextBasedChannels}
     */
    this.channel = channel;

    /**
     * Total number of messages that were received in the channel during message collection
     * @type {number}
     */
    this.received = 0;

    const bulkDeleteListener = (messages: Collection<Snowflake, Message>) => {
      for (const message of messages.values()) this.handleDispose(message);
    };

    this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
    this._handleThreadDeletion = this._handleThreadDeletion.bind(this);
    this._handleGuildDeletion = this._handleGuildDeletion.bind(this);

    this.client.incrementMaxListeners();
    this.client.on(Events.MESSAGE_CREATE, this.handleCollect);
    this.client.on(Events.MESSAGE_DELETE, this.handleDispose);
    this.client.on(Events.MESSAGE_BULK_DELETE, bulkDeleteListener);
    this.client.on(Events.CHANNEL_DELETE, this._handleChannelDeletion);
    this.client.on(Events.THREAD_DELETE, this._handleThreadDeletion);
    this.client.on(Events.GUILD_DELETE, this._handleGuildDeletion);

    this.once('end', () => {
      this.client.removeListener(Events.MESSAGE_CREATE, this.handleCollect);
      this.client.removeListener(Events.MESSAGE_DELETE, this.handleDispose);
      this.client.removeListener(Events.MESSAGE_BULK_DELETE, bulkDeleteListener);
      this.client.removeListener(Events.CHANNEL_DELETE, this._handleChannelDeletion);
      this.client.removeListener(Events.THREAD_DELETE, this._handleThreadDeletion);
      this.client.removeListener(Events.GUILD_DELETE, this._handleGuildDeletion);
      this.client.decrementMaxListeners();
    });
  }

  /**
   * Handles a message for possible collection.
   * @param {Message} message The message that could be collected
   * @returns {?Snowflake}
   * @private
   */
  collect(message: Message): Snowflake | null {
    /**
     * Emitted whenever a message is collected.
     * @event MessageCollector#collect
     * @param {Message} message The message that was collected
     */
    if (message.channelId !== this.channel.id) return null;
    this.received++;
    return message.id;
  }

  /**
   * Handles a message for possible disposal.
   * @param {Message} message The message that could be disposed of
   * @returns {?Snowflake}
   */
  dispose(message: Message): Snowflake | null {
    /**
     * Emitted whenever a message is disposed of.
     * @event MessageCollector#dispose
     * @param {Message} message The message that was disposed of
     */
    return message.channelId === this.channel.id ? message.id : null;
  }

  /**
   * The reason this collector has ended with, or null if it hasn't ended yet
   * @type {?string}
   * @readonly
   */
  get endReason(): string | null {
    if (this.options.max && this.collected.size >= this.options.max) return 'limit';
    if (this.options.maxProcessed && this.received === this.options.maxProcessed) return 'processedLimit';
    return null;
  }

  /**
   * Handles checking if the channel has been deleted, and if so, stops the collector with the reason 'channelDelete'.
   * @private
   * @param {GuildChannel} channel The channel that was deleted
   * @returns {void}
   */
  _handleChannelDeletion(channel: GuildChannel) {
    if (channel.id === this.channel.id || ('parentId' in this.channel && channel.id === this.channel.parentId)) {
      this.stop('channelDelete');
    }
  }

  /**
   * Handles checking if the thread has been deleted, and if so, stops the collector with the reason 'threadDelete'.
   * @private
   * @param {ThreadChannel} thread The thread that was deleted
   * @returns {void}
   */
  _handleThreadDeletion(thread: ThreadChannel) {
    if (thread.id === this.channel.id) {
      this.stop('threadDelete');
    }
  }

  /**
   * Handles checking if the guild has been deleted, and if so, stops the collector with the reason 'guildDelete'.
   * @private
   * @param {Guild} guild The guild that was deleted
   * @returns {void}
   */
  _handleGuildDeletion(guild: Guild) {
    if ('guild' in this.channel && guild.id === this.channel.guild?.id) {
      this.stop('guildDelete');
    }
  }
}

export default MessageCollector;
export { MessageCollector };
