import { Buffer } from 'node:buffer';
import VideoDispatcher from './VideoDispatcher';
import type MediaPlayer from '../player/MediaPlayer';
import type { DispatcherStreams } from './BaseDispatcher';
import VoiceCodec from '../util/VoiceCodec';
/*
Credit: https://github.com/dank074/Discord-video-stream
The use of video streaming in this library is an incomplete implementation with many bugs, primarily aimed at lazy users.
The video streaming features in this library are sourced from https://github.com/dank074/Discord-video-stream.

Please use the @dank074/discord-video-stream library to access all advanced and professional features,
along with comprehensive support. I will not actively fix bugs related to streaming and encourage everyone to
use https://github.com/dank074/Discord-video-stream for stable and smooth streaming.

To reiterate: This is an incomplete implementation of the library https://github.com/dank074/Discord-video-stream.

Thanks to dank074 and longnguyen2004 for implementing new codecs (H264, H265).
Thanks to mrjvs for discovering how Discord transmits data and the VP8 codec.

Please use the @dank074/discord-video-stream library for the best support.
*/

class VP8Dispatcher extends VideoDispatcher {
  constructor(
    player: MediaPlayer,
    highWaterMark: number | undefined,
    streams: DispatcherStreams,
    fps: number
  ) {
    super(
      player,
      highWaterMark,
      streams,
      fps,
      VoiceCodec.getPayloadType('VP8')
    );
  }

  makeChunk(buffer: Buffer, isFirstPacket: boolean): Buffer {
    // Vp8 payload descriptor
    const payloadDescriptorBuf = Buffer.alloc(2);
    payloadDescriptorBuf[0] = 0x80;
    payloadDescriptorBuf[1] = 0x80;
    if (isFirstPacket) {
      // Mark S bit, indicates start of frame.
      payloadDescriptorBuf[0] |= 1 << 4;
    }
    // Vp8 pictureid payload extension
    const pictureIdBuf = Buffer.alloc(2);
    pictureIdBuf.writeUintBE(this.count, 0, 2);
    pictureIdBuf[0] |= 0x80;
    return Buffer.concat([
      this.createPayloadExtension(),
      payloadDescriptorBuf,
      pictureIdBuf,
      buffer,
    ]);
  }

  _codecCallback(chunk: Buffer) {
    const chunkSplit = this.partitionMtu(chunk).map((chunkPart, index) =>
      this.makeChunk(chunkPart, index === 0)
    );
    for (let index = 0; index < chunkSplit.length; index++) {
      this._playChunk(chunkSplit[index], index + 1 === chunkSplit.length);
    }
  }
}

export { VP8Dispatcher };
export default {
  VP8Dispatcher,
};
