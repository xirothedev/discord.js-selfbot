import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
import type { Client } from '../client/Client';
import type { Guild } from './Guild';
import type { RawChannelData } from '../../typings/rawDataTypes';
import _ConstantsModule from '../util/Constants';
import { isThreadParentChannel } from '../types/channels';
import type { Channel } from './Channel';

const { ChannelTypes } = _ConstantsModule;

type GuildChannelConstructor = new (
  guild: Guild,
  data: RawChannelData,
  client: Client
) => Channel;

type ClientChannelConstructor = new (
  client: Client,
  data: RawChannelData
) => Channel;

let channelFactory:
  | ((
      client: Client,
      data: RawChannelData,
      guild?: Guild
    ) => Channel | undefined)
  | null = null;

function requireGuild(guild: Guild | null | undefined): Guild {
  if (!guild) {
    throw new TypeError('A guild is required to create a guild channel');
  }
  return guild;
}

function buildChannelFactory() {
  const CategoryChannel = require('./CategoryChannel')
    .default as GuildChannelConstructor;
  const DMChannel = require('./DMChannel').default as ClientChannelConstructor;
  const GroupDMChannel = require('./GroupDMChannel')
    .default as ClientChannelConstructor;
  const NewsChannel = require('./NewsChannel')
    .default as GuildChannelConstructor;
  const StageChannel = require('./StageChannel')
    .default as GuildChannelConstructor;
  const StoreChannel = require('./StoreChannel')
    .default as GuildChannelConstructor;
  const TextChannel = require('./TextChannel')
    .default as GuildChannelConstructor;
  const ThreadChannel = require('./ThreadChannel')
    .default as GuildChannelConstructor;
  const VoiceChannel = require('./VoiceChannel')
    .default as GuildChannelConstructor;
  const DirectoryChannel = require('./DirectoryChannel')
    .default as ClientChannelConstructor;
  const ForumChannel = require('./ForumChannel')
    .default as GuildChannelConstructor;
  const MediaChannel = require('./MediaChannel')
    .default as GuildChannelConstructor;

  const constructDirect = (
    client: Client,
    data: RawChannelData
  ): Channel | undefined => {
    if (
      ('recipients' in data &&
        data.recipients &&
        data.type !== ChannelTypes.GROUP_DM) ||
      data.type === ChannelTypes.DM
    ) {
      return new DMChannel(client, data);
    }
    if (data.type === ChannelTypes.GROUP_DM) {
      return new GroupDMChannel(client, data);
    }
    return undefined;
  };

  const constructGuild = (
    client: Client,
    data: RawChannelData,
    guild?: Guild
  ): Channel | undefined => {
    switch (data.type) {
      case ChannelTypes.GUILD_TEXT: {
        return new TextChannel(requireGuild(guild), data, client);
      }
      case ChannelTypes.GUILD_VOICE: {
        return new VoiceChannel(requireGuild(guild), data, client);
      }
      case ChannelTypes.GUILD_CATEGORY: {
        return new CategoryChannel(requireGuild(guild), data, client);
      }
      case ChannelTypes.GUILD_NEWS: {
        return new NewsChannel(requireGuild(guild), data, client);
      }
      case ChannelTypes.GUILD_STORE: {
        return new StoreChannel(requireGuild(guild), data, client);
      }
      case ChannelTypes.GUILD_STAGE_VOICE: {
        return new StageChannel(requireGuild(guild), data, client);
      }
      case ChannelTypes.GUILD_NEWS_THREAD:
      case ChannelTypes.GUILD_PUBLIC_THREAD:
      case ChannelTypes.GUILD_PRIVATE_THREAD: {
        return new ThreadChannel(requireGuild(guild), data, client);
      }
      case ChannelTypes.GUILD_DIRECTORY: {
        return new DirectoryChannel(client, data);
      }
      case ChannelTypes.GUILD_FORUM: {
        return new ForumChannel(requireGuild(guild), data, client);
      }
      case ChannelTypes.GUILD_MEDIA: {
        return new MediaChannel(requireGuild(guild), data, client);
      }
      default: {
        return undefined;
      }
    }
  };

  return (client: Client, data: RawChannelData, guild?: Guild) => {
    const guildId = 'guild_id' in data ? data.guild_id : undefined;
    if (!guildId && !guild) {
      return constructDirect(client, data);
    }
    return constructGuild(client, data, guild);
  };
}

export interface ConstructedChannelRelations {
  guild?: Guild;
  threadParent?: unknown;
}

export function constructChannel(
  client: Client,
  data: RawChannelData,
  guild?: Guild | null,
  { allowUnknownGuild = false }: { allowUnknownGuild?: boolean } = {}
): { channel: Channel | undefined; relations: ConstructedChannelRelations } {
  channelFactory ??= buildChannelFactory();

  const relations: ConstructedChannelRelations = {};
  const guildId = 'guild_id' in data ? data.guild_id : undefined;
  if (!guildId && !guild) {
    return { channel: channelFactory(client, data), relations };
  }

  const resolvedGuild =
    guild ?? (guildId ? client.guilds.cache.get(guildId) : undefined);

  if (!resolvedGuild && !allowUnknownGuild) {
    return { channel: undefined, relations };
  }

  const channel = channelFactory(client, data, resolvedGuild);
  if (channel && resolvedGuild) {
    relations.guild = resolvedGuild;
  }
  if (
    channel &&
    typeof channel.isThread === 'function' &&
    channel.isThread() &&
    'parent' in channel &&
    channel.parent &&
    isThreadParentChannel(channel.parent as never)
  ) {
    relations.threadParent = channel.parent;
  }

  return { channel, relations };
}
