import process from "node:process";
import { Collection } from "@discordjs/collection";
import CachedManager from "./CachedManager";
import _errorsModule from "../errors";

const { TypeError, Error } = _errorsModule;
import GuildBan from "../structures/GuildBan";
import _GuildMemberModule from "../structures/GuildMember";

const { GuildMember } = _GuildMemberModule;
import type {
  RESTPostAPIGuildBulkBanResult,
  Snowflake,
} from "discord-api-types/v10";
import type { RawGuildBanData } from "../../typings/rawDataTypes";
import type {
  BanOptions,
  BaseFetchOptions,
  BulkBanOptions,
  BulkBanResult,
  FetchBanOptions,
  FetchBansOptions,
  UserResolvable,
} from "../../typings";
import type { Guild } from "../structures/Guild";
import type { User } from "../structures/User";
import type { Message } from "../structures/Message";
import type { ThreadMember } from "../structures/ThreadMember";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFetchBanOptions(value: unknown): value is FetchBanOptions {
  return isRecord(value) && "user" in value;
}

function isFetchBansOptions(value: unknown): value is FetchBansOptions {
  return (
    isRecord(value) &&
    ("limit" in value ||
      "before" in value ||
      "after" in value ||
      "cache" in value)
  );
}

type UserResolvableSource =
  | User
  | InstanceType<typeof GuildMember>
  | Message
  | ThreadMember
  | Snowflake
  | UserResolvable;
type GuildBanResolvableSource = GuildBan | UserResolvableSource;

let deprecationEmittedForDays = false;

class GuildBanManager extends CachedManager<GuildBan> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<GuildBan>) {
    super(guild.client, GuildBan, iterable);

    this.guild = guild;
  }

  _add(data: RawGuildBanData, cache = true): GuildBan {
    return super._add(data, cache, { extras: [this.guild], id: data.user.id });
  }

  resolve(ban: GuildBanResolvableSource): GuildBan | null {
    return (
      super.resolve(ban) ?? super.resolve(this.client.users.resolveId(ban))
    );
  }

  fetch(options: GuildBanResolvableSource | FetchBanOptions): Promise<GuildBan>;
  fetch(options?: FetchBansOptions): Promise<Collection<Snowflake, GuildBan>>;
  async fetch(
    options?: GuildBanResolvableSource | FetchBanOptions | FetchBansOptions
  ): Promise<GuildBan | Collection<Snowflake, GuildBan>> {
    if (!options) {
      return this._fetchMany();
    }
    const banOptions = isFetchBanOptions(options) ? options : undefined;
    const listOptions = isFetchBansOptions(options) ? options : undefined;
    const resolvedUser = this.client.users.resolveId(
      banOptions?.user ?? options
    );
    if (resolvedUser) {
      return this._fetchSingle({
        cache: banOptions?.cache,
        force: banOptions?.force,
        user: resolvedUser,
      });
    }

    if (
      !listOptions?.before &&
      !listOptions?.after &&
      !listOptions?.limit &&
      listOptions?.cache === undefined
    ) {
      throw new Error("FETCH_BAN_RESOLVE_ID");
    }

    return this._fetchMany(listOptions);
  }

  async _fetchSingle({
    user,
    cache,
    force = false,
  }: BaseFetchOptions & { user: Snowflake }): Promise<GuildBan> {
    if (!force) {
      const existing = this.cache.get(user);
      if (existing && !existing.partial) {
        return existing;
      }
    }

    const data: RawGuildBanData = await this.client.api
      .guilds(this.guild.id)
      .bans(user)
      .get();
    return this._add(data, cache);
  }

  async _fetchMany(
    options: FetchBansOptions = {}
  ): Promise<Collection<Snowflake, GuildBan>> {
    const data: RawGuildBanData[] = await this.client.api
      .guilds(this.guild.id)
      .bans.get({
        query: options,
      });

    const bans = new Collection<Snowflake, GuildBan>();
    for (const ban of data) {
      bans.set(ban.user.id, this._add(ban, options.cache));
    }
    return bans;
  }
  async create(
    user: UserResolvableSource,
    options: BanOptions = {}
  ): Promise<InstanceType<typeof GuildMember> | User | Snowflake> {
    if (typeof options !== "object") {
      throw new TypeError("INVALID_TYPE", "options", "object", true);
    }
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new Error("BAN_RESOLVE_ID", true);
    }

    if (options.days !== undefined && !deprecationEmittedForDays) {
      process.emitWarning(
        "The days option for GuildBanManager#create() is deprecated. Use the deleteMessageSeconds option instead.",
        "DeprecationWarning"
      );

      deprecationEmittedForDays = true;
    }

    await this.client.api
      .guilds(this.guild.id)
      .bans(id)
      .put({
        data: {
          delete_message_seconds:
            options.deleteMessageSeconds === undefined
              ? (options.days ?? 0) * 24 * 60 * 60
              : options.deleteMessageSeconds,
        },
        reason: options.reason,
      });
    if (user instanceof GuildMember) {
      return user;
    }
    const _user = this.client.users.cache.get(id);
    if (_user) {
      return this.guild.members.resolve(_user) ?? _user;
    }
    return id;
  }

  async remove(
    user: UserResolvableSource,
    reason?: string
  ): Promise<User | null> {
    const id = this.client.users.resolveId(user);
    if (!id) {
      throw new Error("BAN_RESOLVE_ID");
    }
    await this.client.api.guilds(this.guild.id).bans(id).delete({ reason });
    return this.client.users.resolve(user);
  }

  /**
   * Bulk ban users from a guild, and optionally delete previous messages sent by them.
   * @param {Collection<Snowflake, UserResolvable>|UserResolvable[]} users The users to ban
   * @param {BulkBanOptions} [options] The options for bulk banning users
   * @returns {Promise<BulkBanResult>} Returns an object with `bannedUsers` key containing the IDs of the banned users
   * and the key `failedUsers` with the IDs that could not be banned or were already banned.
   * @example
   * // Bulk ban users by ids (or with user/guild member objects) and delete all their messages from the past 7 days
   * guild.bans.bulkCreate(['84484653687267328'], { deleteMessageSeconds: 7 * 24 * 60 * 60 })
   *   .then(result => {
   *     console.log(`Banned ${result.bannedUsers.length} users, failed to ban ${result.failedUsers.length} users.`)
   *   })
   *   .catch(console.error);
   * @deprecated This method will not be usable until an effective MFA implementation is in place.
   */
  async bulkCreate(
    users:
      | Collection<Snowflake, UserResolvableSource>
      | readonly UserResolvableSource[],
    options: BulkBanOptions = {}
  ): Promise<BulkBanResult> {
    if (!users || !(Array.isArray(users) || users instanceof Collection)) {
      throw new TypeError(
        "INVALID_TYPE",
        "users",
        "Array or Collection of UserResolvable",
        true
      );
    }
    if (typeof options !== "object") {
      throw new TypeError("INVALID_TYPE", "options", "object", true);
    }

    const userIds = (
      users instanceof Collection ? [...users.values()] : users
    ).map((user) => this.client.users.resolveId(user));
    if (userIds.length === 0) {
      throw new Error("BULK_BAN_USERS_OPTION_EMPTY");
    }

    const result = await this.client.api
      .guilds(this.guild.id)
      ["bulk-ban"].post<RESTPostAPIGuildBulkBanResult>({
        data: {
          delete_message_days: options.deleteMessageSeconds,
          user_ids: userIds,
        },
        reason: options.reason,
      });
    return {
      bannedUsers: result.banned_users,
      failedUsers: result.failed_users,
    };
  }
}

export default GuildBanManager;
export { GuildBanManager };
