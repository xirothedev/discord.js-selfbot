import BaseGuild from './BaseGuild';
import _ConstantsModule from '../util/Constants';

const { VerificationLevels, NSFWLevels } = _ConstantsModule;
import type { RawAnonymousGuildData } from '../../typings/rawDataTypes';
import type { AnonymousGuildEntity } from '../types/entities/anonymous-guild';
import type { PatchOf } from '../types/schema';
import type { StaticImageURLOptions } from '../../typings';
import type Client from '../client/Client';

class AnonymousGuild extends BaseGuild implements AnonymousGuildEntity {
  declare banner: AnonymousGuildEntity['banner'];
  declare description: AnonymousGuildEntity['description'];
  declare nsfwLevel: AnonymousGuildEntity['nsfwLevel'];
  declare premiumSubscriptionCount: AnonymousGuildEntity['premiumSubscriptionCount'];
  declare splash: AnonymousGuildEntity['splash'];
  declare vanityURLCode: AnonymousGuildEntity['vanityURLCode'];
  declare verificationLevel: AnonymousGuildEntity['verificationLevel'];

  constructor(
    client: Client,
    data: RawAnonymousGuildData,
    immediatePatch = true
  ) {
    super(client, data);
    if (immediatePatch) {
      this._patch(data);
    }
  }

  _patch(data: PatchOf<'AnonymousGuild'>) {
    if ('features' in data && data.features !== undefined) {
      this.features = data.features;
    }

    if ('splash' in data && data.splash !== undefined) {
      this.splash = data.splash;
    }

    if ('banner' in data && data.banner !== undefined) {
      this.banner = data.banner;
    }

    if ('description' in data && data.description !== undefined) {
      this.description = data.description;
    }

    if ('verification_level' in data && data.verification_level !== undefined) {
      this.verificationLevel = VerificationLevels[data.verification_level];
    }

    if ('vanity_url_code' in data && data.vanity_url_code !== undefined) {
      this.vanityURLCode = data.vanity_url_code;
    }

    if ('nsfw_level' in data && data.nsfw_level !== undefined) {
      this.nsfwLevel = NSFWLevels[data.nsfw_level];
    }

    if (
      'premium_subscription_count' in data &&
      data.premium_subscription_count !== undefined
    ) {
      this.premiumSubscriptionCount = data.premium_subscription_count ?? null;
    } else {
      this.premiumSubscriptionCount ??= null;
    }
  }

  bannerURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    return (
      this.banner &&
      this.client.rest.cdn.Banner(this.id, this.banner, format, size)
    );
  }

  splashURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    return (
      this.splash &&
      this.client.rest.cdn.Splash(this.id, this.splash, format, size)
    );
  }
}

export default AnonymousGuild;
export { AnonymousGuild };
