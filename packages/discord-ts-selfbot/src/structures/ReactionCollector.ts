import { Collection } from '@discordjs/collection';
import type { Snowflake } from 'discord-api-types/v10';
import Collector from './interfaces/Collector';
import type { CollectorOptions } from '../../typings';
import type { Guild } from './Guild';
import type GuildChannel from './GuildChannel';

import type { Message } from './Message';
import type MessageReaction from './MessageReaction';
import type ThreadChannel from './ThreadChannel';
import type User from './User';
import _ConstantsModule from '../util/Constants';
const { Events } = _ConstantsModule;

/**
 * The source shape of {@link ReactionCollectorOptions}.
 *
 * The public options use the public `MessageReaction`/`User` classes; the
 * source collector operates on the concrete classes instead.
 */
export type ReactionCollectorSourceOptions = CollectorOptions<[MessageReaction, User]> & {
  max?: number;
  maxEmojis?: number;
  maxUsers?: number;
};

/**
 * @typedef {CollectorOptions} ReactionCollectorOptions
 * @property {number} max The maximum total amount of reactions to collect
 * @property {number} maxEmojis The maximum number of emojis to collect
 * @property {number} maxUsers The maximum number of users to react
 */

/**
 * Collects reactions on messages.
 * Will automatically stop if the message ({@link Client#event:messageDelete messageDelete} or
 * {@link Client#event:messageDeleteBulk messageDeleteBulk}),
 * channel ({@link Client#event:channelDelete channelDelete}),
 * thread ({@link Client#event:threadDelete threadDelete}), or
 * guild ({@link Client#event:guildDelete guildDelete}) is deleted.
 * @extends {Collector}
 */
class ReactionCollector extends Collector<Snowflake | string, MessageReaction, [User]> {
  declare users: Collection<Snowflake, User>;
  declare options: ReactionCollectorSourceOptions;
  declare message: Message;
  declare total: number;

  /**
   * @param {Message} message The message upon which to collect reactions
   * @param {ReactionCollectorOptions} [options={}] The options to apply to this collector
   */
  constructor(message: Message, options: ReactionCollectorSourceOptions = {}) {
    super(message.client, options);

    /**
     * The message upon which to collect reactions
     * @type {Message}
     */
    this.message = message;

    /**
     * The users that have reacted to this message
     * @type {Collection}
     */
    this.users = new Collection<Snowflake, User>();

    /**
     * The total number of reactions collected
     * @type {number}
     */
    this.total = 0;

    this.empty = this.empty.bind(this);
    this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
    this._handleThreadDeletion = this._handleThreadDeletion.bind(this);
    this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
    this._handleMessageDeletion = this._handleMessageDeletion.bind(this);

    const bulkDeleteListener = (messages: Collection<Snowflake, Message>) => {
      if (messages.has(this.message.id)) this.stop('messageDelete');
    };

    this.client.incrementMaxListeners();
    this.client.on(Events.MESSAGE_REACTION_ADD, this.handleCollect);
    this.client.on(Events.MESSAGE_REACTION_REMOVE, this.handleDispose);
    this.client.on(Events.MESSAGE_REACTION_REMOVE_ALL, this.empty);
    this.client.on(Events.MESSAGE_DELETE, this._handleMessageDeletion);
    this.client.on(Events.MESSAGE_BULK_DELETE, bulkDeleteListener);
    this.client.on(Events.CHANNEL_DELETE, this._handleChannelDeletion);
    this.client.on(Events.THREAD_DELETE, this._handleThreadDeletion);
    this.client.on(Events.GUILD_DELETE, this._handleGuildDeletion);

    this.once('end', () => {
      this.client.removeListener(Events.MESSAGE_REACTION_ADD, this.handleCollect);
      this.client.removeListener(Events.MESSAGE_REACTION_REMOVE, this.handleDispose);
      this.client.removeListener(Events.MESSAGE_REACTION_REMOVE_ALL, this.empty);
      this.client.removeListener(Events.MESSAGE_DELETE, this._handleMessageDeletion);
      this.client.removeListener(Events.MESSAGE_BULK_DELETE, bulkDeleteListener);
      this.client.removeListener(Events.CHANNEL_DELETE, this._handleChannelDeletion);
      this.client.removeListener(Events.THREAD_DELETE, this._handleThreadDeletion);
      this.client.removeListener(Events.GUILD_DELETE, this._handleGuildDeletion);
      this.client.decrementMaxListeners();
    });

    this.on('collect', (reaction: MessageReaction, user: User) => {
      /**
       * Emitted whenever a reaction is newly created on a message. Will emit only when a new reaction is
       * added to the message, as opposed to {@link Collector#collect} which will
       * be emitted even when a reaction has already been added to the message.
       * @event ReactionCollector#create
       * @param {MessageReaction} reaction The reaction that was added
       * @param {User} user The user that added the reaction
       */
      if (reaction.count === 1) {
        this.emit('create', reaction, user);
      }
      this.total++;
      this.users.set(user.id, user);
    });

    this.on('remove', (_reaction: MessageReaction, user: User) => {
      this.total--;
      if (!this.collected.some(reaction => reaction.users.cache.has(user.id))) this.users.delete(user.id);
    });
  }

  /**
   * Handles an incoming reaction for possible collection.
   * @param {MessageReaction} reaction The reaction to possibly collect
   * @param {User} user The user that added the reaction
   * @returns {?(Snowflake|string)}
   * @private
   */
  collect(reaction: MessageReaction): Snowflake | string | null {
    /**
     * Emitted whenever a reaction is collected.
     * @event ReactionCollector#collect
     * @param {MessageReaction} reaction The reaction that was collected
     * @param {User} user The user that added the reaction
     */
    if (reaction.message.id !== this.message.id) return null;

    return ReactionCollector.key(reaction);
  }

  /**
   * Handles a reaction deletion for possible disposal.
   * @param {MessageReaction} reaction The reaction to possibly dispose of
   * @param {User} user The user that removed the reaction
   * @returns {?(Snowflake|string)}
   */
  dispose(reaction: MessageReaction, user: User): Snowflake | string | null {
    /**
     * Emitted when the reaction had all the users removed and the `dispose` option is set to true.
     * @event ReactionCollector#dispose
     * @param {MessageReaction} reaction The reaction that was disposed of
     * @param {User} user The user that removed the reaction
     */
    if (reaction.message.id !== this.message.id) return null;

    /**
     * Emitted when the reaction had one user removed and the `dispose` option is set to true.
     * @event ReactionCollector#remove
     * @param {MessageReaction} reaction The reaction that was removed
     * @param {User} user The user that removed the reaction
     */
    if (this.collected.has(ReactionCollector.key(reaction)) && this.users.has(user.id)) {
      this.emit('remove', reaction, user);
    }
    return reaction.count ? null : ReactionCollector.key(reaction);
  }

  /**
   * Empties this reaction collector.
   */
  empty() {
    this.total = 0;
    this.collected.clear();
    this.users.clear();
    this.checkEnd();
  }

  /**
   * The reason this collector has ended with, or null if it hasn't ended yet
   * @type {?string}
   * @readonly
   */
  get endReason(): string | null {
    if (this.options.max && this.total >= this.options.max) return 'limit';
    if (this.options.maxEmojis && this.collected.size >= this.options.maxEmojis) return 'emojiLimit';
    if (this.options.maxUsers && this.users.size >= this.options.maxUsers) return 'userLimit';
    return null;
  }

  /**
   * Handles checking if the message has been deleted, and if so, stops the collector with the reason 'messageDelete'.
   * @private
   * @param {Message} message The message that was deleted
   * @returns {void}
   */
  _handleMessageDeletion(message: Message) {
    if (message.id === this.message.id) {
      this.stop('messageDelete');
    }
  }

  /**
   * Handles checking if the channel has been deleted, and if so, stops the collector with the reason 'channelDelete'.
   * @private
   * @param {GuildChannel} channel The channel that was deleted
   * @returns {void}
   */
  _handleChannelDeletion(channel: GuildChannel & { threads?: { cache: Collection<Snowflake, ThreadChannel> } }) {
    if (channel.id === this.message.channelId || channel.threads?.cache.has(this.message.channelId)) {
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
    if (thread.id === this.message.channelId) {
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
    if (guild.id === this.message.guild?.id) {
      this.stop('guildDelete');
    }
  }

  /**
   * Gets the collector key for a reaction.
   * @param {MessageReaction} reaction The message reaction to get the key for
   * @returns {Snowflake|string}
   */
  static key(reaction: MessageReaction): Snowflake | string {
    return reaction.emoji.id ?? reaction.emoji.name ?? '';
  }
}

export default ReactionCollector;
export { ReactionCollector };
