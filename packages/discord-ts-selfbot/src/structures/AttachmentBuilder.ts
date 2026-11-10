import type { Stream } from 'node:stream';
import Util from '../util/Util';
import type { AttachmentData, BufferResolvable } from '../../typings';

class AttachmentBuilder {
  declare attachment: BufferResolvable | Stream;
  declare name: string | null;
  declare description: string | null;
  declare title: string | null;
  declare waveform: string | null;
  declare duration: number | null;
  constructor(attachment: BufferResolvable | Stream, data: AttachmentData = {}) {
    this.attachment = attachment;

    this.name = data.name ?? null;

    this.description = data.description ?? null;

    this.title = data.title ?? null;

    this.waveform = data.waveform ?? null;

    this.duration = data.duration ?? null;
  }

  setDescription(description: string) {
    this.description = description;
    return this;
  }

  setFile(attachment: BufferResolvable | Stream) {
    this.attachment = attachment;
    return this;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setTitle(title: string) {
    this.title = title;
    return this;
  }

  setWaveform(waveform: string) {
    this.waveform = waveform;
    return this;
  }

  setDuration(duration: number) {
    this.duration = duration;
    return this;
  }

  setSpoiler(spoiler = true) {
    if (spoiler === this.spoiler) return this;

    if (!spoiler) {
      while (this.spoiler) {
        this.name = this.name!.slice('SPOILER_'.length);
      }
      return this;
    }

    this.name = `SPOILER_${this.name}`;
    return this;
  }

  get spoiler() {
    return this.name ? Util.basename(this.name).startsWith('SPOILER_') : false;
  }

  toJSON() {
    return Util.flatten(this);
  }

  static from(
    other: AttachmentBuilder | import('../../typings').MessageAttachment | import('../../typings').AttachmentPayload,
  ) {
    return new AttachmentBuilder(other.attachment, {
      name: other.name ?? undefined,
      description: other.description ?? undefined,
    });
  }
}

export default AttachmentBuilder;
export { AttachmentBuilder };
