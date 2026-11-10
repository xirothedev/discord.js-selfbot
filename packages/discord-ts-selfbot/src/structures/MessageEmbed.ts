import process from "node:process";
import { EmbedType } from "discord-api-types/v10";
import type { APIEmbed } from "discord-api-types/v10";
import _errorsModule from "../errors";

const { RangeError } = _errorsModule;
import Util from "../util/Util";

const NESTED_ARRAY_FLAT_DEPTH = 2;
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
} from "../../typings";

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

interface MessageEmbedInput {
  type?: string;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  timestamp?: Date | number | string | null;
  color?: ColorResolvable | null;
  fields?: (EmbedFieldData | EmbedField)[];
  author?:
    | (Partial<MessageEmbedAuthor> & {
        icon_url?: string;
        proxy_icon_url?: string;
      })
    | null;
  thumbnail?: (Partial<MessageEmbedThumbnail> & { proxy_url?: string }) | null;
  image?: (Partial<MessageEmbedImage> & { proxy_url?: string }) | null;
  video?: (Partial<MessageEmbedVideo> & { proxy_url?: string }) | null;
  footer?:
    | (Partial<MessageEmbedFooter> & {
        icon_url?: string;
        proxy_icon_url?: string;
      })
    | null;
  provider?: Partial<MessageEmbedProvider> | null;
}

let deprecationEmittedForSetAuthor = false;
let deprecationEmittedForSetFooter = false;
let deprecationEmittedForAddField = false;

// The deprecated string forms of `setAuthor()` and `setFooter()` must stay for parity.

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

  constructor(
    data: MessageEmbed | MessageEmbedInput = {},
    skipValidation = false
  ) {
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
    this.type = data.type ?? "rich";

    this.title = data.title ?? null;

    this.description = data.description ?? null;

    this.url = data.url ?? null;

    this.color = "color" in data ? Util.resolveColor(data.color) : null;

    this.timestamp =
      data.timestamp !== null && data.timestamp !== undefined
        ? new Date(data.timestamp).getTime()
        : null;

    this.fields = [];
    if (data.fields) {
      this.fields = skipValidation
        ? data.fields.map((field) => ({
            ...field,
            inline: field.inline ?? false,
          }))
        : MessageEmbed.normalizeFields(data.fields);
    }

    this.setupMedia(data);
    this.setupAuthor(data);
  }

  private setupMedia(data: MessageEmbedInput) {
    this.thumbnail = data.thumbnail
      ? {
          height: data.thumbnail.height,
          proxyURL: data.thumbnail.proxyURL ?? data.thumbnail.proxy_url,
          url: data.thumbnail.url ?? "",
          width: data.thumbnail.width,
        }
      : null;

    this.image = data.image
      ? {
          height: data.image.height,
          proxyURL: data.image.proxyURL ?? data.image.proxy_url,
          url: data.image.url ?? "",
          width: data.image.width,
        }
      : null;

    this.video = data.video
      ? {
          height: data.video.height,
          proxyURL: data.video.proxyURL ?? data.video.proxy_url,
          url: data.video.url,
          width: data.video.width,
        }
      : null;
  }

  private setupAuthor(data: MessageEmbedInput) {
    this.author = data.author
      ? {
          iconURL: data.author.iconURL ?? data.author.icon_url,
          name: data.author.name ?? "",
          proxyIconURL: data.author.proxyIconURL ?? data.author.proxy_icon_url,
          url: data.author.url,
        }
      : null;

    this.provider = data.provider
      ? {
          name: data.provider.name ?? "",
          url: data.provider.url ?? "",
        }
      : null;

    this.footer = data.footer
      ? {
          iconURL: data.footer.iconURL ?? data.footer.icon_url,
          proxyIconURL: data.footer.proxyIconURL ?? data.footer.proxy_icon_url,
          text: data.footer.text ?? "",
        }
      : null;
  }

  get createdAt() {
    return this.timestamp ? new Date(this.timestamp) : null;
  }

  get hexColor() {
    return this.color ? `#${this.color.toString(16).padStart(6, "0")}` : null;
  }

  get length() {
    return (
      (this.title?.length ?? 0) +
      (this.description?.length ?? 0) +
      (this.fields.length >= 1
        ? this.fields.reduce(
            (prev, curr) => prev + curr.name.length + curr.value.length,
            0
          )
        : 0) +
      (this.footer?.text.length ?? 0) +
      (this.author?.name.length ?? 0)
    );
  }

  equals(embed: MessageEmbed | MessageEmbedInput) {
    const authorIconURL = embed.author
      ? (embed.author.iconURL ??
        ("icon_url" in embed.author ? embed.author.icon_url : undefined))
      : undefined;
    const footerIconURL = embed.footer
      ? (embed.footer.iconURL ??
        ("icon_url" in embed.footer ? embed.footer.icon_url : undefined))
      : undefined;
    return (
      this.equalsBasics(embed, authorIconURL) &&
      this.equalsMetadata(embed, footerIconURL) &&
      this.equalsMedia(embed)
    );
  }

  private equalsBasics(
    embed: MessageEmbed | MessageEmbedInput,
    authorIconURL: string | undefined
  ) {
    return (
      this.type === embed.type &&
      this.author?.name === embed.author?.name &&
      this.author?.url === embed.author?.url &&
      this.author?.iconURL === authorIconURL &&
      this.color === embed.color &&
      this.title === embed.title &&
      this.description === embed.description &&
      this.url === embed.url &&
      this.timestamp === embed.timestamp
    );
  }

  private equalsMetadata(
    embed: MessageEmbed | MessageEmbedInput,
    footerIconURL: string | undefined
  ) {
    return (
      this.fields.length === (embed.fields?.length ?? 0) &&
      this.fields.every((field, index) =>
        this._fieldEquals(field, embed.fields?.[index])
      ) &&
      this.footer?.text === embed.footer?.text &&
      this.footer?.iconURL === footerIconURL
    );
  }

  private equalsMedia(embed: MessageEmbed | MessageEmbedInput) {
    return (
      this.image?.url === embed.image?.url &&
      this.thumbnail?.url === embed.thumbnail?.url &&
      this.video?.url === embed.video?.url &&
      this.provider?.name === embed.provider?.name &&
      this.provider?.url === embed.provider?.url
    );
  }

  _fieldEquals(field: EmbedField, other?: EmbedFieldData) {
    return (
      field.name === other?.name &&
      field.value === other?.value &&
      field.inline === other?.inline
    );
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
        "MessageEmbed#addField is deprecated and will be removed in the next major update. Use MessageEmbed#addFields instead.",
        "DeprecationWarning"
      );

      deprecationEmittedForAddField = true;
    }
    return this.addFields({ inline, name, value });
  }

  addFields(...fields: EmbedFieldData[] | EmbedFieldData[][]) {
    this.fields.push(...MessageEmbed.normalizeFields(...fields));
    return this;
  }

  spliceFields(
    index: number,
    deleteCount: number,
    ...fields: EmbedFieldData[] | EmbedFieldData[][]
  ) {
    this.fields.splice(
      index,
      deleteCount,
      ...MessageEmbed.normalizeFields(...fields)
    );
    return this;
  }

  setFields(...fields: EmbedFieldData[] | EmbedFieldData[][]) {
    this.spliceFields(0, this.fields.length, ...fields);
    return this;
  }

  setAuthor(
    options: EmbedAuthorData | string | null,
    deprecatedIconURL?: string,
    deprecatedURL?: string
  ) {
    if (options === null) {
      this.author = null;
      return this;
    }

    let resolvedOptions: EmbedAuthorData;

    if (typeof options === "string") {
      if (!deprecationEmittedForSetAuthor) {
        process.emitWarning(
          "Passing strings for MessageEmbed#setAuthor is deprecated. Pass a sole object instead.",
          "DeprecationWarning"
        );

        deprecationEmittedForSetAuthor = true;
      }

      resolvedOptions = {
        iconURL: deprecatedIconURL,
        name: options,
        url: deprecatedURL,
      };
    } else {
      resolvedOptions = options;
    }

    const { name, url, iconURL } = resolvedOptions;
    this.author = {
      iconURL,
      name: Util.verifyString(name, RangeError, "EMBED_AUTHOR_NAME"),
      url,
    };
    return this;
  }

  setColor(color: ColorResolvable) {
    this.color = Util.resolveColor(color);
    return this;
  }

  setDescription(description: string) {
    this.description = Util.verifyString(
      description,
      RangeError,
      "EMBED_DESCRIPTION"
    );
    return this;
  }

  setFooter(
    options: EmbedFooterData | string | null,
    deprecatedIconURL?: string
  ) {
    if (options === null) {
      this.footer = null;
      return this;
    }

    let resolvedOptions: EmbedFooterData;

    if (typeof options === "string") {
      if (!deprecationEmittedForSetFooter) {
        process.emitWarning(
          "Passing strings for MessageEmbed#setFooter is deprecated. Pass a sole object instead.",
          "DeprecationWarning"
        );

        deprecationEmittedForSetFooter = true;
      }

      resolvedOptions = { iconURL: deprecatedIconURL, text: options };
    } else {
      resolvedOptions = options;
    }

    const { text, iconURL } = resolvedOptions;
    this.footer = {
      iconURL,
      text: Util.verifyString(text, RangeError, "EMBED_FOOTER_TEXT"),
    };
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
    this.timestamp =
      timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this;
  }

  setTitle(title: string) {
    this.title = Util.verifyString(title, RangeError, "EMBED_TITLE");
    return this;
  }

  setURL(url: string) {
    this.url = url;
    return this;
  }

  toJSON(): APIEmbed {
    return {
      author: this.author
        ? {
            icon_url: this.author.iconURL,
            name: this.author.name,
            url: this.author.url,
          }
        : undefined,
      color: this.color ?? undefined,
      description: this.description ?? undefined,
      fields: this.fields,
      footer: this.footer
        ? {
            icon_url: this.footer.iconURL,
            text: this.footer.text,
          }
        : undefined,
      image: this.image
        ? {
            height: this.image.height,
            proxy_url: this.image.proxyURL,
            url: this.image.url,
            width: this.image.width,
          }
        : undefined,
      provider: this.provider
        ? {
            name: this.provider.name,
            url: this.provider.url,
          }
        : undefined,
      thumbnail: this.thumbnail
        ? {
            height: this.thumbnail.height,
            proxy_url: this.thumbnail.proxyURL,
            url: this.thumbnail.url,
            width: this.thumbnail.width,
          }
        : undefined,
      timestamp: this.timestamp
        ? new Date(this.timestamp).toISOString()
        : undefined,
      title: this.title ?? undefined,
      type: isEmbedType(this.type) ? this.type : EmbedType.Rich,
      url: this.url ?? undefined,
      video: this.video
        ? {
            height: this.video.height,
            proxy_url: this.video.proxyURL,
            url: this.video.url,
            width: this.video.width,
          }
        : undefined,
    };
  }

  static normalizeField(
    name: string,
    value: string,
    inline = false
  ): EmbedField {
    return {
      inline,
      name: Util.verifyString(name, RangeError, "EMBED_FIELD_NAME", false),
      value: Util.verifyString(value, RangeError, "EMBED_FIELD_VALUE", false),
    };
  }

  static normalizeFields(
    ...fields: (EmbedFieldData | EmbedFieldData[])[]
  ): EmbedField[] {
    return fields
      .flat(NESTED_ARRAY_FLAT_DEPTH)
      .map((field) =>
        MessageEmbed.normalizeField(
          field.name,
          field.value,
          typeof field.inline === "boolean" ? field.inline : false
        )
      );
  }
}

export default MessageEmbed;
export { MessageEmbed };
