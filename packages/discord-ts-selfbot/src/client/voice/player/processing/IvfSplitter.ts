import { Buffer } from "node:buffer";
import { Transform } from "node:stream";
import type { TransformCallback, TransformOptions } from "node:stream";
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

class IvfTransformer extends Transform {
  declare headerSize: number;
  declare frameHeaderSize: number;
  declare header: {
    signature: string;
    version: number;
    headerLength: number;
    codec: string;
    width: number;
    height: number;
    timeDenominator: number;
    timeNumerator: number;
    frameCount: number;
  } | null;
  declare buf: Buffer | null;
  declare retFullFrame: boolean;

  constructor(options: TransformOptions & { fullframe?: boolean } = {}) {
    super(options);
    this.headerSize = 32;
    this.frameHeaderSize = 12;

    this.header = null;
    this.buf = null;
    this.retFullFrame = Boolean(options.fullframe);
  }

  _parseHeader(header: Buffer) {
    this.header = {
      codec: header.subarray(8, 12).toString(),
      frameCount: header.readUIntLE(24, 4),
      headerLength: header.readUIntLE(6, 2),
      height: header.readUIntLE(14, 2),
      signature: header.subarray(0, 4).toString(),
      timeDenominator: header.readUIntLE(16, 4),
      timeNumerator: header.readUIntLE(20, 4),
      version: header.readUIntLE(4, 2),
      width: header.readUIntLE(12, 2),
    };
  }

  _getFrameSize(buf: Buffer) {
    return buf.readUIntLE(0, 4);
  }

  _parseFrame(frame: Buffer) {
    const size = this._getFrameSize(frame);

    if (this.retFullFrame) {
      return this.push(frame.subarray(0, 12 + size));
    }

    const out = {
      data: frame.subarray(12, 12 + size),
      size,
      timestamp: frame.readBigUInt64LE(4),
    };

    return this.push(out.data);
  }

  _appendChunkToBuf(chunk: Buffer) {
    this.buf = this.buf ? Buffer.concat([this.buf, chunk]) : chunk;
  }

  _updateBufLen(size: number) {
    const { buf } = this;
    if (!buf) {
      return;
    }
    this.buf = buf.length > size ? buf.subarray(size, buf.length) : null;
  }

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    done: TransformCallback
  ) {
    this._appendChunkToBuf(chunk);

    if (!this.header) {
      const { buf } = this;
      if (!buf || buf.length < this.headerSize) {
        done();
        return;
      }
      this._parseHeader(buf.subarray(0, this.headerSize));
      this._updateBufLen(this.headerSize);
    }

    while (this.buf && this.buf.length >= this.frameHeaderSize) {
      const size = this._getFrameSize(this.buf) + this.frameHeaderSize;

      if (this.buf.length >= size) {
        this._parseFrame(this.buf.subarray(0, size));
        this._updateBufLen(size);
      } else {
        break;
      }
    }

    done();
  }
}

export { IvfTransformer };
export default {
  IvfTransformer,
};
