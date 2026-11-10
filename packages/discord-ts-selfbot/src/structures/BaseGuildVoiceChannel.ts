import { Collection } from '@discordjs/collection';
import GuildChannel from './GuildChannel';
import TextBasedChannel from './interfaces/TextBasedChannel';
import MessageManager from '../managers/MessageManager';
import _ConstantsModule from '../util/Constants';

const { VideoQualityModes } = _ConstantsModule;
import Permissions from '../util/Permissions';
import type { Snowflake } from 'discord-api-types/v10';
import type { GuildMember } from './GuildMember';
import type { VideoQualityMode } from '../../typings';
import type {
  RawGuildChannelData,
  RawMessageData,
} from '../../typings/rawDataTypes';
import type { PatchOf } from '../types/schema';
import type { Guild } from './Guild';
import type { Client } from '../client/Client';
import type { Message } from './Message';
import type { CreateInviteOptionsSource } from '../managers/GuildInviteManager';
import type { SendOptions, SendResult } from '../types/channels';

type BaseGuildVoiceChannelPatch = PatchOf<'GuildChannel'> & {
  bitrate?: number;
  rtc_region?: string | null;
  user_limit?: number;
  video_quality_mode?: number;
  last_message_id?: Snowflake | null;
  messages?: RawMessageData[];
  rate_limit_per_user?: number;
  nsfw?: boolean;
  status?: string;
};

class BaseGuildVoiceChannel extends GuildChannel {
  declare messages: MessageManager;
  declare nsfw: boolean;
  declare bitrate: number;
  declare rtcRegion: string | null;
  declare userLimit: number;
  declare videoQualityMode: VideoQualityMode | null;
  declare lastMessageId: Snowflake | null;
  declare rateLimitPerUser: number | null;
  declare status?: string;
  constructor(
    guild: Guild,
    data: BaseGuildVoiceChannelPatch & RawGuildChannelData,
    client?: Client
  ) {
    super(guild, data, client, false);
    this.messages = new MessageManager(this);

    this.nsfw = Boolean(data.nsfw);

    this._patch(data);
  }

  _patch(data: BaseGuildVoiceChannelPatch) {
    super._patch(data);

    if ('bitrate' in data) {
      this.bitrate = data.bitrate ?? 0;
    }

    if ('rtc_region' in data) {
      this.rtcRegion = data.rtc_region ?? null;
    }

    if ('user_limit' in data) {
      this.userLimit = data.user_limit ?? 0;
    }

    if ('video_quality_mode' in data) {
      this.videoQualityMode =
        data.video_quality_mode === undefined
          ? null
          : VideoQualityModes[data.video_quality_mode];
    } else {
      this.videoQualityMode ??= null;
    }

    if ('last_message_id' in data) {
      this.lastMessageId = data.last_message_id ?? null;
    }

    if (data.messages) {
      for (const message of data.messages) {
        this.messages._add(message);
      }
    }

    if ('rate_limit_per_user' in data) {
      this.rateLimitPerUser = data.rate_limit_per_user ?? null;
    }

    if ('nsfw' in data) {
      this.nsfw = data.nsfw ?? false;
    }

    if ('status' in data) {
      this.status = data.status;
    }
  }

  get members(): Collection<Snowflake, GuildMember> {
    const coll = new Collection<Snowflake, GuildMember>();
    for (const state of this.guild.voiceStates.cache.values()) {
      if (state.channelId === this.id && state.member) {
        coll.set(state.id, state.member);
      }
    }
    return coll;
  }

  get full() {
    return this.userLimit > 0 && this.members.size >= this.userLimit;
  }

  get joinable() {
    if (!this.viewable) {
      return false;
    }
    const { user } = this.client;
    const permissions = user ? this.permissionsFor(user) : null;
    if (!permissions) {
      return false;
    }

    // This flag allows joining even if timed out
    if (permissions.has(Permissions.FLAGS.ADMINISTRATOR, false)) {
      return true;
    }

    const { me } = this.guild.members;
    return Boolean(
      me &&
      me.communicationDisabledUntilTimestamp !== null &&
      me.communicationDisabledUntilTimestamp < Date.now() &&
      permissions.has(Permissions.FLAGS.CONNECT, false)
    );
  }

  createInvite(options: CreateInviteOptionsSource) {
    return this.guild.invites.create(this.id, options);
  }

  fetchInvites(cache = true) {
    return this.guild.invites.fetch({ cache, channelId: this.id });
  }

  setBitrate(bitrate: number, reason?: string) {
    return this.edit({ bitrate }, reason);
  }

  setRTCRegion(rtcRegion: string | null, reason?: string) {
    return this.edit({ rtcRegion }, reason);
  }

  setUserLimit(userLimit: number, reason?: string) {
    return this.edit({ userLimit }, reason);
  }

  setVideoQualityMode(
    videoQualityMode: VideoQualityMode | number,
    reason?: string
  ) {
    return this.edit({ videoQualityMode }, reason);
  }

  // These are here only for documentation purposes - they are implemented by TextBasedChannel
  get lastMessage(): Message | null {
    return null;
  }
  declare send: (options: SendOptions) => SendResult;
  sendTyping() {
    // Implemented by the subclass mixin.
  }
  createMessageCollector() {
    // Implemented by the subclass mixin.
  }
  awaitMessages() {
    // Implemented by the subclass mixin.
  }
  fetchWebhooks() {
    // Implemented by the subclass mixin.
  }
  createWebhook() {
    // Implemented by the subclass mixin.
  }
  setRateLimitPerUser() {
    // Implemented by the subclass mixin.
  }
  setNSFW() {
    // Implemented by the subclass mixin.
  }
}

TextBasedChannel.applyToClass(BaseGuildVoiceChannel, true, ['lastPinAt']);

export default BaseGuildVoiceChannel;
export { BaseGuildVoiceChannel };
