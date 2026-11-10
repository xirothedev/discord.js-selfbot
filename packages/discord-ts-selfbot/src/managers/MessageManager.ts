import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _MessageModule from '../structures/Message';
const { Message } = _MessageModule;
import MessagePayload, { type MessagePayloadOptions } from '../structures/MessagePayload';
import Util from '../util/Util';
import type { Snowflake } from 'discord-api-types/v10';
import type {
  BaseFetchOptions,
  ChannelLogsQueryOptions,
  EmojiIdentifierResolvable,
  FetchPollAnswerVotersOptions,
  MessageSearchOptions,
  TextChannelResolvable,
  UserResolvable,
} from '../../typings';
import type { RawMessageData, RawUserData } from '../../typings/rawDataTypes';
import type { Message as SourceMessage } from '../structures/Message';
import type { User } from '../structures/User';
import type { UploadAttachment } from '../types/uploads';

type MessageResolvableSource = SourceMessage | Snowflake;

interface MessageManagerChannel {
  client: import('../client/Client').Client;
  id: Snowflake;
  guildId?: Snowflake | null;
  guild?: import('../structures/Guild').Guild | null;
}

interface MessageSearchDefaults {
  authors: UserResolvable[];
  content: string;
  mentions: UserResolvable[];
  has: NonNullable<MessageSearchOptions['has']>;
  maxId: Snowflake | null;
  minId: Snowflake | null;
  channels: TextChannelResolvable[];
  pinned: boolean;
  nsfw: boolean;
  offset: number;
  limit: number;
  sortBy: NonNullable<MessageSearchOptions['sortBy']>;
  sortOrder: NonNullable<MessageSearchOptions['sortOrder']>;
}

interface MessageSearchResultSource {
  messages: Collection<Snowflake, SourceMessage>;
  total: number;
}

interface MessageSearchResponse {
  messages: [RawMessageData][];
  total_results: number;
}

interface PollVotersResponse {
  users: RawUserData[];
}

interface RawPinnedMessagesResponse {
  items?: RawMessageData[];
}

class MessageManager extends CachedManager<import('../structures/Message').Message> {
  declare channel: MessageManagerChannel;
  constructor(channel: MessageManagerChannel, iterable?: Iterable<SourceMessage>) {
    super(channel.client, Message, iterable);

    this.channel = channel;
  }

  _add(data: unknown, cache = true): SourceMessage {
    return super._add(data, cache);
  }

  fetch(
    message: import('discord-api-types/v10').Snowflake,
    options?: import('../../typings').BaseFetchOptions,
  ): Promise<SourceMessage>;
  fetch(
    options?: import('../../typings').ChannelLogsQueryOptions,
    cache?: import('../../typings').BaseFetchOptions,
  ): Promise<Collection<Snowflake, SourceMessage>>;
  fetch(message?: Snowflake | ChannelLogsQueryOptions, { cache = true, force = false }: BaseFetchOptions = {}) {
    return typeof message === 'string' ? this._fetchId(message, cache, force) : this._fetchMany(message, cache);
  }

  async fetchPinned(cache = true) {
    const data = await this.client.api.channels[this.channel.id].messages.pins.get<RawPinnedMessagesResponse>({
      query: { limit: 50 },
    });
    const messages = new Collection<Snowflake, SourceMessage>();
    for (const message of data?.items || []) messages.set(message.id, this._add(message, cache));
    return messages;
  }

  async edit(
    message: MessageResolvableSource,
    options: string | MessagePayload | MessagePayloadOptions,
  ): Promise<SourceMessage> {
    const messageId = this.resolveId(message);
    if (!messageId) throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');

    const { data, files } = await (
      options instanceof MessagePayload
        ? options
        : MessagePayload.create(message instanceof Message ? message : this, options)
    )
      .resolveData()
      .resolveFiles();

    const fileList = files ?? [];

    // New API
    const attachments = await Util.getUploadURL(this.client, this.channel.id, fileList);
    const requestPromises = attachments.map(async (attachment: UploadAttachment) => {
      const file = fileList[Number(attachment.id)];
      if (!file) throw new TypeError('INVALID_TYPE', 'attachment', 'FileOptions');
      await Util.uploadFile(file.file, attachment.upload_url);
      return {
        id: attachment.id,
        filename: file.name,
        uploaded_filename: attachment.upload_filename,
        description: file.description,
        duration_secs: file.duration_secs,
        waveform: file.waveform,
      };
    });
    const attachmentsData = await Promise.all(requestPromises);
    attachmentsData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    if (data) Object.assign(data, { attachments: attachmentsData });
    // Empty Files

    const d = await this.client.api.channels[this.channel.id].messages[messageId].patch({ data });

    const existing = this.cache.get(messageId);
    if (existing) {
      const clone = existing._clone();
      clone._patch(d);
      return clone;
    }
    return this._add(d);
  }

  async crosspost(message: MessageResolvableSource) {
    const messageId = this.resolveId(message);
    if (!messageId) throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');

    const data = await this.client.api.channels(this.channel.id).messages(messageId).crosspost.post<RawMessageData>();
    return this.cache.get(data.id) ?? this._add(data);
  }

  async pin(message: MessageResolvableSource, reason?: string) {
    const messageId = this.resolveId(message);
    if (!messageId) throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');

    await this.client.api.channels(this.channel.id).messages.pins(messageId).put({ reason });
  }

  async unpin(message: MessageResolvableSource, reason?: string) {
    const messageId = this.resolveId(message);
    if (!messageId) throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');

    await this.client.api.channels(this.channel.id).messages.pins(messageId).delete({ reason });
  }

  async react(message: MessageResolvableSource, emoji: EmojiIdentifierResolvable, burst = false) {
    const messageId = this.resolveId(message);
    if (!messageId) throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');

    const resolvedEmoji = Util.resolvePartialEmoji(emoji);
    if (!resolvedEmoji) throw new TypeError('EMOJI_TYPE', 'emoji', 'EmojiIdentifierResolvable');

    const emojiName = resolvedEmoji.name ?? '';
    const emojiId = resolvedEmoji.id
      ? `${resolvedEmoji.animated ? 'a:' : ''}${emojiName}:${resolvedEmoji.id}`
      : encodeURIComponent(emojiName);

    // eslint-disable-next-line newline-per-chained-call
    await this.client.api
      .channels(this.channel.id)
      .messages(messageId)
      .reactions(emojiId, '@me')
      .put({
        query: {
          type: burst ? 1 : 0,
        },
      });
  }

  async delete(message: MessageResolvableSource) {
    const messageId = this.resolveId(message);
    if (!messageId) throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');

    await this.client.api.channels(this.channel.id).messages(messageId).delete();
  }

  _fetchId(messageId: Snowflake, cache: boolean, force: boolean): SourceMessage | Promise<SourceMessage> {
    if (!force) {
      const existing = this.cache.get(messageId);
      if (existing && !existing.partial) return existing;
    }

    // https://discord.com/api/v9/channels/:id/messages?limit=50&around=:msgid
    return new Promise<SourceMessage>((resolve, reject) => {
      this._fetchMany({ around: messageId, limit: 50 }, cache)
        .then(messages => {
          const message = messages.get(messageId);
          if (message) resolve(message);
          else reject(new Error('MESSAGE_ID_NOT_FOUND'));
        })
        .catch(reject);
    });
  }

  async search(options: MessageSearchOptions = {}): Promise<MessageSearchResultSource> {
    const defaults: MessageSearchDefaults = {
      authors: [],
      content: '',
      mentions: [],
      has: [],
      maxId: null,
      minId: null,
      channels: [],
      pinned: false,
      nsfw: false,
      offset: 0,
      limit: 25,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    };
    let { authors, content, mentions, has, maxId, minId, channels, pinned, nsfw, offset, limit, sortBy, sortOrder } =
      Object.assign(defaults, options);
    // Validate
    if (authors.length > 0) {
      authors = authors.map(u => this.client.users.resolveId(u)).filter((id): id is Snowflake => id !== null);
    }
    if (mentions.length > 0) {
      mentions = mentions.map(u => this.client.users.resolveId(u)).filter((id): id is Snowflake => id !== null);
    }
    if (channels.length > 0) {
      channels = channels
        .map(c => this.client.channels.resolveId(c))
        .filter((id): id is Snowflake => id !== null)
        .filter(id => {
          if (this.channel.guildId) {
            const c = this.channel.guild!.channels.cache.get(id);
            if (!c || !c.messages) return false;
            const clientUser = this.client.user;
            if (!clientUser) return false;
            const perm = c.permissionsFor(clientUser);
            if (!perm || !perm.has('READ_MESSAGE_HISTORY') || !perm.has('VIEW_CHANNEL')) return false;
            return true;
          } else {
            return true;
          }
        });
    }
    if (limit && limit > 25) throw new RangeError('MESSAGE_SEARCH_LIMIT');
    let stringQuery: string[] = [];
    const result = new Collection<Snowflake, SourceMessage>();
    let data: MessageSearchResponse;
    if (authors.length > 0) stringQuery.push(authors.map(id => `author_id=${id}`).join('&'));
    if (content && content.length) stringQuery.push(`content=${encodeURIComponent(content)}`);
    if (mentions.length > 0) stringQuery.push(mentions.map(id => `mentions=${id}`).join('&'));
    has = has.filter(v => ['link', 'embed', 'file', 'video', 'image', 'sound', 'sticker'].includes(v));
    if (has.length > 0) stringQuery.push(has.map(v => `has=${v}`).join('&'));
    if (maxId) stringQuery.push(`max_id=${maxId}`);
    if (minId) stringQuery.push(`min_id=${minId}`);
    if (nsfw) stringQuery.push('include_nsfw=true');
    if (offset !== 0) stringQuery.push(`offset=${offset}`);
    if (limit !== 25) stringQuery.push(`limit=${limit}`);
    if (['timestamp', 'relevance'].includes(sortBy)) {
      stringQuery.push(`sort_by=${sortBy}`);
    } else {
      stringQuery.push('sort_by=timestamp');
    }
    if (['asc', 'desc'].includes(sortOrder)) {
      stringQuery.push(`sort_order=${sortOrder}`);
    } else {
      stringQuery.push('sort_order=desc');
    }
    if (this.channel.guildId && channels.length > 0) {
      stringQuery.push(channels.map(id => `channel_id=${id}`).join('&'));
    }
    if (typeof pinned == 'boolean') stringQuery.push(`pinned=${pinned}`);
    // Main
    if (!stringQuery.length) {
      return {
        messages: result,
        total: 0,
      };
    }
    if (this.channel.guildId) {
      data = await this.client.api.guilds[this.channel.guildId].messages[`search?${stringQuery.join('&')}`].get();
    } else {
      stringQuery = stringQuery.filter(v => !v.startsWith('channel_id') && !v.startsWith('include_nsfw'));
      data = await this.client.api.channels[this.channel.id].messages[`search?${stringQuery.join('&')}`].get();
    }

    for await (const message of data.messages) result.set(message[0].id, new Message(this.client, message[0]));
    return {
      messages: result,
      total: data.total_results,
    };
  }

  async _fetchMany(
    options: ChannelLogsQueryOptions = {},
    cache: boolean,
  ): Promise<Collection<Snowflake, SourceMessage>> {
    const data: RawMessageData[] = await this.client.api.channels[this.channel.id].messages.get({ query: options });
    const messages = new Collection<Snowflake, SourceMessage>();
    for (const message of data) messages.set(message.id, this._add(message, cache));
    return messages;
  }

  async endPoll(messageId: Snowflake) {
    const message = await this.client.api.channels(this.channel.id).polls(messageId).expire.post();
    return this._add(message, false);
  }

  async fetchPollAnswerVoters({
    messageId,
    answerId,
    after,
    limit,
  }: FetchPollAnswerVotersOptions): Promise<Collection<Snowflake, User>> {
    const voters: PollVotersResponse = await this.client.api
      .channels(this.channel.id)
      .polls(messageId)
      .answers(answerId)
      .get({
        query: { limit, after },
      });

    return voters.users.reduce(
      (acc, user) => acc.set(user.id, this.client.users._add(user, false)),
      new Collection<Snowflake, User>(),
    );
  }
}

export default MessageManager;
export { MessageManager };
