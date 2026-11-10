import type { Stream } from 'node:stream';
import Util from '../util/Util';
import type { AttachmentData, BufferResolvable } from '../../typings';

/**
 * Represents an attachment builder.
 */
class AttachmentBuilder {
  declare attachment: BufferResolvable | Stream;
  declare name: string | null;
  declare description: string | null;
  declare title: string | null;
  declare waveform: string | null;
  declare duration: number | null;
  /**
   * @param {BufferResolvable|Stream} attachment The file
   * @param {AttachmentData} [data={}] Extra data
   */
  constructor(attachment: BufferResolvable | Stream, data: AttachmentData = {}) {
    /**
     * The file associated with this attachment.
     * @type {BufferResolvable|Stream}
     */
    this.attachment = attachment;

    /**
     * The name of this attachment.
     * @type {?string}
     */
    this.name = data.name ?? null;

    /**
     * The description of the attachment.
     * @type {?string}
     */
    this.description = data.description ?? null;

    /**
     * The title of the attachment.
     * @type {?string}
     */
    this.title = data.title ?? null;

    /**
     * The base64 encoded byte array representing a sampled waveform.
     * <info>This is only for voice message attachments.</info>
     * @type {?string}
     */
    this.waveform = data.waveform ?? null;

    /**
     * The duration of the attachment in seconds.
     * <info>This is only for voice message attachments.</info>
     * @type {?number}
     */
    this.duration = data.duration ?? null;
  }

  /**
   * Sets the description of this attachment.
   * @param {string} description The description of the file
   * @returns {AttachmentBuilder} This attachment
   */
  setDescription(description: string) {
    this.description = description;
    return this;
  }

  /**
   * Sets the file of this attachment.
   * @param {BufferResolvable|Stream} attachment The file
   * @returns {AttachmentBuilder} This attachment
   */
  setFile(attachment: BufferResolvable | Stream) {
    this.attachment = attachment;
    return this;
  }

  /**
   * Sets the name of this attachment.
   * @param {string} name The name of the file
   * @returns {AttachmentBuilder} This attachment
   */
  setName(name: string) {
    this.name = name;
    return this;
  }

  /**
   * Sets the title of this attachment.
   * @param {string} title The title of the file
   * @returns {AttachmentBuilder} This attachment
   */
  setTitle(title: string) {
    this.title = title;
    return this;
  }

  /**
   * Sets the waveform of this attachment.
   * <info>This is only for voice message attachments.</info>
   * @param {string} waveform The base64 encoded byte array representing a sampled waveform
   * @returns {AttachmentBuilder} This attachment
   */
  setWaveform(waveform: string) {
    this.waveform = waveform;
    return this;
  }

  /**
   * Sets the duration of this attachment.
   * <info>This is only for voice message attachments.</info>
   * @param {number} duration The duration of the attachment in seconds
   * @returns {AttachmentBuilder} This attachment
   */
  setDuration(duration: number) {
    this.duration = duration;
    return this;
  }

  /**
   * Sets whether this attachment is a spoiler.
   * @param {boolean} [spoiler=true] Whether the attachment should be marked as a spoiler
   * @returns {AttachmentBuilder} This attachment
   */
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

  /**
   * Whether or not this attachment has been marked as a spoiler.
   * @type {boolean}
   * @readonly
   */
  get spoiler() {
    return this.name ? Util.basename(this.name).startsWith('SPOILER_') : false;
  }

  toJSON() {
    return Util.flatten(this);
  }

  /**
   * Makes a new builder instance from a preexisting attachment structure.
   * @param {AttachmentBuilder|MessageAttachment|AttachmentPayload} other The builder to construct a new instance from
   * @returns {AttachmentBuilder}
   */
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

/**
 * @typedef {Object} AttachmentData
 * @property {string} [name] The name of the attachment
 * @property {string} [description] The description of the attachment
 * @property {string} [title] The title of the attachment
 * @property {string} [waveform] The base64 encoded bytearray representing a sampled waveform (for voice messages)
 * @property {number} [duration] The duration of the attachment in seconds (for voice messages)
 */
