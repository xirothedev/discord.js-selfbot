import { Collection } from "@discordjs/collection";
import type { Snowflake } from "discord-api-types/v10";
import Collector from "./interfaces/Collector";
import type { CollectorOptions } from "../../typings";
import type { Guild } from "./Guild";
import type GuildChannel from "./GuildChannel";

import type { Message } from "./Message";
import type MessageReaction from "./MessageReaction";
import type ThreadChannel from "./ThreadChannel";
import type User from "./User";
import _ConstantsModule from "../util/Constants";

const { Events } = _ConstantsModule;

export type ReactionCollectorSourceOptions = CollectorOptions<
  [MessageReaction, User]
> & {
  max?: number;
  maxEmojis?: number;
  maxUsers?: number;
};

class ReactionCollector extends Collector<
  Snowflake | string,
  MessageReaction,
  [User]
> {
  declare users: Collection<Snowflake, User>;
  declare options: ReactionCollectorSourceOptions;
  declare message: Message;
  declare total: number;

  constructor(message: Message, options: ReactionCollectorSourceOptions = {}) {
    super(message.client, options);

    this.message = message;

    this.users = new Collection<Snowflake, User>();

    this.total = 0;

    this.empty = this.empty.bind(this);
    this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
    this._handleThreadDeletion = this._handleThreadDeletion.bind(this);
    this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
    this._handleMessageDeletion = this._handleMessageDeletion.bind(this);

    const bulkDeleteListener = (messages: Collection<Snowflake, Message>) => {
      if (messages.has(this.message.id)) {
        this.stop("messageDelete");
      }
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

    this.once("end", () => {
      this.client.removeListener(
        Events.MESSAGE_REACTION_ADD,
        this.handleCollect
      );
      this.client.removeListener(
        Events.MESSAGE_REACTION_REMOVE,
        this.handleDispose
      );
      this.client.removeListener(
        Events.MESSAGE_REACTION_REMOVE_ALL,
        this.empty
      );
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

    this.on("collect", (reaction: MessageReaction, user: User) => {
      if (reaction.count === 1) {
        this.emit("create", reaction, user);
      }
      this.total++;
      this.users.set(user.id, user);
    });

    this.on("remove", (_reaction: MessageReaction, user: User) => {
      this.total--;
      if (
        !this.collected.some((reaction) => reaction.users.cache.has(user.id))
      ) {
        this.users.delete(user.id);
      }
    });
  }

  collect(reaction: MessageReaction): Snowflake | string | null {
    if (reaction.message.id !== this.message.id) {
      return null;
    }

    return ReactionCollector.key(reaction);
  }

  dispose(reaction: MessageReaction, user: User): Snowflake | string | null {
    if (reaction.message.id !== this.message.id) {
      return null;
    }

    if (
      this.collected.has(ReactionCollector.key(reaction)) &&
      this.users.has(user.id)
    ) {
      this.emit("remove", reaction, user);
    }
    return reaction.count ? null : ReactionCollector.key(reaction);
  }

  empty() {
    this.total = 0;
    this.collected.clear();
    this.users.clear();
    this.checkEnd();
  }

  get endReason(): string | null {
    if (this.options.max && this.total >= this.options.max) {
      return "limit";
    }
    if (
      this.options.maxEmojis &&
      this.collected.size >= this.options.maxEmojis
    ) {
      return "emojiLimit";
    }
    if (this.options.maxUsers && this.users.size >= this.options.maxUsers) {
      return "userLimit";
    }
    return null;
  }

  _handleMessageDeletion(message: Message) {
    if (message.id === this.message.id) {
      this.stop("messageDelete");
    }
  }

  _handleChannelDeletion(
    channel: GuildChannel & {
      threads?: { cache: Collection<Snowflake, ThreadChannel> };
    }
  ) {
    if (
      channel.id === this.message.channelId ||
      channel.threads?.cache.has(this.message.channelId)
    ) {
      this.stop("channelDelete");
    }
  }

  _handleThreadDeletion(thread: ThreadChannel) {
    if (thread.id === this.message.channelId) {
      this.stop("threadDelete");
    }
  }

  _handleGuildDeletion(guild: Guild) {
    if (guild.id === this.message.guild?.id) {
      this.stop("guildDelete");
    }
  }

  static key(reaction: MessageReaction): Snowflake | string {
    return reaction.emoji.id ?? reaction.emoji.name ?? "";
  }
}

export default ReactionCollector;
export { ReactionCollector };
