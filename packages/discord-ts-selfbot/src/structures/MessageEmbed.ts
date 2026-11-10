import process from 'node:process';
import { EmbedType } from 'discord-api-types/v10';
import type { APIEmbed } from 'discord-api-types/v10';
import _errorsModule from '../errors';
const { RangeError } = _errorsModule;
import Util from '../util/Util';
import type {
  ColorResolvable,
  EmbedAuthorData,
  EmbedField,
  EmbedFieldData,
  EmbedFooterData,
  MessageEmbedAuthor,
  MessageEmbedFooter,
  MessageEmbedImage,
  MessageEmbedProvider,
  MessageEmbedThumbnail,
  MessageEmbedVideo,
} from '../../typings';

function isEmbedType(value: string): value is EmbedType {
  return (
    value === EmbedType.Rich ||
    value === EmbedType.Image ||
    value === EmbedType.Video ||
    value === EmbedType.GIFV ||
    value === EmbedType.Article ||
    value === EmbedType.Link ||
    value === EmbedType.AutoModerationMessage ||
    value === EmbedType.PollResult ||
    value === EmbedType.Components
  );
}

type MessageEmbedInput = {
  type?: string;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  timestamp?: Date | number | string | null;
  color?: ColorResolvable | null;
  fields?: Array<EmbedFieldData | EmbedField>;
  author?: (Partial<MessageEmbedAuthor> & { icon_url?: string; proxy_icon_url?: string }) | null;
  thumbnail?: (Partial<MessageEmbedThumbnail> & { proxy_url?: string }) | null;
  image?: (Partial<MessageEmbedImage> & { proxy_url?: string }) | null;
  video?: (Partial<MessageEmbedVideo> & { proxy_url?: string }) | null;
  footer?: (Partial<MessageEmbedFooter> & { icon_url?: string; proxy_icon_url?: string }) | null;
  provider?: Partial<MessageEmbedProvider> | null;
};

let deprecationEmittedForSetAuthor = false;
let deprecationEmittedForSetFooter = false;
let deprecationEmittedForAddField = false;

// TODO: Remove the deprecated code for `setAuthor()` and `setFooter()`.

class MessageEmbed {
  declare type: string;
  declare title: string | null;
  declare description: string | null;
  declare url: string | null;
  declare color: number | null;
  declare timestamp: number | null;
  declare fields: EmbedField[];
  declare thumbnail: MessageEmbedThumbnail | null;
  declare image: MessageEmbedImage | null;
  declare video: MessageEmbedVideo | null;
  declare author: MessageEmbedAuthor | null;
  declare provider: MessageEmbedProvider | null;
  declare footer: MessageEmbedFooter | null;

  // eslint-disable-next-line valid-jsdoc
  constructor(data: MessageEmbed | MessageEmbedInput = {}, skipValidation = false) {
    this.setup(data, skipValidation);
  }

  setup(data: MessageEmbedInput, skipValidation: boolean) {
    /**
     * The type of this embed, either:
     * * `rich` - a generic embed rendered from embed attributes
     * * `image` - an image embed
     * * `video` - a video embed
     * * `gifv` - an animated gif image embed rendered as a video embed
     * * `article` - an article embed
     * * `link` - a link embed
     * @type {string}
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-types}
     * @deprecated
     */
    this.type = data.type ?? 'rich';

    this.title = data.title ?? null;

    this.description = data.description ?? null;

    this.url = data.url ?? null;

    this.color = 'color' in data ? Util.resolveColor(data.color) : null;

    this.timestamp = data.timestamp != null ? new Date(data.timestamp).getTime() : null;

    this.fields = [];
    if (data.fields) {
      this.fields = skipValidation
        ? data.fields.map(field => ({ ...field, inline: field.inline ?? false }))
        : MessageEmbed.normalizeFields(data.fields);
    }

    this.thumbnail = data.thumbnail
      ? {
          url: data.thumbnail.url ?? '',
          proxyURL: data.thumbnail.proxyURL ?? data.thumbnail.proxy_url,
          height: data.thumbnail.height,
          width: data.thumbnail.width,
        }
      : null;

    this.image = data.image
      ? {
          url: data.image.url ?? '',
          proxyURL: data.image.proxyURL ?? data.image.proxy_url,
          height: data.image.height,
          width: data.image.width,
        }
      : null;

    this.video = data.video
      ? {
          url: data.video.url,
          proxyURL: data.video.proxyURL ?? data.video.proxy_url,
          height: data.video.height,
          width: data.video.width,
        }
      : null;

    this.author = data.author
      ? {
          name: data.author.name ?? '',
          url: data.author.url,
          iconURL: data.author.iconURL ?? data.author.icon_url,
          proxyIconURL: data.author.proxyIconURL ?? data.author.proxy_icon_url,
        }
      : null;

    this.provider = data.provider
      ? {
          name: data.provider.name ?? '',
          url: data.provider.url ?? '',
        }
      : null;

    this.footer = data.footer
      ? {
          text: data.footer.text ?? '',
          iconURL: data.footer.iconURL ?? data.footer.icon_url,
          proxyIconURL: data.footer.proxyIconURL ?? data.footer.proxy_icon_url,
        }
      : null;
  }

  get createdAt() {
    return this.timestamp ? new Date(this.timestamp) : null;
  }

  get hexColor() {
    return this.color ? `#${this.color.toString(16).padStart(6, '0')}` : null;
  }

  get length() {
    return (
      (this.title?.length ?? 0) +
      (this.description?.length ?? 0) +
      (this.fields.length >= 1
        ? this.fields.reduce((prev, curr) => prev + curr.name.length + curr.value.length, 0)
        : 0) +
      (this.footer?.text.length ?? 0) +
      (this.author?.name.length ?? 0)
    );
  }

  equals(embed: MessageEmbed | MessageEmbedInput) {
    const authorIconURL = embed.author
      ? (embed.author.iconURL ?? ('icon_url' in embed.author ? embed.author.icon_url : undefined))
      : undefined;
    const footerIconURL = embed.footer
      ? (embed.footer.iconURL ?? ('icon_url' in embed.footer ? embed.footer.icon_url : undefined))
      : undefined;
    return (
      this.type === embed.type &&
      this.author?.name === embed.author?.name &&
      this.author?.url === embed.author?.url &&
      this.author?.iconURL === authorIconURL &&
      this.color === embed.color &&
      this.title === embed.title &&
      this.description === embed.description &&
      this.url === embed.url &&
      this.timestamp === embed.timestamp &&
      this.fields.length === (embed.fields?.length ?? 0) &&
      this.fields.every((field, i) => this._fieldEquals(field, embed.fields?.[i])) &&
      this.footer?.text === embed.footer?.text &&
      this.footer?.iconURL === footerIconURL &&
      this.image?.url === embed.image?.url &&
      this.thumbnail?.url === embed.thumbnail?.url &&
      this.video?.url === embed.video?.url &&
      this.provider?.name === embed.provider?.name &&
      this.provider?.url === embed.provider?.url
    );
  }

  _fieldEquals(field: EmbedField, other?: EmbedFieldData) {
    return field.name === other?.name && field.value === other?.value && field.inline === other?.inline;
  }

  /**
   * Adds a field to the embed (max 25).
   * @param {string} name The name of this field
   * @param {string} value The value of this field
   * @param {boolean} [inline=false] If this field will be displayed inline
   * @returns {MessageEmbed}
   * @deprecated This method is a wrapper for {@link MessageEmbed#addFields}. Use that instead.
   */
  addField(name: string, value: string, inline?: boolean) {
    if (!deprecationEmittedForAddField) {
      process.emitWarning(
        // eslint-disable-next-line max-len
        'MessageEmbed#addField is deprecated and will be removed in the next major update. Use MessageEmbed#addFields instead.',
        'DeprecationWarning',
      );

      deprecationEmittedForAddField = true;
    }
    return this.addFields({ name, value, inline });
  }

  addFields(...fields: EmbedFieldData[] | EmbedFieldData[][]) {
    this.fields.push(...MessageEmbed.normalizeFields(...fields));
    return this;
  }

  spliceFields(index: number, deleteCount: number, ...fields: EmbedFieldData[] | EmbedFieldData[][]) {
    this.fields.splice(index, deleteCount, ...MessageEmbed.normalizeFields(...fields));
    return this;
  }

  setFields(...fields: EmbedFieldData[] | EmbedFieldData[][]) {
    this.spliceFields(0, this.fields.length, ...fields);
    return this;
  }

  setAuthor(options: EmbedAuthorData | string | null, deprecatedIconURL?: string, deprecatedURL?: string) {
    if (options === null) {
      this.author = null;
      return this;
    }

    if (typeof options === 'string') {
      if (!deprecationEmittedForSetAuthor) {
        process.emitWarning(
          'Passing strings for MessageEmbed#setAuthor is deprecated. Pass a sole object instead.',
          'DeprecationWarning',
        );

        deprecationEmittedForSetAuthor = true;
      }

      options = { name: options, url: deprecatedURL, iconURL: deprecatedIconURL };
    }

    const { name, url, iconURL } = options;
    this.author = { name: Util.verifyString(name, RangeError, 'EMBED_AUTHOR_NAME'), url, iconURL };
    return this;
  }

  setColor(color: ColorResolvable) {
    this.color = Util.resolveColor(color);
    return this;
  }

  setDescription(description: string) {
    this.description = Util.verifyString(description, RangeError, 'EMBED_DESCRIPTION');
    return this;
  }

  setFooter(options: EmbedFooterData | string | null, deprecatedIconURL?: string) {
    if (options === null) {
      this.footer = null;
      return this;
    }

    if (typeof options === 'string') {
      if (!deprecationEmittedForSetFooter) {
        process.emitWarning(
          'Passing strings for MessageEmbed#setFooter is deprecated. Pass a sole object instead.',
          'DeprecationWarning',
        );

        deprecationEmittedForSetFooter = true;
      }

      options = { text: options, iconURL: deprecatedIconURL };
    }

    const { text, iconURL } = options;
    this.footer = { text: Util.verifyString(text, RangeError, 'EMBED_FOOTER_TEXT'), iconURL };
    return this;
  }

  setImage(url: string) {
    this.image = { url };
    return this;
  }

  setThumbnail(url: string) {
    this.thumbnail = { url };
    return this;
  }

  setTimestamp(timestamp: Date | number | null = Date.now()) {
    if (timestamp instanceof Date) timestamp = timestamp.getTime();
    this.timestamp = timestamp;
    return this;
  }

  setTitle(title: string) {
    this.title = Util.verifyString(title, RangeError, 'EMBED_TITLE');
    return this;
  }

  setURL(url: string) {
    this.url = url;
    return this;
  }

  toJSON(): APIEmbed {
    return {
      title: this.title ?? undefined,
      type: isEmbedType(this.type) ? this.type : EmbedType.Rich,
      description: this.description ?? undefined,
      url: this.url ?? undefined,
      timestamp: this.timestamp ? new Date(this.timestamp).toISOString() : undefined,
      color: this.color ?? undefined,
      fields: this.fields,
      thumbnail: this.thumbnail
        ? {
            url: this.thumbnail.url,
            proxy_url: this.thumbnail.proxyURL,
            height: this.thumbnail.height,
            width: this.thumbnail.width,
          }
        : undefined,
      image: this.image
        ? {
            url: this.image.url,
            proxy_url: this.image.proxyURL,
            height: this.image.height,
            width: this.image.width,
          }
        : undefined,
      author: this.author
        ? {
            name: this.author.name,
            url: this.author.url,
            icon_url: this.author.iconURL,
          }
        : undefined,
      video: this.video
        ? {
            url: this.video.url,
            proxy_url: this.video.proxyURL,
            height: this.video.height,
            width: this.video.width,
          }
        : undefined,
      provider: this.provider
        ? {
            name: this.provider.name,
            url: this.provider.url,
          }
        : undefined,
      footer: this.footer
        ? {
            text: this.footer.text,
            icon_url: this.footer.iconURL,
          }
        : undefined,
    };
  }

  static normalizeField(name: string, value: string, inline = false): EmbedField {
    return {
      name: Util.verifyString(name, RangeError, 'EMBED_FIELD_NAME', false),
      value: Util.verifyString(value, RangeError, 'EMBED_FIELD_VALUE', false),
      inline,
    };
  }

  static normalizeFields(...fields: Array<EmbedFieldData | EmbedFieldData[]>): EmbedField[] {
    return fields
      .flat(2)
      .map(field =>
        MessageEmbed.normalizeField(field.name, field.value, typeof field.inline === 'boolean' ? field.inline : false),
      );
  }
}

export default MessageEmbed;
export { MessageEmbed };
