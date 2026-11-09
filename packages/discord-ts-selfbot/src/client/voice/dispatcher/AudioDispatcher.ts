import BaseDispatcher from './BaseDispatcher';
import VoiceCodec from '../util/VoiceCodec';
import Silence from '../util/Silence';
import VolumeInterface from '../util/VolumeInterface';

const CHANNELS = 2;

/**
 * @external WritableStream
 * @see {@link https://nodejs.org/api/stream.html#stream_class_stream_writable}
 */

/**
 * The class that sends voice packet data to the voice connection.
 * ```js
 * // Obtained using:
 * client.voice.joinChannel(channel).then(connection => {
 *   // You can play a file or a stream here:
 *   const dispatcher = connection.playAudio('/home/hydrabolt/audio.mp3');
 * });
 * ```
 * @implements {VolumeInterface}
 * @extends {BaseDispatcher}
 */
class AudioDispatcher extends BaseDispatcher {
  declare streamOptions: {
    seek: number;
    volume: number;
    fec: boolean;
    plp: number;
    bitrate: number;
    highWaterMark: number;
  };

  constructor(
    player: any,
    { seek = 0, volume = 1, fec, plp, bitrate = 96, highWaterMark = 12 }: any = {},
    streams: any,
  ) {
    const streamOptions = { seek, volume, fec, plp, bitrate, highWaterMark };
    super(player, highWaterMark, VoiceCodec.getPayloadType('opus'), false, streams);

    this.streamOptions = streamOptions;

    this.streams.silence = new Silence();

    this.setVolume(volume);
    this.setBitrate(bitrate);
    if (typeof fec !== 'undefined') this.setFEC(fec);
    if (typeof plp !== 'undefined') this.setPLP(plp);
  }

  get TIMESTAMP_INC() {
    return 480 * CHANNELS;
  }

  get FRAME_LENGTH() {
    return 20;
  }

  /**
   * Get the type of the dispatcher
   * @returns {'audio'}
   */
  getTypeDispatcher() {
    return 'audio';
  }

  /**
   * Set the bitrate of the current Opus encoder if using a compatible Opus stream.
   * @param {number} value New bitrate, in kbps
   * If set to 'auto', the voice channel's bitrate will be used
   * @returns {boolean} true if the bitrate has been successfully changed.
   */
  setBitrate(value: any) {
    if (!value || !this.bitrateEditable) return false;
    const bitrate = value === 'auto' ? this.player.voiceConnection.channel.bitrate : value;
    this.streams.opus!.setBitrate!(bitrate * 1000);
    return true;
  }

  /**
   * Sets the expected packet loss percentage if using a compatible Opus stream.
   * @param {number} value between 0 and 1
   * @returns {boolean} Returns true if it was successfully set.
   */
  setPLP(value: any) {
    if (!this.bitrateEditable) return false;
    this.streams.opus!.setPLP!(value);
    return true;
  }

  /**
   * Enables or disables forward error correction if using a compatible Opus stream.
   * @param {boolean} enabled true to enable
   * @returns {boolean} Returns true if it was successfully set.
   */
  setFEC(enabled: any) {
    if (!this.bitrateEditable) return false;
    this.streams.opus!.setFEC!(enabled);
    return true;
  }

  get volumeEditable() {
    return Boolean(this.streams.volume);
  }

  /**
   * Whether or not the Opus bitrate of this stream is editable
   * @type {boolean}
   * @readonly
   */
  get bitrateEditable() {
    return this.streams.opus && this.streams.opus.setBitrate;
  }

  // Volume
  get volume() {
    return this.streams.volume ? (this.streams.volume.volume ?? 1) : 1;
  }

  setVolume(value: any) {
    if (!this.streams.volume) return false;
    /**
     * Emitted when the volume of this dispatcher changes.
     * @event AudioDispatcher#volumeChange
     * @param {number} oldVolume The old volume of this dispatcher
     * @param {number} newVolume The new volume of this dispatcher
     */
    this.emit('volumeChange', this.volume, value);
    this.streams.volume!.setVolume!(value);
    return true;
  }

  /**
   * Sync with another video dispatcher to ensure that the audio and video are played at the same time.
   * @param {VideoDispatcher} otherDispatcher The video dispatcher to sync with
   */
  setSyncVideoDispatcher(otherDispatcher: any) {
    if (otherDispatcher.getTypeDispatcher() !== 'video') {
      throw new Error('Dispatcher must be a video dispatcher');
    }
    this._syncDispatcher = otherDispatcher;
  }

  // Volume stubs for docs
  /* eslint-disable no-empty-function*/
  get volumeDecibels() {
    return undefined;
  }
  get volumeLogarithmic() {
    return undefined;
  }
  setVolumeDecibels() {}
  setVolumeLogarithmic() {}
}

VolumeInterface.applyToClass(AudioDispatcher);

export default AudioDispatcher;
export { AudioDispatcher };
