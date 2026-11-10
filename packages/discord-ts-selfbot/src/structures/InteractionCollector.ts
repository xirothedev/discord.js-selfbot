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

type InteractionCollectorSourceOptions<TInteraction extends Interaction> = Omit<
  InteractionCollectorOptions<TInteraction>,
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

function getMessageId(interaction: Interaction): Snowflake | null {
  if (!('message' in interaction)) {
    return null;
  }
  const { message } = interaction;
  if (!message || typeof message !== 'object' || !('id' in message)) {
    return null;
  }
  return typeof message.id === 'string' ? message.id : null;
}

class InteractionCollector<
  TInteraction extends Interaction = Interaction,
> extends Collector<Snowflake, TInteraction> {
  declare users: Collection<Snowflake, User>;
  declare options: InteractionCollectorSourceOptions<TInteraction>;
  declare messageId: Snowflake | null;
  declare channelId: Snowflake | null;
  declare guildId: Snowflake | null;
  declare interactionType: InteractionType | null;
  declare componentType: MessageComponentType | null;
  declare total: number;

  constructor(
    client: Client,
    options: InteractionCollectorSourceOptions<TInteraction> = {}
  ) {
    super(client, options);

    this.messageId = options.message?.id ?? null;
    this.channelId = this.resolveChannelId(options);
    this.guildId = this.resolveGuildId(options);
    this.interactionType = InteractionCollector.resolveInteractionType(
      options.interactionType
    );
    this.componentType = InteractionCollector.resolveComponentType(
      options.componentType
    );

    this.users = new Collection<Snowflake, User>();

    this.total = 0;

    this.empty = this.empty.bind(this);
    this.client.incrementMaxListeners();

    const bulkDeleteListener = (messages: Collection<Snowflake, Message>) => {
      if (this.messageId && messages.has(this.messageId)) {
        this.stop('messageDelete');
      }
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
      this.client.removeListener(
        Events.MESSAGE_DELETE,
        this._handleMessageDeletion
      );
      this.client.removeListener(
        Events.MESSAGE_BULK_DELETE,
        bulkDeleteListener
      );
      this.client.removeListener(
        Events.CHANNEL_DELETE,
        this._handleChannelDeletion
      );
      this.client.removeListener(
        Events.THREAD_DELETE,
        this._handleThreadDeletion
      );
      this.client.removeListener(
        Events.GUILD_DELETE,
        this._handleGuildDeletion
      );
      this.client.decrementMaxListeners();
    });

    this.on('collect', (interaction: TInteraction) => {
      this.total++;
      this.users.set(interaction.user.id, interaction.user);
    });
  }

  private resolveChannelId(
    options: InteractionCollectorSourceOptions<TInteraction>
  ): Snowflake | null {
    return (
      this.client.channels.resolveId(options.message?.channel) ??
      options.message?.channelId ??
      options.message?.channel_id ??
      this.client.channels.resolveId(options.channel) ??
      null
    );
  }

  private resolveGuildId(
    options: InteractionCollectorSourceOptions<TInteraction>
  ): Snowflake | null {
    return (
      this.client.guilds.resolveId(options.message?.guild) ??
      options.message?.guildId ??
      options.message?.guild_id ??
      this.client.guilds.resolveId(options.channel?.guild) ??
      this.client.guilds.resolveId(options.guild) ??
      null
    );
  }

  private static resolveInteractionType(
    value: InteractionType | number | null | undefined
  ): InteractionType | null {
    if (typeof value === 'number') {
      return InteractionTypes[value];
    }
    return value ?? null;
  }

  private static resolveComponentType(
    value: MessageComponentType | number | null | undefined
  ): MessageComponentType | null {
    if (typeof value === 'number') {
      return MessageComponentTypes[value];
    }
    return value ?? null;
  }

  collect(interaction: TInteraction): Snowflake | null {
    if (this.interactionType && interaction.type !== this.interactionType) {
      return null;
    }
    if (
      this.componentType &&
      (!('componentType' in interaction) ||
        interaction.componentType !== this.componentType)
    ) {
      return null;
    }
    if (this.messageId && getMessageId(interaction) !== this.messageId) {
      return null;
    }
    if (this.channelId && interaction.channelId !== this.channelId) {
      return null;
    }
    if (this.guildId && interaction.guildId !== this.guildId) {
      return null;
    }

    return interaction.id;
  }

  dispose(interaction: TInteraction): Snowflake | null {
    if (this.interactionType && interaction.type !== this.interactionType) {
      return null;
    }
    if (
      this.componentType &&
      (!('componentType' in interaction) ||
        interaction.componentType !== this.componentType)
    ) {
      return null;
    }
    if (this.messageId && getMessageId(interaction) !== this.messageId) {
      return null;
    }
    if (this.channelId && interaction.channelId !== this.channelId) {
      return null;
    }
    if (this.guildId && interaction.guildId !== this.guildId) {
      return null;
    }

    return interaction.id;
  }

  empty() {
    this.total = 0;
    this.collected.clear();
    this.users.clear();
    this.checkEnd();
  }

  get endReason(): string | null {
    if (this.options.max && this.total >= this.options.max) {
      return 'limit';
    }
    if (
      this.options.maxComponents &&
      this.collected.size >= this.options.maxComponents
    ) {
      return 'componentLimit';
    }
    if (this.options.maxUsers && this.users.size >= this.options.maxUsers) {
      return 'userLimit';
    }
    return null;
  }

  _handleMessageDeletion(message: Message) {
    if (message.id === this.messageId) {
      this.stop('messageDelete');
    }
  }

  _handleChannelDeletion(
    channel: GuildChannel & {
      threads?: { cache: Collection<Snowflake, ThreadChannel> };
    }
  ) {
    if (
      channel.id === this.channelId ||
      (this.channelId !== null && channel.threads?.cache.has(this.channelId))
    ) {
      this.stop('channelDelete');
    }
  }

  _handleThreadDeletion(thread: ThreadChannel) {
    if (thread.id === this.channelId) {
      this.stop('threadDelete');
    }
  }

  _handleGuildDeletion(guild: Guild) {
    if (guild.id === this.guildId) {
      this.stop('guildDelete');
    }
  }
}

export default InteractionCollector;
export { InteractionCollector };
