import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import process from 'node:process';
import Base from './Base';
import ChannelFlags from '../util/ChannelFlags';
import _ConstantsModule from '../util/Constants';
const { ChannelTypes, ThreadChannelTypes, VoiceBasedChannelTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawChannelData } from '../../typings/rawDataTypes';
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

/**
 * Represents any channel on Discord.
 * @extends {Base}
 * @abstract
 */
class Channel extends Base implements ChannelEntity {
  declare id: ChannelEntity['id'];
  declare type: ChannelEntity['type'];
  declare flags: ChannelEntity['flags'];
  constructor(client: import('../client/Client').default, data?: RawChannelData, immediatePatch = true) {
    super(client);

    const type = data?.type !== undefined ? ChannelTypes[data.type] : undefined;
    /**
     * The type of the channel
     * @type {ChannelType}
     */
    this.type = type ?? 'UNKNOWN';

    if (data && immediatePatch) this._patch(data);
  }

  _patch(data: PatchOf<'Channel'>) {
    /**
     * The channel's id
     * @type {Snowflake}
     */
    this.id = data.id!;

    if ('flags' in data) {
      /**
       * The flags that are applied to the channel.
       * @type {?Readonly<ChannelFlags>}
       */
      this.flags = new ChannelFlags(data.flags).freeze();
    } else {
      this.flags ??= new ChannelFlags().freeze();
    }
  }

  /**
   * The timestamp the channel was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  /**
   * The time the channel was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
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

  /**
   * Whether this Channel is a partial
   * <info>This is always false outside of DM channels.</info>
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return false;
  }

  /**
   * When concatenated with a string, this automatically returns the channel's mention instead of the Channel object.
   * @returns {string}
   * @example
   * // Logs: Hello from <#123456789012345678>!
   * console.log(`Hello from ${channel}!`);
   */
  toString() {
    return `<#${this.id}>`;
  }

  /**
   * Deletes this channel.
   * @returns {Promise<Channel>}
   * @example
   * // Delete the channel
   * channel.delete()
   *   .then(console.log)
   *   .catch(console.error);
   */
  async delete(_reason: string | null = null) {
    await this.client.api.channels(this.id).delete();
    return this;
  }

  /**
   * Fetches this channel.
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<Channel>}
   */
  fetch(force = true) {
    return this.client.channels.fetch(this.id, { force });
  }

  /**
   * Indicates whether this channel is {@link TextBasedChannels text-based}.
   * @returns {boolean}
   */
  isText() {
    return 'messages' in this;
  }

  /**
   * Indicates whether this channel is {@link BaseGuildVoiceChannel voice-based}.
   * @returns {boolean}
   */
  isVoice() {
    return VoiceBasedChannelTypes.includes(this.type);
  }

  /**
   * Indicates whether this channel is a {@link ThreadChannel}.
   * @returns {boolean}
   */
  isThread() {
    return ThreadChannelTypes.includes(this.type);
  }

  /**
   * Indicates whether this channel is {@link ThreadOnlyChannel}.
   * @returns {boolean}
   */
  isThreadOnly() {
    return 'availableTags' in this;
  }

  /**
   * Indicates whether this channel is a {@link DirectoryChannel}
   * @returns {boolean}
   */
  isDirectory() {
    return this.type === 'GUILD_DIRECTORY';
  }

  static create(client: any, data: any, guild: any, { allowUnknownGuild }: any = {}) {
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
    if (!data.guild_id && !guild) {
      if ((data.recipients && data.type !== ChannelTypes.GROUP_DM) || data.type === ChannelTypes.DM) {
        channel = new DMChannel(client, data);
      } else if (data.type === ChannelTypes.GROUP_DM) {
        const GroupDMChannel = require('./GroupDMChannel').default;
        channel = new GroupDMChannel(client, data);
      }
    } else {
      guild ??= client.guilds.cache.get(data.guild_id);

      if (guild || allowUnknownGuild) {
        switch (data.type) {
          case ChannelTypes.GUILD_TEXT: {
            channel = new TextChannel(guild, data, client);
            break;
          }
          case ChannelTypes.GUILD_VOICE: {
            channel = new VoiceChannel(guild, data, client);
            break;
          }
          case ChannelTypes.GUILD_CATEGORY: {
            channel = new CategoryChannel(guild, data, client);
            break;
          }
          case ChannelTypes.GUILD_NEWS: {
            channel = new NewsChannel(guild, data, client);
            break;
          }
          case ChannelTypes.GUILD_STORE: {
            channel = new StoreChannel(guild, data, client);
            break;
          }
          case ChannelTypes.GUILD_STAGE_VOICE: {
            channel = new StageChannel(guild, data, client);
            break;
          }
          case ChannelTypes.GUILD_NEWS_THREAD:
          case ChannelTypes.GUILD_PUBLIC_THREAD:
          case ChannelTypes.GUILD_PRIVATE_THREAD: {
            channel = new ThreadChannel(guild, data, client);
            if (!allowUnknownGuild) channel.parent?.threads.cache.set(channel.id, channel);
            break;
          }

          case ChannelTypes.GUILD_DIRECTORY:
            channel = new DirectoryChannel(client, data);
            break;

          case ChannelTypes.GUILD_FORUM:
            channel = new ForumChannel(guild, data, client);
            break;

          case ChannelTypes.GUILD_MEDIA:
            channel = new MediaChannel(guild, data, client);
            break;
        }
        if (channel && !allowUnknownGuild) guild.channels?.cache.set(channel.id, channel);
      }
    }
    return channel;
  }

  toJSON(...props: any[]) {
    return super.toJSON({ createdTimestamp: true }, ...props);
  }
}

/**
 * @external APIChannel
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object}
 */

export { Channel, deletedChannels };
export default { Channel, deletedChannels };
