import Base from './Base';
import _errorsModule from '../errors';
const { Error, TypeError } = _errorsModule;
import type { RawVoiceStateData } from '../../typings/rawDataTypes';
import type { GuildVoiceChannelResolvable } from '../../typings';
import type Client from '../client/Client';
import type { Guild } from './Guild';
import type { VoiceStateEntity } from '../types/entities/voice-state';
import type { PatchOf } from '../types/schema';

/**
 * Represents the voice state for a Guild Member.
 * @extends {Base}
 */
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

  constructor(client: Client, guild: Guild | null, data: Partial<RawVoiceStateData> & { user_id: string }) {
    super(client);
    /**
     * The guild of this voice state
     * @type {?Guild}
     */
    this.guild = guild;
    /**
     * The id of the member of this voice state
     * @type {Snowflake}
     */
    this.id = data.user_id;
    this.streaming = false;
    this.suppress = false;
    this._patch(data);
  }

  _patch(data: PatchOf<'VoiceState'>) {
    if (data.user_id !== undefined) {
      /**
       * The id of the member of this voice state
       * @type {Snowflake}
       */
      this.id = data.user_id;
    }

    if (data.deaf !== undefined) {
      /**
       * Whether this member is deafened server-wide
       * @type {?boolean}
       */
      this.serverDeaf = data.deaf;
    } else {
      this.serverDeaf ??= null;
    }

    if (data.mute !== undefined) {
      /**
       * Whether this member is muted server-wide
       * @type {?boolean}
       */
      this.serverMute = data.mute;
    } else {
      this.serverMute ??= null;
    }

    if (data.self_deaf !== undefined) {
      /**
       * Whether this member is self-deafened
       * @type {?boolean}
       */
      this.selfDeaf = data.self_deaf;
    } else {
      this.selfDeaf ??= null;
    }

    if (data.self_mute !== undefined) {
      /**
       * Whether this member is self-muted
       * @type {?boolean}
       */
      this.selfMute = data.self_mute;
    } else {
      this.selfMute ??= null;
    }

    if (data.self_video !== undefined) {
      /**
       * Whether this member's camera is enabled
       * @type {?boolean}
       */
      this.selfVideo = data.self_video;
    } else {
      this.selfVideo ??= null;
    }

    if (data.session_id !== undefined) {
      /**
       * The session id for this member's connection
       * @type {?string}
       */
      this.sessionId = data.session_id;
    } else {
      this.sessionId ??= null;
    }

    // The self_stream property is omitted if false, check another property
    // here to avoid incorrectly clearing this when partial data is specified
    if (data.self_video !== undefined) {
      /**
       * Whether this member is streaming using "Screen Share"
       * @type {boolean}
       */
      this.streaming = data.self_stream ?? false;
    } else {
      this.streaming ??= false;
    }

    if (data.channel_id !== undefined) {
      /**
       * The {@link VoiceChannel} or {@link StageChannel} id the member is in
       * @type {?Snowflake}
       */
      this.channelId = data.channel_id;
    } else {
      this.channelId ??= null;
    }

    if (data.suppress !== undefined) {
      /**
       * Whether this member is suppressed from speaking. This property is specific to stage channels only.
       * @type {boolean}
       */
      this.suppress = data.suppress;
    } else {
      this.suppress ??= false;
    }

    if (data.request_to_speak_timestamp !== undefined) {
      /**
       * The time at which the member requested to speak. This property is specific to stage channels only.
       * @type {?number}
       */
      this.requestToSpeakTimestamp = data.request_to_speak_timestamp
        ? Date.parse(data.request_to_speak_timestamp)
        : null;
    } else {
      this.requestToSpeakTimestamp ??= null;
    }

    return this;
  }

  /**
   * The member that this voice state belongs to
   * @type {?GuildMember}
   * @readonly
   */
  get member() {
    if (!this.guild) return null;
    return this.guild.members.cache.get(this.id) ?? null;
  }

  /**
   * The user that this voice state belongs to
   * @type {?User}
   * @readonly
   */
  get user() {
    return this.client.users.cache.get(this.id) ?? null;
  }

  /**
   * The channel that the member is connected to
   * @type {?(VoiceChannel|StageChannel|DMChannel|GroupDMChannel)}
   * @readonly
   */
  get channel() {
    return (this.guild ?? this.client).channels.cache.get(this.channelId) ?? null;
  }

  /**
   * Whether this member is either self-deafened or server-deafened
   * @type {?boolean}
   * @readonly
   */
  get deaf() {
    return this.serverDeaf || this.selfDeaf;
  }

  /**
   * Whether this member is either self-muted or server-muted
   * @type {?boolean}
   * @readonly
   */
  get mute() {
    return this.serverMute || this.selfMute;
  }

  /**
   * Mutes/unmutes the member of this voice state.
   * @param {boolean} [mute=true] Whether or not the member should be muted
   * @param {string} [reason] Reason for muting or unmuting
   * @returns {Promise<GuildMember>}
   */
  setMute(mute: boolean = true, reason?: string) {
    if (!this.guild) return null;
    return this.guild.members.edit(this.id, { mute }, reason);
  }

  /**
   * Deafens/undeafens the member of this voice state.
   * @param {boolean} [deaf=true] Whether or not the member should be deafened
   * @param {string} [reason] Reason for deafening or undeafening
   * @returns {Promise<GuildMember>}
   */
  setDeaf(deaf: boolean = true, reason?: string) {
    if (!this.guild) return null;
    return this.guild.members.edit(this.id, { deaf }, reason);
  }

  /**
   * Disconnects the member from the channel.
   * @param {string} [reason] Reason for disconnecting the member from the channel
   * @returns {Promise<GuildMember>}
   */
  disconnect(reason?: string) {
    return this.setChannel(null, reason);
  }

  /**
   * Moves the member to a different channel, or disconnects them from the one they're in.
   * @param {GuildVoiceChannelResolvable|null} channel Channel to move the member to, or `null` if you want to
   * disconnect them from voice.
   * @param {string} [reason] Reason for moving member to another channel or disconnecting
   * @returns {Promise<GuildMember>}
   */
  setChannel(channel: GuildVoiceChannelResolvable | null, reason?: string) {
    if (!this.guild) return null;
    return this.guild.members.edit(this.id, { channel }, reason);
  }

  /**
   * Toggles the request to speak in the channel.
   * Only applicable for stage channels and for the client's own voice state.
   * @param {boolean} [request=true] Whether or not the client is requesting to become a speaker.
   * @example
   * // Making the client request to speak in a stage channel (raise its hand)
   * guild.members.me.voice.setRequestToSpeak(true);
   * @example
   * // Making the client cancel a request to speak
   * guild.members.me.voice.setRequestToSpeak(false);
   * @returns {Promise<void>}
   */
  async setRequestToSpeak(request: boolean = true) {
    if (this.channel?.type !== 'GUILD_STAGE_VOICE') throw new Error('VOICE_NOT_STAGE_CHANNEL');
    if (!this.guild) throw new Error('VOICE_GUILD_NOT_FOUND');

    if (this.client.user!.id !== this.id) throw new Error('VOICE_STATE_NOT_OWN');

    await this.client.api.guilds(this.guild.id, 'voice-states', '@me').patch({
      data: {
        channel_id: this.channelId,
        request_to_speak_timestamp: request ? new Date().toISOString() : null,
      },
    });
  }

  /**
   * Suppress/unsuppress the user. Only applicable for stage channels.
   * @param {boolean} [suppressed=true] Whether or not the user should be suppressed.
   * @example
   * // Making the client a speaker
   * guild.members.me.voice.setSuppressed(false);
   * @example
   * // Making the client an audience member
   * guild.members.me.voice.setSuppressed(true);
   * @example
   * // Inviting another user to speak
   * voiceState.setSuppressed(false);
   * @example
   * // Moving another user to the audience, or cancelling their invite to speak
   * voiceState.setSuppressed(true);
   * @returns {Promise<void>}
   */
  async setSuppressed(suppressed: boolean = true) {
    if (typeof suppressed !== 'boolean') throw new TypeError('VOICE_STATE_INVALID_TYPE', 'suppressed');
    if (!this.guild) throw new Error('VOICE_GUILD_NOT_FOUND');

    if (this.channel?.type !== 'GUILD_STAGE_VOICE') throw new Error('VOICE_NOT_STAGE_CHANNEL');

    const target = this.client.user!.id === this.id ? '@me' : this.id;

    await this.client.api.guilds(this.guild.id, 'voice-states', target).patch({
      data: {
        channel_id: this.channelId,
        suppress: suppressed,
        request_to_speak_timestamp: null,
      },
    });
  }

  /**
   * Sets the status of the voice channel
   * @param {string} [status=""] The message to set the channel status to
   * @example
   * // Setting the status to something
   * guild.members.me.voice.setStatus("something")
   * @example
   * // Removing the status
   * guild.members.me.voice.setStatus()
   * @returns {Promise<void>}
   */
  setStatus(status: string = '') {
    if (!this.channel) throw new Error('VOICE_CHANNEL_NOT_FOUND');
    // PUT https://discord.com/api/v9/channels/:id/voice-status
    return this.client.api.channels(this.channel.id, 'voice-status').put({
      data: {
        status,
      },
    });
  }

  /**
   * Get URL Image of the user's streaming video (NOT STREAMING !!!)
   * @returns {Promise<string>} URL Image of the user's streaming video
   */
  async getPreview() {
    if (!this.streaming) throw new Error('USER_NOT_STREAMING');
    // URL: https://discord.com/api/v9/streams/guild:guildid:voicechannelid:userid/preview
    // URL: https://discord.com/api/v9/streams/call:channelId:userId/preview
    const streamKey = this.guild
      ? `guild:${this.guild.id}:${this.channelId}:${this.id}`
      : `call:${this.channelId}:${this.id}`;
    const data = await this.client.api.streams[encodeURIComponent(streamKey)].preview.get();
    return data.url;
  }

  /**
   * Post Preview Image to the client user's streaming video
   * @param {string} base64Image Base64 URI (data:image/jpeg;base64,data)
   * @returns {Promise<void>}
   */
  postPreview(base64Image: string) {
    if (this.client.user!.id !== this.id || !this.streaming) throw new Error('USER_NOT_STREAMING');
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

  /**
   * Fetches this voice state.
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<VoiceState>}
   */
  fetch(force: boolean = true) {
    if (!this.guild) throw new Error('VOICE_GUILD_NOT_FOUND');
    return this.guild.voiceStates.fetch(this.id, { force });
  }

  toJSON() {
    return super.toJSON({
      id: true,
      serverDeaf: true,
      serverMute: true,
      selfDeaf: true,
      selfMute: true,
      selfVideo: true,
      sessionId: true,
      channelId: 'channel',
    });
  }
}

export default VoiceState;
export { VoiceState };
