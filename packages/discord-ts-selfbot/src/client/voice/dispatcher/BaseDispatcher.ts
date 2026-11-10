import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import type { CipherGCM } from "node:crypto";
import { Writable } from "node:stream";
import { setTimeout } from "node:timers";
import secretbox from "../util/Secretbox";
import type MediaPlayer from "../player/MediaPlayer";

const MAX_UINT_16 = 2 ** 16 - 1;
const MAX_UINT_32 = 2 ** 32 - 1;

const extensions = [{ id: 5, length: 2, value: 0 }];

interface DispatcherStream {
  on: (event: string, listener: (...args: unknown[]) => void) => unknown;
  unpipe: (destination?: NodeJS.WritableStream) => unknown;
  pipe: (destination: NodeJS.WritableStream) => unknown;
  pause: () => unknown;
  resume: () => unknown;
  destroy: () => unknown;
  setBitrate?: (bitrate: number) => unknown;
  setPLP?: (plp: number) => unknown;
  setFEC?: (fec: boolean) => unknown;
  setVolume?: (volume: number) => unknown;
  volume?: number;
}

interface DispatcherStreams {
  input?: DispatcherStream;
  ffmpeg?: DispatcherStream;
  opus?: DispatcherStream;
  volume?: DispatcherStream;
  video?: DispatcherStream;
  silence?: DispatcherStream;
}

class BaseDispatcher extends Writable {
  declare streams: DispatcherStreams;
  declare player: MediaPlayer;
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
    throw new Error("The _codecCallback method must be implemented");
  }

  constructor(
    player: MediaPlayer,
    highWaterMark: number | undefined,
    payloadType: number,
    extensionEnabled: boolean,
    streams: DispatcherStreams = {}
  ) {
    super({
      highWaterMark: highWaterMark ?? 12,
    });
    this.streams = streams;
    this.player = player;
    this.payloadType = payloadType;
    this.extensionEnabled = extensionEnabled;

    this._nonce = 0;
    this._nonceBuffer = null;

    this.pausedSince = null;
    this._writeCallback = null;

    this._pausedTime = 0;
    this._silentPausedTime = 0;

    this.count = 0;
    this.sequence = 0;
    this.timestamp = 0;

    const streamError = (type?: string, err?: unknown) => {
      if (type && err) {
        const error = err instanceof Error ? err : new Error(String(err));
        error.message = `${type} stream: ${error.message}`;
        this.emit(this.player.dispatcher === this ? "error" : "debug", error);
      }
      this.destroy();
    };

    this.on("error", () => streamError());
    if (this.streams.input) {
      this.streams.input.on("error", (err) => streamError("input", err));
    }
    if (this.streams.ffmpeg) {
      this.streams.ffmpeg.on("error", (err) => streamError("ffmpeg", err));
    }
    if (this.streams.opus) {
      this.streams.opus.on("error", (err) => streamError("opus", err));
    }
    if (this.streams.volume) {
      this.streams.volume.on("error", (err) => streamError("volume", err));
    }

    this.on("finish", () => {
      this._cleanup();
      this._setSpeaking(0);
      this._setVideoStatus(false);
      this._setStreamStatus(true);
    });
  }

  getTypeDispatcher() {
    return "base";
  }

  resetNonceBuffer() {
    this._nonceBuffer =
      this.player.voiceConnection.authentication.mode ===
      "aead_aes256_gcm_rtpsize"
        ? Buffer.alloc(12)
        : Buffer.alloc(24);
    return this._nonceBuffer;
  }

  getNewSequence() {
    const currentSeq = this.sequence;
    this.sequence++;
    if (this.sequence > MAX_UINT_16) {
      this.sequence = 0;
    }
    return currentSeq;
  }

  _write(
    chunk: Buffer,
    _enc: BufferEncoding,
    done: (error?: Error | null) => void
  ) {
    if (!this.startTime) {
      this.emit("start");
      this.startTime = performance.now();
    }
    if (this._syncDispatcher && !this._syncDispatcher.startTime) {
      this.pause();
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        this.resume();
      }, 10_000).unref();
      const cb = () => {
        if (timedOut) {
          return;
        }
        this.resume();
        clearTimeout(timeout);
      };
      this._syncDispatcher.once("start", cb);
    }
    if (this.getTypeDispatcher() === "video") {
      this._codecCallback(chunk);
    } else {
      this._playChunk(chunk);
    }
    this._step(done);
  }

  _destroy(err: Error | null, done: (error?: Error | null) => void) {
    this._cleanup();
    super._destroy(err, done);
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
    if (streams.opus) {
      streams.opus.destroy();
    }
    streams.ffmpeg?.destroy();
  }

  pause(silence = false) {
    if (this.paused) {
      return;
    }
    const { streams } = this;
    if (streams.opus) {
      streams.opus.unpipe(this);
    }
    if (this.streams.video) {
      this.streams.ffmpeg?.pause();
      this.streams.video.unpipe(this);
    }
    if (this.getTypeDispatcher() === "audio") {
      if (silence) {
        this.streams.silence?.pipe(this);
        this._silence = true;
      } else {
        this._setSpeaking(0);
      }
    }
    this.pausedSince = performance.now();
  }

  get paused() {
    return Boolean(this.pausedSince);
  }

  get pausedTime() {
    const currentPause = this.pausedSince
      ? performance.now() - this.pausedSince
      : 0;
    return this._silentPausedTime + this._pausedTime + currentPause;
  }

  resume() {
    if (!this.pausedSince) {
      return;
    }
    if (this.getTypeDispatcher() === "audio") {
      this.streams.silence?.unpipe(this);
    }
    if (this.streams.opus) {
      this.streams.opus.pipe(this);
    }
    if (this.streams.video) {
      this.streams.ffmpeg?.resume();
      this.streams.video.pipe(this);
    }
    if (this._silence) {
      this._silentPausedTime += performance.now() - this.pausedSince;
      this._silence = false;
    } else {
      this._pausedTime += performance.now() - this.pausedSince;
    }
    this.pausedSince = null;
    if (typeof this._writeCallback === "function") {
      this._writeCallback();
    }
  }

  get totalStreamTime() {
    return performance.now() - this.startTime;
  }

  _step(done: () => void) {
    this._writeCallback = () => {
      this._writeCallback = null;
      done();
    };
    const next =
      (this.count + 1) * this.FRAME_LENGTH -
      (performance.now() - this.startTime - this._pausedTime);
    setTimeout(() => {
      if ((!this.pausedSince || this._silence) && this._writeCallback) {
        this._writeCallback();
      }
    }, next).unref();
    this.timestamp += this.TIMESTAMP_INC;
    if (this.timestamp > MAX_UINT_32) {
      this.timestamp = 0;
    }
    this.count++;
    if (this.count > MAX_UINT_16) {
      this.count = 0;
    }
  }

  _final(done: (error?: Error | null) => void) {
    this._writeCallback = null;
    done();
  }

  _playChunk(chunk: Buffer, isLastPacket = false) {
    if (
      (this.player.dispatcher !== this &&
        this.player.videoDispatcher !== this) ||
      !this.player.voiceConnection.authentication.secret_key
    ) {
      return;
    }
    const packet = this._createPacket(chunk, isLastPacket);
    if (packet) {
      this._sendPacket(packet);
    }
  }

  createHeaderExtension() {
    const profile = Buffer.alloc(4);
    profile[0] = 0xbe;
    profile[1] = 0xde;
    // Extension count.
    profile.writeInt16BE(extensions.length, 2);

    return profile;
  }

  createPayloadExtension() {
    const extensionsData = [];
    for (const ext of extensions) {
      const data = Buffer.alloc(4);

      // https://webrtc.googlesource.com/src/+/refs/heads/main/docs/native-code/rtp-hdrext/playout-delay
      if (ext.id === 5) {
        // Not quite but its 0 anyway.
        data.writeUIntBE(ext.value, 1, 2);
      }
      extensionsData.push(data);
    }
    return Buffer.concat(extensionsData);
  }

  _encrypt(buffer: Buffer, additionalData: Buffer): [Buffer, Buffer] {
    const { secret_key, mode } = this.player.voiceConnection.authentication;
    if (!secret_key) {
      throw new Error("VOICE_ENCRYPTION_KEY_MISSING");
    }
    // Both supported encryption methods want the nonce to be an incremental integer
    this._nonce++;
    if (this._nonce > MAX_UINT_32) {
      this._nonce = 0;
    }
    if (!this._nonceBuffer) {
      this.resetNonceBuffer();
    }
    const nonceBuffer = this._nonceBuffer ?? this.resetNonceBuffer();
    nonceBuffer.writeUInt32BE(this._nonce, 0);

    // 4 extra bytes of padding on the end of the encrypted packet
    const noncePadding = nonceBuffer.slice(0, 4);

    let encrypted: Buffer | Uint8Array;

    switch (mode) {
      case "aead_aes256_gcm_rtpsize": {
        const cipher: CipherGCM = crypto.createCipheriv(
          "aes-256-gcm",
          secret_key,
          nonceBuffer
        );
        cipher.setAAD(additionalData);

        encrypted = Buffer.concat([
          cipher.update(buffer),
          cipher.final(),
          cipher.getAuthTag(),
        ]);

        return [Buffer.from(encrypted), noncePadding];
      }
      case "aead_xchacha20_poly1305_rtpsize": {
        encrypted =
          secretbox.methods.crypto_aead_xchacha20poly1305_ietf_encrypt(
            buffer,
            additionalData,
            nonceBuffer,
            secret_key
          );

        return [Buffer.from(encrypted), noncePadding];
      }
      default: {
        // This should never happen. Our encryption mode is chosen from a list given to us by the gateway and checked with the ones we support.
        throw new RangeError(`Unsupported encryption method: ${mode}`);
      }
    }
  }

  _createPacket(buffer: Buffer, isLastPacket = false): Buffer | null {
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
    // Header layout: [0] version + flags, [1] payload type, [2-3] sequence,
    // [4-7] timestamp, [8-11] SSRC.
    let rtpHeader = Buffer.alloc(12);
    rtpHeader[0] = 0x80;
    rtpHeader[1] = this.payloadType;
    if (this.extensionEnabled) {
      rtpHeader = Buffer.concat([rtpHeader, this.createHeaderExtension()]);
      rtpHeader[0] |= 1 << 4;
    }
    if (this.getTypeDispatcher() === "video" && isLastPacket) {
      // Marker bit.
      rtpHeader[1] |= 1 << 7;
    }

    rtpHeader.writeUIntBE(this.getNewSequence(), 2, 2);
    rtpHeader.writeUIntBE(this.timestamp, 4, 4);
    rtpHeader.writeUIntBE(
      this.player.voiceConnection.authentication.ssrc +
        Number(this.getTypeDispatcher() === "video"),
      8,
      4
    );
    return Buffer.concat([rtpHeader, ...this._encrypt(buffer, rtpHeader)]);
  }

  _sendPacket(packet: Buffer) {
    if (this.getTypeDispatcher() === "audio") {
      // 1 << 0 = SPEAKING, 1 << 1 = SOUND SHARE.
      this._setSpeaking(this.player.isScreenSharing ? 1 << 1 : Math.trunc(1));
    } else if (this.getTypeDispatcher() === "video") {
      this._setVideoStatus(true);
      this._setStreamStatus(false);
    }
    const { udp } = this.player.voiceConnection.sockets;
    if (!udp) {
      this.emit("debug", "Failed to send a packet - no UDP socket");
      return;
    }
    const send = async () => {
      try {
        await udp.send(packet);
      } catch (error: unknown) {
        if (this.getTypeDispatcher() === "audio") {
          this._setSpeaking(0);
        } else if (this.getTypeDispatcher() === "video") {
          this._setVideoStatus(false);
          this._setStreamStatus(true);
        }
        this.emit("debug", `Failed to send a packet - ${error}`);
      }
    };
    void send();
  }

  _setSpeaking(value: number) {
    if (this.player.voiceConnection !== undefined) {
      this.player.voiceConnection.setSpeaking(value);
    }
    this.emit("speaking", value);
  }

  _setVideoStatus(value: boolean) {
    if (this.player.voiceConnection !== undefined) {
      this.player.voiceConnection.setVideoStatus(value);
    }
    this.emit("videoStatus", value);
  }

  _setStreamStatus(value: boolean) {
    const connection = this.player.voiceConnection;
    if (
      "sendScreenshareState" in connection &&
      typeof connection.sendScreenshareState === "function"
    ) {
      connection.sendScreenshareState(value);
    }
    this.emit("streamStatus", value);
  }
}

export default BaseDispatcher;
export { BaseDispatcher };
export type { DispatcherStream, DispatcherStreams };
