import Base from "./Base";
import VoiceState from "./VoiceState";
import TextBasedChannel from "./interfaces/TextBasedChannel";
import _errorsModule from "../errors";

const { Error } = _errorsModule;
import _ConstantsModule from "../util/Constants";

const { RelationshipTypes } = _ConstantsModule;
import SnowflakeUtil from "../util/SnowflakeUtil";
import UserFlags from "../util/UserFlags";
import Util from "../util/Util";
import type { APIUser } from "discord-api-types/v10";
import type { ImageURLOptions } from "../../typings";
import type { SelfbotUserData } from "../types/selfbot/user";
import type { UserEntity } from "../types/entities/user";
import type { PatchOf } from "../types/schema";
import type { SendOptions } from "../types/channels";
import type { SendResult } from "../types/channels";
import type Client from "../client/Client";
import type { VoiceState as VoiceStateType } from "./VoiceState";
import type { Guild } from "./Guild";

class User extends Base implements UserEntity {
  declare send: (options: SendOptions) => SendResult;
  declare accentColor: UserEntity["accentColor"];
  declare avatar: UserEntity["avatar"];
  declare avatarDecorationData: UserEntity["avatarDecorationData"];
  declare banner: UserEntity["banner"];
  declare bannerColor: UserEntity["bannerColor"];
  declare bot: UserEntity["bot"];
  declare collectibles: UserEntity["collectibles"];
  declare discriminator: UserEntity["discriminator"];
  declare flags: UserEntity["flags"];
  declare globalName: UserEntity["globalName"];
  declare id: UserEntity["id"];
  declare primaryGuild: UserEntity["primaryGuild"];
  declare system: UserEntity["system"];
  declare username: UserEntity["username"];

  constructor(client: Client, data: SelfbotUserData) {
    super(client);

    this.id = data.id;

    this.bot = false;

    this.system = false;

    this.flags = null;

    this._patch(data);
  }

  _patch(data: PatchOf<"User">) {
    if (data.username !== undefined) {
      this.username = data.username;
    }

    if (data.global_name === undefined) {
      this.globalName ??= null;
    } else {
      this.globalName = data.global_name;
    }

    if (data.bot !== undefined) {
      this.bot = Boolean(data.bot);
    } else if (!this.partial) {
      this.bot = false;
    }

    if (data.discriminator !== undefined) {
      this.discriminator = data.discriminator;
    }

    if (data.avatar === undefined) {
      this.avatar ??= null;
    } else {
      this.avatar = data.avatar;
    }

    if (data.banner !== undefined) {
      this.banner = data.banner;
    } else if (this.banner !== null) {
      this.banner ??= undefined;
    }

    if (data.banner_color !== undefined) {
      this.bannerColor = data.banner_color;
    } else if (this.bannerColor !== null) {
      this.bannerColor ??= undefined;
    }

    if (data.accent_color !== undefined) {
      this.accentColor = data.accent_color;
    } else if (this.accentColor !== null) {
      this.accentColor ??= undefined;
    }

    if (data.system !== undefined) {
      this.system = Boolean(data.system);
    } else if (!this.partial) {
      this.system = false;
    }

    if (data.public_flags !== undefined) {
      this.flags = new UserFlags(data.public_flags).freeze();
    }

    if (data.avatar_decoration_data === undefined) {
      this.avatarDecorationData ??= null;
    } else {
      if (data.avatar_decoration_data) {
        this.avatarDecorationData = {
          asset: data.avatar_decoration_data.asset,
          skuId: data.avatar_decoration_data.sku_id,
        };
      } else {
        this.avatarDecorationData = null;
      }
    }

    if (data.primary_guild === undefined) {
      this.primaryGuild ??= null;
    } else {
      if (data.primary_guild) {
        this.primaryGuild = {
          identityGuildId: data.primary_guild.identity_guild_id,
          identityEnabled: data.primary_guild.identity_enabled,
          tag: data.primary_guild.tag,
          badge: data.primary_guild.badge,
        };
      } else {
        this.primaryGuild = null;
      }
    }

    if (data.collectibles) {
      if (data.collectibles.nameplate) {
        this.collectibles = {
          nameplate: {
            asset: data.collectibles.nameplate.asset,
            label: data.collectibles.nameplate.label,
            palette: data.collectibles.nameplate.palette,
            skuId: data.collectibles.nameplate.sku_id,
          },
        };
      } else {
        this.collectibles = { nameplate: null };
      }
    } else {
      this.collectibles ??= null;
    }
  }

  /**
   * The primary clan the user is in
   * @type {?PrimaryGuild}
   * @deprecated Use `primaryGuild` instead
   */
  get clan() {
    return this.primaryGuild;
  }

  /**
   * The user avatar decoration's hash
   * @type {?string}
   * @deprecated Use `avatarDecorationData` instead
   * Removed in v4
   */
  get avatarDecoration() {
    return this.avatarDecorationData?.asset ?? null;
  }

  get partial() {
    return typeof this.username !== "string";
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  avatarURL({ format = "webp", size, dynamic }: ImageURLOptions = {}) {
    if (!this.avatar) {
      return null;
    }
    return this.client.rest.cdn.Avatar(
      this.id,
      this.avatar,
      format,
      size,
      dynamic
    );
  }

  avatarDecorationURL() {
    if (!this.avatarDecorationData) {
      return null;
    }
    return this.client.rest.cdn.AvatarDecoration(
      this.avatarDecorationData.asset
    );
  }

  /**
   * A link to the user's guild tag badge.
   * @returns {?string}
   * @deprecated
   */
  clanBadgeURL() {
    return this.guildTagBadgeURL();
  }

  guildTagBadgeURL() {
    const pg = this.primaryGuild;
    if (!pg?.identityGuildId || !pg.badge) {
      return null;
    }
    return this.client.rest.cdn.GuildTagBadge(pg.identityGuildId, pg.badge);
  }

  get defaultAvatarURL() {
    const index =
      this.discriminator === "0" || this.discriminator === "0000"
        ? Util.calculateUserDefaultAvatarIndex(this.id)
        : Number(this.discriminator) % 5;
    return this.client.rest.cdn.DefaultAvatar(index);
  }

  displayAvatarURL(options?: ImageURLOptions) {
    return this.avatarURL(options) ?? this.defaultAvatarURL;
  }

  get hexAccentColor() {
    if (typeof this.accentColor !== "number") {
      return this.accentColor;
    }
    return `#${this.accentColor.toString(16).padStart(6, "0")}`;
  }

  bannerURL({ format = "webp", size, dynamic }: ImageURLOptions = {}) {
    if (this.banner === undefined) {
      throw new Error("USER_BANNER_NOT_FETCHED");
    }
    if (!this.banner) {
      return null;
    }
    return this.client.rest.cdn.Banner(
      this.id,
      this.banner,
      format,
      size,
      dynamic
    );
  }

  get tag() {
    return typeof this.username === "string"
      ? this.discriminator === "0" || this.discriminator === "0000"
        ? this.username
        : `${this.username}#${this.discriminator}`
      : null;
  }

  get displayName() {
    return this.globalName ?? this.username;
  }

  get dmChannel() {
    return this.client.users.dmChannel(this.id);
  }

  createDM(force = false) {
    return this.client.users.createDM(this.id, { force });
  }

  deleteDM() {
    return this.client.users.deleteDM(this.id);
  }

  equals(user: User | null) {
    return (
      user &&
      this.id === user.id &&
      this.username === user.username &&
      this.discriminator === user.discriminator &&
      this.globalName === user.globalName &&
      this.avatar === user.avatar &&
      this.flags?.bitfield === user.flags?.bitfield &&
      this.banner === user.banner &&
      this.accentColor === user.accentColor &&
      this.avatarDecorationData?.asset === user.avatarDecorationData?.asset &&
      this.avatarDecorationData?.skuId === user.avatarDecorationData?.skuId &&
      this.collectibles?.nameplate?.skuId ===
        user.collectibles?.nameplate?.skuId &&
      this.collectibles?.nameplate?.asset ===
        user.collectibles?.nameplate?.asset &&
      this.collectibles?.nameplate?.label ===
        user.collectibles?.nameplate?.label &&
      this.collectibles?.nameplate?.palette ===
        user.collectibles?.nameplate?.palette &&
      this.primaryGuild?.identityGuildId ===
        user.primaryGuild?.identityGuildId &&
      this.primaryGuild?.identityEnabled ===
        user.primaryGuild?.identityEnabled &&
      this.primaryGuild?.tag === user.primaryGuild?.tag &&
      this.primaryGuild?.badge === user.primaryGuild?.badge
    );
  }

  _equals(user: APIUser) {
    return (
      user &&
      this.id === user.id &&
      this.username === user.username &&
      this.discriminator === user.discriminator &&
      this.globalName === user.global_name &&
      this.avatar === user.avatar &&
      this.flags?.bitfield === user.public_flags &&
      (user.banner === undefined ? true : this.banner === user.banner) &&
      (user.accent_color === undefined
        ? true
        : this.accentColor === user.accent_color) &&
      (user.avatar_decoration_data === undefined
        ? true
        : this.avatarDecorationData?.asset ===
            user.avatar_decoration_data?.asset &&
          this.avatarDecorationData?.skuId ===
            user.avatar_decoration_data?.sku_id) &&
      (user.collectibles === undefined
        ? true
        : this.collectibles?.nameplate?.skuId ===
            user.collectibles?.nameplate?.sku_id &&
          this.collectibles?.nameplate?.asset ===
            user.collectibles?.nameplate?.asset &&
          this.collectibles?.nameplate?.label ===
            user.collectibles?.nameplate?.label &&
          this.collectibles?.nameplate?.palette ===
            user.collectibles?.nameplate?.palette) &&
      (user.primary_guild === undefined
        ? true
        : this.primaryGuild?.identityGuildId ===
            user.primary_guild?.identity_guild_id &&
          this.primaryGuild?.identityEnabled ===
            user.primary_guild?.identity_enabled &&
          this.primaryGuild?.tag === user.primary_guild?.tag &&
          this.primaryGuild?.badge === user.primary_guild?.badge)
    );
  }

  fetch(force = true) {
    return this.client.users.fetch(this.id, { force });
  }

  getProfile(guildId?: string) {
    return this.client.api.users(this.id).profile.get({
      query: {
        guild_id: guildId,
        with_mutual_friends: true,
        with_mutual_friends_count: true,
        with_mutual_guilds: true,
      },
    });
  }

  toString() {
    return `<@${this.id}>`;
  }

  toJSON(...props: unknown[]) {
    const json = super.toJSON(
      {
        createdTimestamp: true,
        defaultAvatarURL: true,
        hexAccentColor: true,
        tag: true,
      },
      ...props
    );
    json.avatarURL = this.avatarURL();
    json.displayAvatarURL = this.displayAvatarURL();
    json.bannerURL = this.banner ? this.bannerURL() : this.banner;
    json.guildTagBadgeURL = this.guildTagBadgeURL();
    return json;
  }

  async setNote(note: string | null = null) {
    await this.client.notes.updateNote(this.id, note);
    return this;
  }

  get note() {
    return this.client.notes.cache.get(this.id);
  }

  get voice(): VoiceStateType {
    return (
      this.client.voiceStates.cache.get(this.id) ??
      this.client.guilds.cache
        .find((g: Guild) => g.voiceStates.cache.get(this.id))
        ?.voiceStates.cache.get(this.id) ??
      new VoiceState(this.client, null, { user_id: this.id })
    );
  }

  sendFriendRequest() {
    return this.client.relationships.sendFriendRequest(this);
  }

  deleteRelationship() {
    return this.client.relationships.deleteRelationship(this);
  }

  get relationship() {
    const i = this.client.relationships.cache.get(this.id) ?? 0;
    return RelationshipTypes[i];
  }

  get friendNickname() {
    return this.client.relationships.friendNicknames.get(this.id);
  }
}

TextBasedChannel.applyToClass(User);

export default User;
export { User };
