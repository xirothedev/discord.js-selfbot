import { setInterval } from 'node:timers';
import { Collection } from '@discordjs/collection';
import Invite from './Invite';
import type { RawInviteDataSource } from './Invite';
import User from './User';
import DataResolver from '../util/DataResolver';
import PremiumUsageFlags from '../util/PremiumUsageFlags';
import PurchasedFlags from '../util/PurchasedFlags';
import Util from '../util/Util';
import type { SelfbotClientUserData } from '../types/selfbot/user';
import type { APIUser, Snowflake } from 'discord-api-types/v10';
import type {
  RawConnectionData,
  RawInviteData,
} from '../../typings/rawDataTypes';
import type { ClientUserEntity } from '../types/entities/client-user';
import type { PatchOf } from '../types/schema';
import type Client from '../client/Client';
import type { Connection, PresenceStatusData } from '../../typings';

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
  declare locale: ClientUserEntity['locale'];
  #packageName: string | null = null;

  constructor(client: Client, data: SelfbotClientUserData) {
    super(client, data);
    setInterval(
      () => {
        this.client.emit(
          'debug',
          `[UPDATE] Samsung Presence: ${this.#packageName}`
        );
        if (!this.#packageName) {
          return;
        }
        this.setSamsungActivity(this.#packageName, 'UPDATE');
      },
      1000 * 60 * 10
    ).unref();
  }

  _patch(data: PatchOf<'ClientUser'>) {
    super._patch(data);

    if (data.verified === undefined) {
      this.verified ??= false;
    } else {
      this.verified = data.verified;
    }

    this.mfaEnabled = Boolean(data.mfa_enabled);

    if (data.token !== undefined) {
      this.client.token = data.token;
    }

    this.purchasedFlags = new PurchasedFlags(
      data.purchased_flags ?? 0
    ).freeze();

    this.premiumUsageFlags = new PremiumUsageFlags(
      data.premium_usage_flags ?? 0
    ).freeze();

    if (data.phone === undefined) {
      this.phone ??= null;
    } else {
      this.phone = data.phone;
    }

    if (data.nsfw_allowed !== undefined) {
      this.nsfwAllowed = data.nsfw_allowed;
    }

    if (data.email === undefined) {
      this.email ??= null;
    } else {
      this.email = data.email;
    }

    if (data.bio !== undefined) {
      this.bio = data.bio;
    }

    if (data.pronouns !== undefined) {
      this.pronouns = data.pronouns;
    }

    if (data.premium_type === undefined) {
      this.premiumType ??= 0;
    } else {
      this.premiumType = data.premium_type;
    }

    if (data.locale === undefined) {
      this.locale ??= null;
    } else {
      this.locale = data.locale;
    }
  }

  get presence() {
    return this.client.presence;
  }

  async edit(options: Record<string, unknown> = {}) {
    const data = await this.client.api
      .users('@me')
      .patch<APIUser>({ data: options });
    const { updated } = this.client.actions.UserUpdate.handle(data);
    return updated ?? this;
  }

  setUsername(username: string, password: string) {
    return this.edit({ password, username });
  }

  async setAvatar(avatar: unknown) {
    const resolvedAvatar = avatar && (await DataResolver.resolveImage(avatar));
    return this.edit({ avatar: resolvedAvatar });
  }

  setPresence(data: Record<string, unknown>) {
    return this.client.presence.set(data);
  }

  setStatus(status: PresenceStatusData, shardId?: number | number[]) {
    return this.setPresence({ shardId, status });
  }

  setActivity(name: unknown, options: Record<string, unknown> = {}) {
    if (!name) {
      return this.setPresence({ activities: [], shardId: options.shardId });
    }

    const activity = Object.assign(
      {},
      options,
      typeof name === 'object' ? name : { name }
    );
    return this.setPresence({
      activities: [activity],
      shardId: activity.shardId,
    });
  }

  setAFK(afk: unknown = true, shardId?: unknown) {
    return this.setPresence({ afk, shardId });
  }

  async setBanner(banner: unknown) {
    const resolvedBanner = banner && (await DataResolver.resolveImage(banner));
    return this.edit({ banner: resolvedBanner });
  }

  setHypeSquad(type: unknown) {
    let houseId = type;
    switch (type) {
      case 'LEAVE': {
        houseId = 0;
        break;
      }
      case 'HOUSE_BRAVERY': {
        houseId = 1;
        break;
      }
      case 'HOUSE_BRILLIANCE': {
        houseId = 2;
        break;
      }
      case 'HOUSE_BALANCE': {
        houseId = 3;
        break;
      }
      default: {
        break;
      }
    }
    if (houseId === 0) {
      return this.client.api.hypesquad.online.delete();
    }
    return this.client.api.hypesquad.online.post({
      data: { house_id: houseId },
    });
  }

  setAccentColor(color: unknown = null) {
    return this.edit({ accent_color: color ? Util.resolveColor(color) : null });
  }

  setAboutMe(bio: string | null = null) {
    return this.edit({ bio });
  }

  async createFriendInvite() {
    const data = await this.client.api.users[
      '@me'
    ].invites.post<RawInviteDataSource>({
      data: {},
    });
    return new Invite(this.client, data);
  }

  async getAllFriendInvites() {
    const data =
      await this.client.api.users['@me'].invites.get<RawInviteData[]>();
    const collection = new Collection();
    for (const invite of data) {
      collection.set(invite.code, new Invite(this.client, invite));
    }
    return collection;
  }

  revokeAllFriendInvites() {
    return this.client.api.users['@me'].invites.delete();
  }

  async setSamsungActivity(
    packageName: string,
    type: 'START' | 'UPDATE' | 'STOP' = 'START'
  ) {
    const normalizedType = type.toUpperCase();
    if (!packageName) {
      throw new Error('Package name is required.');
    }
    if (!['START', 'UPDATE', 'STOP'].includes(normalizedType)) {
      throw new Error('Invalid type (Must be START, UPDATE, or STOP)');
    }
    await this.client.api.presences.post({
      data: {
        package_name: packageName,
        update: normalizedType,
      },
    });
    this.#packageName = normalizedType === 'STOP' ? null : packageName;
    return this;
  }

  stopRinging(channel: unknown) {
    return this.client.api
      .channels(this.client.channels.resolveId(channel), 'call', 'stop-ringing')
      .post({
        data: {},
      });
  }

  fetchBurstCredit(): Promise<number> {
    return this.client.api.users['@me']['burst-credits']
      .get<{ amount: number }>()
      .then((data) => data.amount);
  }

  async fetchConnections(): Promise<Collection<string, Connection>> {
    const data =
      await this.client.api.users['@me'].connections.get<RawConnectionData[]>();
    const connections = new Collection<string, Connection>();
    for (const connection of data) {
      connections.set(connection.id, {
        friendSync: connection.friend_sync,
        id: connection.id,
        integrations: connection.integrations ?? [],
        metadataVisibility: connection.metadata_visibility ?? 0,
        name: connection.name,
        revoked: connection.revoked ?? false,
        showActivity: connection.show_activity,
        twoWayLink: connection.two_way_link,
        type: connection.type,
        verified: connection.verified,
        visibility: connection.visibility,
      });
    }
    return connections;
  }

  async setApplicationIdentityConfig(
    applicationId: Snowflake,
    externalUserId: string,
    options: { connectionVisible?: string } = {}
  ): Promise<void> {
    await this.client.api.users['@me']
      ['application-identities'](applicationId)(externalUserId)('config')
      .patch({
        data: { connection_visible: options.connectionVisible },
      });
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
