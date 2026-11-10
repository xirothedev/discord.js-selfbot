import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import _MessageModule from '../structures/Message';

const { Message } = _MessageModule;
import MessagePayload from '../structures/MessagePayload';
import type { MessagePayloadOptions } from '../structures/MessagePayload';
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
import type { Client } from '../client/Client';
import type { Guild } from '../structures/Guild';

type MessageResolvableSource = SourceMessage | Snowflake;

interface MessageManagerChannel {
  client: Client;
  id: Snowflake;
  guildId?: Snowflake | null;
  guild?: Guild | null;
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

function buildSearchQuery(search: MessageSearchDefaults): string[] {
  const stringQuery: string[] = [];
  if (search.authors.length > 0) {
    stringQuery.push(search.authors.map((id) => `author_id=${id}`).join('&'));
  }
  if (search.content && search.content.length) {
    stringQuery.push(`content=${encodeURIComponent(search.content)}`);
  }
  if (search.mentions.length > 0) {
    stringQuery.push(search.mentions.map((id) => `mentions=${id}`).join('&'));
  }
  const has = search.has.filter((option) =>
    ['link', 'embed', 'file', 'video', 'image', 'sound', 'sticker'].includes(
      option
    )
  );
  if (has.length > 0) {
    stringQuery.push(has.map((option) => `has=${option}`).join('&'));
  }
  if (search.maxId) {
    stringQuery.push(`max_id=${search.maxId}`);
  }
  if (search.minId) {
    stringQuery.push(`min_id=${search.minId}`);
  }
  if (search.nsfw) {
    stringQuery.push('include_nsfw=true');
  }
  if (search.offset !== 0) {
    stringQuery.push(`offset=${search.offset}`);
  }
  if (search.limit !== 25) {
    stringQuery.push(`limit=${search.limit}`);
  }
  if (['timestamp', 'relevance'].includes(search.sortBy)) {
    stringQuery.push(`sort_by=${search.sortBy}`);
  } else {
    stringQuery.push('sort_by=timestamp');
  }
  if (['asc', 'desc'].includes(search.sortOrder)) {
    stringQuery.push(`sort_order=${search.sortOrder}`);
  } else {
    stringQuery.push('sort_order=desc');
  }
  if (search.channels.length > 0) {
    stringQuery.push(search.channels.map((id) => `channel_id=${id}`).join('&'));
  }
  if (typeof search.pinned === 'boolean') {
    stringQuery.push(`pinned=${search.pinned}`);
  }
  return stringQuery;
}

class MessageManager extends CachedManager<SourceMessage> {
  declare channel: MessageManagerChannel;
  constructor(
    channel: MessageManagerChannel,
    iterable?: Iterable<SourceMessage>
  ) {
    super(channel.client, Message, iterable);

    this.channel = channel;
  }

  _add(data: unknown, cache = true): SourceMessage {
    return super._add(data, cache);
  }

  fetch(message: Snowflake, options?: BaseFetchOptions): Promise<SourceMessage>;
  fetch(
    options?: ChannelLogsQueryOptions,
    cache?: BaseFetchOptions
  ): Promise<Collection<Snowflake, SourceMessage>>;
  fetch(
    message?: Snowflake | ChannelLogsQueryOptions,
    { cache = true, force = false }: BaseFetchOptions = {}
  ) {
    return typeof message === 'string'
      ? this._fetchId(message, cache, force)
      : this._fetchMany(message, cache);
  }

  async fetchPinned(cache = true) {
    const data = await this.client.api.channels[
      this.channel.id
    ].messages.pins.get<RawPinnedMessagesResponse>({
      query: { limit: 50 },
    });
    const messages = new Collection<Snowflake, SourceMessage>();
    for (const message of data?.items || []) {
      messages.set(message.id, this._add(message, cache));
    }
    return messages;
  }

  async edit(
    message: MessageResolvableSource,
    options: string | MessagePayload | MessagePayloadOptions
  ): Promise<SourceMessage> {
    const messageId = this.resolveId(message);
    if (!messageId) {
      throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');
    }

    const { data, files } = await (
      options instanceof MessagePayload
        ? options
        : MessagePayload.create(
            message instanceof Message ? message : this,
            options
          )
    )
      .resolveData()
      .resolveFiles();

    const fileList = files ?? [];

    // New API
    const attachments = await Util.getUploadURL(
      this.client,
      this.channel.id,
      fileList
    );
    const requestPromises = attachments.map(
      async (attachment: UploadAttachment) => {
        const file = fileList[Number(attachment.id)];
        if (!file) {
          throw new TypeError('INVALID_TYPE', 'attachment', 'FileOptions');
        }
        await Util.uploadFile(file.file, attachment.upload_url);
        return {
          description: file.description,
          duration_secs: file.duration_secs,
          filename: file.name,
          id: attachment.id,
          uploaded_filename: attachment.upload_filename,
          waveform: file.waveform,
        };
      }
    );
    const attachmentsData = await Promise.all(requestPromises);
    attachmentsData.sort(
      (left, right) =>
        Math.trunc(Number(left.id)) - Math.trunc(Number(right.id))
    );
    if (data) {
      Object.assign(data, { attachments: attachmentsData });
    }
    // Empty Files

    const d = await this.client.api.channels[this.channel.id].messages[
      messageId
    ].patch({ data });

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
    if (!messageId) {
      throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');
    }

    const data = await this.client.api
      .channels(this.channel.id)
      .messages(messageId)
      .crosspost.post<RawMessageData>();
    return this.cache.get(data.id) ?? this._add(data);
  }

  async pin(message: MessageResolvableSource, reason?: string) {
    const messageId = this.resolveId(message);
    if (!messageId) {
      throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');
    }

    await this.client.api
      .channels(this.channel.id)
      .messages.pins(messageId)
      .put({ reason });
  }

  async unpin(message: MessageResolvableSource, reason?: string) {
    const messageId = this.resolveId(message);
    if (!messageId) {
      throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');
    }

    await this.client.api
      .channels(this.channel.id)
      .messages.pins(messageId)
      .delete({ reason });
  }

  async react(
    message: MessageResolvableSource,
    emoji: EmojiIdentifierResolvable,
    burst = false
  ) {
    const messageId = this.resolveId(message);
    if (!messageId) {
      throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');
    }

    const resolvedEmoji = Util.resolvePartialEmoji(emoji);
    if (!resolvedEmoji) {
      throw new TypeError('EMOJI_TYPE', 'emoji', 'EmojiIdentifierResolvable');
    }

    const emojiName = resolvedEmoji.name ?? '';
    const emojiId = resolvedEmoji.id
      ? `${resolvedEmoji.animated ? 'a:' : ''}${emojiName}:${resolvedEmoji.id}`
      : encodeURIComponent(emojiName);

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
    if (!messageId) {
      throw new TypeError('INVALID_TYPE', 'message', 'MessageResolvable');
    }

    await this.client.api
      .channels(this.channel.id)
      .messages(messageId)
      .delete();
  }

  async _fetchId(
    messageId: Snowflake,
    cache: boolean,
    force: boolean
  ): Promise<SourceMessage> {
    if (!force) {
      const existing = this.cache.get(messageId);
      if (existing && !existing.partial) {
        return existing;
      }
    }

    // https://discord.com/api/v9/channels/:id/messages?limit=50&around=:msgid
    const messages = await this._fetchMany(
      { around: messageId, limit: 50 },
      cache
    );
    const message = messages.get(messageId);
    if (!message) {
      throw new Error('MESSAGE_ID_NOT_FOUND');
    }
    return message;
  }

  async search(
    options: MessageSearchOptions = {}
  ): Promise<MessageSearchResultSource> {
    const defaults: MessageSearchDefaults = {
      authors: [],
      channels: [],
      content: '',
      has: [],
      limit: 25,
      maxId: null,
      mentions: [],
      minId: null,
      nsfw: false,
      offset: 0,
      pinned: false,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    };
    const merged = Object.assign(defaults, options);
    let { authors, mentions, channels } = merged;
    const {
      content,
      has,
      maxId,
      minId,
      pinned,
      nsfw,
      offset,
      limit,
      sortBy,
      sortOrder,
    } = merged;
    // Validate
    if (authors.length > 0) {
      authors = authors
        .map((user) => this.client.users.resolveId(user))
        .filter((id): id is Snowflake => id !== null);
    }
    if (mentions.length > 0) {
      mentions = mentions
        .map((user) => this.client.users.resolveId(user))
        .filter((id): id is Snowflake => id !== null);
    }
    if (channels.length > 0) {
      channels = channels
        .map((channel) => this.client.channels.resolveId(channel))
        .filter((id): id is Snowflake => id !== null)
        .filter((id) => this.isSearchableChannel(id));
    }
    if (limit && limit > 25) {
      throw new RangeError('MESSAGE_SEARCH_LIMIT');
    }
    const result = new Collection<Snowflake, SourceMessage>();
    let data: MessageSearchResponse;
    let stringQuery = buildSearchQuery({
      authors,
      channels,
      content,
      has,
      limit,
      maxId,
      mentions,
      minId,
      nsfw,
      offset,
      pinned,
      sortBy,
      sortOrder,
    });
    // Main
    if (!stringQuery.length) {
      return {
        messages: result,
        total: 0,
      };
    }
    if (this.channel.guildId) {
      data =
        await this.client.api.guilds[this.channel.guildId].messages[
          `search?${stringQuery.join('&')}`
        ].get();
    } else {
      stringQuery = stringQuery.filter(
        (queryPart) =>
          !queryPart.startsWith('channel_id') &&
          !queryPart.startsWith('include_nsfw')
      );
      data =
        await this.client.api.channels[this.channel.id].messages[
          `search?${stringQuery.join('&')}`
        ].get();
    }

    for await (const message of data.messages) {
      result.set(message[0].id, new Message(this.client, message[0]));
    }
    return {
      messages: result,
      total: data.total_results,
    };
  }

  private isSearchableChannel(id: Snowflake): boolean {
    if (!this.channel.guildId) {
      return true;
    }
    const { guild } = this.channel;
    if (!guild) {
      return false;
    }
    const channel = guild.channels.cache.get(id);
    if (!channel || !channel.messages) {
      return false;
    }
    const clientUser = this.client.user;
    if (!clientUser) {
      return false;
    }
    const perm = channel.permissionsFor(clientUser);
    if (
      !perm ||
      !perm.has('READ_MESSAGE_HISTORY') ||
      !perm.has('VIEW_CHANNEL')
    ) {
      return false;
    }
    return true;
  }

  async _fetchMany(
    options: ChannelLogsQueryOptions = {},
    cache = true
  ): Promise<Collection<Snowflake, SourceMessage>> {
    const data: RawMessageData[] = await this.client.api.channels[
      this.channel.id
    ].messages.get({ query: options });
    const messages = new Collection<Snowflake, SourceMessage>();
    for (const message of data) {
      messages.set(message.id, this._add(message, cache));
    }
    return messages;
  }

  async endPoll(messageId: Snowflake) {
    const message = await this.client.api
      .channels(this.channel.id)
      .polls(messageId)
      .expire.post();
    return this._add(message, false);
  }

  async fetchPollAnswerVoters({
    messageId,
    answerId,
    after,
    limit,
  }: FetchPollAnswerVotersOptions): Promise<Collection<Snowflake, User>> {
    const votersResponse: PollVotersResponse = await this.client.api
      .channels(this.channel.id)
      .polls(messageId)
      .answers(answerId)
      .get({
        query: { after, limit },
      });

    const voters = new Collection<Snowflake, User>();
    for (const user of votersResponse.users) {
      voters.set(user.id, this.client.users._add(user, false));
    }
    return voters;
  }
}

export default MessageManager;
export { MessageManager };
