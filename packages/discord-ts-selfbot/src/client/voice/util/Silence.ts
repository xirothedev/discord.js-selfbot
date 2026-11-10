import { Buffer } from "node:buffer";
import { Readable } from "node:stream";

const SILENCE_FRAME = Buffer.from([0xf8, 0xff, 0xfe]);

class Silence extends Readable {
  declare static SILENCE_FRAME: Buffer;

  _read() {
    this.push(SILENCE_FRAME);
  }
}

Silence.SILENCE_FRAME = SILENCE_FRAME;

export default Silence;
export { Silence };
