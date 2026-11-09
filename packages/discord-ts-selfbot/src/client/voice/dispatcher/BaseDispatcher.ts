import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import type { CipherGCM } from 'node:crypto';
import { Writable } from 'node:stream';
import { setTimeout } from 'node:timers';
import secretbox from '../util/Secretbox';

const MAX_UINT_16 = 2 ** 16 - 1;
const MAX_UINT_32 = 2 ** 32 - 1;

const extensions = [{ id: 5, length: 2, value: 0 }];

/**
 * @external WritableStream
 * @see {@link https://nodejs.org/api/stream.html#stream_class_stream_writable}
 */

/**
 * @extends {Writable}
 */
type DispatcherStream = {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  unpipe(destination?: unknown): unknown;
  pipe(destination: unknown): unknown;
  pause(): unknown;
  resume(): unknown;
  destroy(): unknown;
  setBitrate?(bitrate: number): unknown;
  setPLP?(plp: number): unknown;
  setFEC?(fec: boolean): unknown;
  setVolume?(volume: number): unknown;
  volume?: number;
};

type DispatcherStreams = {
  input?: DispatcherStream;
  ffmpeg?: DispatcherStream;
  opus?: DispatcherStream;
  volume?: DispatcherStream;
  video?: DispatcherStream;
  silence?: DispatcherStream;
};

class BaseDispatcher extends Writable {
  declare streams: DispatcherStreams;
  declare player: import('../player/MediaPlayer').default;
  declare payloadType: number;
  declare extensionEnabled: boolean;
  declare _nonce: number;
  declare _nonceBuffer: Buffer | null;
  declare pausedSince: number | null;
  declare _writeCallback: (() => void) | null;
  declare _pausedTime: number;
  declare _silentPausedTime: number;
  declare count: number;
  declare sequence: number;
  declare timestamp: number;
  declare startTime: number;
  declare _syncDispatcher: BaseDispatcher | null;
  declare _silence: boolean;

  get TIMESTAMP_INC(): number {
    return 0;
  }

  get FRAME_LENGTH(): number {
    return 0;
  }

  _codecCallback(_chunk: Buffer): void {
    throw new Error('The _codecCallback method must be implemented');
  }

  constructor(player: any, highWaterMark = 12, payloadType: any, extensionEnabled: any, streams: any = {}) {
    super({
      highWaterMark,
    });
    this.streams = streams;
    /**
     * The Player that controls this dispatcher
     * @type {MediaPlayer}
     */
    this.player = player;
    this.payloadType = payloadType;
    this.extensionEnabled = extensionEnabled;

    this._nonce = 0;
    this._nonceBuffer = null;

    /**
     * The time that the stream was paused at (null if not paused)
     * @type {?number}
     */
    this.pausedSince = null;
    this._writeCallback = null;

    this._pausedTime = 0;
    this._silentPausedTime = 0;

    this.count = 0;
    this.sequence = 0;
    this.timestamp = 0;

    const streamError = (type?: any, err?: any) => {
      /**
       * Emitted when the dispatcher encounters an error.
       * @event BaseDispatcher#error
       */
      if (type && err) {
        err.message = `${type} stream: ${err.message}`;
        this.emit(this.player.dispatcher === this ? 'error' : 'debug', err);
      }
      this.destroy();
    };

    this.on('error', () => streamError());
    if (this.streams.input) this.streams.input.on('error', (err: any) => streamError('input', err));
    if (this.streams.ffmpeg) this.streams.ffmpeg.on('error', (err: any) => streamError('ffmpeg', err));
    if (this.streams.opus) this.streams.opus.on('error', (err: any) => streamError('opus', err));
    if (this.streams.volume) this.streams.volume.on('error', (err: any) => streamError('volume', err));

    this.on('finish', () => {
      this._cleanup();
      this._setSpeaking(0);
      this._setVideoStatus(false);
      this._setStreamStatus(true);
    });
  }

  getTypeDispatcher() {
    return 'base';
  }

  resetNonceBuffer() {
    this._nonceBuffer =
      this.player.voiceConnection.authentication.mode === 'aead_aes256_gcm_rtpsize'
        ? Buffer.alloc(12)
        : Buffer.alloc(24);
  }

  getNewSequence() {
    const currentSeq = this.sequence;
    this.sequence++;
    if (this.sequence > MAX_UINT_16) this.sequence = 0;
    return currentSeq;
  }

  _write(chunk: any, _enc: any, done: any) {
    if (!this.startTime) {
      /**
       * Emitted once the stream has started to play.
       * @event BaseDispatcher#start
       */
      this.emit('start');
      this.startTime = performance.now();
    }
    if (this._syncDispatcher && !this._syncDispatcher.startTime) {
      this.pause();
      const cb = () => {
        this.resume();
        clearTimeout(timeout);
      };
      this._syncDispatcher.once('start', cb);
      let timeout = setTimeout(() => {
        this.removeListener('start', cb);
        this.resume();
      }, 10_000).unref();
    }
    if (this.getTypeDispatcher() === 'video') {
      this._codecCallback(chunk);
    } else {
      this._playChunk(chunk);
    }
    this._step(done);
  }

  _destroy(err: any, cb: any) {
    this._cleanup();
    super._destroy(err, cb);
  }

  _cleanup() {
    if (this.player.dispatcher === this) {
      this.player.dispatcher.destroy();
      this.player.dispatcher = null;
    }
    if (this.player.videoDispatcher === this) {
      this.player.videoDispatcher.destroy();
      this.player.videoDispatcher = null;
    }
    const { streams } = this;
    if (streams.opus) streams.opus.destroy();
    streams.ffmpeg?.destroy();
  }

  /**
   * Pauses playback
   * @param {boolean} [silence=false] Whether to play silence while paused to prevent audio glitches
   */
  pause(silence = false) {
    if (this.paused) return;
    if (this.streams.opus) this.streams.opus.unpipe(this); // Audio
    if (this.streams.video) {
      this.streams.ffmpeg!.pause();
      this.streams.video.unpipe(this);
    }
    if (this.getTypeDispatcher() === 'audio') {
      if (silence) {
        this.streams.silence!.pipe(this);
        this._silence = true;
      } else {
        this._setSpeaking(0);
      }
    }
    this.pausedSince = performance.now();
  }

  /**
   * Whether or not playback is paused
   * @type {boolean}
   * @readonly
   */
  get paused() {
    return Boolean(this.pausedSince);
  }

  /**
   * Total time that this dispatcher has been paused in milliseconds
   * @type {number}
   * @readonly
   */
  get pausedTime() {
    return this._silentPausedTime + this._pausedTime + (this.paused ? performance.now() - this.pausedSince! : 0);
  }

  /**
   * Resumes playback
   */
  resume() {
    if (!this.pausedSince) return;
    if (this.getTypeDispatcher() === 'audio') this.streams.silence!.unpipe(this);
    if (this.streams.opus) this.streams.opus.pipe(this);
    if (this.streams.video) {
      this.streams.ffmpeg!.resume();
      this.streams.video.pipe(this);
    }
    if (this._silence) {
      this._silentPausedTime += performance.now() - this.pausedSince;
      this._silence = false;
    } else {
      this._pausedTime += performance.now() - this.pausedSince;
    }
    this.pausedSince = null;
    if (typeof this._writeCallback === 'function') this._writeCallback();
  }

  /**
   * The time (in milliseconds) that the dispatcher has been playing audio for, taking into account skips and pauses
   * @type {number}
   * @readonly
   */
  get totalStreamTime() {
    return performance.now() - this.startTime;
  }

  _step(done: any) {
    this._writeCallback = () => {
      this._writeCallback = null;
      done();
    };
    const next = (this.count + 1) * this.FRAME_LENGTH - (performance.now() - this.startTime - this._pausedTime);
    setTimeout(() => {
      if ((!this.pausedSince || this._silence) && this._writeCallback) this._writeCallback();
    }, next).unref();
    this.timestamp += this.TIMESTAMP_INC;
    if (this.timestamp > MAX_UINT_32) this.timestamp = 0;
    this.count++;
    if (this.count > MAX_UINT_16) this.count = 0;
  }

  _final(callback: any) {
    this._writeCallback = null;
    callback();
  }

  _playChunk(chunk: any, isLastPacket = false) {
    if (
      (this.player.dispatcher !== this && this.player.videoDispatcher !== this) ||
      !this.player.voiceConnection.authentication.secret_key
    ) {
      return;
    }
    const packet = this._createPacket(chunk, isLastPacket);
    if (packet) this._sendPacket(packet);
  }

  /**
   * Creates a one-byte extension header
   * https://www.rfc-editor.org/rfc/rfc5285#section-4.2
   * @returns {Buffer} <Buffer be de 00 01>
   */
  createHeaderExtension() {
    /**
      *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
      |      defined by profile       |           length              |
      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
      */
    const profile = Buffer.alloc(4);
    profile[0] = 0xbe;
    profile[1] = 0xde;
    profile.writeInt16BE(extensions.length, 2); // Extension count

    return profile;
  }

  /**
   * Creates a one-byte extension header & a single extension of type playout-delay
   * @see https://docs.discord.food/topics/voice-connections#sending-and-receiving-voice
   * Discord expects a playout delay RTP extension header on every video packet.
   * @see https://webrtc.googlesource.com/src/+/refs/heads/main/docs/native-code/rtp-hdrext/playout-delay
   * @returns {Buffer} playout-delay extension <Buffer 51 00 00 00>
   */
  createPayloadExtension() {
    const extensionsData = [];
    for (let ext of extensions) {
      /**
       * EXTENSION DATA - each extension payload is 32 bits
       */
      const data = Buffer.alloc(4);

      // https://webrtc.googlesource.com/src/+/refs/heads/main/docs/native-code/rtp-hdrext/playout-delay
      if (ext.id === 5) {
        /**
         *  0 1 2 3 4 5 6 7
          +-+-+-+-+-+-+-+-+
          |  ID   |  len  |
          +-+-+-+-+-+-+-+-+

          where len = actual length - 1
        /
        data[0] = (ext.id & 0b00001111) << 4;
        data[0] |= (ext.len - 1) & 0b00001111;

        /**  Specific to type playout-delay
          *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4
            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
            |       MIN delay       |       MAX delay       |
            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
        */
        data.writeUIntBE(ext.value, 1, 2); // Not quite but its 0 anyway
      }
      extensionsData.push(data);
    }
    return Buffer.concat(extensionsData);
  }

  _encrypt(buffer: any, additionalData: any) {
    const { secret_key, mode } = this.player.voiceConnection.authentication;
    // Both supported encryption methods want the nonce to be an incremental integer
    this._nonce++;
    if (this._nonce > MAX_UINT_32) this._nonce = 0;
    if (!this._nonceBuffer) {
      this.resetNonceBuffer();
    }
    this._nonceBuffer!.writeUInt32BE(this._nonce, 0);

    // 4 extra bytes of padding on the end of the encrypted packet
    const noncePadding = this._nonceBuffer!.slice(0, 4);

    let encrypted;

    switch (mode) {
      case 'aead_aes256_gcm_rtpsize': {
        const cipher: CipherGCM = crypto.createCipheriv('aes-256-gcm', secret_key, this._nonceBuffer!);
        cipher.setAAD(additionalData);

        encrypted = Buffer.concat([cipher.update(buffer), cipher.final(), cipher.getAuthTag()]);

        return [encrypted, noncePadding];
      }
      case 'aead_xchacha20_poly1305_rtpsize': {
        encrypted = secretbox.methods.crypto_aead_xchacha20poly1305_ietf_encrypt(
          buffer,
          additionalData,
          this._nonceBuffer,
          secret_key,
        );

        return [encrypted, noncePadding];
      }
      default: {
        // This should never happen. Our encryption mode is chosen from a list given to us by the gateway and checked with the ones we support.
        throw new RangeError(`Unsupported encryption method: ${mode}`);
      }
    }
  }

  _createPacket(buffer: any, isLastPacket: any) {
    /*
    // Packet is raw rtp from ffmpeg
    const rtp = webrtc.RtpPacket.deSerialize(buffer);
    if (!rtp.payload) {
      console.log('no payload', rtp);
      return null;
    }
    // Header
    // https://docs.discord.food/topics/voice-connections#rtp-packet-structure
    let rtpHeader = buffer.slice(0, 12); // RTP_HEADER_SIZE
    rtpHeader[0] = 0x80; // Version + Flags (1 byte)
    rtpHeader[1] = this.payloadType; // Payload Type (1 byte)
    if (this.extensionEnabled) {
      rtpHeader = Buffer.concat([rtpHeader, this.createHeaderExtension()]);
      rtpHeader[0] |= 1 << 4; // 0x90
    }
    rtpHeader.writeUIntBE(this.getNewSequence(), 2, 2);
    rtpHeader.writeUIntBE(this.timestamp, 4, 4);
    rtpHeader.writeUIntBE(
      this.player.voiceConnection.authentication.ssrc + Number(this.getTypeDispatcher() === 'video'),
      8,
      4,
    );
    */
    // Header
    let rtpHeader = Buffer.alloc(12); // RTP_HEADER_SIZE
    rtpHeader[0] = 0x80; // Version + Flags (1 byte)
    rtpHeader[1] = this.payloadType; // Payload Type (1 byte)
    if (this.extensionEnabled) {
      rtpHeader = Buffer.concat([rtpHeader, this.createHeaderExtension()]);
      rtpHeader[0] |= 1 << 4; // 0x90
    }
    if (this.getTypeDispatcher() === 'video' && isLastPacket) {
      rtpHeader[1] |= 1 << 7; // Marker bit
    }

    rtpHeader.writeUIntBE(this.getNewSequence(), 2, 2);
    rtpHeader.writeUIntBE(this.timestamp, 4, 4);
    rtpHeader.writeUIntBE(
      this.player.voiceConnection.authentication.ssrc + Number(this.getTypeDispatcher() === 'video'),
      8,
      4,
    );
    return Buffer.concat([rtpHeader, ...this._encrypt(buffer, rtpHeader)]);
  }

  _sendPacket(packet: any) {
    /**
     * Emitted whenever the dispatcher has debug information.
     * @event BaseDispatcher#debug
     * @param {string} info The debug info
     */
    if (this.getTypeDispatcher() === 'audio') {
      this._setSpeaking(this.player.isScreenSharing ? 1 << 1 : 1 << 0); // 1 << 0 = SPEAKING, 1 << 1 = SOUND SHARE
    } else if (this.getTypeDispatcher() === 'video') {
      this._setVideoStatus(true);
      this._setStreamStatus(false);
    }
    if (!this.player.voiceConnection.sockets.udp) {
      this.emit('debug', 'Failed to send a packet - no UDP socket');
      return;
    }
    this.player.voiceConnection.sockets.udp.send(packet).catch((e: any) => {
      if (this.getTypeDispatcher() === 'audio') {
        this._setSpeaking(this._setSpeaking(0));
      } else if (this.getTypeDispatcher() === 'video') {
        this._setVideoStatus(false);
        this._setStreamStatus(true);
      }
      this.emit('debug', `Failed to send a packet - ${e}`);
    });
  }

  _setSpeaking(value: any) {
    if (typeof this.player.voiceConnection !== 'undefined') {
      this.player.voiceConnection.setSpeaking(value);
    }
    /**
     * Emitted when the dispatcher starts/stops speaking.
     * @event AudioDispatcher#speaking
     * @param {boolean} value Whether or not the dispatcher is speaking
     */
    this.emit('speaking', value);
  }

  _setVideoStatus(value: any) {
    if (typeof this.player.voiceConnection !== 'undefined') {
      this.player.voiceConnection.setVideoStatus(value);
    }
    /**
     * Emitted when the dispatcher starts/stops video.
     * @event VideoDispatcher#videoStatus
     * @param {boolean} value Whether or not the dispatcher is enable video
     */
    this.emit('videoStatus', value);
  }

  _setStreamStatus(value: any) {
    if (typeof this.player.voiceConnection?.sendScreenshareState !== 'undefined') {
      this.player.voiceConnection.sendScreenshareState(value);
    }
    /**
     * Emitted when the dispatcher starts/stops video.
     * @event VideoDispatcher#streamStatus
     * @param {boolean} isPaused Whether or not the dispatcher is pause video
     */
    this.emit('streamStatus', value);
  }
}

export default BaseDispatcher;
export { BaseDispatcher };
