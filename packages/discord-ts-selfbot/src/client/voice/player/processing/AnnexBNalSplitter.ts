import { Buffer } from "node:buffer";
import { Transform } from "node:stream";
import type { TransformCallback } from "node:stream";
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

const H264NalUnitTypes = {
  AccessUnitDelimiter: 9,
  CodedSliceIdr: 5,
  CodedSliceNonIDR: 1,
  CodedSlicePartitionA: 2,
  CodedSlicePartitionB: 3,
  CodedSlicePartitionC: 4,
  EndOfSequence: 10,
  EndOfStream: 11,
  FillerData: 12,
  PPS: 8,
  PrefixNalUnit: 14,
  SEI: 6,
  SEIExtenstion: 13,
  SPS: 7,
  SubsetSPS: 15,
  Unspecified: 0,
};

const H265NalUnitTypes = {
  AUD_NUT: 35,
  BLA_N_LP: 18,
  BLA_W_LP: 16,
  BLA_W_RADL: 17,
  CRA_NUT: 21,
  EOB_NUT: 37,
  EOS_NUT: 36,
  FD_NUT: 38,
  IDR_N_LP: 20,
  IDR_W_RADL: 19,
  PPS_NUT: 34,
  PREFIX_SEI_NUT: 39,
  RADL_N: 6,
  RADL_R: 7,
  RASL_N: 8,
  RASL_R: 9,
  RSV_IRAP_VCL22: 22,
  RSV_IRAP_VCL23: 23,
  RSV_NVCL41: 41,
  RSV_NVCL42: 42,
  RSV_NVCL43: 43,
  RSV_NVCL44: 44,
  RSV_NVCL45: 45,
  RSV_NVCL46: 46,
  RSV_NVCL47: 47,
  RSV_VCL24: 24,
  RSV_VCL25: 25,
  RSV_VCL26: 26,
  RSV_VCL27: 27,
  RSV_VCL28: 28,
  RSV_VCL29: 29,
  RSV_VCL30: 30,
  RSV_VCL31: 31,
  RSV_VCL_N10: 10,
  RSV_VCL_N12: 12,
  RSV_VCL_N14: 14,
  RSV_VCL_R11: 11,
  RSV_VCL_R13: 13,
  RSV_VCL_R15: 15,
  SPS_NUT: 33,
  STSA_N: 4,
  STSA_R: 5,
  SUFFIX_SEI_NUT: 40,
  TRAIL_N: 0,
  TRAIL_R: 1,
  TSA_N: 2,
  TSA_R: 3,
  UNSPEC48: 48,
  UNSPEC49: 49,
  UNSPEC50: 50,
  UNSPEC51: 51,
  UNSPEC52: 52,
  UNSPEC53: 53,
  UNSPEC54: 54,
  UNSPEC55: 55,
  UNSPEC56: 56,
  UNSPEC57: 57,
  UNSPEC58: 58,
  UNSPEC59: 59,
  UNSPEC60: 60,
  UNSPEC61: 61,
  UNSPEC62: 62,
  UNSPEC63: 63,
  VPS_NUT: 32,
};

const H264Helpers = {
  getUnitType(frame: Buffer) {
    return frame[0] & 0x1f;
  },
  isAUD(unitType: number) {
    return unitType === H264NalUnitTypes.AccessUnitDelimiter;
  },
  splitHeader(frame: Buffer): [Buffer, Buffer] {
    return [frame.subarray(0, 1), frame.subarray(1)];
  },
};

const H265Helpers = {
  getUnitType(frame: Buffer) {
    return (frame[0] >> 1) & 0x3f;
  },
  isAUD(unitType: number) {
    return unitType === H265NalUnitTypes.AUD_NUT;
  },
  splitHeader(frame: Buffer): [Buffer, Buffer] {
    return [frame.subarray(0, 2), frame.subarray(2)];
  },
};

const emptyBuffer = Buffer.allocUnsafe(0);
const epbPrefix = Buffer.from([0x00, 0x00, 0x03]);
const nalSuffix = Buffer.from([0x00, 0x00, 0x01]);

interface NalFunctions {
  getUnitType: (frame: Buffer) => number;
  splitHeader: (frame: Buffer) => [Buffer, Buffer];
  isAUD: (unitType: number) => boolean;
}

class AnnexBNalSplitter extends Transform {
  declare _buffer: Buffer | null;
  declare _accessUnit: Buffer[];
  declare _nalFunctions: NalFunctions;
  removeEpbs(frame: Buffer, _unitType: number): Buffer {
    return frame;
  }

  constructor(nalFunctions: NalFunctions) {
    super();
    this._buffer = null;
    this._accessUnit = [];
    this._nalFunctions = nalFunctions;
  }

  rbsp(input: Buffer) {
    const newData = Buffer.allocUnsafe(input.length);
    let newLength = 0;
    let data = input;

    while (true) {
      const epbsPos = data.indexOf(epbPrefix);
      if (epbsPos === -1) {
        data.copy(newData, newLength);
        newLength += data.length;
        break;
      }
      const copyRange = data[epbsPos + 3] <= 0x03 ? epbsPos + 2 : epbsPos + 3;
      data.copy(newData, newLength, 0, copyRange);
      newLength += copyRange;
      data = data.subarray(epbsPos + 3);
    }

    return newData.subarray(0, newLength);
  }

  findNalStart(buf: Buffer) {
    const pos = buf.indexOf(nalSuffix);
    if (pos === -1) {
      return null;
    }
    return pos > 0 && buf[pos - 1] === 0
      ? { index: pos - 1, length: 4 }
      : { index: pos, length: 3 };
  }

  processFrame(frame: Buffer) {
    if (frame.length === 0) {
      return;
    }

    const unitType = this._nalFunctions.getUnitType(frame);
    if (this._nalFunctions.isAUD(unitType) && this._accessUnit.length > 0) {
      const sizeOfAccessUnit = this._accessUnit.reduce(
        (acc, nalu) => acc + nalu.length + 4,
        0
      );
      const accessUnitBuf = Buffer.allocUnsafe(sizeOfAccessUnit);

      let offset = 0;
      for (const nalu of this._accessUnit) {
        accessUnitBuf.writeUint32BE(nalu.length, offset);
        offset += 4;
        nalu.copy(accessUnitBuf, offset);
        offset += nalu.length;
      }

      this.push(accessUnitBuf);
      this._accessUnit = [];
    } else {
      this._accessUnit.push(this.removeEpbs(frame, unitType));
    }
  }

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    done: TransformCallback
  ) {
    let data = chunk;
    let nalStart = this.findNalStart(data);
    if (!this._buffer) {
      if (!nalStart) {
        done();
        return;
      }
      data = data.subarray(nalStart.index + nalStart.length);
      this._buffer = emptyBuffer;
    }

    data = Buffer.concat([this._buffer, data]);
    while ((nalStart = this.findNalStart(data))) {
      const frame = data.subarray(0, nalStart.index);
      this.processFrame(frame);
      data = data.subarray(nalStart.index + nalStart.length);
    }
    this._buffer = data;
    done();
  }
}

class H264NalSplitter extends AnnexBNalSplitter {
  constructor() {
    super(H264Helpers);
  }

  removeEpbs(frame: Buffer, unitType: number) {
    return unitType === H264NalUnitTypes.SPS ||
      unitType === H264NalUnitTypes.SEI
      ? this.rbsp(frame)
      : frame;
  }
}

class H265NalSplitter extends AnnexBNalSplitter {
  constructor() {
    super(H265Helpers);
  }

  removeEpbs(frame: Buffer) {
    // No specific processing for H265.
    return frame;
  }
}

export {
  H264NalUnitTypes,
  H265NalUnitTypes,
  H264Helpers,
  H265Helpers,
  H264NalSplitter,
  H265NalSplitter,
};
export default {
  H264Helpers,
  H264NalSplitter,
  H264NalUnitTypes,
  H265Helpers,
  H265NalSplitter,
  H265NalUnitTypes,
};
