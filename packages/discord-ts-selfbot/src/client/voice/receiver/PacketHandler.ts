const EventEmitter = require('events');
const { setTimeout } = require('node:timers');
const Recorder = require('./Recorder');
const Speaking = require('../../../util/Speaking');
const VoiceCodec = require('../util/VoiceCodec');
const RtpDecryptor = require('../util/RtpDecryptor');
const { SILENCE_FRAME } = require('../util/Silence');

// The delay between packets when a user is considered to have stopped speaking
// https://github.com/discordjs/discord.js/issues/3524#issuecomment-540373200
const DISCORD_SPEAKING_DELAY = 250;

// Unused: const HEADER_EXTENSION_BYTE = Buffer.from([0xbe, 0xde]);

class Readable extends require('stream').Readable {
  _read() {} // eslint-disable-line no-empty-function
}

class PacketHandler extends EventEmitter {
  [key: string]: any;

  constructor(receiver: any) {
    super();
    this.receiver = receiver;
    this.streams = new Map();
    this.videoStreams = new Map();
    this.speakingTimeouts = new Map();
  }

  getNonceBuffer() {
    return this.receiver.connection.authentication.mode === 'aead_aes256_gcm_rtpsize'
      ? Buffer.alloc(12)
      : Buffer.alloc(24);
  }

  get connection() {
    return this.receiver.connection;
  }

  _stoppedSpeaking(userId: any) {
    const streamInfo = this.streams.get(userId);
    if (streamInfo && streamInfo.end === 'silence') {
      this.streams.delete(userId);
      streamInfo.stream.push(null);
    }
  }

  makeStream(user: any, end: any) {
    if (this.streams.has(user)) return this.streams.get(user).stream;
    const stream = new Readable();
    stream.on('end', () => this.streams.delete(user));
    this.streams.set(user, { stream, end });
    return stream;
  }

  makeVideoStream(user: any, output: any) {
    if (this.videoStreams.has(user)) return this.videoStreams.get(user);
    const stream = new Recorder(this, {
      userId: user,
      output,
      portUdpH264: 65506,
      portUdpOpus: 65510,
    });
    stream.on('ready', () => {
      this.videoStreams.set(user, stream);
    });
    return stream;
  }

  parseBuffer(buffer: any) {
    return RtpDecryptor.decrypt(buffer, this.receiver.connection.authentication);
  }

  audioReceiver(ssrc: any, userStat: any, opusPacket: any) {
    const streamInfo = this.streams.get(userStat.userId);
    // If the user is in video, we need to check if the packet is just silence
    if (userStat.hasVideo) {
      if (opusPacket instanceof Error) {
        // Only emit an error if we were actively receiving packets from this user
        if (streamInfo) {
          this.emit('error', opusPacket);
        }
        return;
      }
      // Check payload type
      if (opusPacket.header.payloadType !== VoiceCodec.getPayloadType('opus')) {
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
    if (typeof speakingTimeout === 'undefined') {
      // Ensure at least the speaking bit is set.
      // As the object is by reference, it's only needed once per client re-connect.
      if (userStat.speaking === 0) {
        userStat.speaking = Speaking.FLAGS.SPEAKING;
      }
      this.connection.onSpeaking({ user_id: userStat.userId, ssrc: ssrc, speaking: userStat.speaking });
      speakingTimeout = setTimeout(() => {
        try {
          this.connection.onSpeaking({ user_id: userStat.userId, ssrc: ssrc, speaking: 0 });
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
        this.emit('error', opusPacket);
        return;
      }
      if (opusPacket.header.payloadType !== VoiceCodec.getPayloadType('opus')) {
        return;
      }
      stream.push(opusPacket.payload);
    }
  }

  audioReceiverForStream(_ssrc: any, userStat: any, packet: any) {
    const streamInfo = this.videoStreams.get(userStat.userId);
    if (!streamInfo) return;
    if (packet instanceof Error) {
      return;
    }
    if (packet.header.payloadType !== VoiceCodec.getPayloadType('opus')) {
      return;
    }
    streamInfo.feed(packet);
  }

  /**
   * Test
   * @param {number} ssrc ssrc
   * @param {Object} userStat { userId, hasVideo }
   * @param {RtpPacket} packet RtpPacket
   * @returns {void}
   */
  videoReceiver(_ssrc: any, userStat: any, packet: any) {
    const streamInfo = this.videoStreams.get(userStat.userId);
    // If the user is in video, we need to check if the packet is just silence
    if (userStat.hasVideo) {
      if (packet instanceof Error) {
        return;
      }

      if (packet.header.payloadType === VoiceCodec.getPayloadType('opus')) {
        return;
      }

      if (streamInfo) {
        streamInfo.feed(packet);
      }
    }
  }

  push(buffer: any) {
    const ssrc = buffer.readUInt32BE(8);
    let userStat, packet;
    if (this.connection.ssrcMap.has(ssrc)) {
      userStat = this.connection.ssrcMap.get(ssrc); // Audio_ssrc
      packet = this.parseBuffer(buffer);
      this.audioReceiver(ssrc, userStat, packet);
      this.audioReceiverForStream(ssrc, userStat, packet);
    } else if (this.connection.ssrcMap.has(ssrc - 1)) {
      userStat = this.connection.ssrcMap.get(ssrc - 1); // Video_ssrc
      packet = this.parseBuffer(buffer);
      this.videoReceiver(ssrc, userStat, packet);
    }
    if (userStat && !(packet instanceof Error)) this.receiver.emit('receiverData', userStat, packet);
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

export = PacketHandler;
