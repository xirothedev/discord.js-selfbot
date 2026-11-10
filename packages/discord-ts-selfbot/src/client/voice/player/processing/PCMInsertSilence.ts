import { Buffer } from "node:buffer";
import { Transform } from "node:stream";
import type { TransformCallback, TransformOptions } from "node:stream";

class PCMInsertSilence extends Transform {
  declare sampleRate: number;
  declare channels: number;
  declare bytesPerFrame: number;
  declare lastChunkTime: number;
  declare silenceThresholdMs: number;

  constructor(options: TransformOptions = {}) {
    super(options);
    // 48Khz, 2 channels, 16-bit (2 bytes per channel)
    this.sampleRate = 48_000;
    this.channels = 2;
    // 4 bytes per frame (2 channels * 2 bytes)
    this.bytesPerFrame = this.channels * 2;
    this.lastChunkTime = Date.now();
    this.silenceThresholdMs = 50;
  }

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    done: TransformCallback
  ) {
    const now = Date.now();
    const gap = now - this.lastChunkTime;

    if (gap >= this.silenceThresholdMs) {
      const missingFrames = Math.floor((gap / 1000) * this.sampleRate);
      const silenceBuffer = Buffer.alloc(missingFrames * this.bytesPerFrame, 0);
      this.push(silenceBuffer);
    }

    this.lastChunkTime = now;

    this.push(chunk);
    done();
  }
}

export { PCMInsertSilence };
export default {
  PCMInsertSilence,
};
