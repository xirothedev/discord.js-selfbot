import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
import process from "node:process";
import Base from "./Base";
import VoiceState from "./VoiceState";
import _errorsModule from "../errors";

const { Error } = _errorsModule;
import GuildMemberRoleManager from "../managers/GuildMemberRoleManager";
import GuildMemberFlags from "../util/GuildMemberFlags";
import Permissions from "../util/Permissions";
import type { RawGuildMemberData } from "../../typings/rawDataTypes";
import type { ImageURLOptions } from "../../typings";
import type { GuildMemberEntity } from "../types/entities/guild-member";
import type { PatchOf } from "../types/schema";
import type Client from "../client/Client";
import type { Guild } from "./Guild";
import type { Presence } from "./Presence";
import type { Role } from "./Role";
import type { GuildChannel } from "./GuildChannel";

/**
 * @type {WeakSet<GuildMember>}
 * @private
 * @internal
 */
const deletedGuildMembers = new WeakSet();
let deprecationEmittedForDeleted = false;

class GuildMember extends Base implements GuildMemberEntity {
  declare avatar: GuildMemberEntity["avatar"];
  declare avatarDecorationData: GuildMemberEntity["avatarDecorationData"];
  declare banner: GuildMemberEntity["banner"];
  declare communicationDisabledUntilTimestamp: GuildMemberEntity["communicationDisabledUntilTimestamp"];
  declare flags: GuildMemberEntity["flags"];
  declare guild: GuildMemberEntity["guild"];
  declare joinedTimestamp: GuildMemberEntity["joinedTimestamp"];
  declare nickname: GuildMemberEntity["nickname"];
  declare pending: GuildMemberEntity["pending"];
  declare premiumSinceTimestamp: GuildMemberEntity["premiumSinceTimestamp"];
  declare user: GuildMemberEntity["user"];
  declare _roles: GuildMemberEntity["_roles"];

  constructor(client: Client, data: RawGuildMemberData, guild: Guild) {
    super(client);

    this.guild = guild;

    this.joinedTimestamp = null;

    this.premiumSinceTimestamp = null;

    this.nickname = null;

    this.pending = false;

    this.communicationDisabledUntilTimestamp = null;

    this._roles = [];
    if (data) {
      this._patch(data);
    }
  }

  _patch(data: PatchOf<"GuildMember">) {
    if (data.user !== undefined) {
      this.user = this.client.users._add(data.user, true);
    }

    if (data.nick !== undefined) {
      this.nickname = data.nick;
    }
    if (data.avatar !== undefined) {
      this.avatar = data.avatar;
    } else if (typeof this.avatar !== "string") {
      this.avatar = null;
    }
    if (data.banner === undefined) {
      this.banner ??= null;
    } else {
      this.banner = data.banner;
    }

    if (data.joined_at !== undefined && data.joined_at !== null) {
      this.joinedTimestamp = new Date(data.joined_at).getTime();
    }
    if (data.premium_since !== undefined) {
      this.premiumSinceTimestamp = data.premium_since
        ? new Date(data.premium_since).getTime()
        : null;
    }
    if (data.roles !== undefined) {
      this._roles = data.roles;
    }
    this.pending = data.pending ?? false;

    if (data.communication_disabled_until !== undefined) {
      this.communicationDisabledUntilTimestamp =
        data.communication_disabled_until
          ? Date.parse(data.communication_disabled_until)
          : null;
    }
    if (data.flags === undefined) {
      this.flags ??= new GuildMemberFlags().freeze();
    } else {
      this.flags = new GuildMemberFlags(data.flags).freeze();
    }

    this.avatarDecorationData = data.avatar_decoration_data
      ? {
          asset: data.avatar_decoration_data.asset,
          skuId: data.avatar_decoration_data.sku_id,
        }
      : null;
  }

  _clone() {
    const clone = super._clone();
    clone._roles = [...this._roles];
    return clone;
  }

  /**
   * Whether or not the structure has been deleted
   * @type {boolean}
   * @deprecated This will be removed in the next major version, see https://github.com/discordjs/discord.js/issues/7091
   */
  get deleted() {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        "GuildMember#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.",
        "DeprecationWarning"
      );
    }

    return deletedGuildMembers.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        "GuildMember#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.",
        "DeprecationWarning"
      );
    }

    if (value) {
      deletedGuildMembers.add(this);
    } else {
      deletedGuildMembers.delete(this);
    }
  }

  get partial() {
    return this.joinedTimestamp === null;
  }

  get roles() {
    return new GuildMemberRoleManager(this);
  }

  get voice() {
    return (
      this.guild.voiceStates.cache.get(this.id) ??
      new VoiceState(this.guild.client, this.guild, { user_id: this.id })
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

  avatarURL({ format, size, dynamic }: ImageURLOptions = {}) {
    if (!this.avatar) {
      return null;
    }
    return this.client.rest.cdn.GuildMemberAvatar(
      this.guild.id,
      this.id,
      this.avatar,
      format,
      size,
      dynamic
    );
  }

  bannerURL({ format, size, dynamic }: ImageURLOptions = {}) {
    return (
      this.banner &&
      this.client.rest.cdn.GuildMemberBanner(
        this.guild.id,
        this.id,
        this.banner,
        format,
        size,
        dynamic
      )
    );
  }

  displayAvatarDecorationURL() {
    return this.avatarDecorationURL() ?? this.user.avatarDecorationURL();
  }

  displayAvatarURL(options?: ImageURLOptions) {
    return this.avatarURL(options) ?? this.user.displayAvatarURL(options);
  }

  displayBannerURL(options?: ImageURLOptions) {
    return this.bannerURL(options) ?? this.user.bannerURL(options);
  }

  get joinedAt() {
    return this.joinedTimestamp ? new Date(this.joinedTimestamp) : null;
  }

  get communicationDisabledUntil() {
    return (
      this.communicationDisabledUntilTimestamp &&
      new Date(this.communicationDisabledUntilTimestamp)
    );
  }

  get premiumSince() {
    return this.premiumSinceTimestamp
      ? new Date(this.premiumSinceTimestamp)
      : null;
  }

  get presence(): Presence | null {
    return this.guild.presences.cache.get(this.id) ?? null;
  }

  get displayColor(): number {
    return this.roles.color?.colors.primaryColor ?? 0;
  }

  get displayHexColor() {
    return this.roles.color?.hexColor ?? "#000000";
  }

  get id() {
    return this.user.id;
  }

  get displayName() {
    return this.nickname ?? this.user.displayName;
  }

  get permissions() {
    if (this.user.id === this.guild.ownerId) {
      return new Permissions(Permissions.ALL).freeze();
    }
    return new Permissions(
      this.roles.cache.map((role: Role) => role.permissions.bitfield)
    ).freeze();
  }

  get manageable(): boolean {
    if (this.user.id === this.guild.ownerId) {
      return false;
    }
    if (this.user.id === this.client.user?.id) {
      return false;
    }
    if (this.client.user?.id === this.guild.ownerId) {
      return true;
    }
    if (!this.guild.members.me) {
      throw new Error("GUILD_UNCACHED_ME");
    }
    return (
      this.guild.members.me.roles.highest.comparePositionTo(
        this.roles.highest
      ) > 0
    );
  }

  get kickable() {
    const { me } = this.guild.members;
    return (
      this.manageable &&
      Boolean(me?.permissions.has(Permissions.FLAGS.KICK_MEMBERS))
    );
  }

  get bannable() {
    const { me } = this.guild.members;
    return (
      this.manageable &&
      Boolean(me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS))
    );
  }

  get moderatable() {
    return (
      !this.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
      this.manageable &&
      (this.guild.members.me?.permissions.has(
        Permissions.FLAGS.MODERATE_MEMBERS
      ) ??
        false)
    );
  }

  isCommunicationDisabled(): this is GuildMember & {
    communicationDisabledUntilTimestamp: number;
  } {
    return (
      this.communicationDisabledUntilTimestamp !== null &&
      this.communicationDisabledUntilTimestamp > Date.now()
    );
  }

  permissionsIn(channel: GuildChannel | string) {
    const resolved = this.guild.channels.resolve(channel);
    if (!resolved) {
      throw new Error("GUILD_CHANNEL_RESOLVE");
    }
    return resolved.permissionsFor(this);
  }

  edit(data: Record<string, unknown>, reason?: string) {
    return this.guild.members.edit(this, data, reason);
  }

  setNickname(nick: string | null, reason?: string) {
    return this.edit({ nick }, reason);
  }

  setFlags(flags: unknown, reason?: string) {
    return this.edit({ flags, reason });
  }

  createDM(force = false) {
    return this.user.createDM(force);
  }

  deleteDM() {
    return this.user.deleteDM();
  }

  kick(reason?: string) {
    return this.guild.members.kick(this, reason);
  }

  ban(options: Record<string, unknown> = {}) {
    return this.guild.bans.create(this, options);
  }

  disableCommunicationUntil(
    communicationDisabledUntil: Date | number | string | null,
    reason?: string
  ) {
    return this.edit({ communicationDisabledUntil }, reason);
  }

  timeout(timeout: number | null, reason?: string) {
    return this.disableCommunicationUntil(
      timeout && Date.now() + timeout,
      reason
    );
  }

  fetch(force = true) {
    return this.guild.members.fetch({ cache: true, force, user: this.id });
  }

  equals(member: GuildMember | null) {
    return (
      member instanceof GuildMember &&
      this.id === member.id &&
      this.partial === member.partial &&
      this.guild.id === member.guild.id &&
      this.joinedTimestamp === member.joinedTimestamp &&
      this.nickname === member.nickname &&
      this.avatar === member.avatar &&
      this.banner === member.banner &&
      this.pending === member.pending &&
      this.communicationDisabledUntilTimestamp ===
        member.communicationDisabledUntilTimestamp &&
      this.flags.bitfield === member.flags.bitfield &&
      (this._roles === member._roles ||
        (this._roles.length === member._roles.length &&
          this._roles.every((role, index) => role === member._roles[index]))) &&
      this.avatarDecorationData?.asset === member.avatarDecorationData?.asset &&
      this.avatarDecorationData?.skuId === member.avatarDecorationData?.skuId
    );
  }

  toString() {
    return `<@${this.nickname ? "!" : ""}${this.user.id}>`;
  }

  toJSON() {
    const json = super.toJSON({
      displayName: true,
      guild: "guildId",
      roles: true,
      user: "userId",
    });
    json.avatarURL = this.avatarURL();
    json.bannerURL = this.bannerURL();
    json.displayAvatarURL = this.displayAvatarURL();
    json.displayBannerURL = this.displayBannerURL();
    json.avatarDecorationURL = this.avatarDecorationURL();
    return json;
  }

  setAvatar(avatar: unknown) {
    return this.edit({ avatar });
  }

  setBanner(banner: unknown) {
    return this.edit({ banner });
  }

  setAboutMe(bio: string | null = null) {
    return this.edit({ bio });
  }
}

export { GuildMember, deletedGuildMembers };
export default { GuildMember, deletedGuildMembers };

setTimeout(() => {
  try {
    const TextBasedChannel = require("./interfaces/TextBasedChannel");
    TextBasedChannel.applyToClass(GuildMember);
  } catch {
    // The channel mixin is optional during early circular imports.
  }
}, 0);
