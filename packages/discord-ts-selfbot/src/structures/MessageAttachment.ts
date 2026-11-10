import type { Stream } from "node:stream";
import { patchValue } from "./Base";
import AttachmentFlags from "../util/AttachmentFlags";
import Util from "../util/Util";
import type { Snowflake } from "discord-api-types/v10";
import type { BufferResolvable } from "../../typings";
import type { RawMessageAttachmentData } from "../../typings/rawDataTypes";

type MessageAttachmentPatch = Partial<RawMessageAttachmentData> & {
  flags?: number;
  title?: string;
};

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

  constructor(
    attachment: BufferResolvable | Stream,
    name: string | null = null,
    data?: MessageAttachmentPatch
  ) {
    this.attachment = attachment;
    this.name = name;
    if (data) {
      this._patch(data);
    }
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
    if (spoiler === this.spoiler) {
      return this;
    }

    if (!spoiler) {
      while (this.spoiler) {
        this.name = this.name?.slice("SPOILER_".length) ?? null;
      }
      return this;
    }
    this.name = `SPOILER_${this.name}`;
    return this;
  }

  _patch(data: MessageAttachmentPatch) {
    if (data.id !== undefined) {
      this.id = data.id;
    }

    this.size = patchValue(data.size, this.size);
    this.url = patchValue(data.url, this.url);
    this.proxyURL = patchValue(data.proxy_url, this.proxyURL);
    this.height = patchValue(data.height, this.height);
    this.width = patchValue(data.width, this.width);
    this.contentType = patchValue(data.content_type, this.contentType);
    this.description = patchValue(data.description, this.description);
    this.ephemeral = patchValue(data.ephemeral, this.ephemeral, false);
    this.duration = patchValue(data.duration_secs, this.duration);
    this.waveform = patchValue(data.waveform, this.waveform);
    this.flags =
      "flags" in data
        ? new AttachmentFlags(data.flags).freeze()
        : (this.flags ?? new AttachmentFlags().freeze());
    this.title = patchValue(data.title, this.title);
  }

  get spoiler() {
    return Util.basename(this.url ?? this.name).startsWith("SPOILER_");
  }

  toJSON() {
    return Util.flatten(this);
  }
}

export default MessageAttachment;
export { MessageAttachment };
