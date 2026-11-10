import Base from './Base';
import type { GuildResolvable } from '../../typings';
import type { SelfbotGuildBoostData } from '../types/selfbot/guild-boost';
import type { GuildBoostEntity } from '../types/entities/guild-boost';
import type { PatchOf } from '../types/schema';
import type Client from '../client/Client';

class GuildBoost extends Base implements GuildBoostEntity {
  declare id: GuildBoostEntity['id'];
  declare guildId: GuildBoostEntity['guildId'];
  declare subscriptionId: GuildBoostEntity['subscriptionId'];
  declare premiumGuildSubscriptionId: GuildBoostEntity['premiumGuildSubscriptionId'];
  declare ended: GuildBoostEntity['ended'];
  declare canceled: GuildBoostEntity['canceled'];
  declare cooldownEndsAt: GuildBoostEntity['cooldownEndsAt'];

  constructor(client: Client, data: SelfbotGuildBoostData) {
    super(client);
    this._patch(data);
  }

  _patch(data: PatchOf<'GuildBoost'>) {
    if (data.id !== undefined) {
      this.id = data.id;
    }
    if (data.subscription_id !== undefined) {
      this.subscriptionId = data.subscription_id;
    }
    if (data.premium_guild_subscription) {
      this.premiumGuildSubscriptionId = data.premium_guild_subscription.id;
      this.guildId = data.premium_guild_subscription.guild_id;
      this.ended = data.premium_guild_subscription.ended;
    }
    if (data.canceled === undefined) {
      this.canceled ??= false;
    } else {
      this.canceled = data.canceled;
    }
    if (data.cooldown_ends_at) {
      this.cooldownEndsAt = new Date(data.cooldown_ends_at);
    } else {
      this.cooldownEndsAt ??= new Date(0);
    }
  }
  get guild() {
    return this.guildId
      ? (this.client.guilds.cache.get(this.guildId) ?? null)
      : null;
  }

  async unsubscribe() {
    // https://discord.com/api/v9/guilds/:id/premium/subscriptions/:id
    if (!this.guildId) {
      throw new Error('BOOST_UNUSED');
    }
    if (!this.premiumGuildSubscriptionId) {
      throw new Error('BOOST_UNCACHED');
    }
    await this.client.api
      .guilds(this.guildId)
      .premium.subscriptions(this.premiumGuildSubscriptionId)
      .delete();
    this.guildId = undefined;
    this.premiumGuildSubscriptionId = undefined;
    this.ended = undefined;
    return this;
  }

  async subscribe(guild: GuildResolvable) {
    // https://discord.com/api/v9/guilds/:id/premium/subscriptions
    if (this.guildId || this.premiumGuildSubscriptionId) {
      throw new Error('BOOST_USED');
    }
    const id = this.client.guilds.resolveId(guild);
    if (!id) {
      throw new Error('UNKNOWN_GUILD');
    }
    const d = await this.client.api
      .guilds(id)
      .premium.subscriptions.put<
        NonNullable<SelfbotGuildBoostData['premium_guild_subscription']>
      >({
        data: {
          user_premium_guild_subscription_slot_ids: [this.id],
        },
      });
    this._patch({
      premium_guild_subscription: d,
    });
    return this;
  }
}

export default GuildBoost;
export { GuildBoost };
