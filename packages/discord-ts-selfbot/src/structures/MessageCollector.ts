import type { Snowflake } from 'discord-api-types/v10';
import type { Collection } from '@discordjs/collection';
import Collector from './interfaces/Collector';
import type { CollectorOptions } from '../../typings';
import type TextBasedChannel from './interfaces/TextBasedChannel';
import type { Guild } from './Guild';
import type GuildChannel from './GuildChannel';
import type { Message } from './Message';
import type ThreadChannel from './ThreadChannel';
import _ConstantsModule from '../util/Constants';

const { Events } = _ConstantsModule;

export type MessageCollectorSourceOptions = CollectorOptions<[Message]> & {
  max?: number;
  maxProcessed?: number;
};

class MessageCollector extends Collector<Snowflake, Message> {
  declare options: MessageCollectorSourceOptions;
  declare channel: TextBasedChannel;
  declare received: number;

  constructor(
    channel: TextBasedChannel,
    options: MessageCollectorSourceOptions = {}
  ) {
    super(channel.client, options);

    this.channel = channel;

    this.received = 0;

    const bulkDeleteListener = (messages: Collection<Snowflake, Message>) => {
      for (const message of messages.values()) {
        this.handleDispose(message);
      }
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
  }

  collect(message: Message): Snowflake | null {
    if (message.channelId !== this.channel.id) {
      return null;
    }
    this.received++;
    return message.id;
  }

  dispose(message: Message): Snowflake | null {
    return message.channelId === this.channel.id ? message.id : null;
  }

  get endReason(): string | null {
    if (this.options.max && this.collected.size >= this.options.max) {
      return 'limit';
    }
    if (
      this.options.maxProcessed &&
      this.received === this.options.maxProcessed
    ) {
      return 'processedLimit';
    }
    return null;
  }

  _handleChannelDeletion(channel: GuildChannel) {
    if (
      channel.id === this.channel.id ||
      ('parentId' in this.channel && channel.id === this.channel.parentId)
    ) {
      this.stop('channelDelete');
    }
  }

  _handleThreadDeletion(thread: ThreadChannel) {
    if (thread.id === this.channel.id) {
      this.stop('threadDelete');
    }
  }

  _handleGuildDeletion(guild: Guild) {
    if ('guild' in this.channel && guild.id === this.channel.guild?.id) {
      this.stop('guildDelete');
    }
  }
}

export default MessageCollector;
export { MessageCollector };
