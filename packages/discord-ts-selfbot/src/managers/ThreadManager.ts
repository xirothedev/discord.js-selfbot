import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import ThreadChannel from '../structures/ThreadChannel';
import { isThreadChannel } from '../types/channels';
import type { Snowflake } from 'discord-api-types/v10';
import type { RawChannelData, RawMessageData, RawThreadMemberData } from '../../typings/rawDataTypes';
import type {
  BaseFetchOptions,
  FetchArchivedThreadOptions,
  FetchThreadsOptions,
  ThreadChannelResolvable,
} from '../../typings';
import type { Client } from '../client/Client';
import type { Guild } from '../structures/Guild';
import type { GuildChannel } from '../structures/GuildChannel';

type ThreadChannelResolvableSource = ThreadChannel | Snowflake | ThreadChannelResolvable;

interface FetchChannelThreadsOptionsSource {
  archived?: boolean;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
}

interface FetchedThreadsSource {
  threads: Collection<Snowflake, ThreadChannel>;
  hasMore?: boolean;
}

interface RawThreadsResponse {
  threads: RawChannelData[];
  members: RawThreadMemberData[];
  first_messages?: RawMessageData[] | null;
  has_more?: boolean;
}

class ThreadManager extends CachedManager<ThreadChannel> {
  declare channel: GuildChannel;
  constructor(channel: GuildChannel, iterable?: Iterable<ThreadChannel>) {
    super(channel.client, ThreadChannel, iterable);

    this.channel = channel;
  }

  _add(thread: ThreadChannel): ThreadChannel {
    const existing = this.cache.get(thread.id);
    if (existing) return existing;
    this.cache.set(thread.id, thread);
    return thread;
  }

  fetch(
    options?: ThreadChannelResolvableSource | FetchThreadsOptions,
    { cache, force }: BaseFetchOptions = {},
  ): Promise<ThreadChannel | FetchedThreadsSource | null> {
    if (!options) return this.fetchActive(cache);
    const channel = this.client.channels.resolveId(options);
    if (channel) {
      return this.client.channels
        .fetch(channel, { cache, force })
        .then(fetched => (fetched && isThreadChannel(fetched) ? fetched : null));
    }
    if (
      typeof options === 'object' &&
      'archived' in options &&
      typeof options.archived === 'object' &&
      options.archived
    ) {
      return this.fetchArchived(options.archived, cache);
    }
    return this.fetchActive(cache);
  }

  fetchArchived(options: FetchArchivedThreadOptions = {}, cache = true): Promise<FetchedThreadsSource> {
    return this.fetchActive(cache, { archived: true, ...options });
  }

  async fetchActive(cache = true, options: FetchChannelThreadsOptionsSource = {}): Promise<FetchedThreadsSource> {
    const raw: RawThreadsResponse = await this.client.api.channels(this.channel.id).threads.search.get({
      query: {
        archived: options?.archived ?? false,
        limit: options?.limit ?? 25,
        offset: options?.offset ?? 0,
        sort_by: options?.sortBy ?? 'last_message_time',
        sort_order: options?.sortOrder ?? 'desc',
      },
    });

    return ThreadManager._mapThreads(raw, this.client, { parent: this.channel, cache });
  }

  static _mapThreads(
    rawThreads: RawThreadsResponse,
    client: Client,
    { parent, guild, cache }: { parent?: GuildChannel; guild?: Guild | null; cache?: boolean },
  ): FetchedThreadsSource {
    const threads = rawThreads.threads.reduce((coll, raw) => {
      const thread = client.channels._add(raw, guild ?? parent?.guild ?? null, { cache });
      if (!thread || !isThreadChannel(thread)) return coll;
      if (parent && thread.parentId !== parent.id) return coll;
      return coll.set(thread.id, thread);
    }, new Collection<Snowflake, ThreadChannel>());
    // Discord sends the thread id as id in this object
    for (const rawMember of rawThreads.members) {
      const channel = rawMember.id ? client.channels.cache.get(rawMember.id) : undefined;
      if (channel && isThreadChannel(channel)) channel.members._add(rawMember);
    }
    // Patch firstMessage
    // According to https://github.com/aiko-chan-ai/discord.js-selfbot-v13/issues/1502, rawThreads.first_messages could be null.
    for (const rawMessage of rawThreads.first_messages || []) {
      const channel = client.channels.cache.get(rawMessage.id);
      if (channel && isThreadChannel(channel)) channel.messages._add(rawMessage);
    }
    return {
      threads,
      hasMore: rawThreads.has_more ?? false,
    };
  }
}

export default ThreadManager;
export { ThreadManager };
