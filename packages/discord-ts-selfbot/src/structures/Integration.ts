import Base from './Base';
import IntegrationApplication from './IntegrationApplication';
import type { Role } from './Role';
import type { RawIntegrationData } from '../../typings/rawDataTypes';
import type { IntegrationEntity } from '../types/entities/integration';
import type { PatchOf } from '../types/schema';

/**
 * The information account for an integration
 * @typedef {Object} IntegrationAccount
 * @property {Snowflake|string} id The id of the account
 * @property {string} name The name of the account
 */

/**
 * The type of an {@link Integration}. This can be:
 * * `twitch`
 * * `youtube`
 * * `discord`
 * * `guild_subscription`
 * @typedef {string} IntegrationType
 */

/**
 * Represents a guild integration.
 * @extends {Base}
 */
class Integration extends Base implements IntegrationEntity {
  declare account: IntegrationEntity['account'];
  declare application: IntegrationEntity['application'];
  declare enabled: IntegrationEntity['enabled'];
  declare expireBehavior: IntegrationEntity['expireBehavior'];
  declare expireGracePeriod: IntegrationEntity['expireGracePeriod'];
  declare guild: IntegrationEntity['guild'];
  declare id: IntegrationEntity['id'];
  declare name: IntegrationEntity['name'];
  declare role: IntegrationEntity['role'];
  declare enableEmoticons: IntegrationEntity['enableEmoticons'];
  declare syncedAt: IntegrationEntity['syncedAt'];
  declare syncing: IntegrationEntity['syncing'];
  declare type: IntegrationEntity['type'];
  declare user: IntegrationEntity['user'];
  declare subscriberCount: IntegrationEntity['subscriberCount'];
  declare revoked: IntegrationEntity['revoked'];
  constructor(client: import('../client/Client').default, data: RawIntegrationData, guild: import('./Guild').Guild) {
    super(client);

    /**
     * The guild this integration belongs to
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * The integration id
     * @type {Snowflake|string}
     */
    this.id = data.id;

    /**
     * The integration name
     * @type {string}
     */
    this.name = data.name;

    /**
     * The integration type
     * @type {IntegrationType}
     */
    this.type = data.type;

    /**
     * Whether this integration is enabled
     * @type {boolean}
     */
    this.enabled = data.enabled;

    /**
     * Whether this integration is syncing
     * @type {?boolean}
     */
    this.syncing = data.syncing;

    /**
     * The role that this integration uses for subscribers
     * @type {?Role}
     */
    this.role = this.guild.roles.cache.get(data.role_id);

    if ('enable_emoticons' in data) {
      /**
       * Whether emoticons should be synced for this integration (twitch only currently)
       * @type {?boolean}
       */
      this.enableEmoticons = data.enable_emoticons ?? null;
    } else {
      this.enableEmoticons ??= null;
    }

    if (data.user) {
      /**
       * The user for this integration
       * @type {?User}
       */
      this.user = this.client.users._add(data.user);
    } else {
      this.user = null;
    }

    /**
     * The account integration information
     * @type {IntegrationAccount}
     */
    this.account = data.account;

    /**
     * The last time this integration was last synced
     * @type {?number}
     */
    this.syncedAt = data.synced_at ? Date.parse(data.synced_at) : undefined;

    if ('subscriber_count' in data) {
      /**
       * How many subscribers this integration has
       * @type {?number}
       */
      this.subscriberCount = data.subscriber_count ?? null;
    } else {
      this.subscriberCount ??= null;
    }

    if ('revoked' in data) {
      /**
       * Whether this integration has been revoked
       * @type {?boolean}
       */
      this.revoked = data.revoked ?? null;
    } else {
      this.revoked ??= null;
    }

    this._patch(data);
  }

  /**
   * All roles that are managed by this integration
   * @type {Collection<Snowflake, Role>}
   * @readonly
   */
  get roles() {
    const roles = this.guild.roles.cache;
    return roles.filter((role: Role) => role.tags?.integrationId === this.id);
  }

  _patch(data: PatchOf<'Integration'>) {
    if ('expire_behavior' in data) {
      /**
       * The behavior of expiring subscribers
       * @type {?number}
       */
      this.expireBehavior = data.expire_behavior;
    }

    if ('expire_grace_period' in data) {
      /**
       * The grace period before expiring subscribers
       * @type {?number}
       */
      this.expireGracePeriod = data.expire_grace_period;
    }

    if ('application' in data) {
      if (this.application) {
        this.application._patch(data.application);
      } else {
        /**
         * The application for this integration
         * @type {?IntegrationApplication}
         */
        this.application = new IntegrationApplication(this.client, data.application);
      }
    } else {
      this.application ??= null;
    }
  }

  /**
   * Deletes this integration.
   * @returns {Promise<Integration>}
   * @param {string} [reason] Reason for deleting this integration
   */
  async delete(reason?: string) {
    await this.client.api.guilds(this.guild.id).integrations(this.id).delete({ reason });
    return this;
  }

  toJSON() {
    return super.toJSON({
      role: 'roleId',
      guild: 'guildId',
      user: 'userId',
    });
  }
}

export default Integration;
export { Integration };
