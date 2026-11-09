import Base from './Base';
import VoiceState from './VoiceState';
import TextBasedChannel from './interfaces/TextBasedChannel';
import _errorsModule from '../errors';
const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { RelationshipTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import UserFlags from '../util/UserFlags';
import Util from '../util/Util';

/**
 * Represents a user on Discord.
 * @implements {TextBasedChannel}
 * @extends {Base}
 */
class User extends Base {
  constructor(client: import('../client/Client').default, data: Record<string, unknown>) {
    super(client);

    /**
     * The user's id
     * @type {Snowflake}
     */
    this.id = data.id;

    this.bot = null;

    this.system = null;

    this.flags = null;

    this._patch(data);
  }

  _patch(data: Record<string, unknown>) {
    if ('username' in data) {
      /**
       * The username of the user
       * @type {?string}
       */
      this.username = data.username;
    } else {
      this.username ??= null;
    }

    if ('global_name' in data) {
      /**
       * The global name of this user
       * @type {?string}
       */
      this.globalName = data.global_name;
    } else {
      this.globalName ??= null;
    }

    if ('bot' in data) {
      /**
       * Whether or not the user is a bot
       * @type {?boolean}
       */
      this.bot = Boolean(data.bot);
    } else if (!this.partial && typeof this.bot !== 'boolean') {
      this.bot = false;
    }

    if ('discriminator' in data) {
      /**
       * The discriminator of this user
       * <info>`'0'`, or a 4-digit stringified number if they're using the legacy username system</info>
       * @type {?string}
       */
      this.discriminator = data.discriminator;
    } else {
      this.discriminator ??= null;
    }

    if ('avatar' in data) {
      /**
       * The user avatar's hash
       * @type {?string}
       */
      this.avatar = data.avatar;
    } else {
      this.avatar ??= null;
    }

    if ('banner' in data) {
      /**
       * The user banner's hash
       * <info>The user must be force fetched for this property to be present or be updated</info>
       * @type {?string}
       */
      this.banner = data.banner;
    } else if (this.banner !== null) {
      this.banner ??= undefined;
    }

    if ('banner_color' in data) {
      /**
       * The user banner's hex
       * <info>The user must be force fetched for this property to be present or be updated</info>
       * @type {?string}
       */
      this.bannerColor = data.banner_color;
    } else if (this.bannerColor !== null) {
      this.bannerColor ??= undefined;
    }

    if ('accent_color' in data) {
      /**
       * The base 10 accent color of the user's banner
       * <info>The user must be force fetched for this property to be present or be updated</info>
       * @type {?number}
       */
      this.accentColor = data.accent_color;
    } else if (this.accentColor !== null) {
      this.accentColor ??= undefined;
    }

    if ('system' in data) {
      /**
       * Whether the user is an Official Discord System user (part of the urgent message system)
       * @type {?boolean}
       */
      this.system = Boolean(data.system);
    } else if (!this.partial && typeof this.system !== 'boolean') {
      this.system = false;
    }

    if ('public_flags' in data) {
      /**
       * The flags for this user
       * @type {?UserFlags}
       */
      this.flags = new UserFlags(data.public_flags as number);
    }

    /**
     * @typedef {Object} AvatarDecorationData
     * @property {string} asset The avatar decoration hash
     * @property {Snowflake} skuId The id of the avatar decoration's SKU
     */

    if (data.avatar_decoration_data) {
      if (data.avatar_decoration_data) {
        /**
         * The user avatar decoration's data
         * @type {?AvatarDecorationData}
         */
        this.avatarDecorationData = {
          asset: (data.avatar_decoration_data as { asset: unknown }).asset as string,
          skuId: (data.avatar_decoration_data as { sku_id: unknown }).sku_id as string,
        };
      } else {
        this.avatarDecorationData = null;
      }
    } else {
      this.avatarDecorationData ??= null;
    }

    /**
     * @typedef {Object} UserPrimaryGuild
     * @property {?Snowflake} identityGuildId The id of the user's primary guild
     * @property {?boolean} identityEnabled Whether the user is displaying the primary guild's tag
     * @property {?string} tag The user's guild tag. Limited to 4 characters
     * @property {?string} badge The guild tag badge hash
     */

    if ('primary_guild' in data) {
      if (data.primary_guild) {
        /**
         * The primary guild of the user
         * @type {?UserPrimaryGuild}
         */
        this.primaryGuild = {
          identityGuildId: (data.primary_guild as { identity_guild_id: unknown }).identity_guild_id as string,
          identityEnabled: (data.primary_guild as { identity_enabled: unknown }).identity_enabled as boolean,
          tag: (data.primary_guild as { tag: unknown }).tag as string,
          badge: (data.primary_guild as { badge: unknown }).badge as string,
        };
      } else {
        this.primaryGuild = null;
      }
    } else {
      this.primaryGuild ??= null;
    }

    /**
     * @typedef {Object} NameplateData
     * @property {Snowflake} skuId The id of the nameplate's SKU
     * @property {string} asset The nameplate's asset path
     * @property {string} label The nameplate's label
     * @property {NameplatePalette} palette Background color of the nameplate
     */

    /**
     * @typedef {Object} Collectibles
     * @property {?NameplateData} nameplate The user's nameplate data
     */

    if (data.collectibles) {
      const coll = data.collectibles as { nameplate?: unknown };
      if (coll.nameplate) {
        /**
         * The user's collectibles
         * @type {?Collectibles}
         */
        this.collectibles = {
          nameplate: {
            skuId: (data.collectibles as { nameplate: { sku_id: unknown } }).nameplate.sku_id as string,
            asset: (data.collectibles as { nameplate: { asset: unknown } }).nameplate.asset as string,
            label: (data.collectibles as { nameplate: { label: unknown } }).nameplate.label as string,
            palette: (data.collectibles as { nameplate: { palette: unknown } }).nameplate.palette as unknown,
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
    return (this.avatarDecorationData as { asset?: string } | null)?.asset || null;
  }

  /**
   * Whether this User is a partial
   * @type {boolean}
   * @readonly
   */
  get partial() {
    return typeof this.username !== 'string';
  }

  /**
   * The timestamp the user was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id as string);
  }

  /**
   * The time the user was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * A link to the user's avatar.
   * @param {ImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  avatarURL({ format, size, dynamic }: { format?: string; size?: number; dynamic?: boolean } = {}) {
    if (!this.avatar) return null;
    return this.client.rest.cdn.Avatar(this.id, this.avatar, format, size, dynamic);
  }

  /**
   * A link to the user's avatar decoration.
   * @returns {?string}
   */
  avatarDecorationURL() {
    if (!this.avatarDecorationData) return null;
    return this.client.rest.cdn.AvatarDecoration((this.avatarDecorationData as { asset: string }).asset);
  }

  /**
   * A link to the user's guild tag badge.
   * @returns {?string}
   * @deprecated
   */
  clanBadgeURL() {
    return this.guildTagBadgeURL();
  }

  /**
   * A link to the user's guild tag badge.
   * @returns {?string}
   */
  guildTagBadgeURL() {
    const pg = this.primaryGuild as { identityGuildId?: string; badge?: string } | null;
    if (!pg || !pg.identityGuildId || !pg.badge) return null;
    return this.client.rest.cdn.GuildTagBadge(pg.identityGuildId, pg.badge);
  }

  /**
   * A link to the user's default avatar
   * @type {string}
   * @readonly
   */
  get defaultAvatarURL() {
    const index =
      this.discriminator === '0' || this.discriminator === '0000'
        ? Util.calculateUserDefaultAvatarIndex(this.id)
        : this.discriminator % 5;
    return this.client.rest.cdn.DefaultAvatar(index);
  }

  /**
   * A link to the user's avatar if they have one.
   * Otherwise a link to their default avatar will be returned.
   * @param {ImageURLOptions} [options={}] Options for the Image URL
   * @returns {string}
   */
  displayAvatarURL(options?: unknown) {
    return this.avatarURL(options as { format?: string; size?: number; dynamic?: boolean }) ?? this.defaultAvatarURL;
  }

  /**
   * The hexadecimal version of the user accent color, with a leading hash
   * <info>The user must be force fetched for this property to be present</info>
   * @type {?string}
   * @readonly
   */
  get hexAccentColor() {
    if (typeof this.accentColor !== 'number') return this.accentColor;
    return `#${this.accentColor.toString(16).padStart(6, '0')}`;
  }

  /**
   * A link to the user's banner.
   * <info>This method will throw an error if called before the user is force fetched.
   * See {@link User#banner} for more info</info>
   * @param {ImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  bannerURL({ format, size, dynamic }: { format?: string; size?: number; dynamic?: boolean } = {}) {
    if (typeof this.banner === 'undefined') throw new Error('USER_BANNER_NOT_FETCHED');
    if (!this.banner) return null;
    return this.client.rest.cdn.Banner(this.id, this.banner, format, size, dynamic);
  }

  /**
   * The tag of this user
   * <info>This user's username, or their legacy tag (e.g. `hydrabolt#0001`)
   * if they're using the legacy username system</info>
   * @type {?string}
   * @readonly
   */
  get tag() {
    return typeof this.username === 'string'
      ? this.discriminator === '0' || this.discriminator === '0000'
        ? this.username
        : `${this.username}#${this.discriminator}`
      : null;
  }

  /**
   * The global name of this user, or their username if they don't have one
   * @type {?string}
   * @readonly
   */
  get displayName() {
    return this.globalName ?? this.username;
  }

  /**
   * The DM between the client's user and this user
   * @type {?DMChannel}
   * @readonly
   */
  get dmChannel() {
    return this.client.users.dmChannel(this.id);
  }

  /**
   * Creates a DM channel between the client and the user.
   * @param {boolean} [force=false] Whether to skip the cache check and request the API
   * @returns {Promise<DMChannel>}
   */
  createDM(force: boolean = false) {
    return this.client.users.createDM(this.id, force);
  }

  /**
   * Deletes a DM channel (if one exists) between the client and the user. Resolves with the channel if successful.
   * @returns {Promise<DMChannel>}
   */
  deleteDM() {
    return this.client.users.deleteDM(this.id);
  }

  /**
   * Checks if the user is equal to another.
   * It compares id, username, discriminator, avatar, banner, accent color, and bot flags.
   * It is recommended to compare equality by using `user.id === user2.id` unless you want to compare all properties.
   * @param {User} user User to compare with
   * @returns {boolean}
   */
  equals(user: User | null) {
    return (
      user &&
      this.id === user.id &&
      this.username === user.username &&
      this.discriminator === user.discriminator &&
      this.globalName === user.globalName &&
      this.avatar === user.avatar &&
      (this.flags as { bitfield?: unknown } | null)?.bitfield ===
        (user as { flags?: { bitfield?: unknown } } | null)?.flags?.bitfield &&
      this.banner === user.banner &&
      this.accentColor === user.accentColor &&
      (this.avatarDecorationData as { asset?: unknown } | null)?.asset ===
        (user as { avatarDecorationData?: { asset?: unknown } } | null)?.avatarDecorationData?.asset &&
      (this.avatarDecorationData as { skuId?: unknown } | null)?.skuId ===
        (user as { avatarDecorationData?: { skuId?: unknown } } | null)?.avatarDecorationData?.skuId &&
      (this.collectibles as { nameplate?: { skuId?: unknown } } | null)?.nameplate?.skuId ===
        (user as { collectibles?: { nameplate?: { skuId?: unknown } } } | null)?.collectibles?.nameplate?.skuId &&
      (this.collectibles as { nameplate?: { asset?: unknown } } | null)?.nameplate?.asset ===
        (user as { collectibles?: { nameplate?: { asset?: unknown } } } | null)?.collectibles?.nameplate?.asset &&
      (this.collectibles as { nameplate?: { label?: unknown } } | null)?.nameplate?.label ===
        (user as { collectibles?: { nameplate?: { label?: unknown } } } | null)?.collectibles?.nameplate?.label &&
      (this.collectibles as { nameplate?: { palette?: unknown } } | null)?.nameplate?.palette ===
        (user as { collectibles?: { nameplate?: { palette?: unknown } } } | null)?.collectibles?.nameplate?.palette &&
      (this.primaryGuild as { identityGuildId?: unknown } | null)?.identityGuildId ===
        (user as { primaryGuild?: { identityGuildId?: unknown } } | null)?.primaryGuild?.identityGuildId &&
      (this.primaryGuild as { identityEnabled?: unknown } | null)?.identityEnabled ===
        (user as { primaryGuild?: { identityEnabled?: unknown } } | null)?.primaryGuild?.identityEnabled &&
      (this.primaryGuild as { tag?: unknown } | null)?.tag ===
        (user as { primaryGuild?: { tag?: unknown } } | null)?.primaryGuild?.tag &&
      (this.primaryGuild as { badge?: unknown } | null)?.badge ===
        (user as { primaryGuild?: { badge?: unknown } } | null)?.primaryGuild?.badge
    );
  }

  /**
   * Compares the user with an API user object
   * @param {APIUser} user The API user object to compare
   * @returns {boolean}
   * @private
   */
  _equals(user: Record<string, unknown>) {
    return (
      user &&
      this.id === user.id &&
      this.username === user.username &&
      this.discriminator === user.discriminator &&
      this.globalName === user.global_name &&
      this.avatar === user.avatar &&
      (this.flags as { bitfield?: unknown } | null)?.bitfield === user.public_flags &&
      ('banner' in user ? this.banner === user.banner : true) &&
      ('accent_color' in user ? this.accentColor === user.accent_color : true) &&
      ('avatar_decoration_data' in user
        ? (this.avatarDecorationData as { asset?: unknown } | null)?.asset ===
            (user.avatar_decoration_data as { asset?: unknown } | null)?.asset &&
          (this.avatarDecorationData as { skuId?: unknown } | null)?.skuId ===
            (user.avatar_decoration_data as { sku_id?: unknown } | null)?.sku_id
        : true) &&
      ('collectibles' in user
        ? (this.collectibles as { nameplate?: { skuId?: unknown } } | null)?.nameplate?.skuId ===
            (user.collectibles as { nameplate?: { sku_id?: unknown } } | null)?.nameplate?.sku_id &&
          (this.collectibles as { nameplate?: { asset?: unknown } } | null)?.nameplate?.asset ===
            (user.collectibles as { nameplate?: { asset?: unknown } } | null)?.nameplate?.asset &&
          (this.collectibles as { nameplate?: { label?: unknown } } | null)?.nameplate?.label ===
            (user.collectibles as { nameplate?: { label?: unknown } } | null)?.nameplate?.label &&
          (this.collectibles as { nameplate?: { palette?: unknown } } | null)?.nameplate?.palette ===
            (user.collectibles as { nameplate?: { palette?: unknown } } | null)?.nameplate?.palette
        : true) &&
      ('primary_guild' in user
        ? (this.primaryGuild as { identityGuildId?: unknown } | null)?.identityGuildId ===
            (user.primary_guild as { identity_guild_id?: unknown } | null)?.identity_guild_id &&
          (this.primaryGuild as { identityEnabled?: unknown } | null)?.identityEnabled ===
            (user.primary_guild as { identity_enabled?: unknown } | null)?.identity_enabled &&
          (this.primaryGuild as { tag?: unknown } | null)?.tag ===
            (user.primary_guild as { tag?: unknown } | null)?.tag &&
          (this.primaryGuild as { badge?: unknown } | null)?.badge ===
            (user.primary_guild as { badge?: unknown } | null)?.badge
        : true)
    );
  }

  /**
   * Fetches this user.
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<User>}
   */
  fetch(force: boolean = true) {
    return this.client.users.fetch(this.id, { force });
  }

  /**
   * Returns a user profile object for a given user ID.
   * <info>This endpoint requires one of the following:
   * - The user is a bot
   * - The user shares a mutual guild with the current user
   * - The user is a friend of the current user
   * - The user is a friend suggestion of the current user
   * - The user has an outgoing friend request to the current user</info>
   * @param {Snowflake} [guildId] The guild ID to get the user's member profile in
   * @returns {Promise<Object>}
   * @see {@link https://discord-userdoccers.vercel.app/resources/user#response-body}
   */
  getProfile(guildId: unknown) {
    return this.client.api.users(this.id).profile.get({
      query: {
        with_mutual_guilds: true,
        with_mutual_friends: true,
        with_mutual_friends_count: true,
        guild_id: guildId,
      },
    });
  }

  /**
   * When concatenated with a string, this automatically returns the user's mention instead of the User object.
   * @returns {string}
   * @example
   * // Logs: Hello from <@123456789012345678>!
   * console.log(`Hello from ${user}!`);
   */
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
      ...props,
    );
    json.avatarURL = this.avatarURL();
    json.displayAvatarURL = this.displayAvatarURL();
    json.bannerURL = this.banner ? this.bannerURL() : this.banner;
    json.guildTagBadgeURL = this.guildTagBadgeURL();
    return json;
  }

  /**
   * The function updates the note of a user and returns the updated user.
   * @param {string|null|undefined} [note=null] - The `note` parameter is the new value that you want to set for the note of the
   * user. It is an optional parameter and its default value is `null`.
   * @returns {Promise<User>} The `setNote` method is returning the `User` object.
   */
  async setNote(note: unknown = null) {
    await this.client.notes.updateNote(this.id, note);
    return this;
  }

  /**
   * The function returns the note associated with a specific client ID from a cache.
   * @type {?string} The note that corresponds to the given id.
   */
  get note() {
    return this.client.notes.cache.get(this.id);
  }

  /**
   * The voice state of this member
   * @type {VoiceState}
   * @readonly
   */
  get voice() {
    return (
      this.client.voiceStates.cache.get(this.id) ??
      this.client.guilds.cache
        .find((g: unknown) =>
          (g as { voiceStates?: { cache: { get: (id: string) => unknown } } } | null)?.voiceStates?.cache?.get(this.id),
        )
        ?.voiceStates?.cache?.get(this.id) ??
      new VoiceState({ client: this.client }, { user_id: this.id })
    );
  }

  /**
   * Send Friend Request to the user
   * @type {boolean}
   * @returns {Promise<boolean>}
   */
  sendFriendRequest() {
    return this.client.relationships.sendFriendRequest(this);
  }

  /**
   * Unblock / Unfriend / Cancels a friend request
   * @type {boolean}
   * @returns {Promise<boolean>}
   */
  deleteRelationship() {
    return this.client.relationships.deleteRelationship(this);
  }

  /**
   * Check relationship status (Client -> User)
   * @type {RelationshipType}
   * @readonly
   */
  get relationship() {
    const i = this.client.relationships.cache.get(this.id) ?? 0;
    return RelationshipTypes[parseInt(i)];
  }

  /**
   * Get friend nickname
   * @type {?string}
   * @readonly
   */
  get friendNickname() {
    return this.client.relationships.friendNicknames.get(this.id);
  }
}

/**
 * Sends a message to this user.
 * @method send
 * @memberof User
 * @instance
 * @param {string|MessagePayload|MessageOptions} options The options to provide
 * @returns {Promise<Message>}
 * @example
 * // Send a direct message
 * user.send('Hello!')
 *   .then(message => console.log(`Sent message: ${message.content} to ${user.tag}`))
 *   .catch(console.error);
 */

TextBasedChannel.applyToClass(User);

/**
 * @external APIUser
 * @see {@link https://discord.com/developers/docs/resources/user#user-object}
 */

export default User;
export { User };
