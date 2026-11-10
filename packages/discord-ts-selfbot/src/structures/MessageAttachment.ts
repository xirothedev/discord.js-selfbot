import { Stream } from 'node:stream';
import AttachmentFlags from '../util/AttachmentFlags';
import Util from '../util/Util';
import type { Snowflake } from 'discord-api-types/v10';
import type { BufferResolvable } from '../../typings';
import type { RawMessageAttachmentData } from '../../typings/rawDataTypes';

type MessageAttachmentPatch = Partial<RawMessageAttachmentData> & { flags?: number; title?: string };

/**
 * Represents an attachment in a message.
 */
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

  /**
   * @param {BufferResolvable|Stream} attachment The file
   * @param {string} [name=null] The name of the file, if any
   * @param {APIAttachment} [data] Extra data
   */
  constructor(attachment: BufferResolvable | Stream, name: string | null = null, data?: MessageAttachmentPatch) {
    this.attachment = attachment;
    /**
     * The name of this attachment
     * @type {?string}
     */
    this.name = name;
    if (data) this._patch(data);
  }

  /**
   * Sets the description of this attachment.
   * @param {string} description The description of the file
   * @returns {MessageAttachment} This attachment
   */
  setDescription(description: string) {
    this.description = description;
    return this;
  }

  /**
   * Sets the file of this attachment.
   * @param {BufferResolvable|Stream} attachment The file
   * @param {string} [name=null] The name of the file
   * @returns {MessageAttachment} This attachment
   */
  setFile(attachment: BufferResolvable | Stream, name: string | null = null) {
    this.attachment = attachment;
    this.name = name;
    return this;
  }

  /**
   * Sets the name of this attachment.
   * @param {string} name The name of the file
   * @returns {MessageAttachment} This attachment
   */
  setName(name: string) {
    this.name = name;
    return this;
  }

  /**
   * Sets whether this attachment is a spoiler
   * @param {boolean} [spoiler=true] Whether the attachment should be marked as a spoiler
   * @returns {MessageAttachment} This attachment
   */
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
    /**
     * The attachment's id
     * @type {Snowflake}
     */
    this.id = data.id!;

    if ('size' in data) {
      /**
       * The size of this attachment in bytes
       * @type {number}
       */
      this.size = data.size!;
    }

    if ('url' in data) {
      /**
       * The URL to this attachment
       * @type {string}
       */
      this.url = data.url!;
    }

    if ('proxy_url' in data) {
      /**
       * The Proxy URL to this attachment
       * @type {string}
       */
      this.proxyURL = data.proxy_url!;
    }

    if ('height' in data) {
      /**
       * The height of this attachment (if an image or video)
       * @type {?number}
       */
      this.height = data.height ?? null;
    } else {
      this.height ??= null;
    }

    if ('width' in data) {
      /**
       * The width of this attachment (if an image or video)
       * @type {?number}
       */
      this.width = data.width ?? null;
    } else {
      this.width ??= null;
    }

    if ('content_type' in data) {
      /**
       * The media (MIME) type of this attachment
       * @type {?string}
       * @see {@link https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types}
       */
      this.contentType = data.content_type ?? null;
    } else {
      this.contentType ??= null;
    }

    if ('description' in data) {
      /**
       * The description (alt text) of this attachment
       * @type {?string}
       */
      this.description = data.description ?? null;
    } else {
      this.description ??= null;
    }

    /**
     * Whether this attachment is ephemeral
     * @type {boolean}
     */
    this.ephemeral = data.ephemeral ?? false;

    if ('duration_secs' in data) {
      /**
       * The duration of this attachment in seconds
       * <info>This will only be available if the attachment is an audio file.</info>
       * @type {?number}
       */
      this.duration = data.duration_secs ?? null;
    } else {
      this.duration ??= null;
    }

    if ('waveform' in data) {
      /**
       * The base64 encoded byte array representing a sampled waveform
       * <info>This will only be available if the attachment is an audio file.</info>
       * @type {?string}
       */
      this.waveform = data.waveform ?? null;
    } else {
      this.waveform ??= null;
    }

    if ('flags' in data) {
      /**
       * The flags of this attachment
       * @type {Readonly<AttachmentFlags>}
       */
      this.flags = new AttachmentFlags(data.flags).freeze();
    } else {
      this.flags ??= new AttachmentFlags().freeze();
    }

    if ('title' in data) {
      /**
       * The title of this attachment
       * <info>This will only be available if the attachment name contains special characters.</info>
       * @type {?string}
       */
      this.title = data.title ?? null;
    } else {
      this.title ??= null;
    }
  }

  /**
   * Whether or not this attachment has been marked as a spoiler
   * @type {boolean}
   * @readonly
   */
  get spoiler() {
    return Util.basename(this.url ?? this.name).startsWith('SPOILER_');
  }

  toJSON() {
    return Util.flatten(this);
  }
}

export default MessageAttachment;
export { MessageAttachment };

/**
 * @external APIAttachment
 * @see {@link https://discord.com/developers/docs/resources/channel#attachment-object}
 */
