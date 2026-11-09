import type MessageManager from '../managers/MessageManager';
import type CategoryChannel from '../structures/CategoryChannel';
import type DirectoryChannel from '../structures/DirectoryChannel';
import type DMChannel from '../structures/DMChannel';
import type ForumChannel from '../structures/ForumChannel';
import type GroupDMChannel from '../structures/GroupDMChannel';
import type GuildChannel from '../structures/GuildChannel';
import type MediaChannel from '../structures/MediaChannel';
import type NewsChannel from '../structures/NewsChannel';
import type StageChannel from '../structures/StageChannel';
import type StoreChannel from '../structures/StoreChannel';
import type TextChannel from '../structures/TextChannel';
import type ThreadChannel from '../structures/ThreadChannel';
import type VoiceChannel from '../structures/VoiceChannel';

/**
 * Every channel structure the client can cache.
 */
export type AnyChannel =
  | CategoryChannel
  | DirectoryChannel
  | DMChannel
  | ForumChannel
  | GroupDMChannel
  | MediaChannel
  | NewsChannel
  | StageChannel
  | StoreChannel
  | TextChannel
  | ThreadChannel
  | VoiceChannel;

/**
 * Channels that carry a message manager.
 */
export type TextBasedChannel = Exclude<Extract<AnyChannel, { messages: MessageManager }>, ForumChannel | MediaChannel>;

/**
 * Channels that belong to a guild.
 */
export type GuildBasedChannel = Extract<AnyChannel, { guild: unknown }>;

/**
 * Channels that own threads.
 */
export type ThreadParentChannel = Extract<AnyChannel, { threads: unknown }>;

/**
 * The options accepted by `TextBasedChannel#send`.
 */
export type SendOptions =
  | string
  | import('../structures/MessagePayload').default
  | (Omit<import('../../typings').MessageOptions, 'forward'> & {
      forward?: {
        message: import('../structures/Message').Message | import('discord-api-types/v10').Snowflake;
        channel?: import('../../typings').TextBasedChannelResolvable;
        guild?: import('../../typings').GuildResolvable;
      };
    });
export type SendResult = Promise<import('../structures/Message').Message>;

export function isTextBasedChannel(channel: object): channel is TextBasedChannel {
  return 'messages' in channel && Boolean(channel.messages);
}

export function isThreadChannel(channel: object): channel is ThreadChannel {
  return (
    'type' in channel &&
    (channel.type === 'GUILD_PUBLIC_THREAD' ||
      channel.type === 'GUILD_PRIVATE_THREAD' ||
      channel.type === 'GUILD_NEWS_THREAD')
  );
}

export function isGuildBasedChannel(channel: object): channel is GuildBasedChannel {
  return 'permissionsFor' in channel && Boolean(channel.permissionsFor) && 'guild' in channel && Boolean(channel.guild);
}

export function isThreadParentChannel(channel: object): channel is ThreadParentChannel {
  return 'threads' in channel && Boolean(channel.threads);
}

export function isCategoryChannel(channel: object): channel is CategoryChannel {
  return 'type' in channel && channel.type === 'GUILD_CATEGORY';
}

export function isNewsChannel(channel: object): channel is NewsChannel {
  return 'type' in channel && channel.type === 'GUILD_NEWS';
}

export function isStageChannel(channel: object): channel is StageChannel {
  return 'type' in channel && channel.type === 'GUILD_STAGE_VOICE';
}

export function isGroupDMChannel(channel: object): channel is GroupDMChannel {
  return 'type' in channel && channel.type === 'GROUP_DM';
}

export function isDMChannel(channel: object): channel is DMChannel {
  return 'type' in channel && channel.type === 'DM';
}

export function isInviteChannel(channel: object): channel is GuildChannel | GroupDMChannel {
  return ('permissionsFor' in channel && 'guild' in channel && !isThreadChannel(channel)) || isGroupDMChannel(channel);
}
