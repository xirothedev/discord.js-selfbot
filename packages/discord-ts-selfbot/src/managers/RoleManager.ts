import process from "node:process";
import { Collection } from "@discordjs/collection";
import CachedManager from "./CachedManager";
import _errorsModule from "../errors";

const { TypeError } = _errorsModule;
import _RoleModule from "../structures/Role";

const { Role } = _RoleModule;
import DataResolver from "../util/DataResolver";
import Permissions from "../util/Permissions";
import Util from "../util/Util";

const { resolveColor } = Util;
import type {
  RESTPostAPIGuildRoleResult,
  Snowflake,
} from "discord-api-types/v10";
import type { RawRoleData } from "../../typings/rawDataTypes";
import type {
  BaseFetchOptions,
  CreateRoleOptions,
  RoleData,
  RoleResolvable,
  SetRolePositionOptions,
  UserResolvable,
} from "../../typings";
import type { Guild } from "../structures/Guild";
import type { Role as RoleStructure } from "../structures/Role";

type RoleResolvableSource = RoleStructure | RoleResolvable;

interface RolePositionSource {
  role: RoleResolvableSource;
  position: number;
}

let cacheWarningEmitted = false;
let deprecationEmittedForCreate = false;
let deprecationEmittedForEdit = false;

class RoleManager extends CachedManager<RoleStructure> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<RoleStructure>) {
    super(guild.client, Role, iterable);
    if (!cacheWarningEmitted && this._cache.constructor.name !== "Collection") {
      cacheWarningEmitted = true;
      process.emitWarning(
        `Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
        "UnsupportedCacheOverwriteWarning"
      );
    }

    this.guild = guild;
  }

  _add(data: RawRoleData, cache = true): RoleStructure {
    return super._add(data, cache, { extras: [this.guild] });
  }

  async fetch(
    id: Snowflake,
    options?: BaseFetchOptions
  ): Promise<RoleStructure | null>;
  async fetch(
    id?: undefined,
    options?: BaseFetchOptions
  ): Promise<Collection<Snowflake, RoleStructure>>;
  async fetch(
    id?: Snowflake,
    { cache = true, force = false }: BaseFetchOptions = {}
  ): Promise<RoleStructure | Collection<Snowflake, RoleStructure> | null> {
    if (id && !force) {
      const existing = this.cache.get(id);
      if (existing) {
        return existing;
      }
    }

    // We cannot fetch a single role, as of this commit's date, Discord API throws with 405
    const data: RawRoleData[] = await this.client.api
      .guilds(this.guild.id)
      .roles.get();
    const roles = new Collection<Snowflake, RoleStructure>();
    for (const role of data) {
      roles.set(role.id, this._add(role, cache));
    }
    return id ? (roles.get(id) ?? null) : roles;
  }

  async fetchMemberCounts() {
    const data = await this.client.api
      .guilds(this.guild.id)
      .roles("member-counts")
      .get();

    return data;
  }

  async fetchMemberIds(role: RoleResolvableSource): Promise<Snowflake[]> {
    const id = this.resolveId(role);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "role", "RoleResolvable");
    }

    const data: Snowflake[] = await this.client.api
      .guilds(this.guild.id)
      .roles(id, "member-ids")
      .get();

    return data;
  }

  async create(options: CreateRoleOptions = {}): Promise<RoleStructure> {
    let { icon } = options;
    let permissions: unknown = options.permissions;
    const { name, color, hoist, position, mentionable, reason, unicodeEmoji } =
      options;

    if (permissions !== undefined) {
      permissions = new Permissions(permissions);
    }
    if (icon) {
      const guildEmojiURL = this.guild.emojis.resolve(icon)?.url;
      icon = guildEmojiURL
        ? await DataResolver.resolveImage(guildEmojiURL)
        : await DataResolver.resolveImage(icon);
      if (typeof icon !== "string") {
        icon = undefined;
      }
    }

    let colors:
      | {
          primary_color: number;
          secondary_color: number | null;
          tertiary_color: number | null;
        }
      | undefined = options.colors && {
      primary_color: resolveColor(options.colors.primaryColor),
      secondary_color: options.colors.secondaryColor
        ? resolveColor(options.colors.secondaryColor)
        : null,
      tertiary_color: options.colors.tertiaryColor
        ? resolveColor(options.colors.tertiaryColor)
        : null,
    };

    if (color !== undefined) {
      if (!deprecationEmittedForCreate) {
        process.emitWarning(
          `Passing "color" to RoleManager#create() is deprecated. Use "colors" instead.`
        );
      }

      deprecationEmittedForCreate = true;

      colors = {
        primary_color: resolveColor(color),
        secondary_color: null,
        tertiary_color: null,
      };
    }

    const data = await this.client.api
      .guilds(this.guild.id)
      .roles.post<RESTPostAPIGuildRoleResult>({
        data: {
          colors,
          hoist,
          icon,
          mentionable,
          name,
          permissions,
          unicode_emoji: unicodeEmoji,
        },
        reason,
      });
    const { role } = this.client.actions.GuildRoleCreate.handle({
      guild_id: this.guild.id,
      role: data,
    });
    if (!role) {
      throw new TypeError("INVALID_TYPE", "role", "RoleResolvable");
    }
    if (position) {
      return this.setPosition(role, position, { reason });
    }
    return role;
  }

  async edit(
    role: RoleResolvableSource,
    data: RoleData,
    reason?: string
  ): Promise<RoleStructure> {
    const resolved = this.resolve(role);
    if (!resolved) {
      throw new TypeError("INVALID_TYPE", "role", "RoleResolvable");
    }

    if (typeof data.position === "number") {
      await this.setPosition(resolved, data.position, { reason });
    }

    let { icon } = data;
    if (icon) {
      const guildEmojiURL = this.guild.emojis.resolve(icon)?.url;
      icon = guildEmojiURL
        ? await DataResolver.resolveImage(guildEmojiURL)
        : await DataResolver.resolveImage(icon);
      if (typeof icon !== "string") {
        icon = undefined;
      }
    }

    let colors:
      | {
          primary_color: number;
          secondary_color: number | null;
          tertiary_color: number | null;
        }
      | undefined = data.colors && {
      primary_color: resolveColor(data.colors.primaryColor),
      secondary_color: data.colors.secondaryColor
        ? resolveColor(data.colors.secondaryColor)
        : null,
      tertiary_color: data.colors.tertiaryColor
        ? resolveColor(data.colors.tertiaryColor)
        : null,
    };

    if (data.color !== undefined) {
      if (!deprecationEmittedForEdit) {
        process.emitWarning(
          `Passing "color" to RoleManager#edit() is deprecated. Use "colors" instead.`
        );
      }

      deprecationEmittedForEdit = true;

      colors = {
        primary_color: resolveColor(data.color),
        secondary_color: null,
        tertiary_color: null,
      };
    }

    const _data = {
      colors,
      hoist: data.hoist,
      icon,
      mentionable: data.mentionable,
      name: data.name,
      permissions:
        data.permissions === undefined
          ? undefined
          : new Permissions(data.permissions),
      unicode_emoji: data.unicodeEmoji,
    };

    const d = await this.client.api
      .guilds(this.guild.id)
      .roles(resolved.id)
      .patch({ data: _data, reason });

    const clone = resolved._clone();
    clone._patch(d);
    return clone;
  }

  async delete(role: RoleResolvableSource, reason?: string): Promise<void> {
    const id = this.resolveId(role);
    if (!id) {
      throw new TypeError("INVALID_TYPE", "role", "RoleResolvable");
    }
    await this.client.api.guilds[this.guild.id].roles[id].delete({ reason });
    this.client.actions.GuildRoleDelete.handle({
      guild_id: this.guild.id,
      role_id: id,
    });
  }

  async setPosition(
    role: RoleResolvableSource,
    position: number,
    { relative, reason }: SetRolePositionOptions = {}
  ): Promise<RoleStructure> {
    const resolved = this.resolve(role);
    if (!resolved) {
      throw new TypeError("INVALID_TYPE", "role", "RoleResolvable");
    }
    const updatedRoles = await Util.setPosition(
      resolved,
      position,
      Boolean(relative),
      this.guild._sortedRoles(),
      this.client.api.guilds(this.guild.id).roles,
      reason
    );

    this.client.actions.GuildRolesPositionUpdate.handle({
      guild_id: this.guild.id,
      roles: updatedRoles,
    });
    return resolved;
  }

  async setPositions(rolePositions: readonly RolePositionSource[]) {
    // Make sure rolePositions are prepared for API
    const positions = rolePositions.map((o) => ({
      id: this.resolveId(o.role),
      position: o.position,
    }));

    // Call the API to update role positions
    await this.client.api.guilds(this.guild.id).roles.patch({
      data: positions,
    });
    return this.client.actions.GuildRolesPositionUpdate.handle({
      guild_id: this.guild.id,
      roles: positions,
    }).guild;
  }

  comparePositions(role1: unknown, role2: unknown): number {
    const resolvedRole1 = this.resolve(role1);
    const resolvedRole2 = this.resolve(role2);
    if (!resolvedRole1 || !resolvedRole2) {
      throw new TypeError("INVALID_TYPE", "role", "Role nor a Snowflake");
    }

    const role1Position = resolvedRole1.position;
    const role2Position = resolvedRole2.position;

    if (role1Position === role2Position) {
      return Number(BigInt(resolvedRole2.id) - BigInt(resolvedRole1.id));
    }

    return role1Position - role2Position;
  }

  botRoleFor(user: UserResolvable): RoleStructure | null {
    const userId = this.client.users.resolveId(user);
    if (!userId) {
      return null;
    }
    return this.cache.find((role) => role.tags?.botId === userId) ?? null;
  }

  get everyone() {
    return this.cache.get(this.guild.id);
  }

  get premiumSubscriberRole(): RoleStructure | null {
    return this.cache.find((role) => role.tags?.premiumSubscriberRole) ?? null;
  }

  get highest(): RoleStructure {
    const highest = this.cache.first();
    if (!highest) {
      throw new Error("GUILD_UNCACHED_ROLE_RESOLVE");
    }
    let result = highest;
    for (const role of this.cache.values()) {
      if (role.comparePositionTo(result) > 0) {
        result = role;
      }
    }
    return result;
  }
}

export default RoleManager;
export { RoleManager };
