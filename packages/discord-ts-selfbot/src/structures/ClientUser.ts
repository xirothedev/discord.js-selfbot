import { setInterval } from 'node:timers';
import { Collection } from '@discordjs/collection';
import Invite, { type RawInviteDataSource } from './Invite';
import User from './User';
import DataResolver from '../util/DataResolver';
import PremiumUsageFlags from '../util/PremiumUsageFlags';
import PurchasedFlags from '../util/PurchasedFlags';
import Util from '../util/Util';
import type { SelfbotClientUserData } from '../types/selfbot/user';
import type { APIUser } from 'discord-api-types/v10';
import type { RawInviteData } from '../../typings/rawDataTypes';
import type { ClientUserEntity } from '../types/entities/client-user';
import type { PatchOf } from '../types/schema';

class ClientUser extends User implements ClientUserEntity {
  declare mfaEnabled: ClientUserEntity['mfaEnabled'];
  declare verified: ClientUserEntity['verified'];
  declare purchasedFlags: ClientUserEntity['purchasedFlags'];
  declare premiumUsageFlags: ClientUserEntity['premiumUsageFlags'];
  declare phone: ClientUserEntity['phone'];
  declare nsfwAllowed: ClientUserEntity['nsfwAllowed'];
  declare email: ClientUserEntity['email'];
  declare bio: ClientUserEntity['bio'];
  declare pronouns: ClientUserEntity['pronouns'];
  declare premiumType: ClientUserEntity['premiumType'];
  #packageName: string | null = null;

  constructor(client: import('../client/Client').default, data: SelfbotClientUserData) {
    super(client, data);
    setInterval(
      () => {
        this.client.emit('debug', `[UPDATE] Samsung Presence: ${this.#packageName}`);
        if (!this.#packageName) return;
        this.setSamsungActivity(this.#packageName, 'UPDATE');
      },
      1000 * 60 * 10,
    ).unref();
  }

  _patch(data: PatchOf<'ClientUser'>) {
    super._patch(data);

    if (data.verified !== undefined) {
      this.verified = data.verified;
    } else {
      this.verified ??= false;
    }

    this.mfaEnabled = Boolean(data.mfa_enabled);

    if (data.token !== undefined) this.client.token = data.token;

    this.purchasedFlags = new PurchasedFlags(data.purchased_flags ?? 0).freeze();

    this.premiumUsageFlags = new PremiumUsageFlags(data.premium_usage_flags ?? 0).freeze();

    if (data.phone !== undefined) {
      this.phone = data.phone;
    } else {
      this.phone ??= null;
    }

    if (data.nsfw_allowed !== undefined) {
      this.nsfwAllowed = data.nsfw_allowed;
    }

    if (data.email !== undefined) {
      this.email = data.email;
    } else {
      this.email ??= null;
    }

    if (data.bio !== undefined) {
      this.bio = data.bio;
    }

    if (data.pronouns !== undefined) {
      this.pronouns = data.pronouns;
    }

    if (data.premium_type !== undefined) {
      this.premiumType = data.premium_type;
    } else {
      this.premiumType ??= 0;
    }
  }

  get presence() {
    return this.client.presence;
  }

  async edit(options: Record<string, unknown> = {}) {
    const data = await this.client.api.users('@me').patch<APIUser>({ data: options });
    const { updated } = this.client.actions.UserUpdate.handle(data);
    return updated ?? this;
  }

  setUsername(username: string, password: string) {
    return this.edit({ username, password });
  }

  async setAvatar(avatar: unknown) {
    avatar = avatar && (await DataResolver.resolveImage(avatar));
    return this.edit({ avatar });
  }

  setPresence(data: Record<string, unknown>) {
    return this.client.presence.set(data);
  }

  setStatus(status: import('../../typings').PresenceStatusData, shardId?: number | number[]) {
    return this.setPresence({ status, shardId });
  }

  setActivity(name: unknown, options: Record<string, unknown> = {}) {
    if (!name) return this.setPresence({ activities: [], shardId: options.shardId });

    const activity = Object.assign({}, options, typeof name === 'object' ? name : { name });
    return this.setPresence({ activities: [activity], shardId: activity.shardId });
  }

  setAFK(afk: unknown = true, shardId: unknown) {
    return this.setPresence({ afk, shardId });
  }

  async setBanner(banner: unknown) {
    banner = banner && (await DataResolver.resolveImage(banner));
    return this.edit({ banner });
  }

  setHypeSquad(type: unknown) {
    switch (type) {
      case 'LEAVE': {
        type = 0;
        break;
      }
      case 'HOUSE_BRAVERY': {
        type = 1;
        break;
      }
      case 'HOUSE_BRILLIANCE': {
        type = 2;
        break;
      }
      case 'HOUSE_BALANCE': {
        type = 3;
        break;
      }
    }
    if (type == 0) {
      return this.client.api.hypesquad.online.delete();
    } else {
      return this.client.api.hypesquad.online.post({
        data: { house_id: type },
      });
    }
  }

  setAccentColor(color: unknown = null) {
    return this.edit({ accent_color: color ? Util.resolveColor(color) : null });
  }

  setAboutMe(bio: string | null = null) {
    return this.edit({ bio });
  }

  async createFriendInvite() {
    const data = await this.client.api.users['@me'].invites.post<RawInviteDataSource>({
      data: {},
    });
    return new Invite(this.client, data);
  }

  async getAllFriendInvites() {
    const data = await this.client.api.users['@me'].invites.get<RawInviteData[]>();
    const collection = new Collection();
    for (const invite of data) {
      collection.set(invite.code, new Invite(this.client, invite));
    }
    return collection;
  }

  revokeAllFriendInvites() {
    return this.client.api.users['@me'].invites.delete();
  }

  async setSamsungActivity(packageName: string, type: 'START' | 'UPDATE' | 'STOP' = 'START') {
    const t = type.toUpperCase();
    if (!packageName) throw new Error('Package name is required.');
    if (!['START', 'UPDATE', 'STOP'].includes(t)) throw new Error('Invalid type (Must be START, UPDATE, or STOP)');
    await this.client.api.presences.post({
      data: {
        package_name: packageName,
        update: t,
      },
    });
    if (t !== 'STOP') this.#packageName = packageName;
    else this.#packageName = null;
    return this;
  }

  stopRinging(channel: unknown) {
    return this.client.api.channels(this.client.channels.resolveId(channel), 'call', 'stop-ringing').post({
      data: {},
    });
  }

  fetchBurstCredit(): Promise<number> {
    return this.client.api.users['@me']['burst-credits'].get<{ amount: number }>().then(data => data.amount);
  }

  setGlobalName(globalName: string | null = '') {
    return this.edit({ global_name: globalName });
  }

  setPronouns(pronouns: string | null = '') {
    return this.edit({ pronouns });
  }
}

export default ClientUser;
export { ClientUser };
