import process from 'node:process';
import { Collection } from '@discordjs/collection';
import AnonymousGuild from './AnonymousGuild';
import GuildAuditLogs from './GuildAuditLogs';
import GuildPreview from './GuildPreview';
import GuildTemplate from './GuildTemplate';
import Integration from './Integration';
import Webhook from './Webhook';
import WelcomeScreen from './WelcomeScreen';
import _errorsModule from '../errors';

const { Error } = _errorsModule;
import AutoModerationRuleManager from '../managers/AutoModerationRuleManager';
import GuildBanManager from '../managers/GuildBanManager';
import GuildChannelManager from '../managers/GuildChannelManager';
import GuildEmojiManager from '../managers/GuildEmojiManager';
import GuildInviteManager from '../managers/GuildInviteManager';
import GuildMemberManager from '../managers/GuildMemberManager';
import GuildScheduledEventManager from '../managers/GuildScheduledEventManager';
import GuildSettingManager from '../managers/GuildSettingManager';
import GuildStickerManager from '../managers/GuildStickerManager';
import PresenceManager from '../managers/PresenceManager';
import RoleManager from '../managers/RoleManager';
import StageInstanceManager from '../managers/StageInstanceManager';
import VoiceStateManager from '../managers/VoiceStateManager';
import _ConstantsModule from '../util/Constants';

const {
  DefaultMessageNotificationLevels,
  VerificationLevels,
  ExplicitContentFilterLevels,
  Status,
  MFALevels,
  PremiumTiers,
} = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import { patchValue } from './Base';
import SystemChannelFlags from '../util/SystemChannelFlags';
import Util from '../util/Util';
import { GuildFeature, GuildWidgetStyle } from 'discord-api-types/v10';
import type {
  RESTGetAPIAuditLogResult,
  RESTGetAPIGuildIntegrationsResult,
  RESTGetAPIGuildOnboardingResult,
  RESTGetAPIGuildPruneCountQuery,
  RESTGetAPIGuildPruneCountResult,
  RESTGetAPIGuildMemberVerificationResult,
  RESTPatchAPIGuildMemberVerificationJSONBody,
  RESTPatchAPIGuildMemberVerificationResult,
  RESTGetAPIGuildPreviewResult,
  RESTGetAPIGuildTemplatesResult,
  RESTGetAPIGuildThreadsResult,
  RESTGetAPIGuildWebhooksResult,
  RESTGetAPIGuildWelcomeScreenResult,
  RESTGetAPIGuildWidgetSettingsResult,
  RESTPatchAPIGuildResult,
  RESTPatchAPIGuildWelcomeScreenResult,
  RESTPostAPIGuildPruneResult,
  RESTPostAPIGuildBulkBanJSONBody,
  RESTPostAPIGuildBulkBanResult,
  RESTPostAPIGuildTemplatesResult,
  RESTPutAPIGuildOnboardingJSONBody,
  RESTPutAPIGuildOnboardingResult,
  Snowflake,
} from 'discord-api-types/v10';
import type { RawGuildData } from '../../typings/rawDataTypes';
import type {
  Base64Resolvable,
  BaseFetchOptions,
  BufferResolvable,
  ChannelPosition,
  DefaultMessageNotificationLevel,
  ExplicitContentFilterLevel,
  GuildAuditLogsFetchOptions,
  GuildAuditLogsResolvable,
  GuildEditData,
  GuildFeatures,
  GuildMemberResolvable,
  GuildTextChannelResolvable,
  GuildWidgetSettingsData,
  IncidentActions,
  IncidentActionsEditOptions,
  InternalDiscordGatewayAdapterCreator,
  InternalDiscordGatewayAdapterLibraryMethods,
  RolePosition,
  StaticImageURLOptions,
  SystemChannelFlagsResolvable,
  TextChannelResolvable,
  Vanity,
  VerificationLevel,
  VoiceChannelResolvable,
  WelcomeChannelData,
  WelcomeScreenEditData,
} from '../../typings';
import type { GuildChannel } from './GuildChannel';
import type { GuildEntity } from '../types/entities/guild';
import type { PatchOf } from '../types/schema';
import type { GuildEmoji } from './GuildEmoji';
import type { ThreadChannel } from './ThreadChannel';
import type Client from '../client/Client';

let deprecationEmittedForSetChannelPositions = false;
let deprecationEmittedForSetRolePositions = false;
let deprecationEmittedForDeleted = false;
let deprecationEmittedForMe = false;

/**
 * @type {WeakSet<Guild>}
 * @private
 * @internal
 */
const deletedGuilds = new WeakSet();

function resolveGuildVerificationLevel(
  value: GuildEditData['verificationLevel']
) {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'number' ? value : VerificationLevels[value];
}

function resolveExplicitContentFilter(
  value: GuildEditData['explicitContentFilter']
) {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'number' ? value : ExplicitContentFilterLevels[value];
}

function resolveDefaultMessageNotificationLevel(
  value: GuildEditData['defaultMessageNotifications']
) {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'number'
    ? value
    : DefaultMessageNotificationLevels[value];
}

class Guild extends AnonymousGuild implements GuildEntity {
  declare client: Client;
  declare afkChannelId: GuildEntity['afkChannelId'];
  declare afkTimeout: GuildEntity['afkTimeout'];
  declare applicationId: GuildEntity['applicationId'];
  declare maxVideoChannelUsers: GuildEntity['maxVideoChannelUsers'];
  declare maxStageVideoChannelUsers: GuildEntity['maxStageVideoChannelUsers'];
  declare approximateMemberCount: GuildEntity['approximateMemberCount'];
  declare approximatePresenceCount: GuildEntity['approximatePresenceCount'];
  declare autoModerationRules: GuildEntity['autoModerationRules'];
  declare available: GuildEntity['available'];
  declare bans: GuildEntity['bans'];
  declare channels: GuildEntity['channels'];
  declare defaultMessageNotifications: GuildEntity['defaultMessageNotifications'];
  declare discoverySplash: GuildEntity['discoverySplash'];
  declare emojis: GuildEntity['emojis'];
  declare explicitContentFilter: GuildEntity['explicitContentFilter'];
  declare invites: GuildEntity['invites'];
  declare joinedTimestamp: GuildEntity['joinedTimestamp'];
  declare large: GuildEntity['large'];
  declare maximumMembers: GuildEntity['maximumMembers'];
  declare maximumPresences: GuildEntity['maximumPresences'];
  declare memberCount: GuildEntity['memberCount'];
  declare members: GuildEntity['members'];
  declare mfaLevel: GuildEntity['mfaLevel'];
  declare ownerId: GuildEntity['ownerId'];
  declare preferredLocale: GuildEntity['preferredLocale'];
  declare premiumProgressBarEnabled: GuildEntity['premiumProgressBarEnabled'];
  declare premiumTier: GuildEntity['premiumTier'];
  declare presences: GuildEntity['presences'];
  declare publicUpdatesChannelId: GuildEntity['publicUpdatesChannelId'];
  declare roles: GuildEntity['roles'];
  declare rulesChannelId: GuildEntity['rulesChannelId'];
  declare safetyAlertsChannelId: GuildEntity['safetyAlertsChannelId'];
  declare scheduledEvents: GuildEntity['scheduledEvents'];
  declare settings: GuildEntity['settings'];
  declare shardId: GuildEntity['shardId'];
  declare stageInstances: GuildEntity['stageInstances'];
  declare stickers: GuildEntity['stickers'];
  declare incidentsData: GuildEntity['incidentsData'];
  declare systemChannelFlags: GuildEntity['systemChannelFlags'];
  declare systemChannelId: GuildEntity['systemChannelId'];
  declare vanityURLUses: GuildEntity['vanityURLUses'];
  declare voiceStates: GuildEntity['voiceStates'];
  declare widgetChannelId: GuildEntity['widgetChannelId'];
  declare widgetEnabled: GuildEntity['widgetEnabled'];

  constructor(client: Client, data: RawGuildData & { shardId?: number }) {
    super(client, data, false);

    this.members = new GuildMemberManager(this);

    this.channels = new GuildChannelManager(this);

    this.bans = new GuildBanManager(this);

    this.roles = new RoleManager(this);

    this.presences = new PresenceManager(this.client);

    this.voiceStates = new VoiceStateManager(this);

    this.stageInstances = new StageInstanceManager(this);

    this.invites = new GuildInviteManager(this);

    this.scheduledEvents = new GuildScheduledEventManager(this);

    this.autoModerationRules = new AutoModerationRuleManager(this);

    this.settings = new GuildSettingManager(this);

    if (!data) {
      return;
    }
    if ('unavailable' in data && data.unavailable) {
      this.available = false;
    } else {
      this._patch(data);
      if (!('channels' in data) || !data.channels) {
        this.available = false;
      }
    }

    this.shardId = data.shardId ?? 0;
  }

  /**
   * Whether or not the structure has been deleted
   * @type {boolean}
   * @deprecated This will be removed in the next major version, see https://github.com/discordjs/discord.js/issues/7091
   */
  get deleted() {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Guild#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning'
      );
    }

    return deletedGuilds.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        'Guild#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.',
        'DeprecationWarning'
      );
    }

    if (value) {
      deletedGuilds.add(this);
    } else {
      deletedGuilds.delete(this);
    }
  }

  get shard() {
    return this.client.ws.shards.get(this.shardId);
  }

  _patch(data: PatchOf<'Guild'>) {
    super._patch(data);
    if (data.id !== undefined) {
      this.id = data.id;
    }
    this.patchCoreFields(data);
    this.patchCounters(data);
    this.patchCollections(data);
    this.patchAssets(data);
  }

  private patchCoreFields(data: PatchOf<'Guild'>) {
    this.name = patchValue(data.name, this.name);
    this.icon = patchValue(data.icon, this.icon);
    if ('unavailable' in data && data.unavailable) {
      this.available = !data.unavailable;
    } else {
      this.available ??= true;
    }

    if (data.discovery_splash !== undefined) {
      this.discoverySplash = data.discovery_splash ?? null;
    }
    if (data.member_count !== undefined) {
      this.memberCount = data.member_count;
    }
    if (data.large !== undefined) {
      this.large = Boolean(data.large);
    }
    if (data.premium_progress_bar_enabled !== undefined) {
      this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
    }
    if (data.application_id !== undefined) {
      this.applicationId = data.application_id;
    }
    if (data.afk_timeout !== undefined) {
      this.afkTimeout = data.afk_timeout;
    }
    if (data.afk_channel_id !== undefined) {
      this.afkChannelId = data.afk_channel_id;
    }
    if (data.system_channel_id !== undefined) {
      this.systemChannelId = data.system_channel_id;
    }
    if (data.premium_tier !== undefined) {
      this.premiumTier = PremiumTiers[data.premium_tier];
    }
    if (data.widget_enabled !== undefined) {
      this.widgetEnabled = data.widget_enabled;
    }
    if (data.widget_channel_id !== undefined) {
      this.widgetChannelId = data.widget_channel_id;
    }
    this.patchCoreSettings(data);
  }

  private patchCoreSettings(data: PatchOf<'Guild'>) {
    if (data.explicit_content_filter !== undefined) {
      this.explicitContentFilter =
        ExplicitContentFilterLevels[data.explicit_content_filter];
    }
    if (data.mfa_level !== undefined) {
      this.mfaLevel = MFALevels[data.mfa_level];
    }
    if (data.joined_at !== undefined) {
      this.joinedTimestamp = new Date(data.joined_at).getTime();
    }
    if (data.default_message_notifications !== undefined) {
      this.defaultMessageNotifications =
        DefaultMessageNotificationLevels[data.default_message_notifications];
    }
    if (data.system_channel_flags !== undefined) {
      this.systemChannelFlags = new SystemChannelFlags(
        data.system_channel_flags
      ).freeze();
    }
  }

  private patchCounters(data: PatchOf<'Guild'>) {
    this.patchLimits(data);

    if (data.rules_channel_id !== undefined) {
      this.rulesChannelId = data.rules_channel_id;
    }
    if (data.public_updates_channel_id !== undefined) {
      this.publicUpdatesChannelId = data.public_updates_channel_id;
    }
    if (data.preferred_locale !== undefined) {
      this.preferredLocale = data.preferred_locale;
    }
    if (data.safety_alerts_channel_id === undefined) {
      this.safetyAlertsChannelId ??= null;
    } else {
      this.safetyAlertsChannelId = data.safety_alerts_channel_id;
    }
    if (data.incidents_data === undefined) {
      this.incidentsData ??= null;
    } else {
      this.incidentsData = data.incidents_data
        ? Util.transformAPIIncidentsData(data.incidents_data)
        : null;
    }
  }

  private patchLimits(data: PatchOf<'Guild'>) {
    if (data.max_members === undefined) {
      this.maximumMembers ??= null;
    } else {
      this.maximumMembers = data.max_members ?? null;
    }
    if (data.max_presences === undefined) {
      this.maximumPresences ??= null;
    } else {
      this.maximumPresences = data.max_presences ?? 25_000;
    }
    if (data.max_video_channel_users === undefined) {
      this.maxVideoChannelUsers ??= null;
    } else {
      this.maxVideoChannelUsers = data.max_video_channel_users ?? null;
    }
    if (data.max_stage_video_channel_users === undefined) {
      this.maxStageVideoChannelUsers ??= null;
    } else {
      this.maxStageVideoChannelUsers =
        data.max_stage_video_channel_users ?? null;
    }
    if (data.approximate_member_count === undefined) {
      this.approximateMemberCount ??= null;
    } else {
      this.approximateMemberCount = data.approximate_member_count ?? null;
    }
    if (data.approximate_presence_count === undefined) {
      this.approximatePresenceCount ??= null;
    } else {
      this.approximatePresenceCount = data.approximate_presence_count ?? null;
    }
    this.vanityURLUses ??= null;
  }

  private patchCollections(data: PatchOf<'Guild'>) {
    if (data.channels) {
      this.channels.cache.clear();
      for (const rawChannel of data.channels) {
        this.client.channels._add(rawChannel, this);
      }
    }
    if (data.threads) {
      for (const rawThread of data.threads) {
        this.client.channels._add(rawThread, this);
      }
    }
    if (data.roles) {
      this.roles.cache.clear();
      for (const role of data.roles) {
        this.roles._add(role);
      }
    }
    if (data.members) {
      this.members.cache.clear();
      for (const guildUser of data.members) {
        this.members._add(guildUser);
      }
    }
    if (data.owner_id !== undefined) {
      this.ownerId = data.owner_id;
    }
    if (data.presences) {
      for (const presence of data.presences) {
        this.presences._add(Object.assign(presence, { guild: this }));
      }
    }
    if (data.stage_instances) {
      this.stageInstances.cache.clear();
      for (const stageInstance of data.stage_instances) {
        this.stageInstances._add(stageInstance);
      }
    }
    if (data.guild_scheduled_events) {
      this.scheduledEvents.cache.clear();
      for (const scheduledEvent of data.guild_scheduled_events) {
        this.scheduledEvents._add(scheduledEvent);
      }
    }
    if (data.voice_states) {
      this.voiceStates.cache.clear();
      for (const voiceState of data.voice_states) {
        this.voiceStates._add(voiceState);
      }
    }
  }

  private patchAssets(data: PatchOf<'Guild'>) {
    if (!this.emojis) {
      this.emojis = new GuildEmojiManager(this);
      if (data.emojis) {
        for (const emoji of data.emojis) {
          this.emojis._add(emoji);
        }
      }
    } else if (data.emojis) {
      this.client.actions.GuildEmojisUpdate.handle({
        emojis: data.emojis,
        guild_id: this.id,
      });
    }

    if (!this.stickers) {
      this.stickers = new GuildStickerManager(this);
      if (data.stickers) {
        for (const sticker of data.stickers) {
          this.stickers._add(sticker);
        }
      }
    } else if (data.stickers) {
      this.client.actions.GuildStickersUpdate.handle({
        guild_id: this.id,
        stickers: data.stickers,
      });
    }
  }

  get joinedAt() {
    return new Date(this.joinedTimestamp);
  }

  discoverySplashURL({ format = 'webp', size }: StaticImageURLOptions = {}) {
    return (
      this.discoverySplash &&
      this.client.rest.cdn.DiscoverySplash(
        this.id,
        this.discoverySplash,
        format,
        size
      )
    );
  }

  fetchOwner(options?: BaseFetchOptions) {
    return this.members.fetch({ ...options, user: this.ownerId });
  }

  get afkChannel() {
    return this.client.channels.resolve(this.afkChannelId);
  }

  get systemChannel() {
    return this.client.channels.resolve(this.systemChannelId);
  }

  get safetyAlertsChannel() {
    return this.client.channels.resolve(this.safetyAlertsChannelId);
  }

  get widgetChannel() {
    return this.client.channels.resolve(this.widgetChannelId);
  }

  get rulesChannel() {
    return this.client.channels.resolve(this.rulesChannelId);
  }

  get publicUpdatesChannel() {
    return this.client.channels.resolve(this.publicUpdatesChannelId);
  }

  /**
   * The client user as a GuildMember of this guild
   * @type {?GuildMember}
   * @deprecated Use {@link GuildMemberManager#me} instead.
   * @readonly
   */
  get me() {
    if (!deprecationEmittedForMe) {
      process.emitWarning(
        'Guild#me is deprecated. Use Guild#members#me instead.',
        'DeprecationWarning'
      );
      deprecationEmittedForMe = true;
    }

    return this.members.me;
  }

  get maximumBitrate() {
    if (this.features.includes(GuildFeature.VIPRegions)) {
      return 384_000;
    }

    switch (PremiumTiers[this.premiumTier]) {
      case PremiumTiers.TIER_1: {
        return 128_000;
      }
      case PremiumTiers.TIER_2: {
        return 256_000;
      }
      case PremiumTiers.TIER_3: {
        return 384_000;
      }
      default: {
        return 96_000;
      }
    }
  }

  async fetchIntegrations() {
    const data = await this.client.api
      .guilds(this.id)
      .integrations.get<RESTGetAPIGuildIntegrationsResult>();
    const integrations = new Collection<Snowflake | string, Integration>();
    for (const integration of data) {
      integrations.set(
        integration.id,
        new Integration(this.client, integration, this)
      );
    }
    return integrations;
  }

  async fetchTemplates() {
    const templates = await this.client.api
      .guilds(this.id)
      .templates.get<RESTGetAPIGuildTemplatesResult>();
    const collection = new Collection<string, GuildTemplate>();
    for (const template of templates) {
      collection.set(template.code, new GuildTemplate(this.client, template));
    }
    return collection;
  }

  async fetchWelcomeScreen() {
    const data = await this.client.api
      .guilds(this.id, 'welcome-screen')
      .get<RESTGetAPIGuildWelcomeScreenResult>();
    return new WelcomeScreen(this, data);
  }

  async createTemplate(name: string, description?: string) {
    const data = await this.client.api
      .guilds(this.id)
      .templates.post<RESTPostAPIGuildTemplatesResult>({
        data: { description, name },
      });
    return new GuildTemplate(this.client, data);
  }

  async fetchPreview() {
    const data = await this.client.api
      .guilds(this.id)
      .preview.get<RESTGetAPIGuildPreviewResult>();
    return new GuildPreview(this.client, data);
  }

  async fetchActiveThreads() {
    const data = await this.client.api
      .guilds(this.id)
      .threads.active.get<RESTGetAPIGuildThreadsResult>();
    const threads = new Collection<Snowflake, ThreadChannel>();
    for (const thread of data.threads) {
      const channel = this.client.channels._add(
        thread,
        this
      ) as ThreadChannel | null;
      if (channel) {
        threads.set(channel.id, channel);
      }
    }
    return { members: data.members, threads };
  }

  async pruneMembers({
    days = 7,
    computePruneCount = true,
    includeRoles,
    reason,
  }: {
    days?: number;
    computePruneCount?: boolean;
    includeRoles?: Snowflake[];
    reason?: string;
  } = {}) {
    const data = await this.client.api
      .guilds(this.id)
      .prune.post<RESTPostAPIGuildPruneResult>({
        data: {
          compute_prune_count: computePruneCount,
          days,
          include_roles: includeRoles,
        },
        reason,
      });
    return data;
  }

  async fetchOnboarding() {
    const data = await this.client.api
      .guilds(this.id)
      .onboarding.get<RESTGetAPIGuildOnboardingResult>();
    return data;
  }

  async editOnboarding(
    data: RESTPutAPIGuildOnboardingJSONBody,
    reason?: string
  ) {
    const patchData = await this.client.api
      .guilds(this.id)
      .onboarding.put<RESTPutAPIGuildOnboardingResult>({
        data,
        reason,
      });
    return patchData;
  }

  async fetchBasic() {
    return this.client.api.guilds(this.id).basic.get<GuildBasic>();
  }

  async fetchPruneCount({
    days = 7,
    includeRoles,
  }: { days?: number; includeRoles?: Snowflake[] } = {}) {
    const query: RESTGetAPIGuildPruneCountQuery = { days };
    if (includeRoles) {
      query.include_roles = includeRoles.join(',');
    }
    return this.client.api
      .guilds(this.id)
      .prune.get<RESTGetAPIGuildPruneCountResult>({ query });
  }

  async fetchMemberVerification() {
    return this.client.api
      .guilds(this.id)
      ['member-verification'].get<RESTGetAPIGuildMemberVerificationResult>();
  }

  async editMemberVerification(
    data: RESTPatchAPIGuildMemberVerificationJSONBody = {}
  ) {
    return this.client.api
      .guilds(this.id)
      ['member-verification'].patch<RESTPatchAPIGuildMemberVerificationResult>({
        data,
      });
  }

  async fetchOnboardingAllowedApplications() {
    return this.client.api
      .guilds(this.id)
      .onboarding['allowed-applications'].get<unknown[]>();
  }

  async fetchTopGames() {
    return this.client.api.guilds(this.id)['top-games'].get<unknown[]>();
  }

  async fetchGuildProfile() {
    return this.client.api
      .guilds(this.id)
      .profile.get<Record<string, unknown>>();
  }

  async editGuildProfile(data: Partial<UserProfile> = {}) {
    return this.client.api
      .guilds(this.id)
      .profile.patch<Record<string, unknown>>({ data });
  }

  async fetchRoleMemberCounts() {
    return this.client.api
      .guilds(this.id)
      .roles['member-counts'].get<Record<string, number>>();
  }

  async searchBans(query: string) {
    return this.client.api.guilds(this.id).bans.search.get<unknown[]>({
      query: { query },
    });
  }

  async bulkBanV2(data: Partial<RESTPostAPIGuildBulkBanJSONBody> = {}) {
    return this.client.api
      .guilds(this.id)
      ['bulk-ban'].v2.post<RESTPostAPIGuildBulkBanResult>({ data });
  }

  async fetchJoinRequests() {
    return this.client.api.guilds(this.id).requests.get<GuildJoinRequest[]>();
  }

  async fetchJoinRequest(requestId: Snowflake) {
    return this.client.api['join-requests'](requestId).get<GuildJoinRequest>();
  }

  async fetchCurrentJoinRequest() {
    return this.client.api
      .guilds(this.id)
      .requests['@me'].get<Record<string, unknown>>();
  }

  async fetchJoinRequestCooldown() {
    return this.client.api
      .guilds(this.id)
      .requests['@me'].cooldown.get<Record<string, unknown>>();
  }

  async createJoinRequest() {
    return this.client.api
      .guilds(this.id)
      .requests['@me'].put<Record<string, unknown>>({ data: {} });
  }

  async resetJoinRequest() {
    return this.client.api
      .guilds(this.id)
      .requests['@me'].post<Record<string, unknown>>({ data: {} });
  }

  async deleteJoinRequest() {
    return this.client.api.guilds(this.id).requests['@me'].delete();
  }

  async fetchSoundboardSounds() {
    return this.client.api
      .guilds(this.id)
      ['soundboard-sounds'].get<unknown[]>();
  }

  async fetchSoundboardSound(soundId: Snowflake) {
    return this.client.api
      .guilds(this.id)
      ['soundboard-sounds'](soundId)
      .get<Record<string, unknown>>();
  }

  createSoundboardSound(data: Partial<SoundboardSound> = {}) {
    return this.client.api.guilds(this.id)['soundboard-sounds'].post<unknown>({
      data,
    });
  }

  editSoundboardSound(soundId: Snowflake, data: Partial<SoundboardSound> = {}) {
    return this.client.api
      .guilds(this.id)
      ['soundboard-sounds'](soundId)
      .patch<Record<string, unknown>>({ data });
  }

  deleteSoundboardSound(soundId: Snowflake) {
    return this.client.api
      .guilds(this.id)
      ['soundboard-sounds'](soundId)
      .delete();
  }

  sendSoundboardSound(channelId: Snowflake, soundId: Snowflake) {
    return this.client.api.channels(channelId)['send-soundboard-sound'].post({
      data: { sound_id: soundId },
    });
  }

  async fetchSoundboardSoundGuild(soundId: Snowflake) {
    return this.client.api['soundboard-sounds'](soundId)
      .guild(this.id)
      .get<Record<string, unknown>>();
  }

  validateAutoModerationRule(data: Record<string, unknown> = {}) {
    return this.client.api
      .guilds(this.id)
      ['auto-moderation'].rules.validate.post<Record<string, unknown>>({
        data,
      });
  }

  executeAutoModerationAlertAction(data: Record<string, unknown> = {}) {
    return this.client.api
      .guilds(this.id)
      ['auto-moderation']['alert-action'].post({ data });
  }

  resolveAutoModerationFalseAlarm(data: Record<string, unknown> = {}) {
    return this.client.api
      .guilds(this.id)
      ['auto-moderation']['false-alarm'].post({ data });
  }

  reportAutoModerationRaid(data: Record<string, unknown> = {}) {
    return this.client.api
      .guilds(this.id)
      ['auto-moderation']['report-raid'].post({ data });
  }

  clearAutoModerationMentionRaid() {
    return this.client.api
      .guilds(this.id)
      ['auto-moderation']['clear-mention-raid'].post({ data: {} });
  }

  async fetchDefaultSoundboardSounds() {
    return this.client.api['soundboard-default-sounds'].get<
      SoundboardSound[]
    >();
  }

  async fetchVanityData() {
    const data = await this.client.api
      .guilds(this.id, 'vanity-url')
      .get<Vanity>();
    this.vanityURLCode = data.code;
    this.vanityURLUses = data.uses;

    return data;
  }

  async fetchWebhooks() {
    const apiHooks = await this.client.api
      .guilds(this.id)
      .webhooks.get<RESTGetAPIGuildWebhooksResult>();
    const hooks = new Collection();
    for (const hook of apiHooks) {
      hooks.set(hook.id, new Webhook(this.client, hook));
    }
    return hooks;
  }

  fetchWidget() {
    return this.client.fetchGuildWidget(this.id);
  }

  async fetchWidgetSettings() {
    const data = await this.client.api
      .guilds(this.id)
      .widget.get<RESTGetAPIGuildWidgetSettingsResult>();
    this.widgetEnabled = data.enabled;
    this.widgetChannelId = data.channel_id;
    return {
      channel: data.channel_id
        ? this.channels.cache.get(data.channel_id)
        : null,
      enabled: data.enabled,
    };
  }

  widgetImageURL(style: GuildWidgetStyle = GuildWidgetStyle.Shield) {
    return `${this.client.options.http.api}/guilds/${this.id}/widget.png?style=${style}`;
  }

  async fetchAuditLogs<TResolvable extends GuildAuditLogsResolvable = 'ALL'>({
    before,
    after,
    limit,
    user,
    type,
  }: GuildAuditLogsFetchOptions<TResolvable> = {}): Promise<
    GuildAuditLogs<TResolvable>
  > {
    const data = await this.client.api
      .guilds(this.id)
      ['audit-logs'].get<RESTGetAPIAuditLogResult>({
        query: {
          action_type:
            typeof type === 'string' ? GuildAuditLogs.Actions[type] : type,
          after: typeof after === 'string' ? after : after?.id,
          before: typeof before === 'string' ? before : before?.id,
          limit,
          user_id: this.client.users.resolveId(user),
        },
      });

    return GuildAuditLogs.build<TResolvable>(this, data);
  }

  async edit(data: GuildEditData, reason?: string): Promise<this> {
    const _data: Record<string, unknown> = {
      ...this.resolveEditFields(data),
      ...(await this.resolveEditImages(data)),
    };

    const newData = await this.client.api
      .guilds(this.id)
      .patch<RESTPatchAPIGuildResult>({ data: _data, reason });
    this.client.actions.GuildUpdate.handle(newData);
    return this;
  }

  private resolveEditFields(data: GuildEditData) {
    const _data: Record<string, unknown> = {};
    if (data.name) {
      _data.name = data.name;
    }
    if (data.verificationLevel !== undefined) {
      _data.verification_level = resolveGuildVerificationLevel(
        data.verificationLevel
      );
    }
    if (data.afkChannel !== undefined) {
      _data.afk_channel_id = this.client.channels.resolveId(data.afkChannel);
    }
    if (data.systemChannel !== undefined) {
      _data.system_channel_id = this.client.channels.resolveId(
        data.systemChannel
      );
    }
    if (data.afkTimeout) {
      _data.afk_timeout = Number(data.afkTimeout);
    }
    if (data.owner) {
      _data.owner_id = this.client.users.resolveId(data.owner);
    }
    if (data.explicitContentFilter !== undefined) {
      _data.explicit_content_filter = resolveExplicitContentFilter(
        data.explicitContentFilter
      );
    }
    if (data.defaultMessageNotifications !== undefined) {
      _data.default_message_notifications =
        resolveDefaultMessageNotificationLevel(
          data.defaultMessageNotifications
        );
    }
    if (data.systemChannelFlags !== undefined) {
      _data.system_channel_flags = SystemChannelFlags.resolve(
        data.systemChannelFlags
      );
    }
    if (data.rulesChannel !== undefined) {
      _data.rules_channel_id = this.client.channels.resolveId(
        data.rulesChannel
      );
    }
    if (data.publicUpdatesChannel !== undefined) {
      _data.public_updates_channel_id = this.client.channels.resolveId(
        data.publicUpdatesChannel
      );
    }
    if (data.features !== undefined) {
      _data.features = data.features;
    }
    if (data.description !== undefined) {
      _data.description = data.description;
    }
    if (data.preferredLocale !== undefined) {
      _data.preferred_locale = data.preferredLocale;
    }
    if (data.safetyAlertsChannel !== undefined) {
      _data.safety_alerts_channel_id = this.client.channels.resolveId(
        data.safetyAlertsChannel
      );
    }
    if ('premiumProgressBarEnabled' in data) {
      _data.premium_progress_bar_enabled = data.premiumProgressBarEnabled;
    }
    return _data;
  }

  private async resolveEditImages(data: GuildEditData) {
    const _data: Record<string, unknown> = {};
    if (data.icon !== undefined) {
      _data.icon = await DataResolver.resolveImage(data.icon);
    }
    if (data.splash !== undefined) {
      _data.splash = await DataResolver.resolveImage(data.splash);
    }
    if (data.discoverySplash !== undefined) {
      _data.discovery_splash = await DataResolver.resolveImage(
        data.discoverySplash
      );
    }
    if (data.banner !== undefined) {
      _data.banner = await DataResolver.resolveImage(data.banner);
    }
    return _data;
  }

  async editWelcomeScreen(data: WelcomeScreenEditData) {
    const { enabled, description, welcomeChannels } = data;
    const welcome_channels = welcomeChannels?.map(
      (welcomeChannelData: WelcomeChannelData) => {
        const emoji = this.emojis.resolve(welcomeChannelData.emoji);
        return {
          channel_id: this.channels.resolveId(welcomeChannelData.channel),
          description: welcomeChannelData.description,
          emoji_id: emoji?.id,
          emoji_name: emoji?.name ?? welcomeChannelData.emoji,
        };
      }
    );

    const patchData = await this.client.api
      .guilds(this.id, 'welcome-screen')
      .patch<RESTPatchAPIGuildWelcomeScreenResult>({
        data: {
          description,
          enabled,
          welcome_channels,
        },
      });
    return new WelcomeScreen(this, patchData);
  }

  setExplicitContentFilter(
    explicitContentFilter: ExplicitContentFilterLevel | number | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ explicitContentFilter }, reason);
  }

  setDefaultMessageNotifications(
    defaultMessageNotifications:
      | DefaultMessageNotificationLevel
      | number
      | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ defaultMessageNotifications }, reason);
  }

  setSystemChannelFlags(
    systemChannelFlags: SystemChannelFlagsResolvable,
    reason?: string
  ): Promise<this> {
    return this.edit({ systemChannelFlags }, reason);
  }

  setName(name: string, reason?: string): Promise<this> {
    return this.edit({ name }, reason);
  }

  setVerificationLevel(
    verificationLevel: VerificationLevel | number | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ verificationLevel }, reason);
  }

  setAFKChannel(
    afkChannel: VoiceChannelResolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ afkChannel }, reason);
  }

  setSystemChannel(
    systemChannel: TextChannelResolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ systemChannel }, reason);
  }

  setAFKTimeout(afkTimeout: number, reason?: string): Promise<this> {
    return this.edit({ afkTimeout }, reason);
  }

  setIcon(
    icon: BufferResolvable | Base64Resolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ icon }, reason);
  }

  setOwner(owner: GuildMemberResolvable, reason?: string): Promise<this> {
    return this.edit({ owner }, reason);
  }

  setSplash(
    splash: BufferResolvable | Base64Resolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ splash }, reason);
  }

  setDiscoverySplash(
    discoverySplash: BufferResolvable | Base64Resolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ discoverySplash }, reason);
  }

  setBanner(
    banner: BufferResolvable | Base64Resolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ banner }, reason);
  }

  setRulesChannel(
    rulesChannel: TextChannelResolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ rulesChannel }, reason);
  }

  setPublicUpdatesChannel(
    publicUpdatesChannel: TextChannelResolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ publicUpdatesChannel }, reason);
  }

  setPreferredLocale(
    preferredLocale: string | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ preferredLocale }, reason);
  }

  setSafetyAlertsChannel(
    safetyAlertsChannel: TextChannelResolvable | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ safetyAlertsChannel }, reason);
  }

  setPremiumProgressBarEnabled(enabled = true, reason?: string): Promise<this> {
    return this.edit({ premiumProgressBarEnabled: enabled }, reason);
  }

  /**
   * Batch-updates the guild's channels' positions.
   * <info>Only one channel's parent can be changed at a time</info>
   * @param {ChannelPosition[]} channelPositions Channel positions to update
   * @returns {Promise<Guild>}
   * @deprecated Use {@link GuildChannelManager#setPositions} instead
   * @example
   * guild.setChannelPositions([{ channel: channelId, position: newChannelIndex }])
   *   .then(guild => console.log(`Updated channel positions for ${guild}`))
   *   .catch(console.error);
   */
  setChannelPositions(
    channelPositions: readonly ChannelPosition[]
  ): Promise<this> {
    if (!deprecationEmittedForSetChannelPositions) {
      process.emitWarning(
        'The Guild#setChannelPositions method is deprecated. Use GuildChannelManager#setPositions instead.',
        'DeprecationWarning'
      );

      deprecationEmittedForSetChannelPositions = true;
    }

    return this.channels.setPositions(channelPositions).then(() => this);
  }

  /**
   * Batch-updates the guild's role positions
   * @param {GuildRolePosition[]} rolePositions Role positions to update
   * @returns {Promise<Guild>}
   * @deprecated Use {@link RoleManager#setPositions} instead
   * @example
   * guild.setRolePositions([{ role: roleId, position: updatedRoleIndex }])
   *  .then(guild => console.log(`Role positions updated for ${guild}`))
   *  .catch(console.error);
   */
  setRolePositions(rolePositions: readonly RolePosition[]): Promise<this> {
    if (!deprecationEmittedForSetRolePositions) {
      process.emitWarning(
        'The Guild#setRolePositions method is deprecated. Use RoleManager#setPositions instead.',
        'DeprecationWarning'
      );

      deprecationEmittedForSetRolePositions = true;
    }

    return this.roles.setPositions(rolePositions).then(() => this);
  }

  async setWidgetSettings(
    settings: GuildWidgetSettingsData,
    reason?: string
  ): Promise<this> {
    await this.client.api.guilds(this.id).widget.patch({
      data: {
        channel_id: this.channels.resolveId(settings.channel),
        enabled: settings.enabled,
      },
      reason,
    });
    return this;
  }

  disableInvites(disabled = true): Promise<this> {
    const features: GuildFeature[] = this.features.filter(
      (feature) => feature !== GuildFeature.InvitesDisabled
    );
    if (disabled) {
      features.push(GuildFeature.InvitesDisabled);
    }
    return this.edit({
      features: features.map((feature) => String(feature) as GuildFeatures),
    });
  }

  setIncidentActions(
    incidentActions: IncidentActionsEditOptions
  ): Promise<IncidentActions> {
    return this.client.guilds.setIncidentActions(this.id, incidentActions);
  }

  async leave() {
    if (this.ownerId === this.client.user?.id) {
      throw new Error('GUILD_OWNED');
    }
    await this.client.api.users('@me').guilds(this.id).delete();
    return this.client.actions.GuildDelete.handle({ id: this.id }).guild;
  }

  async delete() {
    await this.client.api.guilds(this.id).delete();
    return this.client.actions.GuildDelete.handle({ id: this.id }).guild;
  }

  equals(guild: Guild): boolean {
    return (
      guild &&
      guild instanceof this.constructor &&
      this.id === guild.id &&
      this.available === guild.available &&
      this.splash === guild.splash &&
      this.discoverySplash === guild.discoverySplash &&
      this.name === guild.name &&
      this.memberCount === guild.memberCount &&
      this.large === guild.large &&
      this.icon === guild.icon &&
      this.ownerId === guild.ownerId &&
      this.verificationLevel === guild.verificationLevel &&
      (this.features === guild.features ||
        (this.features.length === guild.features.length &&
          this.features.every(
            (feat: GuildFeature, index: number) =>
              feat === guild.features[index]
          )))
    );
  }

  toJSON() {
    const json = super.toJSON({
      available: false,
      createdTimestamp: true,
      nameAcronym: true,
      presences: false,
      voiceStates: false,
    });
    json.iconURL = this.iconURL();
    json.splashURL = this.splashURL();
    json.discoverySplashURL = this.discoverySplashURL();
    json.bannerURL = this.bannerURL();
    return json;
  }

  markAsRead() {
    return this.client.api.guilds(this.id).ack.post();
  }

  async setCommunity(
    stats = true,
    publicUpdatesChannel?: GuildTextChannelResolvable,
    rulesChannel?: GuildTextChannelResolvable,
    reason?: string
  ): Promise<this> {
    if (stats) {
      // Check everyone role
      const everyoneRole = this.roles.everyone;
      if (everyoneRole?.mentionable) {
        await everyoneRole.setMentionable(false, reason);
      }
      // Setting
      return this.edit(
        {
          defaultMessageNotifications: 'ONLY_MENTIONS',
          explicitContentFilter: 'ALL_MEMBERS',
          features: [...this.features, GuildFeature.Community].map(
            (feature) => String(feature) as GuildFeatures
          ),
          publicUpdatesChannel:
            this.channels.resolveId(publicUpdatesChannel) || '1',
          rulesChannel: this.channels.resolveId(rulesChannel) || '1',
          // Email verification level fallback.
          verificationLevel:
            VerificationLevels[this.verificationLevel] < 1
              ? 'LOW'
              : this.verificationLevel,
        },
        reason
      );
    }
    return this.edit(
      {
        description: this.description,
        features: this.features
          .filter((feature) => feature !== GuildFeature.Community)
          .map((feature) => String(feature) as GuildFeatures),
        preferredLocale: this.preferredLocale,
        publicUpdatesChannel: null,
        rulesChannel: null,
      },
      reason
    );
  }

  async topEmojis(): Promise<Collection<number, GuildEmoji>> {
    const data = await this.client.api.guilds(this.id)['top-emojis'].get<{
      items: { emoji_rank: number; emoji_id: Snowflake }[];
    }>();
    const emojis = new Collection<number, GuildEmoji>();
    for (const emoji of data.items) {
      const resolved = this.emojis.cache.get(emoji.emoji_id);
      if (resolved) {
        emojis.set(emoji.emoji_rank, resolved);
      }
    }
    return emojis;
  }

  async setVanityCode(code = ''): Promise<Vanity> {
    if (typeof code !== 'string') {
      throw new TypeError('INVALID_VANITY_URL_CODE');
    }
    const data = await this.client.api
      .guilds(this.id, 'vanity-url')
      .patch<Vanity>({
        data: { code },
      });
    this.vanityURLCode = data.code;
    this.vanityURLUses = data.uses;

    return data;
  }

  get voiceAdapterCreator(): InternalDiscordGatewayAdapterCreator {
    return (methods: InternalDiscordGatewayAdapterLibraryMethods) => {
      this.client.voice.adapters.set(this.id, methods);
      return {
        destroy: () => {
          this.client.voice.adapters.delete(this.id);
        },
        sendPayload: (data: unknown) => {
          const { shard } = this;
          if (!shard || shard.status !== Status.READY) {
            return false;
          }
          shard.send(data);
          return true;
        },
      };
    };
  }

  _sortedRoles() {
    return Util.discordSort(this.roles.cache);
  }

  _sortedChannels(channel: GuildChannel) {
    const category = channel.type === 'GUILD_CATEGORY';
    return Util.discordSort(
      this.channels.cache.filter(
        (channelItem: GuildChannel) =>
          (['GUILD_TEXT', 'GUILD_NEWS', 'GUILD_STORE'].includes(
            String(channel.type)
          )
            ? ['GUILD_TEXT', 'GUILD_NEWS', 'GUILD_STORE'].includes(
                String(channelItem.type)
              )
            : channelItem.type === channel.type) &&
          (category || channelItem.parent === channel.parent)
      )
    );
  }
}

export { Guild, deletedGuilds };
export default { Guild, deletedGuilds };
