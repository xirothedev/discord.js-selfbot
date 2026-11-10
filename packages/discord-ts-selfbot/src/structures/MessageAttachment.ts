import type { Stream } from 'node:stream';
import AttachmentFlags from '../util/AttachmentFlags';
import Util from '../util/Util';
import type { Snowflake } from 'discord-api-types/v10';
import type { BufferResolvable } from '../../typings';
import type { RawMessageAttachmentData } from '../../typings/rawDataTypes';

type MessageAttachmentPatch = Partial<RawMessageAttachmentData> & { flags?: number; title?: string };

class MessageAttachment {
  declare attachment: BufferResolvable | Stream;
  declare contentType: string | null;
  declare description: string | null;
  declare duration: number | null;
  declare ephemeral: boolean;
  declare flags: Readonly<AttachmentFlags>;
  declare height: number | null;
  declare id: Snowflake;
  declare name: string | null;
  declare proxyURL: string;
  declare size: number;
  declare title: string | null;
  declare url: string;
  declare waveform: string | null;
  declare width: number | null;

  constructor(attachment: BufferResolvable | Stream, name: string | null = null, data?: MessageAttachmentPatch) {
    this.attachment = attachment;
    this.name = name;
    if (data) this._patch(data);
  }

  setDescription(description: string) {
    this.description = description;
    return this;
  }

  setFile(attachment: BufferResolvable | Stream, name: string | null = null) {
    this.attachment = attachment;
    this.name = name;
    return this;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setSpoiler(spoiler = true) {
    if (spoiler === this.spoiler) return this;

    if (!spoiler) {
      while (this.spoiler) {
        this.name = this.name?.slice('SPOILER_'.length) ?? null;
      }
      return this;
    }
    this.name = `SPOILER_${this.name}`;
    return this;
  }

  _patch(data: MessageAttachmentPatch) {
    this.id = data.id!;

    if ('size' in data) {
      this.size = data.size!;
    }

    if ('url' in data) {
      this.url = data.url!;
    }

    if ('proxy_url' in data) {
      this.proxyURL = data.proxy_url!;
    }

    if ('height' in data) {
      this.height = data.height ?? null;
    } else {
      this.height ??= null;
    }

    if ('width' in data) {
      this.width = data.width ?? null;
    } else {
      this.width ??= null;
    }

    if ('content_type' in data) {
      this.contentType = data.content_type ?? null;
    } else {
      this.contentType ??= null;
    }

    if ('description' in data) {
      this.description = data.description ?? null;
    } else {
      this.description ??= null;
    }

    this.ephemeral = data.ephemeral ?? false;

    if ('duration_secs' in data) {
      this.duration = data.duration_secs ?? null;
    } else {
      this.duration ??= null;
    }

    if ('waveform' in data) {
      this.waveform = data.waveform ?? null;
    } else {
      this.waveform ??= null;
    }

    if ('flags' in data) {
      this.flags = new AttachmentFlags(data.flags).freeze();
    } else {
      this.flags ??= new AttachmentFlags().freeze();
    }

    if ('title' in data) {
      this.title = data.title ?? null;
    } else {
      this.title ??= null;
    }
  }

  get spoiler() {
    return Util.basename(this.url ?? this.name).startsWith('SPOILER_');
  }

  toJSON() {
    return Util.flatten(this);
  }
}

export default MessageAttachment;
export { MessageAttachment };
