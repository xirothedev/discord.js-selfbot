import process from 'node:process';
import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import ThreadMember from '../structures/ThreadMember';
import type { Snowflake } from 'discord-api-types/v10';
import type { RawThreadMemberData } from '../../typings/rawDataTypes';
import type {
  BaseFetchOptions,
  FetchThreadMemberOptions,
  FetchThreadMembersOptions,
  UserResolvable,
} from '../../typings';
import type { ThreadChannel } from '../structures/ThreadChannel';
import type { GuildMember } from '../structures/GuildMember';
import type { Message } from '../structures/Message';
import type { User } from '../structures/User';

type ThreadMemberResolvableSource =
  | ThreadMember
  | User
  | GuildMember
  | Message
  | Snowflake
  | UserResolvable;

function isFetchOptions(
  value: unknown
): value is FetchManyThreadMembersOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('cache' in value ||
      'withMember' in value ||
      'limit' in value ||
      'after' in value)
  );
}

interface FetchManyThreadMembersOptions {
  cache?: boolean;
  limit?: number;
  after?: Snowflake;
  withMember?: boolean;
}

let deprecationEmittedForPassingBoolean = false;

class ThreadMemberManager extends CachedManager<ThreadMember> {
  declare thread: ThreadChannel;
  constructor(thread: ThreadChannel, iterable?: Iterable<ThreadMember>) {
    super(thread.client, ThreadMember, iterable);

    this.thread = thread;
  }

  _add(data: RawThreadMemberData, cache = true): ThreadMember {
    const userId = data.user_id;
    if (!userId) {
      throw new TypeError('INVALID_TYPE', 'data', 'ThreadMemberData');
    }
    const existing = this.cache.get(userId);
    if (cache) {
      existing?._patch(data, { cache });
    }
    if (existing) {
      return existing;
    }

    const member = new ThreadMember(this.thread, data, { cache });
    if (cache) {
      this.cache.set(userId, member);
    }
    return member;
  }

  fetchMe(options?: BaseFetchOptions): Promise<ThreadMember> {
    const userId = this.client.user?.id;
    if (!userId) {
      throw new TypeError('INVALID_TYPE', 'user', 'UserResolvable');
    }
    return this.fetch(userId, options);
  }

  get me(): ThreadMember | null {
    const userId = this.client.user?.id;
    return userId ? (this.cache.get(userId) ?? null) : null;
  }

  resolve(member: ThreadMemberResolvableSource): ThreadMember | null {
    const memberResolvable = super.resolve(member);
    if (memberResolvable) {
      return memberResolvable;
    }
    const userId = this.client.users.resolveId(member);
    if (userId) {
      return this.cache.get(userId) ?? null;
    }
    return null;
  }

  resolveId(member: ThreadMemberResolvableSource): string | null {
    const memberResolvable = super.resolveId(member);
    if (memberResolvable) {
      return memberResolvable;
    }
    const userResolvable = this.client.users.resolveId(member);
    if (!userResolvable) {
      return null;
    }
    return this.cache.has(userResolvable) ? userResolvable : null;
  }

  async add(
    member: UserResolvable | '@me',
    reason?: string
  ): Promise<Snowflake> {
    const id = member === '@me' ? member : this.client.users.resolveId(member);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'member', 'UserResolvable');
    }
    await this.client.api
      .channels(this.thread.id, 'thread-members', id)
      .put({ reason });
    return id;
  }

  async remove(
    id: Snowflake | '@me',
    reason?: string
  ): Promise<Snowflake | '@me'> {
    await this.client.api
      .channels(this.thread.id, 'thread-members', id)
      .delete({ reason });
    return id;
  }

  async _fetchOne(
    memberId: Snowflake,
    { cache, force = false, withMember }: FetchThreadMemberOptions
  ): Promise<ThreadMember> {
    if (!force) {
      const existing = this.cache.get(memberId);
      if (existing) {
        return existing;
      }
    }

    const data: RawThreadMemberData = await this.client.api
      .channels(this.thread.id, 'thread-members', memberId)
      .get({
        query: { with_member: withMember },
      });
    return this._add(data, cache);
  }

  async _fetchMany({
    cache,
    limit,
    after,
    withMember,
  }: FetchManyThreadMembersOptions = {}): Promise<
    Collection<Snowflake, ThreadMember>
  > {
    const raw: RawThreadMemberData[] = await this.client.api
      .channels(this.thread.id, 'thread-members')
      .get({
        query: { after, limit, with_member: withMember },
      });
    const members = new Collection<Snowflake, ThreadMember>();
    for (const member of raw) {
      if (member.user_id) {
        members.set(member.user_id, this._add(member, cache));
      }
    }
    return members;
  }
  fetch(
    member: UserResolvable,
    options?: FetchThreadMemberOptions
  ): Promise<ThreadMember>;
  fetch(
    options?: FetchThreadMembersOptions
  ): Promise<Collection<Snowflake, ThreadMember>>;
  fetch(
    member?:
      | ThreadMemberResolvableSource
      | FetchManyThreadMembersOptions
      | boolean,
    options?: FetchThreadMemberOptions | FetchManyThreadMembersOptions
  ): Promise<ThreadMember | Collection<Snowflake, ThreadMember>> {
    const resolvedOptions = options ?? { cache: true, force: false };
    if (typeof member === 'boolean' && !deprecationEmittedForPassingBoolean) {
      process.emitWarning(
        'Passing boolean to member option is deprecated, use cache property instead.',
        'DeprecationWarning'
      );
      deprecationEmittedForPassingBoolean = true;
    }
    const isOptions = isFetchOptions(member);
    const id =
      !isOptions && typeof member !== 'boolean' && member !== undefined
        ? this.resolveId(member)
        : null;
    if (id) {
      return this._fetchOne(id, resolvedOptions);
    }
    let fetchOptions: FetchManyThreadMembersOptions;
    if (isOptions) {
      fetchOptions = member;
    } else if (typeof member === 'boolean') {
      fetchOptions = { ...resolvedOptions, cache: member };
    } else {
      fetchOptions = resolvedOptions;
    }
    return this._fetchMany(fetchOptions);
  }
}

export default ThreadMemberManager;
export { ThreadMemberManager };
