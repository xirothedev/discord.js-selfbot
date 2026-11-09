import BaseGuild from './BaseGuild';
import _ConstantsModule from '../util/Constants';
const { VerificationLevels, NSFWLevels } = _ConstantsModule;

/**
 * Bundles common attributes and methods between {@link Guild} and {@link InviteGuild}
 * @extends {BaseGuild}
 * @abstract
 */
class AnonymousGuild extends BaseGuild {
  constructor(client: any, data: any, immediatePatch: any = true) {
    super(client, data);
    if (immediatePatch) this._patch(data);
  }

  _patch(data: any) {
    if ('features' in data) this.features = data.features;

    if ('splash' in data) {
      /**
       * The hash of the guild invite splash image
       * @type {?string}
       */
      this.splash = data.splash;
    }

    if ('banner' in data) {
      /**
       * The hash of the guild banner
       * @type {?string}
       */
      this.banner = data.banner;
    }

    if ('description' in data) {
      /**
       * The description of the guild, if any
       * @type {?string}
       */
      this.description = data.description;
    }

    if ('verification_level' in data) {
      /**
       * The verification level of the guild
       * @type {VerificationLevel}
       */
      this.verificationLevel = VerificationLevels[data.verification_level];
    }

    if ('vanity_url_code' in data) {
      /**
       * The vanity invite code of the guild, if any
       * @type {?string}
       */
      this.vanityURLCode = data.vanity_url_code;
    }

    if ('nsfw_level' in data) {
      /**
       * The NSFW level of this guild
       * @type {NSFWLevel}
       */
      this.nsfwLevel = NSFWLevels[data.nsfw_level];
    }

    if ('premium_subscription_count' in data) {
      /**
       * The total number of boosts for this server
       * @type {?number}
       */
      this.premiumSubscriptionCount = data.premium_subscription_count;
    } else {
      this.premiumSubscriptionCount ??= null;
    }
  }

  /**
   * The URL to this guild's banner.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  bannerURL({ format, size }: any = {}) {
    return this.banner && this.client.rest.cdn.Banner(this.id, this.banner, format, size);
  }

  /**
   * The URL to this guild's invite splash image.
   * @param {StaticImageURLOptions} [options={}] Options for the Image URL
   * @returns {?string}
   */
  splashURL({ format, size }: any = {}) {
    return this.splash && this.client.rest.cdn.Splash(this.id, this.splash, format, size);
  }
}

export default AnonymousGuild;
export { AnonymousGuild };
