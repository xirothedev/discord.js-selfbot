import EventEmitter from "node:events";
import { Buffer } from "node:buffer";

class VolumeInterface extends EventEmitter {
  declare _volume: number;

  constructor({ volume = 1 }: { volume?: number } = {}) {
    super();
    this.setVolume(volume);
  }

  get volumeEditable() {
    return true;
  }

  get volume() {
    return this._volume;
  }

  get volumeDecibels() {
    return Math.log10(this.volume) * 20;
  }

  get volumeLogarithmic() {
    return this.volume ** (1 / 1.660964);
  }

  applyVolume(buffer: Buffer, volume?: number) {
    const targetVolume = volume || this._volume;
    if (targetVolume === 1) {
      return buffer;
    }

    const out = Buffer.alloc(buffer.length);
    for (let index = 0; index < buffer.length; index += 2) {
      if (index >= buffer.length - 1) {
        break;
      }
      const uint = Math.min(
        32_767,
        Math.max(-32_767, Math.floor(targetVolume * buffer.readInt16LE(index)))
      );
      out.writeInt16LE(uint, index);
    }

    return out;
  }

  setVolume(volume: number) {
    this.emit("volumeChange", this._volume, volume);
    this._volume = volume;
  }

  setVolumeDecibels(db: number) {
    this.setVolume(10 ** (db / 20));
  }

  setVolumeLogarithmic(value: number) {
    this.setVolume(value ** 1.660964);
  }
}

const props = [
  "volumeDecibels",
  "volumeLogarithmic",
  "setVolumeDecibels",
  "setVolumeLogarithmic",
];

function applyToClass(structure: { prototype: object }) {
  for (const prop of props) {
    const descriptor = Object.getOwnPropertyDescriptor(
      VolumeInterface.prototype,
      prop
    );
    if (!descriptor) {
      continue;
    }
    Object.defineProperty(structure.prototype, prop, descriptor);
  }
}

export { applyToClass };
export default { applyToClass };
