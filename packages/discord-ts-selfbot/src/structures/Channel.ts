import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import process from 'node:process';
import Base from './Base';
import type { Client } from '../client/Client';
import type { Guild } from './Guild';
import type { RawChannelData } from '../../typings/rawDataTypes';
import ChannelFlags from '../util/ChannelFlags';
import _ConstantsModule from '../util/Constants';
const { ChannelTypes, ThreadChannelTypes, VoiceBasedChannelTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { ChannelEntity } from '../types/entities/channel';
import type { PatchOf } from '../types/schema';
let CategoryChannel;
let DMChannel;
let NewsChannel;
let StageChannel;
let StoreChannel;
let TextChannel;
let ThreadChannel;
let VoiceChannel;
let DirectoryChannel;
let ForumChannel;
let MediaChannel;

/**
 * @type {WeakSet<Channel>}
 * @private
 * @internal
 */
const deletedChannels = new WeakSet();
let deprecationEmittedForDeleted = false;

class Channel extends Base implements ChannelEntity {
  declare id: ChannelEntity['id'];
  declare type: ChannelEntity['type'];
  declare flags: ChannelEntity['flags'];
  constructor(client: import('../client/Client').default, data?: RawChannelData, immediatePatch = true) {
    super(client);

    const type = data?.type !== undefined ? ChannelTypes[data.type] : undefined;
    this.type = type ?? 'UNKNOWN';

    if (data && immediatePatch) this._patch(data);
  }

  _patch(data: PatchOf<'Channel'>) {
    this.id = data.id!;

    if ('flags' in data) {
      this.flags = new ChannelFlags(data.flags).freeze();
    } else {
      this.flags ??= new ChannelFlags().freeze();
    }
  }

  get createdTimestamp(): number | null {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt(): Date | null {
    const timestamp = this.createdTimestamp;
    return timestamp === null ? null : new Date(timestamp);
  }

  /**
   * Whether or not the structure has been deleted
   * @type {boolean}
   * @deprecated This will be removed in the next major version, see https://github.com/discordjs/discord.js/issues/7091
   */
  get deleted() {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Channel#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning',
      );
    }

    return deletedChannels.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Channel#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning',
      );
    }

    if (value) deletedChannels.add(this);
    else deletedChannels.delete(this);
  }

  get partial() {
    return false;
  }

  toString() {
    return `<#${this.id}>`;
  }

  async delete(_reason: string | null = null) {
    await this.client.api.channels(this.id).delete();
    return this;
  }

  fetch(force = true): Promise<Channel | null> {
    return this.client.channels.fetch(this.id, { force });
  }

  isText() {
    return 'messages' in this;
  }

  isVoice() {
    return VoiceBasedChannelTypes.includes(this.type);
  }

  isThread() {
    return ThreadChannelTypes.includes(this.type);
  }

  isThreadOnly() {
    return 'availableTags' in this;
  }

  isDirectory() {
    return this.type === 'GUILD_DIRECTORY';
  }

  static create(
    client: Client,
    data: RawChannelData,
    guild?: Guild | null,
    { allowUnknownGuild = false }: { allowUnknownGuild?: boolean } = {},
  ) {
    CategoryChannel ??= require('./CategoryChannel').default;
    DMChannel ??= require('./DMChannel').default;
    NewsChannel ??= require('./NewsChannel').default;
    StageChannel ??= require('./StageChannel').default;
    StoreChannel ??= require('./StoreChannel').default;
    TextChannel ??= require('./TextChannel').default;
    ThreadChannel ??= require('./ThreadChannel').default;
    VoiceChannel ??= require('./VoiceChannel').default;
    DirectoryChannel ??= require('./DirectoryChannel').default;
    ForumChannel ??= require('./ForumChannel').default;
    MediaChannel ??= require('./MediaChannel').default;

    let channel;
    const guildId = 'guild_id' in data ? data.guild_id : undefined;
    if (!guildId && !guild) {
      if (
        ('recipients' in data && data.recipients && data.type !== ChannelTypes.GROUP_DM) ||
        data.type === ChannelTypes.DM
      ) {
        channel = new DMChannel(client, data);
      } else if (data.type === ChannelTypes.GROUP_DM) {
        const GroupDMChannel = require('./GroupDMChannel').default;
        channel = new GroupDMChannel(client, data);
      }
    } else {
      guild ??= guildId ? client.guilds.cache.get(guildId) : undefined;

      if (guild || allowUnknownGuild) {
        switch (data.type) {
          case ChannelTypes.GUILD_TEXT: {
            channel = new TextChannel(guild!, data, client);
            break;
          }
          case ChannelTypes.GUILD_VOICE: {
            channel = new VoiceChannel(guild!, data, client);
            break;
          }
          case ChannelTypes.GUILD_CATEGORY: {
            channel = new CategoryChannel(guild!, data, client);
            break;
          }
          case ChannelTypes.GUILD_NEWS: {
            channel = new NewsChannel(guild!, data, client);
            break;
          }
          case ChannelTypes.GUILD_STORE: {
            channel = new StoreChannel(guild!, data, client);
            break;
          }
          case ChannelTypes.GUILD_STAGE_VOICE: {
            channel = new StageChannel(guild!, data, client);
            break;
          }
          case ChannelTypes.GUILD_NEWS_THREAD:
          case ChannelTypes.GUILD_PUBLIC_THREAD:
          case ChannelTypes.GUILD_PRIVATE_THREAD: {
            channel = new ThreadChannel(guild!, data, client);
            if (!allowUnknownGuild) channel.parent?.threads.cache.set(channel.id, channel);
            break;
          }

          case ChannelTypes.GUILD_DIRECTORY:
            channel = new DirectoryChannel(client, data);
            break;

          case ChannelTypes.GUILD_FORUM:
            channel = new ForumChannel(guild!, data, client);
            break;

          case ChannelTypes.GUILD_MEDIA:
            channel = new MediaChannel(guild!, data, client);
            break;
        }
        if (channel && !allowUnknownGuild && guild) guild.channels.cache.set(channel.id, channel);
      }
    }
    return channel;
  }

  toJSON(...props: unknown[]) {
    return super.toJSON({ createdTimestamp: true }, ...props);
  }
}

export { Channel, deletedChannels };
export default { Channel, deletedChannels };
