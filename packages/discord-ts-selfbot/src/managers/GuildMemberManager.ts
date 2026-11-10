import { Buffer } from "node:buffer";
import { setTimeout } from "node:timers";
import { Collection } from "@discordjs/collection";
import CachedManager from "./CachedManager";
import _errorsModule from "../errors";

const { Error, TypeError, RangeError } = _errorsModule;
import BaseGuildVoiceChannel from "../structures/BaseGuildVoiceChannel";
import _GuildMemberModule from "../structures/GuildMember";

const { GuildMember } = _GuildMemberModule;
import _ConstantsModule from "../util/Constants";

const { Events, Opcodes } = _ConstantsModule;
const { PartialTypes } = _ConstantsModule;
import DataResolver from "../util/DataResolver";
import GuildMemberFlags from "../util/GuildMemberFlags";
import SnowflakeUtil from "../util/SnowflakeUtil";
import type {
  APIGuildMember,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildPruneCountResult,
  RESTPatchAPIGuildMemberResult,
  RESTPostAPIGuildPruneResult,
  Snowflake,
} from "discord-api-types/v10";
import type { RawGuildMemberData } from "../../typings/rawDataTypes";
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
} from "../../typings";
import type { Guild } from "../structures/Guild";
import type { GuildMember as GuildMemberType } from "../structures/GuildMember";
import type { User } from "../structures/User";

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

function isMemberFetchOptions(
  value: unknown
): value is FetchMemberOptions | FetchMembersOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    ("user" in value ||
      "query" in value ||
      "limit" in value ||
      "withPresences" in value)
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

class GuildMemberManager extends CachedManager<GuildMemberType> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<GuildMemberType>) {
    super(guild.client, GuildMember, iterable);

    this.guild = guild;
  }

  _add(
    data: RawGuildMemberData | { user: { id: string } },
    cache = true
  ): GuildMemberType {
    const userId = "user" in data && data.user ? data.user.id : undefined;
    return super._add(data, cache, { extras: [this.guild], id: userId });
  }

  resolve(member: unknown): GuildMemberType | null {
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

  resolveId(member: unknown): string | null {
    const memberResolvable = super.resolveId(member);
    if (memberResolvable) {
      return memberResolvable;
    }
    const userId = this.client.users.resolveId(member);
    if (!userId) {
      return null;
    }
    return this.cache.has(userId) ? userId : null;
  }

  async add(
    user: GuildMemberResolvableSource,
    options: AddGuildMemberOptions
  ): Promise<GuildMemberType | null> {
    const userId = this.client.users.resolveId(user);
    if (!userId) {
      throw new TypeError("INVALID_TYPE", "user", "UserResolvable");
    }
    if (!options.force) {
      const cachedUser = this.cache.get(userId);
      if (cachedUser) {
        return cachedUser;
      }
    }
    const resolvedOptions: {
      access_token: string;
      nick?: string;
      mute?: boolean;
      deaf?: boolean;
      roles?: Snowflake[];
    } = {
      access_token: options.accessToken,
      deaf: options.deaf,
      mute: options.mute,
      nick: options.nick,
    };
    if (options.roles) {
      if (
        !Array.isArray(options.roles) &&
        !(options.roles instanceof Collection)
      ) {
        throw new TypeError(
          "INVALID_TYPE",
          "options.roles",
          "Array or Collection of Roles or Snowflakes",
          true
        );
      }
      const resolvedRoles: Snowflake[] = [];
      const roles =
        options.roles instanceof Collection
          ? [...options.roles.values()]
          : options.roles;
      for (const role of roles) {
        const resolvedRole = this.guild.roles.resolveId(role);
        if (!resolvedRole) {
          throw new TypeError(
            "INVALID_ELEMENT",
            "Array or Collection",
            "options.roles",
            role
          );
        }
        resolvedRoles.push(resolvedRole);
      }
      resolvedOptions.roles = resolvedRoles;
    }
    const data = await this.client.api
      .guilds(this.guild.id)
      .members(userId)
      .put<APIGuildMember>({
        data: resolvedOptions,
      });
    // Data is an empty buffer if the member is already part of the guild.
    if (!(data instanceof Buffer)) {
      return this._add(data);
    }
    return options.fetchWhenExisting === false ? null : this.fetch(userId);
  }

  get me(): GuildMemberType | null {
    const userId = this.client.user?.id;
    if (!userId) {
      return null;
    }
    return (
      this.cache.get(userId) ??
      (this.client.options.partials.includes(PartialTypes.GUILD_MEMBER)
        ? this._add({ user: { id: userId } }, true)
        : null)
    );
  }

  fetch(
    options:
      | UserResolvable
      | FetchMemberOptions
      | (FetchMembersOptions & { user: UserResolvable })
  ): Promise<GuildMemberType>;
  fetch(
    options?: FetchMembersOptions
  ): Promise<Collection<Snowflake, GuildMemberType>>;
  fetch(
    options?: UserResolvable | FetchMemberOptions | FetchMembersOptions
  ): Promise<GuildMemberType | Collection<Snowflake, GuildMemberType>> {
    if (!options) {
      const { me } = this;
      if (
        me &&
        (me.permissions.has("KICK_MEMBERS") ||
          me.permissions.has("BAN_MEMBERS") ||
          me.permissions.has("MANAGE_ROLES"))
      ) {
        return this._fetchMany();
      }
      return this.fetchByMemberSafety();
    }
    const user = this.client.users.resolveId(options);
    if (user) {
      return this._fetchSingle({ cache: true, user });
    }
    if (isMemberFetchOptions(options) && options.user) {
      if (Array.isArray(options.user)) {
        const userIds = options.user
          .map((userResolvable) => this.client.users.resolveId(userResolvable))
          .filter((id): id is Snowflake => id !== null);
        return this._fetchMany({ ...options, user: userIds });
      }
      const userId = this.client.users.resolveId(options.user);
      if (!userId) {
        throw new TypeError("INVALID_TYPE", "user", "UserResolvable");
      }
      const limit = "limit" in options ? options.limit : undefined;
      const withPresences =
        "withPresences" in options ? options.withPresences : undefined;
      const cache = "cache" in options ? options.cache : undefined;
      const force = "force" in options ? options.force : undefined;
      if (!limit && !withPresences) {
        return this._fetchSingle({ cache, force, user: userId });
      }
      return this._fetchMany({ ...options, user: userId });
    }
    return this._fetchMany(isMemberFetchOptions(options) ? options : undefined);
  }

  fetchMe(options?: BaseFetchOptions): Promise<GuildMemberType> {
    const userId = this.client.user?.id;
    if (!userId) {
      throw new TypeError("INVALID_TYPE", "user", "UserResolvable");
    }
    return this.fetch({ ...options, user: userId });
  }

  async search({
    query,
    limit = 1,
    cache = true,
  }: GuildSearchMembersOptions): Promise<
    Collection<Snowflake, GuildMemberType>
  > {
    const data: RawGuildMemberData[] = await this.client.api
      .guilds(this.guild.id)
      .members.search.get({
        query: { limit, query },
      });
    const members = new Collection<Snowflake, GuildMemberType>();
    for (const member of data) {
      if ("user" in member && member.user) {
        members.set(member.user.id, this._add(member, cache));
      }
    }
    return members;
  }

  async edit(
    user: GuildMemberResolvableSource,
    data: GuildMemberEditData,
    reason?: string
  ): Promise<GuildMemberType> {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "user", "UserResolvable");
    }

    const _data = await this.buildEditPayload(data);

    const selfId = this.client.user?.id;
    const keys = Object.keys(data);
    const useMeEndpoint =
      id === selfId &&
      keys.length === 1 &&
      ["nick", "avatar", "banner", "bio"].includes(keys[0]);
    const endpoint = this.client.api
      .guilds(this.guild.id)
      .members(useMeEndpoint ? "@me" : id);
    const d = await endpoint.patch<RESTPatchAPIGuildMemberResult>({
      data: _data,
      reason,
    });

    const clone = this.cache.get(id)?._clone();
    clone?._patch(d);
    return clone ?? this._add(d, false);
  }

  private async buildEditPayload(
    data: GuildMemberEditData
  ): Promise<GuildMemberEditPayload> {
    const _data: GuildMemberEditPayload = {};
    if ("nick" in data) {
      _data.nick = data.nick ?? null;
    }
    if (data.roles) {
      const roles =
        data.roles instanceof Collection
          ? [...data.roles.values()]
          : data.roles;
      _data.roles = roles
        .map((role) => this.guild.roles.resolveId(role))
        .filter((roleId): roleId is Snowflake => roleId !== null);
    }
    if (typeof data.mute === "boolean") {
      _data.mute = data.mute;
    }
    if (typeof data.deaf === "boolean") {
      _data.deaf = data.deaf;
    }
    if (data.channel) {
      const channel = this.guild.channels.resolve(data.channel);
      if (!(channel instanceof BaseGuildVoiceChannel)) {
        throw new Error("GUILD_VOICE_CHANNEL_RESOLVE");
      }
      _data.channel_id = channel.id;
    } else if (data.channel === null) {
      _data.channel_id = null;
    }
    if ("communicationDisabledUntil" in data) {
      _data.communication_disabled_until = data.communicationDisabledUntil
        ? new Date(data.communicationDisabledUntil).toISOString()
        : null;
    }
    if (data.flags !== undefined) {
      _data.flags = Number(GuildMemberFlags.resolve(data.flags));
    }
    if (data.avatar !== undefined) {
      _data.avatar = await DataResolver.resolveImage(data.avatar);
    }
    if (data.banner !== undefined) {
      _data.banner = await DataResolver.resolveImage(data.banner);
    }
    if (data.bio !== undefined) {
      _data.bio = data.bio;
    }
    return _data;
  }

  async prune(options: GuildPruneMembersOptions = {}): Promise<number | null> {
    const {
      days = 7,
      dry = false,
      count: compute_prune_count = true,
      roles = [],
      reason,
    } = options;
    if (typeof days !== "number") {
      throw new TypeError("PRUNE_DAYS_TYPE");
    }

    const query: { days: number; include_roles?: string | Snowflake[] } = {
      days,
    };
    const resolvedRoles: Snowflake[] = [];

    for (const role of roles) {
      const resolvedRole = this.guild.roles.resolveId(role);
      if (!resolvedRole) {
        throw new TypeError("INVALID_ELEMENT", "Array", "options.roles", role);
      }
      resolvedRoles.push(resolvedRole);
    }

    if (resolvedRoles.length) {
      query.include_roles = dry ? resolvedRoles.join(",") : resolvedRoles;
    }

    const endpoint = this.client.api.guilds(this.guild.id).prune;

    const { pruned } = await (dry
      ? endpoint.get<RESTGetAPIGuildPruneCountResult>({ query, reason })
      : endpoint.post<RESTPostAPIGuildPruneResult>({
          data: { ...query, compute_prune_count },
          reason,
        }));

    return pruned;
  }

  async kick(
    user: GuildMemberResolvableSource,
    reason?: string
  ): Promise<GuildMemberType | User | Snowflake> {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "user", "UserResolvable");
    }

    await this.client.api.guilds(this.guild.id).members(id).delete({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? id;
  }

  ban(user: GuildMemberResolvableSource, options?: BanOptions) {
    return this.guild.bans.create(user, options);
  }

  unban(user: GuildMemberResolvableSource, reason?: string) {
    return this.guild.bans.remove(user, reason);
  }

  async _fetchSingle({
    user,
    cache,
    force = false,
  }: FetchSingleMemberOptions): Promise<GuildMemberType> {
    if (!force) {
      const existing = this.cache.get(user);
      if (existing && !existing.partial) {
        return existing;
      }
    }

    const data = await this.client.api
      .guilds(this.guild.id)
      .members(user)
      .get<RESTGetAPIGuildMemberResult>();
    return this._add(data, cache);
  }

  async addRole(
    user: GuildMemberResolvableSource,
    role: RoleResolvable,
    reason?: string
  ) {
    const userId = this.resolveId(user);
    if (!userId) {
      throw new TypeError("INVALID_TYPE", "user", "GuildMemberResolvable");
    }
    const roleId = this.guild.roles.resolveId(role);
    if (!roleId) {
      throw new TypeError("INVALID_TYPE", "role", "RoleResolvable");
    }

    await this.client.api
      .guilds(this.guild.id)
      .members(userId)
      .roles(roleId)
      .put({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? userId;
  }

  async removeRole(
    user: GuildMemberResolvableSource,
    role: RoleResolvable,
    reason?: string
  ) {
    const userId = this.resolveId(user);
    if (!userId) {
      throw new TypeError("INVALID_TYPE", "user", "GuildMemberResolvable");
    }
    const roleId = this.guild.roles.resolveId(role);
    if (!roleId) {
      throw new TypeError("INVALID_TYPE", "role", "RoleResolvable");
    }

    await this.client.api
      .guilds(this.guild.id)
      .members(userId)
      .roles(roleId)
      .delete({ reason });

    return this.resolve(user) ?? this.client.users.resolve(user) ?? userId;
  }

  fetchByMemberSafety(
    timeout = 15_000
  ): Promise<Collection<Snowflake, GuildMemberType>> {
    const { promise, resolve } =
      Promise.withResolvers<Collection<Snowflake, GuildMemberType>>();
    const nonce = SnowflakeUtil.generate();
    const fetchedMembers = new Collection<Snowflake, GuildMemberType>();
    const state: {
      handler?: (
        members: Collection<Snowflake, GuildMemberType>,
        guild: Guild,
        chunk: GuildMembersChunk
      ) => void;
      timer?: ReturnType<typeof setTimeout>;
    } = {};
    const cleanup = () => {
      if (state.handler) {
        this.client.removeListener(Events.GUILD_MEMBERS_CHUNK, state.handler);
      }
      if (state.timer) {
        clearTimeout(state.timer);
      }
    };
    state.timer = setTimeout(() => {
      cleanup();
      resolve(fetchedMembers);
    }, timeout).unref();
    state.handler = (members, guild, chunk) => {
      if (guild.id === this.guild.id && chunk.nonce === nonce) {
        if (members.size > 0) {
          for (const member of members.values()) {
            fetchedMembers.set(member.id, member);
          }
          this.client.ws.broadcast({
            d: {
              continuation_token: members.first()?.id,
              guild_id: this.guild.id,
              nonce,
              query: "",
            },
            op: Opcodes.SEARCH_RECENT_MEMBERS,
          });
        } else {
          cleanup();
          resolve(fetchedMembers);
        }
      }
    };
    this.client.on(Events.GUILD_MEMBERS_CHUNK, state.handler);
    this.client.ws.broadcast({
      d: {
        continuation_token: null,
        guild_id: this.guild.id,
        nonce,
        query: "",
      },
      op: Opcodes.SEARCH_RECENT_MEMBERS,
    });
    return promise;
  }

  _fetchMany({
    limit = 0,
    withPresences: presences = true,
    user: user_ids,
    query: initialQuery,
    time = 120e3,
    nonce = SnowflakeUtil.generate(),
  }: FetchMembersSourceOptions = {}): Promise<
    Collection<Snowflake, GuildMemberType> | GuildMemberType
  > {
    const { promise, resolve, reject } = Promise.withResolvers<
      Collection<Snowflake, GuildMemberType> | GuildMemberType
    >();
    const query = initialQuery || (user_ids ? undefined : "");
    if (nonce.length > 32) {
      reject(new RangeError("MEMBER_FETCH_NONCE_LENGTH"));
      return promise;
    }
    const { shard } = this.guild;
    if (!shard) {
      reject(new Error("GUILD_MEMBERS_TIMEOUT"));
      return promise;
    }
    shard.send({
      d: {
        guild_id: this.guild.id,
        limit,
        nonce,
        presences,
        query,
        user_ids,
      },
      op: Opcodes.REQUEST_GUILD_MEMBERS,
    });
    const fetchedMembers = new Collection<Snowflake, GuildMemberType>();
    let chunkIndex = 0;
    const state: {
      handler?: (
        members: Collection<Snowflake, GuildMemberType>,
        guild: Guild,
        chunk: GuildMembersChunk
      ) => void;
      timer?: ReturnType<typeof setTimeout>;
    } = {};
    const cleanup = () => {
      if (state.handler) {
        this.client.removeListener(Events.GUILD_MEMBERS_CHUNK, state.handler);
      }
      if (state.timer) {
        clearTimeout(state.timer);
      }
      this.client.decrementMaxListeners();
    };
    state.handler = (members, _guild, chunk) => {
      state.timer?.refresh();
      if (chunk.nonce !== nonce) {
        return;
      }
      chunkIndex++;
      for (const member of members.values()) {
        fetchedMembers.set(member.id, member);
      }
      if (
        members.size < 1000 ||
        (limit && fetchedMembers.size >= limit) ||
        chunkIndex === chunk.count
      ) {
        cleanup();
        let fetched: Collection<Snowflake, GuildMemberType> | GuildMemberType =
          fetchedMembers;
        if (user_ids && !Array.isArray(user_ids) && fetchedMembers.size) {
          const first = fetchedMembers.first();
          if (first) {
            fetched = first;
          }
        }
        resolve(fetched);
      }
    };
    state.timer = setTimeout(() => {
      cleanup();
      reject(new Error("GUILD_MEMBERS_TIMEOUT"));
    }, time).unref();
    this.client.incrementMaxListeners();
    this.client.on(Events.GUILD_MEMBERS_CHUNK, state.handler);
    return promise;
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
    options: BulkBanOptions = {}
  ): Promise<BulkBanResult> {
    return this.guild.bans.bulkCreate(users, options);
  }
}

export default GuildMemberManager;
export { GuildMemberManager };
