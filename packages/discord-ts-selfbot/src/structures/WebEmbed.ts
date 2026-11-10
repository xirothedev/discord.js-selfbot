import _errorsModule from '../errors';
const { RangeError } = _errorsModule;
import Util from '../util/Util';
import type {
  ColorResolvable,
  EmbedAuthorData,
  EmbedFieldData,
  MessageEmbedAuthor,
  MessageEmbedFooter,
  MessageEmbedImage,
  MessageEmbedProvider,
  MessageEmbedThumbnail,
  MessageEmbedVideo,
} from '../../typings';

type WebEmbedInput = {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  timestamp?: Date | number | string | null;
  color?: ColorResolvable | null;
  fields?: EmbedFieldData[];
  author?: (Partial<MessageEmbedAuthor> & { icon_url?: string; proxy_icon_url?: string }) | null;
  thumbnail?: (Partial<MessageEmbedThumbnail> & { proxy_url?: string }) | null;
  image?: (Partial<MessageEmbedImage> & { proxy_url?: string }) | null;
  video?: (Partial<MessageEmbedVideo> & { proxy_url?: string }) | null;
  footer?: (Partial<MessageEmbedFooter> & { icon_url?: string; proxy_icon_url?: string }) | null;
  provider?: Partial<MessageEmbedProvider> | null;
  imageType?: 'thumbnail' | 'image';
  redirect?: string;
};
const baseURL = 'https://webembed-sb.onrender.com/embed?';
const hiddenCharter =
  '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||';

class WebEmbed {
  declare author: MessageEmbedAuthor | null;
  declare baseURL?: string;
  declare color: number | null;
  declare description: string | null;
  declare image: MessageEmbedImage | null;
  declare thumbnail: MessageEmbedThumbnail | null;
  declare provider: MessageEmbedProvider | null;
  declare title: string | null;
  declare url: string | null;
  declare video: MessageEmbedVideo | null;
  declare imageType: 'thumbnail' | 'image';
  declare redirect?: string;

  declare static hiddenEmbed: string;
  constructor(data: WebEmbed | WebEmbedInput = {}) {
    // eslint-disable-next-line valid-jsdoc
    this._setup(data);
  }
  _setup(data: WebEmbedInput) {
    this.imageType = 'thumbnail';
    this.title = data.title ?? null;

    this.description = data.description ?? null;

    this.url = data.url ?? null;

    this.color = 'color' in data ? Util.resolveColor(data.color) : null;

    this.image = data.image
      ? {
          url: data.image.url ?? '',
          proxyURL: data.image.proxyURL ?? data.image.proxy_url,
          height: data.image.height,
          width: data.image.width,
        }
      : null;

    this.thumbnail = data.thumbnail
      ? {
          url: data.thumbnail.url ?? '',
          proxyURL: data.thumbnail.proxyURL ?? data.thumbnail.proxy_url,
          height: data.thumbnail.height,
          width: data.thumbnail.width,
        }
      : null;

    this.video = data.video
      ? {
          url: data.video.url ?? '',
          proxyURL: data.video.proxyURL ?? data.video.proxy_url,
          height: data.video.height,
          width: data.video.width,
        }
      : null;

    this.author = data.author
      ? {
          name: data.author.name ?? '',
          url: data.author.url,
        }
      : null;

    this.provider = data.provider
      ? {
          name: data.provider.name ?? '',
          url: data.provider.url ?? '',
        }
      : null;

    this.redirect = data.redirect;
  }

  setAuthor(options: EmbedAuthorData | null) {
    if (options === null) {
      this.author = null;
      return this;
    }
    const { name, url } = options;
    this.author = {
      name: Util.verifyString(name, RangeError, 'EMBED_AUTHOR_NAME'),
      url,
    };
    return this;
  }

  setProvider(options: Partial<MessageEmbedProvider> | null) {
    if (options === null) {
      this.provider = null;
      return this;
    }
    const { name, url } = options;
    this.provider = {
      name: Util.verifyString(name ?? '', RangeError, 'EMBED_PROVIDER_NAME'),
      url: url ?? '',
    };
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

  setImage(url: string) {
    if (this.thumbnail && this.thumbnail.url) {
      console.warn('You can only set image or thumbnail per embed.');
      this.thumbnail = null;
    }
    this.imageType = 'image';
    this.image = { url };
    return this;
  }

  setThumbnail(url: string) {
    if (this.image && this.image.url) {
      console.warn('You can only set image or thumbnail per embed.');
      this.image = null;
    }
    this.imageType = 'thumbnail';
    this.thumbnail = { url };
    return this;
  }

  setVideo(url: string) {
    this.video = { url };
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

  setRedirect(url: string) {
    this.redirect = url;
    return this;
  }

  toString() {
    const url = new URL(baseURL);
    url.searchParams.set('image_type', this.imageType);
    if (this.title) {
      url.searchParams.set('title', this.title);
    }
    if (this.description) {
      url.searchParams.set('description', this.description);
    }
    if (this.url) {
      url.searchParams.set('url', this.url);
    }
    if (this.color) {
      url.searchParams.set('color', `#${this.color.toString(16)}`);
    }
    if (this.image?.url) {
      url.searchParams.set('image', this.image.url);
    }
    if (this.video?.url) {
      url.searchParams.set('video', this.video.url);
    }
    if (this.author) {
      if (this.author.name) {
        url.searchParams.set('author_name', this.author.name);
      }
      if (this.author.url) {
        url.searchParams.set('author_url', this.author.url);
      }
    }
    if (this.provider) {
      if (this.provider.name) {
        url.searchParams.set('provider_name', this.provider.name);
      }
      if (this.provider.url) {
        url.searchParams.set('provider_url', this.provider.url);
      }
    }
    if (this.thumbnail?.url) {
      url.searchParams.set('image', this.thumbnail.url);
    }
    if (this.redirect) {
      url.searchParams.set('redirect', this.redirect);
    }
    return url.toString();
  }
}

WebEmbed.hiddenEmbed = hiddenCharter;

export default WebEmbed;
export { WebEmbed };
