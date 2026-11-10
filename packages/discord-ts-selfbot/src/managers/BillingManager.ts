import { Collection } from '@discordjs/collection';
import BaseManager from './BaseManager';
import GuildBoost from '../structures/GuildBoost';
import type { Client } from '../client/Client';
import type { SelfbotGuildBoostData } from '../types/selfbot/guild-boost';

interface BillingEntity {
  id: string;
  [key: string]: unknown;
}

function isBillingEntity(value: unknown): value is BillingEntity {
  return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string';
}

function isGuildBoostData(value: BillingEntity): value is BillingEntity & SelfbotGuildBoostData {
  return (
    'subscription_id' in value ||
    'premium_guild_subscription' in value ||
    'canceled' in value ||
    'cooldown_ends_at' in value
  );
}

/**
 * Manages the API methods of a data model.
 * @extends {CachedManager}
 */
class BillingManager extends BaseManager {
  declare paymentSources: Collection<string, Record<string, unknown>>;
  declare guildBoosts: Collection<string, GuildBoost>;
  declare currentSubscription: Collection<string, Record<string, unknown>>;

  constructor(client: Client) {
    super(client);
    /**
     * All the payment sources of the client
     * @type {Collection<Snowflake, Object>}
     */
    this.paymentSources = new Collection();
    /**
     * All the guild boosts of the client
     * @type {Collection<Snowflake, GuildBoost>}
     */
    this.guildBoosts = new Collection();
    /**
     * The current subscription of the client
     * @type {Collection<Snowflake, Object>}
     */
    this.currentSubscription = new Collection();
  }

  /**
   * Fetches all the payment sources of the client
   * @returns {Collection<Snowflake, Object>}
   */
  async fetchPaymentSources() {
    // https://discord.com/api/v9/users/@me/billing/payment-sources
    const d: unknown = await this.client.api.users('@me').billing['payment-sources'].get();
    // ! TODO: Create a PaymentSource class
    this.paymentSources = new Collection(
      Array.isArray(d) ? d.filter(isBillingEntity).map(source => [source.id, source]) : [],
    );
    return this.paymentSources;
  }

  /**
   * Fetches all the guild boosts of the client
   * @returns {Collection<Snowflake, GuildBoost>}
   */
  async fetchGuildBoosts() {
    // https://discord.com/api/v9/users/@me/guilds/premium/subscription-slots
    const d: unknown = await this.client.api.users('@me').guilds.premium['subscription-slots'].get();
    this.guildBoosts = new Collection(
      Array.isArray(d)
        ? d
            .filter(isBillingEntity)
            .filter(isGuildBoostData)
            .map(source => [source.id, new GuildBoost(this.client, source)])
        : [],
    );
    return this.guildBoosts;
  }

  /**
   * Fetches the current subscription of the client
   * @returns {Collection<Snowflake, Object>}
   */
  async fetchCurrentSubscription() {
    // https://discord.com/api/v9/users/@me/billing/subscriptions
    const d: unknown = await this.client.api.users('@me').billing.subscriptions.get();
    this.currentSubscription = new Collection(
      Array.isArray(d) ? d.filter(isBillingEntity).map(source => [source.id, source]) : [],
    );
    return this.currentSubscription;
  }
}

export default BillingManager;
export { BillingManager };
