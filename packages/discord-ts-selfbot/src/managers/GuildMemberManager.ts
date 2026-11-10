import { Buffer } from 'node:buffer';
import { setTimeout } from 'node:timers';
import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';
const { Error, TypeError, RangeError } = _errorsModule;
import BaseGuildVoiceChannel from '../structures/BaseGuildVoiceChannel';
import _GuildMemberModule from '../structures/GuildMember';
const { GuildMember } = _GuildMemberModule;
import _ConstantsModule from '../util/Constants';
const { Events, Opcodes } = _ConstantsModule;
const { PartialTypes } = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import GuildMemberFlags from '../util/GuildMemberFlags';
import SnowflakeUtil from '../util/SnowflakeUtil';
import type {
  APIGuildMember,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildPruneCountResult,
  RESTPatchAPIGuildMemberResult,
  RESTPostAPIGuildPruneResult,
  Snowflake,
} from 'discord-api-types/v10';
import type { RawGuildMemberData } from '../../typings/rawDataTypes';
import type {
  AddGuildMemberOptions,
  BanOptions,
  BaseFetchOptions,
  BulkBanOptions,
  BulkBanResult,
  FetchMemberOptions,
  FetchMembersOptions,
  GuildMemberEditData,
  GuildPruneMembersOptions,
  GuildSearchMembersOptions,
  RoleResolvable,
  UserResolvable,
} from '../../typings';
import type { Guild } from '../structures/Guild';
import type { GuildMember as GuildMemberType } from '../structures/GuildMember';
import type { User } from '../structures/User';

type GuildMemberResolvableSource = GuildMemberType | UserResolvable;

interface FetchSingleMemberOptions {
  user: Snowflake;
  cache?: boolean;
  force?: boolean;
}

interface FetchMembersSourceOptions {
  limit?: number;
  withPresences?: boolean;
  user?: UserResolvable | UserResolvable[];
  query?: string;
  time?: number;
  nonce?: string;
}

interface GuildMembersChunk {
  nonce: string;
  count: number;
}

function isMemberFetchOptions(value: unknown): value is FetchMemberOptions | FetchMembersOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('user' in value || 'query' in value || 'limit' in value || 'withPresences' in value)
  );
}

interface GuildMemberEditPayload {
  nick?: string | null;
  roles?: Snowflake[];
  mute?: boolean;
  deaf?: boolean;
  channel_id?: Snowflake | null;
  communication_disabled_until?: string | null;
  flags?: number;
  avatar?: string | null;
  banner?: string | null;
  bio?: string | null;
}
/* eslint-disable newline-per-chained-call */

class GuildMemberManager extends CachedManager<import('../structures/GuildMember').GuildMember> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<GuildMemberType>) {
    super(guild.client, GuildMember, iterable);

    this.guild = guild;
  }

  _add(data: RawGuildMemberData | { user: { id: string } }, cache = true): GuildMemberType {
    const userId = 'user' in data && data.user ? data.user.id : undefined;
    return super._add(data, cache, { id: userId, extras: [this.guild] });
  }

  resolve(member: unknown): GuildMemberType | null {
    const memberResolvable = super.resolve(member);
    if (memberResolvable) return memberResolvable;
    const userId = this.client.users.resolveId(member);
    if (userId) return this.cache.get(userId) ?? null;
    return null;
  }

  resolveId(member: unknown): string | null {
    const memberResolvable = super.resolveId(member);
    if (memberResolvable) return memberResolvable;
    const userId = this.client.users.resolveId(member);
    if (!userId) return null;
    return this.cache.has(userId) ? userId : null;
  }

  async add(user: GuildMemberResolvableSource, options: AddGuildMemberOptions): Promise<GuildMemberType | null> {
    const userId = this.client.users.resolveId(user);
    if (!userId) throw new TypeError('INVALID_TYPE', 'user', 'UserResolvable');
    if (!options.force) {
      const cachedUser = this.cache.get(userId);
      if (cachedUser) return cachedUser;
    }
    const resolvedOptions: {
      access_token: string;
      nick?: string;
      mute?: boolean;
      deaf?: boolean;
      roles?: Snowflake[];
    } = {
      access_token: options.accessToken,
      nick: options.nick,
      mute: options.mute,
      deaf: options.deaf,
    };
    if (options.roles) {
      if (!Array.isArray(options.roles) && !(options.roles instanceof Collection)) {
        throw new TypeError('INVALID_TYPE', 'options.roles', 'Array or Collection of Roles or Snowflakes', true);
      }
      const resolvedRoles: Snowflake[] = [];
      const roles = options.roles instanceof Collection ? [...options.roles.values()] : options.roles;
      for (const role of roles) {
        const resolvedRole = this.guild.roles.resolveId(role);
        if (!resolvedRole) throw new TypeError('INVALID_ELEMENT', 'Array or Collection', 'options.roles', role);
        resolvedRoles.push(resolvedRole);
      }
      resolvedOptions.roles = resolvedRoles;
    }
    const data = await this.client.api.guilds(this.guild.id).members(userId).put<APIGuildMember>({
      data: resolvedOptions,
    });
    // Data is an empty buffer if the member is already part of the guild.
    return data instanceof Buffer ? (options.fetchWhenExisting === false ? null : this.fetch(userId)) : this._add(data);
  }

  get me(): import('../structures/GuildMember').GuildMember | null {
    return (
      this.cache.get(this.client.user!.id) ??
      (this.client.options.partials.includes(PartialTypes.GUILD_MEMBER)
        ? this._add({ user: { id: this.client.user!.id } }, true)
        : null)
    );
  }

  fetch(
    options: UserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: UserResolvable }),
  ): Promise<GuildMemberType>;
  fetch(options?: FetchMembersOptions): Promise<Collection<Snowflake, GuildMemberType>>;
  fetch(
    options?: UserResolvable | FetchMemberOptions | FetchMembersOptions,
  ): Promise<GuildMemberType | Collection<Snowflake, GuildMemberType>> {
    if (!options) {
      const me = this.me;
      if (
        me &&
        (me.permissions.has('KICK_MEMBERS') || me.permissions.has('BAN_MEMBERS') || me.permissions.has('MANAGE_ROLES'))
      ) {
        return this._fetchMany();
      }
      return this.fetchByMemberSafety();
    }
    const user = this.client.users.resolveId(options);
    if (user) return this._fetchSingle({ user, cache: true });
    if (isMemberFetchOptions(options) && options.user) {
      if (Array.isArray(options.user)) {
        const userIds = options.user
          .map(u => this.client.users.resolveId(u))
          .filter((id): id is Snowflake => id !== null);
        return this._fetchMany({ ...options, user: userIds });
      }
      const userId = this.client.users.resolveId(options.user);
      if (!userId) throw new TypeError('INVALID_TYPE', 'user', 'UserResolvable');
      const limit = 'limit' in options ? options.limit : undefined;
      const withPresences = 'withPresences' in options ? options.withPresences : undefined;
      const cache = 'cache' in options ? options.cache : undefined;
      const force = 'force' in options ? options.force : undefined;
      if (!limit && !withPresences) {
        return this._fetchSingle({ user: userId, cache, force });
      }
      return this._fetchMany({ ...options, user: userId });
    }
    return this._fetchMany(isMemberFetchOptions(options) ? options : undefined);
  }

  fetchMe(options?: BaseFetchOptions): Promise<GuildMemberType> {
    return this.fetch({ ...options, user: this.client.user!.id });
  }

  async search({
    query,
    limit = 1,
    cache = true,
  }: GuildSearchMembersOptions): Promise<Collection<Snowflake, GuildMemberType>> {
    const data: RawGuildMemberData[] = await this.client.api.guilds(this.guild.id).members.search.get({
      query: { query, limit },
    });
    const members = new Collection<Snowflake, GuildMemberType>();
    for (const member of data) {
      if ('user' in member && member.user) members.set(member.user.id, this._add(member, cache));
    }
    return members;
  }

  async edit(user: GuildMemberResolvableSource, data: GuildMemberEditData, reason?: string): Promise<GuildMemberType> {
    const id = this.client.users.resolveId(user);
    if (!id) throw new TypeError('INVALID_TYPE', 'user', 'UserResolvable');

    const _data: GuildMemberEditPayload = {};
    if ('nick' in data) _data.nick = data.nick ?? null;
    if (data.roles) {
      const roles = data.roles instanceof Collection ? [...data.roles.values()] : data.roles;
      _data.roles = roles
        .map(role => this.guild.roles.resolveId(role))
        .filter((roleId): roleId is Snowflake => roleId !== null);
    }
    if (typeof data.mute === 'boolean') _data.mute = data.mute;
    if (typeof data.deaf === 'boolean') _data.deaf = data.deaf;
    if (data.channel) {
      const channel = this.guild.channels.resolve(data.channel);
      if (!(channel instanceof BaseGuildVoiceChannel)) {
        throw new Error('GUILD_VOICE_CHANNEL_RESOLVE');
      }
      _data.channel_id = channel.id;
    } else if (data.channel === null) {
      _data.channel_id = null;
    }
    if ('communicationDisabledUntil' in data) {
      _data.communication_disabled_until = data.communicationDisabledUntil
        ? new Date(data.communicationDisabledUntil).toISOString()
        : null;
    }
    if (typeof data.flags !== 'undefined') _data.flags = Number(GuildMemberFlags.resolve(data.flags));
    if (typeof data.avatar !== 'undefined') _data.avatar = await DataResolver.resolveImage(data.avatar);
    if (typeof data.banner !== 'undefined') _data.banner = await DataResolver.resolveImage(data.banner);
    if (typeof data.bio !== 'undefined') _data.bio = data.bio;

    let endpoint = this.client.api.guilds(this.guild.id);
    if (id === this.client.user!.id) {
      const keys = Object.keys(data);
      if (keys.length === 1 && ['nick', 'avatar', 'banner', 'bio'].includes(keys[0])) {
        endpoint = endpoint.members('@me');
      } else {
        endpoint = endpoint.members(id);
      }
    } else {
      endpoint = endpoint.members(id);
    }
    const d = await endpoint.patch<RESTPatchAPIGuildMemberResult>({ data: _data, reason });

    const clone = this.cache.get(id)?._clone();
    clone?._patch(d);
    return clone ?? this._add(d, false);
  }

  async prune(options: GuildPruneMembersOptions = {}): Promise<number | null> {
    const { days = 7, dry = false, count: compute_prune_count = true, roles = [], reason } = options;
    if (typeof days !== 'number') throw new TypeError('PRUNE_DAYS_TYPE');

    const query: { days: number; include_roles?: string | Snowflake[] } = { days };
    const resolvedRoles: Snowflake[] = [];

    for (const role of roles) {
      const resolvedRole = this.guild.roles.resolveId(role);
      if (!resolvedRole) {
        throw new TypeError('INVALID_ELEMENT', 'Array', 'options.roles', role);
      }
      resolvedRoles.push(resolvedRole);
    }

    if (resolvedRoles.length) {
      query.include_roles = dry ? resolvedRoles.join(',') : resolvedRoles;
    }

    const endpoint = this.client.api.guilds(this.guild.id).prune;

    const { pruned } = await (dry
      ? endpoint.get<RESTGetAPIGuildPruneCountResult>({ query, reason })
      : endpoint.post<RESTPostAPIGuildPruneResult>({ data: { ...query, compute_prune_count }, reason }));

    return pruned;
  }

  async kick(user: GuildMemberResolvableSource, reason?: string): Promise<GuildMemberType | User | Snowflake> {
    const id = this.client.users.resolveId(user);
    if (!id) throw new TypeError('INVALID_TYPE', 'user', 'UserResolvable');

    await this.client.api.guilds(this.guild.id).members(id).delete({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? id;
  }

  ban(user: GuildMemberResolvableSource, options?: BanOptions) {
    return this.guild.bans.create(user, options);
  }

  unban(user: GuildMemberResolvableSource, reason?: string) {
    return this.guild.bans.remove(user, reason);
  }

  async _fetchSingle({ user, cache, force = false }: FetchSingleMemberOptions): Promise<GuildMemberType> {
    if (!force) {
      const existing = this.cache.get(user);
      if (existing && !existing.partial) return existing;
    }

    const data = await this.client.api.guilds(this.guild.id).members(user).get<RESTGetAPIGuildMemberResult>();
    return this._add(data, cache);
  }

  async addRole(user: GuildMemberResolvableSource, role: RoleResolvable, reason?: string) {
    const userId = this.resolveId(user);
    if (!userId) throw new TypeError('INVALID_TYPE', 'user', 'GuildMemberResolvable');
    const roleId = this.guild.roles.resolveId(role);
    if (!roleId) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');

    await this.client.api.guilds(this.guild.id).members(userId).roles(roleId).put({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? userId;
  }

  async removeRole(user: GuildMemberResolvableSource, role: RoleResolvable, reason?: string) {
    const userId = this.resolveId(user);
    if (!userId) throw new TypeError('INVALID_TYPE', 'user', 'GuildMemberResolvable');
    const roleId = this.guild.roles.resolveId(role);
    if (!roleId) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');

    await this.client.api.guilds(this.guild.id).members(userId).roles(roleId).delete({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? userId;
  }

  fetchByMemberSafety(timeout = 15_000): Promise<Collection<Snowflake, GuildMemberType>> {
    return new Promise<Collection<Snowflake, GuildMemberType>>(resolve => {
      const nonce = SnowflakeUtil.generate();
      const fetchedMembers = new Collection<Snowflake, GuildMemberType>();
      let timeout_ = setTimeout(() => {
        this.client.removeListener(Events.GUILD_MEMBERS_CHUNK, handler);
        resolve(fetchedMembers);
      }, timeout).unref();
      const handler = (members: Collection<Snowflake, GuildMemberType>, guild: Guild, chunk: GuildMembersChunk) => {
        if (guild.id === this.guild.id && chunk.nonce === nonce) {
          if (members.size > 0) {
            for (const member of members.values()) {
              fetchedMembers.set(member.id, member);
            }
            this.client.ws.broadcast({
              op: Opcodes.SEARCH_RECENT_MEMBERS,
              d: {
                guild_id: this.guild.id,
                query: '',
                continuation_token: members.first()?.id,
                nonce,
              },
            });
          } else {
            clearTimeout(timeout_);
            this.client.removeListener(Events.GUILD_MEMBERS_CHUNK, handler);
            resolve(fetchedMembers);
          }
        }
      };
      this.client.on(Events.GUILD_MEMBERS_CHUNK, handler);
      this.client.ws.broadcast({
        op: Opcodes.SEARCH_RECENT_MEMBERS,
        d: {
          guild_id: this.guild.id,
          query: '',
          continuation_token: null,
          nonce,
        },
      });
    });
  }

  _fetchMany({
    limit = 0,
    withPresences: presences = true,
    user: user_ids,
    query: initialQuery,
    time = 120e3,
    nonce = SnowflakeUtil.generate(),
  }: FetchMembersSourceOptions = {}): Promise<Collection<Snowflake, GuildMemberType> | GuildMemberType> {
    return new Promise<Collection<Snowflake, GuildMemberType> | GuildMemberType>((resolve, reject) => {
      const query = initialQuery || (!user_ids ? '' : undefined);
      if (nonce.length > 32) throw new RangeError('MEMBER_FETCH_NONCE_LENGTH');
      this.guild.shard!.send({
        op: Opcodes.REQUEST_GUILD_MEMBERS,
        d: {
          guild_id: this.guild.id,
          presences,
          user_ids,
          query,
          nonce,
          limit,
        },
      });
      const fetchedMembers = new Collection<Snowflake, GuildMemberType>();
      let i = 0;
      const handler = (members: Collection<Snowflake, GuildMemberType>, _: unknown, chunk: GuildMembersChunk) => {
        timeout.refresh();
        if (chunk.nonce !== nonce) return;
        i++;
        for (const member of members.values()) {
          fetchedMembers.set(member.id, member);
        }
        if (members.size < 1_000 || (limit && fetchedMembers.size >= limit) || i === chunk.count) {
          clearTimeout(timeout);
          this.client.removeListener(Events.GUILD_MEMBERS_CHUNK, handler);
          this.client.decrementMaxListeners();
          let fetched: Collection<Snowflake, GuildMemberType> | GuildMemberType = fetchedMembers;
          if (user_ids && !Array.isArray(user_ids) && fetchedMembers.size) {
            const first = fetchedMembers.first();
            if (first) fetched = first;
          }
          resolve(fetched);
        }
      };
      const timeout = setTimeout(() => {
        this.client.removeListener(Events.GUILD_MEMBERS_CHUNK, handler);
        this.client.decrementMaxListeners();
        reject(new Error('GUILD_MEMBERS_TIMEOUT'));
      }, time).unref();
      this.client.incrementMaxListeners();
      this.client.on(Events.GUILD_MEMBERS_CHUNK, handler);
    });
  }

  /**
   * Bulk ban users from a guild, and optionally delete previous messages sent by them.
   * @param {Collection<Snowflake, UserResolvable>|UserResolvable[]} users The users to ban
   * @param {BulkBanOptions} [options] The options for bulk banning users
   * @returns {Promise<BulkBanResult>} Returns an object with `bannedUsers` key containing the IDs of the banned users
   * and the key `failedUsers` with the IDs that could not be banned or were already banned.
   * Internally calls the GuildBanManager#bulkCreate method.
   * @example
   * // Bulk ban users by ids (or with user/guild member objects) and delete all their messages from the past 7 days
   * guild.members.bulkBan(['84484653687267328'], { deleteMessageSeconds: 7 * 24 * 60 * 60 })
   *   .then(result => {
   *     console.log(`Banned ${result.bannedUsers.length} users, failed to ban ${result.failedUsers.length} users.`)
   *   })
   *   .catch(console.error);
   * @deprecated This method will not be usable until an effective MFA implementation is in place.
   */
  bulkBan(
    users: Collection<Snowflake, UserResolvable> | readonly UserResolvable[],
    options: BulkBanOptions = {},
  ): Promise<BulkBanResult> {
    return this.guild.bans.bulkCreate(users, options);
  }
}

export default GuildMemberManager;
export { GuildMemberManager };
