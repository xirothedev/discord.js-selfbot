import process from 'node:process';
import Base from './Base';
import type { Client } from '../client/Client';
import type { Guild } from './Guild';
import type { RawChannelData } from '../../typings/rawDataTypes';
import ChannelFlags from '../util/ChannelFlags';
import _ConstantsModule from '../util/Constants';
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { ChannelEntity } from '../types/entities/channel';
import type { PatchOf } from '../types/schema';
import type ClientType from '../client/Client';
import { constructChannel } from './ChannelConstruction';

const { ChannelTypes, ThreadChannelTypes, VoiceBasedChannelTypes } =
  _ConstantsModule;

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
  constructor(
    client: ClientType,
    data?: RawChannelData,
    immediatePatch = true
  ) {
    super(client);

    const type = data?.type === undefined ? undefined : ChannelTypes[data.type];
    this.type = type ?? 'UNKNOWN';

    if (data && immediatePatch) {
      this._patch(data);
    }
  }

  _patch(data: PatchOf<'Channel'>) {
    if (data.id !== undefined) {
      this.id = data.id;
    }

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
        'DeprecationWarning'
      );
    }

    return deletedChannels.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Channel#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning'
      );
    }

    if (value) {
      deletedChannels.add(this);
    } else {
      deletedChannels.delete(this);
    }
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

  static construct(
    client: Client,
    data: RawChannelData,
    guild?: Guild | null,
    { allowUnknownGuild = false }: { allowUnknownGuild?: boolean } = {}
  ) {
    return constructChannel(client, data, guild, { allowUnknownGuild });
  }

  static create(
    client: Client,
    data: RawChannelData,
    guild?: Guild | null,
    { allowUnknownGuild = false }: { allowUnknownGuild?: boolean } = {}
  ) {
    const { channel, relations } = constructChannel(client, data, guild, {
      allowUnknownGuild,
    });
    if (!channel) {
      return channel;
    }
    if (!allowUnknownGuild && relations.guild) {
      relations.guild.channels.cache.set(channel.id, channel as never);
    }
    if (!allowUnknownGuild && relations.threadParent) {
      const parent = relations.threadParent as {
        threads?: { cache?: Map<string, Channel> };
      };
      parent.threads?.cache?.set(channel.id, channel);
    }
    return channel;
  }

  toJSON(...props: unknown[]) {
    return super.toJSON({ createdTimestamp: true }, ...props);
  }
}

export { Channel, deletedChannels };
export default { Channel, deletedChannels };
