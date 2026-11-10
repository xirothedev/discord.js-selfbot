import Base, { patchValue } from './Base';
import _errorsModule from '../errors';

const { Error, TypeError } = _errorsModule;
import type { RawVoiceStateData } from '../../typings/rawDataTypes';
import type { GuildVoiceChannelResolvable } from '../../typings';
import type Client from '../client/Client';
import type { Guild } from './Guild';
import type { VoiceStateEntity } from '../types/entities/voice-state';
import type { PatchOf } from '../types/schema';
import type { GuildMember } from './GuildMember';
import type User from './User';

class VoiceState extends Base implements VoiceStateEntity {
  declare channelId: VoiceStateEntity['channelId'];
  declare guild: VoiceStateEntity['guild'];
  declare id: VoiceStateEntity['id'];
  declare selfDeaf: VoiceStateEntity['selfDeaf'];
  declare selfMute: VoiceStateEntity['selfMute'];
  declare serverDeaf: VoiceStateEntity['serverDeaf'];
  declare serverMute: VoiceStateEntity['serverMute'];
  declare sessionId: VoiceStateEntity['sessionId'];
  declare streaming: VoiceStateEntity['streaming'];
  declare selfVideo: VoiceStateEntity['selfVideo'];
  declare suppress: VoiceStateEntity['suppress'];
  declare requestToSpeakTimestamp: VoiceStateEntity['requestToSpeakTimestamp'];

  constructor(
    client: Client,
    guild: Guild | null,
    data: Partial<RawVoiceStateData> & { user_id: string }
  ) {
    super(client);
    this.guild = guild;
    this.id = data.user_id;
    this.streaming = false;
    this.suppress = false;
    this._patch(data);
  }

  _patch(data: PatchOf<'VoiceState'>) {
    this.serverDeaf = patchValue(data.deaf, this.serverDeaf);
    this.serverMute = patchValue(data.mute, this.serverMute);
    this.selfDeaf = patchValue(data.self_deaf, this.selfDeaf);
    this.selfMute = patchValue(data.self_mute, this.selfMute);
    this.selfVideo = patchValue(data.self_video, this.selfVideo);
    this.sessionId = patchValue(data.session_id, this.sessionId);

    // The self_stream property is omitted if false, check another property
    // here to avoid incorrectly clearing this when partial data is specified
    if (data.self_video === undefined) {
      this.streaming ??= false;
    } else {
      this.streaming = data.self_stream ?? false;
    }

    this.channelId = patchValue(data.channel_id, this.channelId);
    this.suppress = patchValue(data.suppress, this.suppress, false);

    if (data.request_to_speak_timestamp === undefined) {
      this.requestToSpeakTimestamp ??= null;
    } else {
      this.requestToSpeakTimestamp = data.request_to_speak_timestamp
        ? Date.parse(data.request_to_speak_timestamp)
        : null;
    }

    return this;
  }

  get member(): GuildMember | null {
    if (!this.guild) {
      return null;
    }
    return this.guild.members.cache.get(this.id) ?? null;
  }

  get user(): User | null {
    return this.client.users.cache.get(this.id) ?? null;
  }

  get channel() {
    return this.channelId
      ? ((this.guild ?? this.client).channels.cache.get(this.channelId) ?? null)
      : null;
  }

  get deaf() {
    return this.serverDeaf || this.selfDeaf;
  }

  get mute() {
    return this.serverMute || this.selfMute;
  }

  setMute(mute = true, reason?: string) {
    if (!this.guild) {
      return null;
    }
    return this.guild.members.edit(this.id, { mute }, reason);
  }

  setDeaf(deaf = true, reason?: string) {
    if (!this.guild) {
      return null;
    }
    return this.guild.members.edit(this.id, { deaf }, reason);
  }

  disconnect(reason?: string) {
    return this.setChannel(null, reason);
  }

  setChannel(channel: GuildVoiceChannelResolvable | null, reason?: string) {
    if (!this.guild) {
      return null;
    }
    return this.guild.members.edit(this.id, { channel }, reason);
  }

  async setRequestToSpeak(request = true) {
    if (this.channel?.type !== 'GUILD_STAGE_VOICE') {
      throw new Error('VOICE_NOT_STAGE_CHANNEL');
    }
    if (!this.guild) {
      throw new Error('VOICE_GUILD_NOT_FOUND');
    }

    if (this.client.user?.id !== this.id) {
      throw new Error('VOICE_STATE_NOT_OWN');
    }

    await this.client.api.guilds(this.guild.id, 'voice-states', '@me').patch({
      data: {
        channel_id: this.channelId,
        request_to_speak_timestamp: request ? new Date().toISOString() : null,
      },
    });
  }

  async setSuppressed(suppressed = true) {
    if (typeof suppressed !== 'boolean') {
      throw new TypeError('VOICE_STATE_INVALID_TYPE', 'suppressed');
    }
    if (!this.guild) {
      throw new Error('VOICE_GUILD_NOT_FOUND');
    }

    if (this.channel?.type !== 'GUILD_STAGE_VOICE') {
      throw new Error('VOICE_NOT_STAGE_CHANNEL');
    }

    const target = this.client.user?.id === this.id ? '@me' : this.id;

    await this.client.api.guilds(this.guild.id, 'voice-states', target).patch({
      data: {
        channel_id: this.channelId,
        request_to_speak_timestamp: null,
        suppress: suppressed,
      },
    });
  }

  setStatus(status = '') {
    if (!this.channel) {
      throw new Error('VOICE_CHANNEL_NOT_FOUND');
    }
    // PUT https://discord.com/api/v9/channels/:id/voice-status
    return this.client.api.channels(this.channel.id, 'voice-status').put({
      data: {
        status,
      },
    });
  }

  async getPreview() {
    if (!this.streaming) {
      throw new Error('USER_NOT_STREAMING');
    }
    // URL: https://discord.com/api/v9/streams/guild:guildid:voicechannelid:userid/preview
    // URL: https://discord.com/api/v9/streams/call:channelId:userId/preview
    const streamKey = this.guild
      ? `guild:${this.guild.id}:${this.channelId}:${this.id}`
      : `call:${this.channelId}:${this.id}`;
    const data = await this.client.api.streams[
      encodeURIComponent(streamKey)
    ].preview.get<{ url: string }>();
    return data.url;
  }

  postPreview(base64Image: string) {
    if (this.client.user?.id !== this.id || !this.streaming) {
      throw new Error('USER_NOT_STREAMING');
    }
    // URL: https://discord.com/api/v9/streams/guild:guildid:voicechannelid:userid/preview
    // URL: https://discord.com/api/v9/streams/call:channelId:userId/preview
    const streamKey = this.guild?.id
      ? `guild:${this.guild.id}:${this.channelId}:${this.id}`
      : `call:${this.channelId}:${this.id}`;
    return this.client.api.streams[encodeURIComponent(streamKey)].preview.post({
      data: {
        thumbnail: base64Image,
      },
    });
  }

  fetch(force = true) {
    if (!this.guild) {
      throw new Error('VOICE_GUILD_NOT_FOUND');
    }
    return this.guild.voiceStates.fetch(this.id, { force });
  }

  toJSON() {
    return super.toJSON({
      channelId: 'channel',
      id: true,
      selfDeaf: true,
      selfMute: true,
      selfVideo: true,
      serverDeaf: true,
      serverMute: true,
      sessionId: true,
    });
  }
}

export default VoiceState;
export { VoiceState };
