import { Collection } from '@discordjs/collection';
import type { Snowflake } from 'discord-api-types/v10';
import Collector from './interfaces/Collector';
import type {
  Interaction,
  InteractionCollectorOptions,
  InteractionType,
  MessageComponentType,
  TextBasedChannelResolvable,
  User,
} from '../../typings';
import type Client from '../client/Client';
import type { Guild } from './Guild';
import type GuildChannel from './GuildChannel';
import type { Message } from './Message';
import type ThreadChannel from './ThreadChannel';
import _ConstantsModule from '../util/Constants';
const { Events } = _ConstantsModule;
const { InteractionTypes, MessageComponentTypes } = _ConstantsModule;

/**
 * @typedef {CollectorOptions} InteractionCollectorOptions
 * @property {TextBasedChannelsResolvable} [channel] The channel to listen to interactions from
 * @property {MessageComponentType} [componentType] The type of component to listen for
 * @property {GuildResolvable} [guild] The guild to listen to interactions from
 * @property {InteractionType} [interactionType] The type of interaction to listen for
 * @property {number} [max] The maximum total amount of interactions to collect
 * @property {number} [maxComponents] The maximum number of components to collect
 * @property {number} [maxUsers] The maximum number of users to interact
 * @property {Message|APIMessage} [message] The message to listen to interactions from
 */

/**
 * The source shape of {@link InteractionCollectorOptions}.
 *
 * `message` accepts both the cached `Message` and the raw `APIMessage`; the raw
 * shape only carries the `*_id` variants, so the source options allow either.
 */
type InteractionCollectorSourceOptions<T extends Interaction> = Omit<
  InteractionCollectorOptions<T>,
  'channel' | 'message'
> & {
  channel?: TextBasedChannelResolvable & { guild?: unknown };
  message?: {
    id: Snowflake;
    channel?: unknown;
    channelId?: Snowflake | null;
    channel_id?: Snowflake;
    guild?: unknown;
    guildId?: Snowflake | null;
    guild_id?: Snowflake;
  };
};

/**
 * Collects interactions.
 * Will automatically stop if the message ({@link Client#event:messageDelete messageDelete} or
 * {@link Client#event:messageDeleteBulk messageDeleteBulk}),
 * channel ({@link Client#event:channelDelete channelDelete}), or
 * guild ({@link Client#event:guildDelete guildDelete}) is deleted.
 * <info>Interaction collectors that do not specify `time` or `idle` may be prone to always running.
 * Ensure your interaction collectors end via either of these options or manual cancellation.</info>
 * @extends {Collector}
 */
class InteractionCollector<T extends Interaction = Interaction> extends Collector<Snowflake, T> {
  declare users: Collection<Snowflake, User>;
  declare options: InteractionCollectorSourceOptions<T>;
  declare messageId: Snowflake | null;
  declare channelId: Snowflake | null;
  declare guildId: Snowflake | null;
  declare interactionType: InteractionType | null;
  declare componentType: MessageComponentType | null;
  declare total: number;

  /**
   * @param {Client} client The client on which to collect interactions
   * @param {InteractionCollectorOptions} [options={}] The options to apply to this collector
   */
  constructor(client: Client, options: InteractionCollectorSourceOptions<T> = {}) {
    super(client, options);

    /**
     * The message from which to collect interactions, if provided
     * @type {?Snowflake}
     */
    this.messageId = options.message?.id ?? null;

    /**
     * The channel from which to collect interactions, if provided
     * @type {?Snowflake}
     */
    this.channelId =
      this.client.channels.resolveId(options.message?.channel) ??
      options.message?.channelId ??
      options.message?.channel_id ??
      this.client.channels.resolveId(options.channel) ??
      null;

    /**
     * The guild from which to collect interactions, if provided
     * @type {?Snowflake}
     */
    this.guildId =
      this.client.guilds.resolveId(options.message?.guild) ??
      options.message?.guildId ??
      options.message?.guild_id ??
      this.client.guilds.resolveId(options.channel?.guild) ??
      this.client.guilds.resolveId(options.guild) ??
      null;

    /**
     * The type of interaction to collect
     * @type {?InteractionType}
     */
    this.interactionType =
      typeof options.interactionType === 'number'
        ? InteractionTypes[options.interactionType]
        : (options.interactionType ?? null);

    /**
     * The type of component to collect
     * @type {?MessageComponentType}
     */
    this.componentType =
      typeof options.componentType === 'number'
        ? MessageComponentTypes[options.componentType]
        : (options.componentType ?? null);

    /**
     * The users that have interacted with this collector
     * @type {Collection<Snowflake, User>}
     */
    this.users = new Collection<Snowflake, User>();

    /**
     * The total number of interactions collected
     * @type {number}
     */
    this.total = 0;

    this.empty = this.empty.bind(this);
    this.client.incrementMaxListeners();

    const bulkDeleteListener = (messages: Collection<Snowflake, Message>) => {
      if (this.messageId && messages.has(this.messageId)) this.stop('messageDelete');
    };

    if (this.messageId) {
      this._handleMessageDeletion = this._handleMessageDeletion.bind(this);
      this.client.on(Events.MESSAGE_DELETE, this._handleMessageDeletion);
      this.client.on(Events.MESSAGE_BULK_DELETE, bulkDeleteListener);
    }

    if (this.channelId) {
      this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
      this._handleThreadDeletion = this._handleThreadDeletion.bind(this);
      this.client.on(Events.CHANNEL_DELETE, this._handleChannelDeletion);
      this.client.on(Events.THREAD_DELETE, this._handleThreadDeletion);
    }

    if (this.guildId) {
      this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
      this.client.on(Events.GUILD_DELETE, this._handleGuildDeletion);
    }

    this.client.on(Events.INTERACTION_CREATE, this.handleCollect);

    this.once('end', () => {
      this.client.removeListener(Events.INTERACTION_CREATE, this.handleCollect);
      this.client.removeListener(Events.MESSAGE_DELETE, this._handleMessageDeletion);
      this.client.removeListener(Events.MESSAGE_BULK_DELETE, bulkDeleteListener);
      this.client.removeListener(Events.CHANNEL_DELETE, this._handleChannelDeletion);
      this.client.removeListener(Events.THREAD_DELETE, this._handleThreadDeletion);
      this.client.removeListener(Events.GUILD_DELETE, this._handleGuildDeletion);
      this.client.decrementMaxListeners();
    });

    this.on('collect', (interaction: T) => {
      this.total++;
      this.users.set(interaction.user.id, interaction.user);
    });
  }

  /**
   * Handles an incoming interaction for possible collection.
   * @param {Interaction} interaction The interaction to possibly collect
   * @returns {?Snowflake}
   * @private
   */
  collect(interaction: T): Snowflake | null {
    /**
     * Emitted whenever an interaction is collected.
     * @event InteractionCollector#collect
     * @param {Interaction} interaction The interaction that was collected
     */
    if (this.interactionType && interaction.type !== this.interactionType) return null;
    if (this.componentType && (!('componentType' in interaction) || interaction.componentType !== this.componentType)) {
      return null;
    }
    if (this.messageId && getMessageId(interaction) !== this.messageId) return null;
    if (this.channelId && interaction.channelId !== this.channelId) return null;
    if (this.guildId && interaction.guildId !== this.guildId) return null;

    return interaction.id;
  }

  /**
   * Handles an interaction for possible disposal.
   * @param {Interaction} interaction The interaction that could be disposed of
   * @returns {?Snowflake}
   */
  dispose(interaction: T): Snowflake | null {
    /**
     * Emitted whenever an interaction is disposed of.
     * @event InteractionCollector#dispose
     * @param {Interaction} interaction The interaction that was disposed of
     */
    if (this.interactionType && interaction.type !== this.interactionType) return null;
    if (this.componentType && (!('componentType' in interaction) || interaction.componentType !== this.componentType)) {
      return null;
    }
    if (this.messageId && getMessageId(interaction) !== this.messageId) return null;
    if (this.channelId && interaction.channelId !== this.channelId) return null;
    if (this.guildId && interaction.guildId !== this.guildId) return null;

    return interaction.id;
  }

  /**
   * Empties this interaction collector.
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
    if (this.options.maxComponents && this.collected.size >= this.options.maxComponents) return 'componentLimit';
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
    if (message.id === this.messageId) {
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
    if (channel.id === this.channelId || (this.channelId !== null && channel.threads?.cache.has(this.channelId))) {
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
    if (thread.id === this.channelId) {
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
    if (guild.id === this.guildId) {
      this.stop('guildDelete');
    }
  }
}

/**
 * Reads the message id from an interaction that carries a message, without
 * assuming the concrete interaction subtype.
 */
function getMessageId(interaction: Interaction): Snowflake | null {
  if (!('message' in interaction)) return null;
  const { message } = interaction;
  if (!message || typeof message !== 'object' || !('id' in message)) return null;
  return typeof message.id === 'string' ? message.id : null;
}

export default InteractionCollector;
export { InteractionCollector };
