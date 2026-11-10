import GuildChannel from './GuildChannel';
import TextBasedChannel from './interfaces/TextBasedChannel';
import GuildTextThreadManager from '../managers/GuildTextThreadManager';
import MessageManager from '../managers/MessageManager';
import type {
  AllowedThreadTypeForNewsChannel,
  AllowedThreadTypeForTextChannel,
  ThreadAutoArchiveDuration,
} from '../../typings';
import type { Snowflake } from 'discord-api-types/v10';
import type { RawGuildChannelData, RawMessageData } from '../../typings/rawDataTypes';
import type { PatchOf } from '../types/schema';
import type { Guild } from './Guild';
import type { Client } from '../client/Client';
import type { Message } from './Message';
import type { CreateInviteOptionsSource } from '../managers/GuildInviteManager';

type BaseGuildTextChannelPatch = PatchOf<'GuildChannel'> & {
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: Snowflake | null;
  last_pin_timestamp?: string | null;
  default_auto_archive_duration?: ThreadAutoArchiveDuration;
  default_thread_rate_limit_per_user?: number;
  messages?: RawMessageData[];
};

class BaseGuildTextChannel extends GuildChannel {
  declare messages: MessageManager;
  declare nsfw: boolean;
  declare topic: string | null;
  declare lastMessageId: Snowflake | null;
  declare lastPinTimestamp: number | null;
  declare defaultAutoArchiveDuration?: ThreadAutoArchiveDuration;
  declare defaultThreadRateLimitPerUser: number | null;
  declare threads: GuildTextThreadManager<AllowedThreadTypeForTextChannel | AllowedThreadTypeForNewsChannel>;
  constructor(guild: Guild, data: BaseGuildTextChannelPatch & RawGuildChannelData, client?: Client) {
    super(guild, data, client, false);

    this.messages = new MessageManager(this);

    this.threads = new GuildTextThreadManager<AllowedThreadTypeForTextChannel | AllowedThreadTypeForNewsChannel>(this);

    this.nsfw = Boolean(data.nsfw);

    this._patch(data);
  }

  _patch(data: BaseGuildTextChannelPatch) {
    super._patch(data);

    if ('topic' in data) {
      this.topic = data.topic ?? null;
    }

    if ('nsfw' in data) {
      this.nsfw = Boolean(data.nsfw);
    }

    if ('last_message_id' in data) {
      this.lastMessageId = data.last_message_id ?? null;
    }

    if ('last_pin_timestamp' in data) {
      this.lastPinTimestamp = data.last_pin_timestamp ? new Date(data.last_pin_timestamp).getTime() : null;
    }

    if ('default_auto_archive_duration' in data) {
      this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    }

    if ('default_thread_rate_limit_per_user' in data) {
      this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user ?? null;
    } else {
      this.defaultThreadRateLimitPerUser ??= null;
    }

    if (data.messages) {
      for (const message of data.messages) this.messages._add(message);
    }
  }

  setDefaultAutoArchiveDuration(defaultAutoArchiveDuration: ThreadAutoArchiveDuration, reason?: string) {
    return this.edit({ defaultAutoArchiveDuration }, reason);
  }

  setType(type: 'GUILD_TEXT' | 'GUILD_NEWS' | number, reason?: string) {
    return this.edit({ type }, reason);
  }

  setTopic(topic: string | null, reason?: string) {
    return this.edit({ topic }, reason);
  }

  createInvite(options: CreateInviteOptionsSource) {
    return this.guild.invites.create(this.id, options);
  }

  fetchInvites(cache = true) {
    return this.guild.invites.fetch({ channelId: this.id, cache });
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  /* eslint-disable no-empty-function */
  get lastMessage(): Message | null {
    return null;
  }
  get lastPinAt(): Date | null {
    return null;
  }
  declare send: (options: import('../types/channels').SendOptions) => import('../types/channels').SendResult;
  sendTyping() {}
  createMessageCollector() {}
  awaitMessages() {}
  fetchWebhooks() {}
  createWebhook() {}
  setRateLimitPerUser(..._args: unknown[]) {}
  setNSFW() {}
}

TextBasedChannel.applyToClass(BaseGuildTextChannel, true);

export default BaseGuildTextChannel;
export { BaseGuildTextChannel };
