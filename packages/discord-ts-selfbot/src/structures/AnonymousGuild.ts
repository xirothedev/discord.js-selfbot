import BaseGuild from './BaseGuild';
import _ConstantsModule from '../util/Constants';
const { VerificationLevels, NSFWLevels } = _ConstantsModule;
import type { RawAnonymousGuildData } from '../../typings/rawDataTypes';
import type { AnonymousGuildEntity } from '../types/entities/anonymous-guild';
import type { PatchOf } from '../types/schema';
import type { StaticImageURLOptions } from '../../typings';

/**
 * Bundles common attributes and methods between {@link Guild} and {@link InviteGuild}
 * @extends {BaseGuild}
 * @abstract
 */
class AnonymousGuild extends BaseGuild implements AnonymousGuildEntity {
  declare banner: AnonymousGuildEntity['banner'];
  declare description: AnonymousGuildEntity['description'];
  declare nsfwLevel: AnonymousGuildEntity['nsfwLevel'];
  declare premiumSubscriptionCount: AnonymousGuildEntity['premiumSubscriptionCount'];
  declare splash: AnonymousGuildEntity['splash'];
  declare vanityURLCode: AnonymousGuildEntity['vanityURLCode'];
  declare verificationLevel: AnonymousGuildEntity['verificationLevel'];

  constructor(client: import('../client/Client').default, data: RawAnonymousGuildData, immediatePatch = true) {
    super(client, data);
    if (immediatePatch) this._patch(data);
  }

  _patch(data: PatchOf<'AnonymousGuild'>) {
    if ('features' in data && data.features !== undefined) this.features = data.features;

    if ('splash' in data && data.splash !== undefined) {
      /**
       * The hash of the guild invite splash image
       * @type {?string}
       */
      this.splash = data.splash;
    }

    if ('banner' in data && data.banner !== undefined) {
      /**
       * The hash of the guild banner
       * @type {?string}
       */
      this.banner = data.banner;
    }

    if ('description' in data && data.description !== undefined) {
      /**
       * The description of the guild, if any
       * @type {?string}
       */
      this.description = data.description;
    }

    if ('verification_level' in data && data.verification_level !== undefined) {
      /**
       * The verification level of the guild
       * @type {VerificationLevel}
       */
      this.verificationLevel = VerificationLevels[data.verification_level];
    }

    if ('vanity_url_code' in data && data.vanity_url_code !== undefined) {
      /**
       * The vanity invite code of the guild, if any
       * @type {?string}
       */
      this.vanityURLCode = data.vanity_url_code;
    }

    if ('nsfw_level' in data && data.nsfw_level !== undefined) {
      /**
       * The NSFW level of this guild
       * @type {NSFWLevel}
       */
      this.nsfwLevel = NSFWLevels[data.nsfw_level];
    }

    if ('premium_subscription_count' in data && data.premium_subscription_count !== undefined) {
      /**
       * The total number of boosts for this server
       * @type {?number}
       */
      this.premiumSubscriptionCount = data.premium_subscription_count ?? null;
    } else {
      this.premiumSubscriptionCount ??= null;
    }
  }

  /**
   * The URL to this guild's banner.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  bannerURL({ format, size }: StaticImageURLOptions = {}) {
    return this.banner && this.client.rest.cdn.Banner(this.id, this.banner, format, size);
  }

  /**
   * The URL to this guild's invite splash image.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  splashURL({ format, size }: StaticImageURLOptions = {}) {
    return this.splash && this.client.rest.cdn.Splash(this.id, this.splash, format, size);
  }
}

export default AnonymousGuild;
export { AnonymousGuild };
