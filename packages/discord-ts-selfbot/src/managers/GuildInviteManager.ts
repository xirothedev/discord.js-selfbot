import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';

const { Error } = _errorsModule;
import Invite from '../structures/Invite';
import DataResolver from '../util/DataResolver';
import type {
  RESTPostAPIChannelInviteResult,
  Snowflake,
} from 'discord-api-types/v10';
import type { RawInviteData } from '../../typings/rawDataTypes';
import type { RawInviteDataSource } from '../structures/Invite';
import type {
  ApplicationResolvable,
  CreateInviteOptions,
  GuildInvitableChannelResolvable,
  InviteResolvable,
  UserResolvable,
} from '../../typings';
import type { Guild } from '../structures/Guild';
import type { GuildChannel } from '../structures/GuildChannel';
import type { User } from '../structures/User';
import type { GuildMember } from '../structures/GuildMember';
import type { Message } from '../structures/Message';
import type { ThreadMember } from '../structures/ThreadMember';

type UserResolvableSource =
  | User
  | GuildMember
  | Message
  | ThreadMember
  | Snowflake
  | UserResolvable;
type GuildInvitableChannelSource =
  | GuildChannel
  | GuildInvitableChannelResolvable;

interface ApplicationResolvableSource {
  id?: Snowflake;
  applicationId?: Snowflake;
}

interface FetchInviteOptionsSource {
  code: string;
  cache?: boolean;
  force?: boolean;
}

interface FetchInvitesOptionsSource {
  channelId?: GuildInvitableChannelSource;
  cache?: boolean;
}

export type CreateInviteOptionsSource = Omit<
  CreateInviteOptions,
  'targetUser' | 'targetApplication'
> & {
  targetUser?: UserResolvableSource;
  targetApplication?: ApplicationResolvableSource | ApplicationResolvable;
};

class GuildInviteManager extends CachedManager<Invite> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<Invite>) {
    super(guild.client, Invite, iterable);

    this.guild = guild;
  }

  _add(data: RawInviteDataSource, cache = true): Invite {
    return super._add(data, cache, { extras: [this.guild], id: data.code });
  }

  fetch(options: InviteResolvable | FetchInviteOptionsSource): Promise<Invite>;
  fetch(
    options?: FetchInvitesOptionsSource
  ): Promise<Collection<string, Invite>>;
  async fetch(
    options?:
      | InviteResolvable
      | FetchInviteOptionsSource
      | FetchInvitesOptionsSource
  ): Promise<Invite | Collection<string, Invite>> {
    if (!options) {
      return this._fetchMany();
    }
    if (typeof options === 'string') {
      const code = DataResolver.resolveInviteCode(options);
      if (!code) {
        throw new Error('INVITE_RESOLVE_CODE');
      }
      return this._fetchSingle({ cache: true, code });
    }
    if (!('code' in options)) {
      if (options.channelId) {
        const id = this.guild.channels.resolveId(options.channelId);
        if (!id) {
          throw new Error('GUILD_CHANNEL_RESOLVE');
        }
        return this._fetchChannelMany(id, options.cache);
      }

      if ('cache' in options) {
        return this._fetchMany(options.cache);
      }
      throw new Error('INVITE_RESOLVE_CODE');
    }
    const code = DataResolver.resolveInviteCode(options.code);
    if (!code) {
      throw new Error('INVITE_RESOLVE_CODE');
    }
    return this._fetchSingle({ ...options, code });
  }

  async _fetchSingle({
    code,
    cache,
    force = false,
  }: FetchInviteOptionsSource): Promise<Invite> {
    if (!force) {
      const existing = this.cache.get(code);
      if (existing) {
        return existing;
      }
    }

    const invites = await this._fetchMany(cache);
    const invite = invites.get(code);
    if (!invite) {
      throw new Error('INVITE_NOT_FOUND');
    }
    return invite;
  }

  async _fetchMany(cache?: boolean): Promise<Collection<string, Invite>> {
    const data: RawInviteData[] = await this.client.api
      .guilds(this.guild.id)
      .invites.get();
    const invites = new Collection<string, Invite>();
    for (const invite of data) {
      invites.set(invite.code, this._add(invite, cache));
    }
    return invites;
  }
  async _fetchChannelMany(
    channelId: Snowflake,
    cache?: boolean
  ): Promise<Collection<string, Invite>> {
    const data: RawInviteData[] = await this.client.api
      .channels(channelId)
      .invites.get();
    const invites = new Collection<string, Invite>();
    for (const invite of data) {
      invites.set(invite.code, this._add(invite, cache));
    }
    return invites;
  }

  async create(
    channel: GuildInvitableChannelSource,
    {
      temporary = false,
      maxAge = 86_400,
      maxUses = 0,
      unique,
      targetUser,
      targetApplication,
      targetType,
      reason,
    }: CreateInviteOptionsSource = {}
  ): Promise<Invite> {
    const id = this.guild.channels.resolveId(channel);
    if (!id) {
      throw new Error('GUILD_CHANNEL_RESOLVE');
    }

    const target = targetApplication;
    let targetApplicationId: string | undefined;
    if (typeof target === 'string') {
      targetApplicationId = target;
    } else if (target && typeof target === 'object') {
      if ('id' in target && typeof target.id === 'string') {
        targetApplicationId = target.id;
      } else if (
        'applicationId' in target &&
        typeof target.applicationId === 'string'
      ) {
        targetApplicationId = target.applicationId;
      }
    }

    const invite = await this.client.api
      .channels(id)
      .invites.post<RESTPostAPIChannelInviteResult>({
        data: {
          max_age: maxAge,
          max_uses: maxUses,
          target_application_id: targetApplicationId,
          target_type: targetType,
          target_user_id: this.client.users.resolveId(targetUser),
          temporary,
          unique,
        },
        reason,
      });
    return new Invite(this.client, invite);
  }

  async delete(
    invite: InviteResolvable | Invite,
    reason?: string
  ): Promise<void> {
    const code = DataResolver.resolveInviteCode(invite);

    await this.client.api.invites(code).delete({ reason });
  }
}

export default GuildInviteManager;
export { GuildInviteManager };
