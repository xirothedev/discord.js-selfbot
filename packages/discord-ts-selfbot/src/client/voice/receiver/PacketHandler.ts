import { Readable as ReadableStream } from "node:stream";
import EventEmitter from "node:events";
import { setTimeout } from "node:timers";
import Recorder from "./Recorder";
import type { RtpPacket } from "werift-rtp";

interface UserStat {
  userId: string;
  speaking?: number;
  hasVideo?: boolean;
}
import Speaking from "../../../util/Speaking";
import VoiceCodec from "../util/VoiceCodec";
import RtpDecryptor from "../util/RtpDecryptor";
import _SilenceModule from "../util/Silence";
import type Receiver from "./Receiver";
import type { Writable } from "node:stream";

const { SILENCE_FRAME } = _SilenceModule;

// The delay between packets when a user is considered to have stopped speaking
// https://github.com/discordjs/discord.js/issues/3524#issuecomment-540373200
const DISCORD_SPEAKING_DELAY = 250;

// Unused: const HEADER_EXTENSION_BYTE = Buffer.from([0xbe, 0xde]);

class Readable extends ReadableStream {
  _read() {
    // The stream is fed manually by the packet handler.
  }
}

class PacketHandler extends EventEmitter {
  declare receiver: Receiver;
  declare streams: Map<string, { stream: Readable; end: string }>;
  declare videoStreams: Map<string, Recorder>;
  declare speakingTimeouts: Map<number, NodeJS.Timeout>;

  constructor(receiver: Receiver) {
    super();
    this.receiver = receiver;
    this.streams = new Map();
    this.videoStreams = new Map();
    this.speakingTimeouts = new Map();
  }

  getNonceBuffer() {
    return this.receiver.connection.authentication.mode ===
      "aead_aes256_gcm_rtpsize"
      ? Buffer.alloc(12)
      : Buffer.alloc(24);
  }

  get connection() {
    return this.receiver.connection;
  }

  _stoppedSpeaking(userId: string) {
    const streamInfo = this.streams.get(userId);
    if (streamInfo && streamInfo.end === "silence") {
      this.streams.delete(userId);
      streamInfo.stream.push(null);
    }
  }

  makeStream(user: string, end: string) {
    const stream = this.streams.get(user)?.stream;
    if (stream) {
      return stream;
    }
    const newStream = new Readable();
    newStream.on("end", () => this.streams.delete(user));
    this.streams.set(user, { end, stream: newStream });
    return newStream;
  }

  makeVideoStream(user: string, output: Writable | string) {
    const existing = this.videoStreams.get(user);
    if (existing) {
      return existing;
    }
    const stream = new Recorder(this, {
      output,
      portUdpH264: 65_506,
      portUdpOpus: 65_510,
      userId: user,
    });
    stream.on("ready", () => {
      this.videoStreams.set(user, stream);
    });
    return stream;
  }

  parseBuffer(buffer: Buffer): RtpPacket | Error {
    return RtpDecryptor.decrypt(
      buffer,
      this.receiver.connection.authentication
    );
  }

  audioReceiver(
    ssrc: number,
    userStat: UserStat,
    opusPacket: RtpPacket | Error
  ) {
    const streamInfo = this.streams.get(userStat.userId);
    // If the user is in video, we need to check if the packet is just silence
    if (userStat.hasVideo) {
      if (opusPacket instanceof Error) {
        // Only emit an error if we were actively receiving packets from this user
        if (streamInfo) {
          this.emit("error", opusPacket);
        }
        return;
      }
      // Check payload type
      if (opusPacket.header.payloadType !== VoiceCodec.getPayloadType("opus")) {
        return;
      }
      if (!opusPacket.payload) {
        return;
      }
      if (SILENCE_FRAME.equals(opusPacket.payload)) {
        // If this is a silence frame, pretend we never received it
        return;
      }
    }

    let speakingTimeout = this.speakingTimeouts.get(ssrc);
    if (speakingTimeout === undefined) {
      // Ensure at least the speaking bit is set.
      // As the object is by reference, it's only needed once per client re-connect.
      if (userStat.speaking === 0) {
        userStat.speaking = Number(Speaking.FLAGS.SPEAKING);
      }
      this.connection.onSpeaking({
        speaking: userStat.speaking ?? 0,
        ssrc,
        user_id: userStat.userId,
      });
      speakingTimeout = setTimeout(() => {
        try {
          this.connection.onSpeaking({
            speaking: 0,
            ssrc,
            user_id: userStat.userId,
          });
          clearTimeout(speakingTimeout);
          this.speakingTimeouts.delete(ssrc);
        } catch {
          // Connection already closed, ignore
        }
      }, DISCORD_SPEAKING_DELAY).unref();
      this.speakingTimeouts.set(ssrc, speakingTimeout);
    } else {
      speakingTimeout.refresh();
    }

    if (streamInfo) {
      const { stream } = streamInfo;
      if (opusPacket instanceof Error) {
        this.emit("error", opusPacket);
        return;
      }
      if (opusPacket.header.payloadType !== VoiceCodec.getPayloadType("opus")) {
        return;
      }
      stream.push(opusPacket.payload);
    }
  }

  audioReceiverForStream(
    _ssrc: number,
    userStat: UserStat,
    packet: RtpPacket | Error
  ) {
    const streamInfo = this.videoStreams.get(userStat.userId);
    if (!streamInfo) {
      return;
    }
    if (packet instanceof Error) {
      return;
    }
    if (packet.header.payloadType !== VoiceCodec.getPayloadType("opus")) {
      return;
    }
    streamInfo.feed(packet);
  }

  videoReceiver(_ssrc: number, userStat: UserStat, packet: RtpPacket | Error) {
    const streamInfo = this.videoStreams.get(userStat.userId);
    // If the user is in video, we need to check if the packet is just silence
    if (userStat.hasVideo) {
      if (packet instanceof Error) {
        return;
      }

      if (packet.header.payloadType === VoiceCodec.getPayloadType("opus")) {
        return;
      }

      if (streamInfo) {
        streamInfo.feed(packet);
      }
    }
  }

  push(buffer: Buffer) {
    const ssrc = buffer.readUInt32BE(8);
    let userStat: UserStat | undefined;
    let packet: RtpPacket | Error | undefined;
    if (this.connection.ssrcMap.has(ssrc)) {
      // Audio_ssrc.
      userStat = this.connection.ssrcMap.get(ssrc);
      packet = this.parseBuffer(buffer);
      if (userStat) {
        this.audioReceiver(ssrc, userStat, packet);
        this.audioReceiverForStream(ssrc, userStat, packet);
      }
    } else if (this.connection.ssrcMap.has(ssrc - 1)) {
      // Video_ssrc.
      userStat = this.connection.ssrcMap.get(ssrc - 1);
      packet = this.parseBuffer(buffer);
      if (userStat) {
        this.videoReceiver(ssrc, userStat, packet);
      }
    }
    if (userStat && !(packet instanceof Error)) {
      this.receiver.emit("receiverData", userStat, packet);
    }
  }

  // When udp connection is closed (STREAM_DELETE), destroy all streams (Memory leak)
  destroyAllStream() {
    for (const stream of this.streams.values()) {
      stream.stream.destroy();
    }
    this.streams.clear();
    for (const stream of this.videoStreams.values()) {
      stream.destroy();
    }
    this.videoStreams.clear();
  }
}

export default PacketHandler;
export { PacketHandler };
