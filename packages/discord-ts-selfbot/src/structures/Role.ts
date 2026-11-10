import process from 'node:process';
import Base from './Base';
import _errorsModule from '../errors';

const { Error } = _errorsModule;
import Permissions from '../util/Permissions';
import RoleFlags from '../util/RoleFlags';
import SnowflakeUtil from '../util/SnowflakeUtil';
import type { RawRoleData } from '../../typings/rawDataTypes';
import type { RoleEntity } from '../types/entities/role';
import type { PatchOf } from '../types/schema';
import type Client from '../client/Client';
import type { Guild } from './Guild';
import type { GuildMember } from './GuildMember';
import type { GuildChannel } from './GuildChannel';
import type { SetRolePositionOptions } from '../../typings';

let deprecationEmittedForComparePositions = false;

/**
 * @type {WeakSet<Role>}
 * @private
 * @internal
 */
const deletedRoles = new WeakSet();
let deprecationEmittedForDeleted = false;

class Role extends Base implements RoleEntity {
  declare color: RoleEntity['color'];
  declare colors: RoleEntity['colors'];
  declare flags: RoleEntity['flags'];
  declare guild: RoleEntity['guild'];
  declare hoist: RoleEntity['hoist'];
  declare id: RoleEntity['id'];
  declare managed: RoleEntity['managed'];
  declare mentionable: RoleEntity['mentionable'];
  declare name: RoleEntity['name'];
  declare permissions: RoleEntity['permissions'];
  declare rawPosition: RoleEntity['rawPosition'];
  declare tags: RoleEntity['tags'];
  declare icon: RoleEntity['icon'];
  declare unicodeEmoji: RoleEntity['unicodeEmoji'];

  constructor(client: Client, data: RawRoleData, guild: Guild) {
    super(client);

    this.guild = guild;

    this.icon = null;

    this.unicodeEmoji = null;

    if (data) {
      this._patch(data);
    }
  }

  _patch(data: PatchOf<'Role'>) {
    this.id = data.id ?? this.id;
    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.color !== undefined) {
      /**
       * The base 10 color of the role
       * @type {number}
       * @deprecated Use {@link Role#colors} instead.
       */
      this.color = data.color;
    }

    if (data.colors !== undefined) {
      const { colors } = data;
      this.colors = {
        primaryColor: colors.primary_color,
        secondaryColor: colors.secondary_color,
        tertiaryColor: colors.tertiary_color,
      };
    }

    if (data.hoist !== undefined) {
      this.hoist = data.hoist;
    }

    if (data.position !== undefined) {
      this.rawPosition = data.position;
    }

    if (data.permissions !== undefined) {
      this.permissions = new Permissions(BigInt(data.permissions)).freeze();
    }

    if (data.managed !== undefined) {
      this.managed = data.managed;
    }

    if (data.mentionable !== undefined) {
      this.mentionable = data.mentionable;
    }

    if (data.icon !== undefined) {
      this.icon = data.icon;
    }

    if (data.unicode_emoji !== undefined) {
      this.unicodeEmoji = data.unicode_emoji;
    }

    const { tags } = data;
    this.tags = tags ? Role.mapTags(tags) : null;

    if (data.flags === undefined) {
      this.flags ??= new RoleFlags().freeze();
    } else {
      this.flags = new RoleFlags(data.flags).freeze();
    }
  }

  static mapTags(
    tags: NonNullable<PatchOf<'Role'>['tags']>
  ): NonNullable<RoleEntity['tags']> {
    const mapped: NonNullable<RoleEntity['tags']> = {};
    if (tags.bot_id !== undefined) {
      mapped.botId = tags.bot_id;
    }
    if (tags.integration_id !== undefined) {
      mapped.integrationId = tags.integration_id;
    }
    if (tags.premium_subscriber !== undefined) {
      mapped.premiumSubscriberRole = true;
    }
    if (tags.subscription_listing_id !== undefined) {
      mapped.subscriptionListingId = tags.subscription_listing_id;
    }
    if (tags.available_for_purchase !== undefined) {
      mapped.availableForPurchase = true;
    }
    if (tags.guild_connections !== undefined) {
      mapped.guildConnections = true;
    }
    return mapped;
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * Whether or not the role has been deleted
   * @type {boolean}
   * @deprecated This will be removed in the next major version, see https://github.com/discordjs/discord.js/issues/7091
   */
  get deleted() {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Role#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning'
      );
    }

    return deletedRoles.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Role#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning'
      );
    }

    if (value) {
      deletedRoles.add(this);
    } else {
      deletedRoles.delete(this);
    }
  }

  get hexColor() {
    return `#${this.colors.primaryColor.toString(16).padStart(6, '0')}`;
  }

  get members() {
    return this.guild.members.cache.filter((member: GuildMember) =>
      member.roles.cache.has(this.id)
    );
  }

  get editable(): boolean {
    if (this.managed) {
      return false;
    }
    const clientMember: GuildMember | null = this.guild.members.resolve(
      this.client.user
    );
    if (!clientMember?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
      return false;
    }
    return clientMember.roles.highest.comparePositionTo(this) > 0;
  }

  get position() {
    let count = 0;
    for (const role of this.guild.roles.cache.values()) {
      if (this.rawPosition > role.rawPosition) {
        count++;
      } else if (
        this.rawPosition === role.rawPosition &&
        BigInt(this.id) < BigInt(role.id)
      ) {
        count++;
      }
    }

    return count;
  }

  comparePositionTo(role: unknown) {
    return this.guild.roles.comparePositions(this, role);
  }

  edit(data: Record<string, unknown>, reason?: string) {
    return this.guild.roles.edit(this, data, reason);
  }

  permissionsIn(channel: GuildChannel | string, checkAdmin = true) {
    const resolved = this.guild.channels.resolve(channel);
    if (!resolved) {
      throw new Error('GUILD_CHANNEL_RESOLVE');
    }
    return resolved.rolePermissions(this, checkAdmin);
  }

  setName(name: string, reason?: string) {
    return this.edit({ name }, reason);
  }

  /**
   * Sets a new color for the role.
   * @param {ColorResolvable} color The color of the role
   * @param {string} [reason] Reason for changing the role's color
   * @returns {Promise<Role>}
   * @deprecated Use {@link Role#setColors} instead.
   */
  setColor(color: unknown, reason?: string) {
    return this.edit({ color }, reason);
  }

  setColors(colors: unknown, reason?: string) {
    return this.edit({ colors, reason });
  }

  setHoist(hoist = true, reason?: string) {
    return this.edit({ hoist }, reason);
  }

  setPermissions(permissions: unknown, reason?: string) {
    return this.edit({ permissions }, reason);
  }

  setMentionable(mentionable = true, reason?: string) {
    return this.edit({ mentionable }, reason);
  }

  setIcon(icon: unknown, reason?: string) {
    return this.edit({ icon }, reason);
  }

  setUnicodeEmoji(unicodeEmoji: unknown, reason?: string) {
    return this.edit({ unicodeEmoji }, reason);
  }

  setPosition(position: number, options: SetRolePositionOptions = {}) {
    return this.guild.roles.setPosition(this, position, options);
  }

  async delete(reason?: string) {
    await this.guild.roles.delete(this.id, reason);
    return this;
  }

  fetchMemberIds() {
    return this.guild.roles.fetchMemberIds(this.id);
  }

  iconURL({ format, size }: { format?: string; size?: number } = {}) {
    if (!this.icon) {
      return null;
    }
    return this.client.rest.cdn.RoleIcon(this.id, this.icon, format, size);
  }

  equals(role: Role | null) {
    return (
      role &&
      this.id === role.id &&
      this.name === role.name &&
      this.colors.primaryColor === role.colors.primaryColor &&
      this.colors.secondaryColor === role.colors.secondaryColor &&
      this.colors.tertiaryColor === role.colors.tertiaryColor &&
      this.hoist === role.hoist &&
      this.position === role.position &&
      this.permissions.bitfield === role.permissions.bitfield &&
      this.managed === role.managed &&
      this.icon === role.icon &&
      this.unicodeEmoji === role.unicodeEmoji
    );
  }

  toString() {
    if (this.id === this.guild.id) {
      return '@everyone';
    }
    return `<@&${this.id}>`;
  }

  toJSON() {
    return {
      ...super.toJSON({ createdTimestamp: true }),
      permissions: this.permissions.toJSON(),
    };
  }

  /**
   * Compares the positions of two roles.
   * @param {Role} role1 First role to compare
   * @param {Role} role2 Second role to compare
   * @returns {number} Negative number if the first role's position is lower (second role's is higher),
   * positive number if the first's is higher (second's is lower), 0 if equal
   * @deprecated Use {@link RoleManager#comparePositions} instead.
   */
  static comparePositions(role1: Role, role2: Role) {
    if (!deprecationEmittedForComparePositions) {
      process.emitWarning(
        'The Role.comparePositions method is deprecated. Use RoleManager#comparePositions instead.',
        'DeprecationWarning'
      );

      deprecationEmittedForComparePositions = true;
    }

    return role1.guild.roles.comparePositions(role1, role2);
  }
}

export { Role, deletedRoles };
export default { Role, deletedRoles };
