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
import type { APIUser, Snowflake } from 'discord-api-types/v10';
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
  GuildMemberResolvable,
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

/**
 * Manages API methods for GuildMembers and stores their cache.
 * @extends {CachedManager}
 */
class GuildMemberManager extends CachedManager<import('../structures/GuildMember').GuildMember> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<GuildMemberType>) {
    super(guild.client, GuildMember, iterable);

    /**
     * The guild this manager belongs to
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The cache of this Manager
   * @type {Collection<Snowflake, GuildMemberType>}
   * @name GuildMemberManager#cache
   */

  _add(data: RawGuildMemberData | { user: APIUser }, cache = true): GuildMemberType {
    const userId = 'user' in data && data.user ? data.user.id : undefined;
    return super._add(data, cache, { id: userId, extras: [this.guild] });
  }

  /**
   * Data that resolves to give a GuildMemberType object. This can be:
   * * A GuildMemberType object
   * * A User resolvable
   * @typedef {GuildMemberType|UserResolvable} GuildMemberResolvable
   */

  /**
   * Resolves a {@link GuildMemberResolvable} to a {@link GuildMemberType} object.
   * @param {GuildMemberResolvable} member The user that is part of the guild
   * @returns {?GuildMemberType}
   */
  resolve(member: unknown): GuildMemberType | null {
    const memberResolvable = super.resolve(member);
    if (memberResolvable) return memberResolvable;
    const userId = this.client.users.resolveId(member);
    if (userId) return this.cache.get(userId) ?? null;
    return null;
  }

  /**
   * Resolves a {@link GuildMemberResolvable} to a member id.
   * @param {GuildMemberResolvable} member The user that is part of the guild
   * @returns {?Snowflake}
   */
  resolveId(member: unknown): string | null {
    const memberResolvable = super.resolveId(member);
    if (memberResolvable) return memberResolvable;
    const userId = this.client.users.resolveId(member);
    if (!userId) return null;
    return this.cache.has(userId) ? userId : null;
  }

  /**
   * Options used to add a user to a guild using OAuth2.
   * @typedef {Object} AddGuildMemberOptions
   * @property {string} accessToken An OAuth2 access token for the user with the `guilds.join` scope granted to the
   * bot's application
   * @property {string} [nick] The nickname to give to the member (requires `MANAGE_NICKNAMES`)
   * @property {Collection<Snowflake, Role>|RoleResolvable[]} [roles] The roles to add to the member
   * (requires `MANAGE_ROLES`)
   * @property {boolean} [mute] Whether the member should be muted (requires `MUTE_MEMBERS`)
   * @property {boolean} [deaf] Whether the member should be deafened (requires `DEAFEN_MEMBERS`)
   * @property {boolean} [force] Whether to skip the cache check and call the API directly
   * @property {boolean} [fetchWhenExisting=true] Whether to fetch the user if not cached and already a member
   */

  /**
   * Adds a user to the guild using OAuth2. Requires the `CREATE_INSTANT_INVITE` permission.
   * @param {UserResolvable} user The user to add to the guild
   * @param {AddGuildMemberOptions} options Options for adding the user to the guild
   * @returns {Promise<GuildMemberType|null>}
   */
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
    const data = await this.client.api.guilds(this.guild.id).members(userId).put({ data: resolvedOptions });
    // Data is an empty buffer if the member is already part of the guild.
    return data instanceof Buffer ? (options.fetchWhenExisting === false ? null : this.fetch(userId)) : this._add(data);
  }

  /**
   * The client user as a GuildMemberType of this guild
   * @type {?GuildMemberType}
   * @readonly
   */
  get me(): import('../structures/GuildMember').GuildMember | null {
    return (
      this.cache.get(this.client.user!.id) ??
      (this.client.options.partials.includes(PartialTypes.GUILD_MEMBER)
        ? this._add({ user: { id: this.client.user!.id } }, true)
        : null)
    );
  }

  /**
   * Options used to fetch a single member from a guild.
   * @typedef {BaseFetchOptions} FetchMemberOptions
   * @property {UserResolvable} user The user to fetch
   */

  /**
   * Options used to fetch multiple members from a guild.
   * @typedef {Object} FetchMembersOptions
   * @property {UserResolvable|UserResolvable[]} user The user(s) to fetch
   * @property {?string} query Limit fetch to members with similar usernames
   * @property {number} [limit=0] Maximum number of members to request
   * @property {boolean} [withPresences=false] Whether or not to include the presences
   * @property {number} [time=120e3] Timeout for receipt of members
   * @property {?string} nonce Nonce for this request (32 characters max - default to base 16 now timestamp)
   * @property {boolean} [force=false] Whether to skip the cache check and request the API
   */

  /**
   * Fetches member(s) from Discord, even if they're offline.
   * @param {UserResolvable|FetchMemberOptions|FetchMembersOptions} [options] If a UserResolvable, the user to fetch.
   * If undefined, fetches all members.
   * If a query, it limits the results to users with similar usernames.
   * @returns {Promise<GuildMemberType|Collection<Snowflake, GuildMemberType>>}
   * @example
   * // Fetch all members from a guild
   * guild.members.fetch()
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetch a single member
   * guild.members.fetch('66564597481480192')
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetch a single member without checking cache
   * guild.members.fetch({ user, force: true })
   *   .then(console.log)
   *   .catch(console.error)
   * @example
   * // Fetch a single member without caching
   * guild.members.fetch({ user, cache: false })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetch by an array of users including their presences
   * guild.members.fetch({ user: ['66564597481480192', '191615925336670208'], withPresences: true })
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Fetch by query
   * guild.members.fetch({ query: 'hydra', limit: 1 })
   *   .then(console.log)
   *   .catch(console.error);
   */
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

  /**
   * Fetches the client user as a GuildMemberType of the guild.
   * @param {BaseFetchOptions} [options] The options for fetching the member
   * @returns {Promise<GuildMemberType>}
   */
  fetchMe(options?: BaseFetchOptions): Promise<GuildMemberType> {
    return this.fetch({ ...options, user: this.client.user!.id });
  }

  /**
   * Options used for searching guild members.
   * @typedef {Object} GuildSearchMembersOptions
   * @property {string} query Filter members whose username or nickname start with this query
   * @property {number} [limit=1] Maximum number of members to search
   * @property {boolean} [cache=true] Whether or not to cache the fetched member(s)
   */

  /**
   * Searches for members in the guild based on a query.
   * @param {GuildSearchMembersOptions} options Options for searching members
   * @returns {Promise<Collection<Snowflake, GuildMemberType>>}
   */
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

  /**
   * The data for editing a guild member.
   * @typedef {Object} GuildMemberEditData
   * @property {?string} [nick] The nickname to set for the member
   * @property {Collection<Snowflake, Role>|RoleResolvable[]} [roles] The roles or role ids to apply
   * @property {boolean} [mute] Whether or not the member should be muted
   * @property {boolean} [deaf] Whether or not the member should be deafened
   * @property {GuildVoiceChannelResolvable|null} [channel] Channel to move the member to
   * (if they are connected to voice), or `null` if you want to disconnect them from voice
   * @property {DateResolvable|null} [communicationDisabledUntil] The date or timestamp
   * for the member's communication to be disabled until. Provide `null` to enable communication again.
   * @property {GuildMemberFlagsResolvable} [flags] The flags to set for the member
   * @property {?(BufferResolvable|Base64Resolvable)} [avatar] The new guild avatar
   * @property {?(BufferResolvable|Base64Resolvable)} [banner] The new guild banner
   * @property {?string} [bio] The new guild about me
   */

  /**
   * Edits a member of the guild.
   * <info>The user must be a member of the guild</info>
   * @param {UserResolvable} user The member to edit
   * @param {GuildMemberEditData} data The data to edit the member with
   * @param {string} [reason] Reason for editing this user
   * @returns {Promise<GuildMemberType>}
   */
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
    const d = await endpoint.patch({ data: _data, reason });

    const clone = this.cache.get(id)?._clone();
    clone?._patch(d);
    return clone ?? this._add(d, false);
  }

  /**
   * Options used for pruning guild members.
   * <info>It's recommended to set {@link GuildPruneMembersOptions#count options.count}
   * to `false` for large guilds.</info>
   * @typedef {Object} GuildPruneMembersOptions
   * @property {number} [days=7] Number of days of inactivity required to kick
   * @property {boolean} [dry=false] Get the number of users that will be kicked, without actually kicking them
   * @property {boolean} [count=true] Whether or not to return the number of users that have been kicked.
   * @property {RoleResolvable[]} [roles] Array of roles to bypass the "...and no roles" constraint when pruning
   * @property {string} [reason] Reason for this prune
   */

  /**
   * Prunes members from the guild based on how long they have been inactive.
   * @param {GuildPruneMembersOptions} [options] Options for pruning
   * @returns {Promise<number|null>} The number of members that were/will be kicked
   * @example
   * // See how many members will be pruned
   * guild.members.prune({ dry: true })
   *   .then(pruned => console.log(`This will prune ${pruned} people!`))
   *   .catch(console.error);
   * @example
   * // Actually prune the members
   * guild.members.prune({ days: 1, reason: 'too many people!' })
   *   .then(pruned => console.log(`I just pruned ${pruned} people!`))
   *   .catch(console.error);
   * @example
   * // Include members with a specified role
   * guild.members.prune({ days: 7, roles: ['657259391652855808'] })
   *    .then(pruned => console.log(`I just pruned ${pruned} people!`))
   *    .catch(console.error);
   */
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
      ? endpoint.get({ query, reason })
      : endpoint.post({ data: { ...query, compute_prune_count }, reason }));

    return pruned;
  }

  /**
   * Kicks a user from the guild.
   * <info>The user must be a member of the guild</info>
   * @param {UserResolvable} user The member to kick
   * @param {string} [reason] Reason for kicking
   * @returns {Promise<GuildMemberType|User|Snowflake>} Result object will be resolved as specifically as possible.
   * If the GuildMemberType cannot be resolved, the User will instead be attempted to be resolved. If that also cannot
   * be resolved, the user's id will be the result.
   * @example
   * // Kick a user by id (or with a user/guild member object)
   * guild.members.kick('84484653687267328')
   *   .then(kickInfo => console.log(`Kicked ${kickInfo.user?.tag ?? kickInfo.tag ?? kickInfo}`))
   *   .catch(console.error);
   */
  async kick(user: GuildMemberResolvableSource, reason?: string): Promise<GuildMemberType | User | Snowflake> {
    const id = this.client.users.resolveId(user);
    if (!id) throw new TypeError('INVALID_TYPE', 'user', 'UserResolvable');

    await this.client.api.guilds(this.guild.id).members(id).delete({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? id;
  }

  /**
   * Bans a user from the guild.
   * @param {UserResolvable} user The user to ban
   * @param {BanOptions} [options] Options for the ban
   * @returns {Promise<GuildMemberType|User|Snowflake>} Result object will be resolved as specifically as possible.
   * If the GuildMemberType cannot be resolved, the User will instead be attempted to be resolved. If that also cannot
   * be resolved, the user id will be the result.
   * Internally calls the GuildBanManager#create method.
   * @example
   * // Ban a user by id (or with a user/guild member object)
   * guild.members.ban('84484653687267328')
   *   .then(banInfo => console.log(`Banned ${banInfo.user?.tag ?? banInfo.tag ?? banInfo}`))
   *   .catch(console.error);
   */
  ban(user: GuildMemberResolvableSource, options?: BanOptions) {
    return this.guild.bans.create(user, options);
  }

  /**
   * Unbans a user from the guild. Internally calls the {@link GuildBanManager#remove} method.
   * @param {UserResolvable} user The user to unban
   * @param {string} [reason] Reason for unbanning user
   * @returns {Promise<?User>} The user that was unbanned
   * @example
   * // Unban a user by id (or with a user/guild member object)
   * guild.members.unban('84484653687267328')
   *   .then(user => console.log(`Unbanned ${user.username} from ${guild.name}`))
   *   .catch(console.error);
   */
  unban(user: GuildMemberResolvableSource, reason?: string) {
    return this.guild.bans.remove(user, reason);
  }

  async _fetchSingle({ user, cache, force = false }: FetchSingleMemberOptions): Promise<GuildMemberType> {
    if (!force) {
      const existing = this.cache.get(user);
      if (existing && !existing.partial) return existing;
    }

    const data = await this.client.api.guilds(this.guild.id).members(user).get();
    return this._add(data, cache);
  }

  /**
   * Adds a role to a member.
   * @param {GuildMemberResolvable} user The user to add the role from
   * @param {RoleResolvable} role The role to add
   * @param {string} [reason] Reason for adding the role
   * @returns {Promise<GuildMemberType|User|Snowflake>}
   */
  async addRole(user: GuildMemberResolvableSource, role: RoleResolvable, reason?: string) {
    const userId = this.resolveId(user);
    if (!userId) throw new TypeError('INVALID_TYPE', 'user', 'GuildMemberResolvable');
    const roleId = this.guild.roles.resolveId(role);
    if (!roleId) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');

    await this.client.api.guilds(this.guild.id).members(userId).roles(roleId).put({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? userId;
  }

  /**
   * Removes a role from a member.
   * @param {UserResolvable} user The user to remove the role from
   * @param {RoleResolvable} role The role to remove
   * @param {string} [reason] Reason for removing the role
   * @returns {Promise<GuildMemberType|User|Snowflake>}
   */
  async removeRole(user: GuildMemberResolvableSource, role: RoleResolvable, reason?: string) {
    const userId = this.resolveId(user);
    if (!userId) throw new TypeError('INVALID_TYPE', 'user', 'GuildMemberResolvable');
    const roleId = this.guild.roles.resolveId(role);
    if (!roleId) throw new TypeError('INVALID_TYPE', 'role', 'RoleResolvable');

    await this.client.api.guilds(this.guild.id).members(userId).roles(roleId).delete({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? userId;
  }

  /**
   * Experimental method to fetch members from the guild.
   * <info>Lists up to 10000 members of the guild.</info>
   * @param {number} [timeout=15_000] Timeout for receipt of members in ms
   * @returns {Promise<Collection<Snowflake, GuildMemberType>>}
   */
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
