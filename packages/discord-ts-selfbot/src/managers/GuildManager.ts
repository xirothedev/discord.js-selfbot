import process from 'node:process';
import { setTimeout } from 'node:timers';
import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import _GuildModule from '../structures/Guild';

const { Guild } = _GuildModule;
import GuildChannel from '../structures/GuildChannel';
import GuildEmoji from '../structures/GuildEmoji';
import _GuildMemberModule from '../structures/GuildMember';

const { GuildMember } = _GuildMemberModule;
import Invite from '../structures/Invite';
import OAuth2Guild from '../structures/OAuth2Guild';
import _RoleModule from '../structures/Role';

const { Role } = _RoleModule;
import _ConstantsModule, { resolveEnumValue } from '../util/Constants';

const {
  ChannelTypes,
  Events,
  OverwriteTypes,
  VerificationLevels,
  DefaultMessageNotificationLevels,
  ExplicitContentFilterLevels,
  VideoQualityModes,
} = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import Permissions from '../util/Permissions';
import SystemChannelFlags from '../util/SystemChannelFlags';
import Util from '../util/Util';

const { resolveColor } = Util;
import type { APIIncidentsData, Snowflake } from 'discord-api-types/v10';
import { GuildWidgetStyle } from 'discord-api-types/v10';
import type {
  RawGuildData,
  RawOAuth2GuildData,
} from '../../typings/rawDataTypes';
import type {
  FetchGuildOptions,
  FetchGuildsOptions,
  GuildCreateOptions,
  GuildResolvable,
  IncidentActionsEditOptions,
  PartialOverwriteData,
  PartialRoleData,
} from '../../typings';
import type { Client } from '../client/Client';

type GuildResolvableSource =
  | InstanceType<typeof Guild>
  | GuildChannel
  | InstanceType<typeof GuildMember>
  | GuildEmoji
  | InstanceType<typeof Role>
  | Invite
  | Snowflake
  | GuildResolvable;

interface PartialChannelDataSource {
  id?: Snowflake | number;
  parentId?: Snowflake | number;
  parent_id?: Snowflake | number;
  type?: string | number;
  name: string;
  topic?: string;
  nsfw?: boolean;
  bitrate?: number;
  userLimit?: number;
  user_limit?: number;
  rtcRegion?: string | null;
  rtc_region?: string | null;
  videoQualityMode?: string | number;
  video_quality_mode?: number;
  permissionOverwrites?: PartialOverwriteDataSource[];
  permission_overwrites?: PartialOverwriteDataSource[];
  rateLimitPerUser?: number;
  rate_limit_per_user?: number;
}

interface PartialOverwriteDataSource extends Omit<
  PartialOverwriteData,
  'type' | 'allow' | 'deny'
> {
  type?: string | number;
  allow?: unknown;
  deny?: unknown;
}

interface PartialRoleDataSource extends Omit<
  PartialRoleData,
  'color' | 'permissions'
> {
  color?: unknown;
  permissions?: unknown;
}

type GuildCreateOptionsSource = Omit<
  GuildCreateOptions,
  'channels' | 'roles'
> & {
  channels?: PartialChannelDataSource[];
  roles?: PartialRoleDataSource[];
};

function isFetchGuildOptions(value: unknown): value is FetchGuildOptions {
  return typeof value === 'object' && value !== null && 'guild' in value;
}

let cacheWarningEmitted = false;

class GuildManager extends CachedManager<InstanceType<typeof Guild>> {
  constructor(client: Client, iterable?: Iterable<InstanceType<typeof Guild>>) {
    super(client, Guild, iterable);
    if (!cacheWarningEmitted && this._cache.constructor.name !== 'Collection') {
      cacheWarningEmitted = true;
      process.emitWarning(
        `Overriding the cache handling for ${this.constructor.name} is unsupported and breaks functionality.`,
        'UnsupportedCacheOverwriteWarning'
      );
    }
  }

  resolve(guild: unknown): InstanceType<typeof Guild> | null {
    if (
      guild instanceof GuildChannel ||
      guild instanceof GuildMember ||
      guild instanceof GuildEmoji ||
      guild instanceof Role ||
      (guild instanceof Invite && guild.guild)
    ) {
      return super.resolve(guild.guild);
    }
    return super.resolve(guild);
  }

  resolveId(guild: unknown): string | null {
    const inviteGuild = guild instanceof Invite ? guild.guild : null;
    if (
      guild instanceof GuildChannel ||
      guild instanceof GuildMember ||
      guild instanceof GuildEmoji ||
      guild instanceof Role ||
      inviteGuild
    ) {
      if (inviteGuild) {
        return super.resolveId(inviteGuild.id);
      }
      if (typeof guild === 'object' && guild !== null && 'guild' in guild) {
        const parent = guild.guild;
        if (
          typeof parent === 'object' &&
          parent !== null &&
          'id' in parent &&
          typeof parent.id === 'string'
        ) {
          return super.resolveId(parent.id);
        }
      }
    }
    return super.resolveId(guild);
  }

  async create(
    name: string,
    {
      afkChannelId,
      afkTimeout,
      channels = [],
      defaultMessageNotifications,
      explicitContentFilter,
      icon = null,
      roles = [],
      systemChannelId,
      systemChannelFlags,
      verificationLevel,
    }: GuildCreateOptionsSource = {}
  ): Promise<InstanceType<typeof Guild>> {
    const resolvedIcon = await DataResolver.resolveImage(icon);
    const resolvedVerificationLevel =
      typeof verificationLevel === 'string'
        ? VerificationLevels[verificationLevel]
        : verificationLevel;
    const resolvedDefaultMessageNotifications =
      typeof defaultMessageNotifications === 'string'
        ? DefaultMessageNotificationLevels[defaultMessageNotifications]
        : defaultMessageNotifications;
    const resolvedExplicitContentFilter =
      typeof explicitContentFilter === 'string'
        ? ExplicitContentFilterLevels[explicitContentFilter]
        : explicitContentFilter;
    for (const channel of channels) {
      channel.type &&= resolveEnumValue(ChannelTypes, channel.type);
      channel.parent_id = channel.parentId;
      delete channel.parentId;
      channel.user_limit = channel.userLimit;
      delete channel.userLimit;
      channel.rate_limit_per_user = channel.rateLimitPerUser;
      delete channel.rateLimitPerUser;
      channel.rtc_region = channel.rtcRegion;
      delete channel.rtcRegion;
      channel.video_quality_mode = resolveEnumValue(
        VideoQualityModes,
        channel.videoQualityMode
      );
      delete channel.videoQualityMode;

      if (!channel.permissionOverwrites) {
        continue;
      }
      for (const overwrite of channel.permissionOverwrites) {
        if (typeof overwrite.type === 'string') {
          overwrite.type = resolveEnumValue(OverwriteTypes, overwrite.type);
        }
        overwrite.allow &&= Permissions.resolve(overwrite.allow).toString();
        overwrite.deny &&= Permissions.resolve(overwrite.deny).toString();
      }
      channel.permission_overwrites = channel.permissionOverwrites;
      delete channel.permissionOverwrites;
    }
    for (const role of roles) {
      role.color &&= resolveColor(role.color);
      role.permissions &&= Permissions.resolve(role.permissions).toString();
    }
    const resolvedSystemChannelFlags = systemChannelFlags
      ? SystemChannelFlags.resolve(systemChannelFlags)
      : undefined;

    const data: RawGuildData = await this.client.api.guilds.post({
      data: {
        afk_channel_id: afkChannelId,
        afk_timeout: afkTimeout,
        channels,
        default_message_notifications: resolvedDefaultMessageNotifications,
        explicit_content_filter: resolvedExplicitContentFilter,
        // From Discord
        guild_template_code: '2TffvPucqHkN',
        icon: resolvedIcon,
        name,
        roles,
        system_channel_flags: resolvedSystemChannelFlags,
        system_channel_id: systemChannelId,
        verification_level: resolvedVerificationLevel,
      },
    });

    const existing = this.client.guilds.cache.get(data.id);
    if (existing) {
      return existing;
    }

    const { promise, resolve } =
      Promise.withResolvers<InstanceType<typeof Guild>>();
    const timeoutState: { timer?: ReturnType<typeof setTimeout> } = {};
    const handleGuild = (guild: InstanceType<typeof Guild>) => {
      if (guild.id === data.id) {
        if (timeoutState.timer) {
          clearTimeout(timeoutState.timer);
        }
        this.client.removeListener(Events.GUILD_CREATE, handleGuild);
        this.client.decrementMaxListeners();
        resolve(guild);
      }
    };
    this.client.incrementMaxListeners();
    this.client.on(Events.GUILD_CREATE, handleGuild);

    timeoutState.timer = setTimeout(() => {
      this.client.removeListener(Events.GUILD_CREATE, handleGuild);
      this.client.decrementMaxListeners();
      resolve(this.client.guilds._add(data));
    }, 10_000).unref();
    return promise;
  }

  fetch(
    options: GuildResolvableSource | FetchGuildOptions
  ): Promise<InstanceType<typeof Guild>>;
  fetch(
    options?: FetchGuildsOptions
  ): Promise<Collection<Snowflake, OAuth2Guild>>;
  async fetch(
    options: GuildResolvableSource | FetchGuildOptions | FetchGuildsOptions = {}
  ): Promise<InstanceType<typeof Guild> | Collection<Snowflake, OAuth2Guild>> {
    const fetchOptions = isFetchGuildOptions(options) ? options : undefined;
    const id =
      this.resolveId(options) ??
      (fetchOptions?.guild ? this.resolveId(fetchOptions.guild) : null);

    if (id) {
      if (!fetchOptions?.force) {
        const existing = this.cache.get(id);
        if (existing) {
          return existing;
        }
      }

      const data: RawGuildData = await this.client.api.guilds(id).get({
        query: { with_counts: fetchOptions?.withCounts ?? true },
      });
      return this._add(data, fetchOptions?.cache);
    }

    const data: RawOAuth2GuildData[] = await this.client.api
      .users('@me')
      .guilds.get({ query: options });
    const guilds = new Collection<Snowflake, OAuth2Guild>();
    for (const guild of data) {
      guilds.set(guild.id, new OAuth2Guild(this.client, guild));
    }
    return guilds;
  }

  widgetImageURL(
    guild: GuildResolvableSource,
    style: GuildWidgetStyle = GuildWidgetStyle.Shield
  ) {
    const id = this.resolveId(guild);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    }
    return `${this.client.options.http.api}/guilds/${id}/widget.png?style=${style}`;
  }

  async fetchDiscoveryMetadata(guild: GuildResolvableSource) {
    const id = this.resolveId(guild);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    }
    return this.client.api
      .guilds(id)
      ['discovery-metadata'].get<DiscoveryMetadata>();
  }

  async editDiscoveryMetadata(
    guild: GuildResolvableSource,
    data: Partial<DiscoveryMetadata> = {}
  ) {
    const id = this.resolveId(guild);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    }
    return this.client.api
      .guilds(id)
      ['discovery-metadata'].patch<DiscoveryMetadata>({ data });
  }

  async fetchDiscoveryRequirements(guild: GuildResolvableSource) {
    const id = this.resolveId(guild);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    }
    return this.client.api
      .guilds(id)
      ['discovery-requirements'].get<DiscoveryMetadata>();
  }

  async addDiscoverySubcategory(
    guild: GuildResolvableSource,
    categoryId: Snowflake
  ) {
    const id = this.resolveId(guild);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    }
    return this.client.api.guilds(id)['discovery-categories'](categoryId).put({
      data: {},
    });
  }

  async removeDiscoverySubcategory(
    guild: GuildResolvableSource,
    categoryId: Snowflake
  ) {
    const id = this.resolveId(guild);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    }
    return this.client.api
      .guilds(id)
      ['discovery-categories'](categoryId)
      .delete();
  }

  async fetchDiscoverableGuilds(query: Record<string, unknown> = {}) {
    return this.client.api['discoverable-guilds'].get<unknown>({ query });
  }

  async searchDiscoverableGuilds(query: string) {
    return this.client.api['discoverable-guilds'].search.get<unknown>({
      query: { query },
    });
  }

  async searchPublishedGuilds(query: string) {
    return this.client.api.discovery.search.get<unknown>({ query: { query } });
  }

  async fetchDiscoverySlug(guildId: Snowflake) {
    return this.client.api.discovery(guildId).get<DiscoveryMetadata>();
  }

  async fetchDiscoveryCategories() {
    return this.client.api.discovery.categories.get<DiscoveryCategory[]>();
  }

  async setIncidentActions(
    guild: GuildResolvableSource,
    { invitesDisabledUntil, dmsDisabledUntil }: IncidentActionsEditOptions
  ) {
    const guildId = this.resolveId(guild);

    const data: APIIncidentsData = await this.client.api
      .guilds(guildId)
      ['incident-actions'].put({
        data: {
          dms_disabled_until:
            dmsDisabledUntil && new Date(dmsDisabledUntil).toISOString(),
          invites_disabled_until:
            invitesDisabledUntil &&
            new Date(invitesDisabledUntil).toISOString(),
        },
      });

    const parsedData = Util.transformAPIIncidentsData(data);
    const resolvedGuild = this.resolve(guild);

    if (resolvedGuild) {
      resolvedGuild.incidentsData = parsedData;
    }

    return parsedData;
  }
}

export default GuildManager;
export { GuildManager };
