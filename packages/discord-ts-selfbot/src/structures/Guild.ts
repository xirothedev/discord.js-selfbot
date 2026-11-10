import process from "node:process";
import { Collection } from "@discordjs/collection";
import AnonymousGuild from "./AnonymousGuild";
import GuildAuditLogs from "./GuildAuditLogs";
import GuildPreview from "./GuildPreview";
import GuildTemplate from "./GuildTemplate";
import Integration from "./Integration";
import Webhook from "./Webhook";
import WelcomeScreen from "./WelcomeScreen";
import _errorsModule from "../errors";

const { Error } = _errorsModule;
import AutoModerationRuleManager from "../managers/AutoModerationRuleManager";
import GuildBanManager from "../managers/GuildBanManager";
import GuildChannelManager from "../managers/GuildChannelManager";
import GuildEmojiManager from "../managers/GuildEmojiManager";
import GuildInviteManager from "../managers/GuildInviteManager";
import GuildMemberManager from "../managers/GuildMemberManager";
import GuildScheduledEventManager from "../managers/GuildScheduledEventManager";
import GuildSettingManager from "../managers/GuildSettingManager";
import GuildStickerManager from "../managers/GuildStickerManager";
import PresenceManager from "../managers/PresenceManager";
import RoleManager from "../managers/RoleManager";
import StageInstanceManager from "../managers/StageInstanceManager";
import VoiceStateManager from "../managers/VoiceStateManager";
import _ConstantsModule from "../util/Constants";

const {
  DefaultMessageNotificationLevels,
  VerificationLevels,
  ExplicitContentFilterLevels,
  Status,
  MFALevels,
  PremiumTiers,
} = _ConstantsModule;
import DataResolver from "../util/DataResolver";
import SystemChannelFlags from "../util/SystemChannelFlags";
import Util from "../util/Util";
import { GuildFeature } from "discord-api-types/v10";
import type {
  APIGuildIntegration,
  RESTGetAPIAuditLogResult,
  RESTGetAPIGuildIntegrationsResult,
  RESTGetAPIGuildPreviewResult,
  RESTGetAPIGuildTemplatesResult,
  RESTGetAPIGuildWebhooksResult,
  RESTGetAPIGuildWelcomeScreenResult,
  RESTGetAPIGuildWidgetSettingsResult,
  RESTPatchAPIGuildResult,
  RESTPatchAPIGuildWelcomeScreenResult,
  RESTPostAPIGuildTemplatesResult,
  Snowflake,
} from "discord-api-types/v10";
import type {
  RawGuildData,
  RawGuildTemplateData,
} from "../../typings/rawDataTypes";
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
} from "../../typings";
import type { GuildChannel } from "./GuildChannel";
import type { GuildEntity } from "../types/entities/guild";
import type { PatchOf } from "../types/schema";
import type { GuildEmoji } from "./GuildEmoji";
import type Client from "../client/Client";
import type { GuildFeatures } from "../../typings";

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

class Guild extends AnonymousGuild implements GuildEntity {
  declare client: Client;
  declare afkChannelId: GuildEntity["afkChannelId"];
  declare afkTimeout: GuildEntity["afkTimeout"];
  declare applicationId: GuildEntity["applicationId"];
  declare maxVideoChannelUsers: GuildEntity["maxVideoChannelUsers"];
  declare maxStageVideoChannelUsers: GuildEntity["maxStageVideoChannelUsers"];
  declare approximateMemberCount: GuildEntity["approximateMemberCount"];
  declare approximatePresenceCount: GuildEntity["approximatePresenceCount"];
  declare autoModerationRules: GuildEntity["autoModerationRules"];
  declare available: GuildEntity["available"];
  declare bans: GuildEntity["bans"];
  declare channels: GuildEntity["channels"];
  declare defaultMessageNotifications: GuildEntity["defaultMessageNotifications"];
  declare discoverySplash: GuildEntity["discoverySplash"];
  declare emojis: GuildEntity["emojis"];
  declare explicitContentFilter: GuildEntity["explicitContentFilter"];
  declare invites: GuildEntity["invites"];
  declare joinedTimestamp: GuildEntity["joinedTimestamp"];
  declare large: GuildEntity["large"];
  declare maximumMembers: GuildEntity["maximumMembers"];
  declare maximumPresences: GuildEntity["maximumPresences"];
  declare memberCount: GuildEntity["memberCount"];
  declare members: GuildEntity["members"];
  declare mfaLevel: GuildEntity["mfaLevel"];
  declare ownerId: GuildEntity["ownerId"];
  declare preferredLocale: GuildEntity["preferredLocale"];
  declare premiumProgressBarEnabled: GuildEntity["premiumProgressBarEnabled"];
  declare premiumTier: GuildEntity["premiumTier"];
  declare presences: GuildEntity["presences"];
  declare publicUpdatesChannelId: GuildEntity["publicUpdatesChannelId"];
  declare roles: GuildEntity["roles"];
  declare rulesChannelId: GuildEntity["rulesChannelId"];
  declare safetyAlertsChannelId: GuildEntity["safetyAlertsChannelId"];
  declare scheduledEvents: GuildEntity["scheduledEvents"];
  declare settings: GuildEntity["settings"];
  declare shardId: GuildEntity["shardId"];
  declare stageInstances: GuildEntity["stageInstances"];
  declare stickers: GuildEntity["stickers"];
  declare incidentsData: GuildEntity["incidentsData"];
  declare systemChannelFlags: GuildEntity["systemChannelFlags"];
  declare systemChannelId: GuildEntity["systemChannelId"];
  declare vanityURLUses: GuildEntity["vanityURLUses"];
  declare voiceStates: GuildEntity["voiceStates"];
  declare widgetChannelId: GuildEntity["widgetChannelId"];
  declare widgetEnabled: GuildEntity["widgetEnabled"];

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
    if ("unavailable" in data && data.unavailable) {
      this.available = false;
    } else {
      this._patch(data);
      if (!("channels" in data) || !data.channels) {
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
        "Guild#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.",
        "DeprecationWarning"
      );
    }

    return deletedGuilds.has(this);
  }

  set deleted(value: boolean) {
    if (!deprecationEmittedForDeleted) {
      deprecationEmittedForDeleted = true;
      process.emitWarning(
        "Guild#deleted is deprecated, see https://github.com/discordjs/discord.js/issues/7091.",
        "DeprecationWarning"
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

  _patch(data: PatchOf<"Guild">) {
    super._patch(data);
    this.id = data.id!;
    if ("name" in data && data.name !== undefined) {
      this.name = data.name;
    }
    if ("icon" in data && data.icon !== undefined) {
      this.icon = data.icon;
    }
    if ("unavailable" in data && data.unavailable) {
      this.available = !data.unavailable;
    } else {
      this.available ??= true;
    }

    if ("discovery_splash" in data && data.discovery_splash !== undefined) {
      this.discoverySplash = data.discovery_splash ?? null;
    }

    if ("member_count" in data && data.member_count !== undefined) {
      this.memberCount = data.member_count;
    }

    if ("large" in data && data.large !== undefined) {
      this.large = Boolean(data.large);
    }

    if (
      "premium_progress_bar_enabled" in data &&
      data.premium_progress_bar_enabled !== undefined
    ) {
      this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
    }

    if ("application_id" in data && data.application_id !== undefined) {
      this.applicationId = data.application_id;
    }

    if ("afk_timeout" in data && data.afk_timeout !== undefined) {
      this.afkTimeout = data.afk_timeout;
    }

    if ("afk_channel_id" in data && data.afk_channel_id !== undefined) {
      this.afkChannelId = data.afk_channel_id;
    }

    if ("system_channel_id" in data && data.system_channel_id !== undefined) {
      this.systemChannelId = data.system_channel_id;
    }

    if ("premium_tier" in data && data.premium_tier !== undefined) {
      this.premiumTier = PremiumTiers[data.premium_tier];
    }

    if ("widget_enabled" in data && data.widget_enabled !== undefined) {
      this.widgetEnabled = data.widget_enabled;
    }

    if ("widget_channel_id" in data && data.widget_channel_id !== undefined) {
      this.widgetChannelId = data.widget_channel_id;
    }

    if (
      "explicit_content_filter" in data &&
      data.explicit_content_filter !== undefined
    ) {
      this.explicitContentFilter =
        ExplicitContentFilterLevels[data.explicit_content_filter];
    }

    if ("mfa_level" in data && data.mfa_level !== undefined) {
      this.mfaLevel = MFALevels[data.mfa_level];
    }

    if ("joined_at" in data && data.joined_at !== undefined) {
      this.joinedTimestamp = new Date(data.joined_at).getTime();
    }

    if (
      "default_message_notifications" in data &&
      data.default_message_notifications !== undefined
    ) {
      this.defaultMessageNotifications =
        DefaultMessageNotificationLevels[data.default_message_notifications];
    }

    if (
      "system_channel_flags" in data &&
      data.system_channel_flags !== undefined
    ) {
      this.systemChannelFlags = new SystemChannelFlags(
        data.system_channel_flags
      ).freeze();
    }

    if ("max_members" in data && data.max_members !== undefined) {
      this.maximumMembers = data.max_members ?? null;
    } else {
      this.maximumMembers ??= null;
    }

    if ("max_presences" in data && data.max_presences !== undefined) {
      this.maximumPresences = data.max_presences ?? 25_000;
    } else {
      this.maximumPresences ??= null;
    }

    if (
      "max_video_channel_users" in data &&
      data.max_video_channel_users !== undefined
    ) {
      this.maxVideoChannelUsers = data.max_video_channel_users ?? null;
    } else {
      this.maxVideoChannelUsers ??= null;
    }

    if (
      "max_stage_video_channel_users" in data &&
      data.max_stage_video_channel_users !== undefined
    ) {
      this.maxStageVideoChannelUsers =
        data.max_stage_video_channel_users ?? null;
    } else {
      this.maxStageVideoChannelUsers ??= null;
    }

    if (
      "approximate_member_count" in data &&
      data.approximate_member_count !== undefined
    ) {
      this.approximateMemberCount = data.approximate_member_count ?? null;
    } else {
      this.approximateMemberCount ??= null;
    }

    if (
      "approximate_presence_count" in data &&
      data.approximate_presence_count !== undefined
    ) {
      this.approximatePresenceCount = data.approximate_presence_count ?? null;
    } else {
      this.approximatePresenceCount ??= null;
    }

    this.vanityURLUses ??= null;

    if ("rules_channel_id" in data && data.rules_channel_id !== undefined) {
      this.rulesChannelId = data.rules_channel_id;
    }

    if (
      "public_updates_channel_id" in data &&
      data.public_updates_channel_id !== undefined
    ) {
      this.publicUpdatesChannelId = data.public_updates_channel_id;
    }

    if ("preferred_locale" in data && data.preferred_locale !== undefined) {
      this.preferredLocale = data.preferred_locale;
    }

    if (
      "safety_alerts_channel_id" in data &&
      data.safety_alerts_channel_id !== undefined
    ) {
      this.safetyAlertsChannelId = data.safety_alerts_channel_id;
    } else {
      this.safetyAlertsChannelId ??= null;
    }

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

    if ("owner_id" in data && data.owner_id !== undefined) {
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

    if (!this.emojis) {
      this.emojis = new GuildEmojiManager(this);
      if (data.emojis) {
        for (const emoji of data.emojis) this.emojis._add(emoji);
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
        for (const sticker of data.stickers) this.stickers._add(sticker);
      }
    } else if (data.stickers) {
      this.client.actions.GuildStickersUpdate.handle({
        guild_id: this.id,
        stickers: data.stickers,
      });
    }

    if ("incidents_data" in data && data.incidents_data !== undefined) {
      this.incidentsData = data.incidents_data
        ? Util.transformAPIIncidentsData(data.incidents_data)
        : null;
    } else {
      this.incidentsData ??= null;
    }
  }

  get joinedAt() {
    return new Date(this.joinedTimestamp);
  }

  discoverySplashURL({ format = "webp", size }: StaticImageURLOptions = {}) {
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
        "Guild#me is deprecated. Use Guild#members#me instead.",
        "DeprecationWarning"
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
    return data.reduce(
      (
        collection: Collection<Snowflake | string, Integration>,
        integration: APIGuildIntegration
      ) =>
        collection.set(
          integration.id,
          new Integration(this.client, integration, this)
        ),
      new Collection<Snowflake | string, Integration>()
    );
  }

  async fetchTemplates() {
    const templates = await this.client.api
      .guilds(this.id)
      .templates.get<RESTGetAPIGuildTemplatesResult>();
    return templates.reduce(
      (col: Collection<string, GuildTemplate>, data: RawGuildTemplateData) =>
        col.set(data.code, new GuildTemplate(this.client, data)),
      new Collection<string, GuildTemplate>()
    );
  }

  async fetchWelcomeScreen() {
    const data = await this.client.api
      .guilds(this.id, "welcome-screen")
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

  async fetchVanityData() {
    const data = await this.client.api
      .guilds(this.id, "vanity-url")
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

  async fetchAuditLogs<T extends GuildAuditLogsResolvable = "ALL">({
    before,
    after,
    limit,
    user,
    type,
  }: GuildAuditLogsFetchOptions<T> = {}): Promise<GuildAuditLogs<T>> {
    const data = await this.client.api
      .guilds(this.id)
      ["audit-logs"].get<RESTGetAPIAuditLogResult>({
        query: {
          action_type:
            typeof type === "string" ? GuildAuditLogs.Actions[type] : type,
          after: typeof after === "string" ? after : after?.id,
          before: typeof before === "string" ? before : before?.id,
          limit,
          user_id: this.client.users.resolveId(user),
        },
      });

    return GuildAuditLogs.build<T>(this, data);
  }

  async edit(data: GuildEditData, reason?: string): Promise<this> {
    const _data: Record<string, unknown> = {};
    if (data.name) {
      _data.name = data.name;
    }
    if (data.verificationLevel !== undefined) {
      _data.verification_level =
        typeof data.verificationLevel === "number"
          ? data.verificationLevel
          : data.verificationLevel === null
            ? null
            : VerificationLevels[data.verificationLevel];
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
    if (data.icon !== undefined) {
      _data.icon = await DataResolver.resolveImage(data.icon);
    }
    if (data.owner) {
      _data.owner_id = this.client.users.resolveId(data.owner);
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
    if (data.explicitContentFilter !== undefined) {
      _data.explicit_content_filter =
        typeof data.explicitContentFilter === "number"
          ? data.explicitContentFilter
          : data.explicitContentFilter === null
            ? null
            : ExplicitContentFilterLevels[data.explicitContentFilter];
    }
    if (data.defaultMessageNotifications !== undefined) {
      _data.default_message_notifications =
        typeof data.defaultMessageNotifications === "number"
          ? data.defaultMessageNotifications
          : data.defaultMessageNotifications === null
            ? null
            : DefaultMessageNotificationLevels[
                data.defaultMessageNotifications
              ];
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
    if ("premiumProgressBarEnabled" in data) {
      _data.premium_progress_bar_enabled = data.premiumProgressBarEnabled;
    }
    const newData = await this.client.api
      .guilds(this.id)
      .patch<RESTPatchAPIGuildResult>({ data: _data, reason });
    this.client.actions.GuildUpdate.handle(newData);
    return this;
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
      .guilds(this.id, "welcome-screen")
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

  /* eslint-disable max-len */
  setDefaultMessageNotifications(
    defaultMessageNotifications:
      | DefaultMessageNotificationLevel
      | number
      | null,
    reason?: string
  ): Promise<this> {
    return this.edit({ defaultMessageNotifications }, reason);
  }
  /* eslint-enable max-len */

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
        "The Guild#setChannelPositions method is deprecated. Use GuildChannelManager#setPositions instead.",
        "DeprecationWarning"
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
        "The Guild#setRolePositions method is deprecated. Use RoleManager#setPositions instead.",
        "DeprecationWarning"
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
    if (this.ownerId === this.client.user!.id) {
      throw new Error("GUILD_OWNED");
    }
    await this.client.api.users("@me").guilds(this.id).delete();
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
            (feat: GuildFeature, i: number) => feat === guild.features[i]
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
          defaultMessageNotifications: "ONLY_MENTIONS",
          explicitContentFilter: "ALL_MEMBERS",
          features: [...this.features, GuildFeature.Community].map(
            (feature) => String(feature) as GuildFeatures
          ),
          publicUpdatesChannel:
            this.channels.resolveId(publicUpdatesChannel) || "1",
          rulesChannel: this.channels.resolveId(rulesChannel) || "1",
          verificationLevel:
            VerificationLevels[this.verificationLevel] < 1
              ? "LOW"
              : this.verificationLevel, // Email
        },
        reason
      );
    }
    return this.edit(
      {
        publicUpdatesChannel: null,
        rulesChannel: null,
        features: this.features
          .filter((feature) => feature !== GuildFeature.Community)
          .map((feature) => String(feature) as GuildFeatures),
        preferredLocale: this.preferredLocale,
        description: this.description,
      },
      reason
    );
  }

  topEmojis(): Promise<Collection<number, GuildEmoji>> {
    return new Promise<Collection<number, GuildEmoji>>((resolve, reject) => {
      this.client.api
        .guilds(this.id)
        ["top-emojis"].get<{
          items: { emoji_rank: number; emoji_id: Snowflake }[];
        }>()
        .then((data) => {
          const emojis = new Collection<number, GuildEmoji>();
          for (const emoji of data.items) {
            const resolved = this.emojis.cache.get(emoji.emoji_id);
            if (resolved) {
              emojis.set(emoji.emoji_rank, resolved);
            }
          }
          resolve(emojis);
        })
        .catch(reject);
    });
  }

  async setVanityCode(code = ""): Promise<Vanity> {
    if (typeof code !== "string") {
      throw new TypeError("INVALID_VANITY_URL_CODE");
    }
    const data = await this.client.api
      .guilds(this.id, "vanity-url")
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
          if (!this.shard || this.shard.status !== Status.READY) return false;
          this.shard!.send(data);
          return true;
        },
      };
    };
  }

  _sortedRoles() {
    return Util.discordSort(this.roles.cache);
  }

  _sortedChannels(channel: GuildChannel) {
    const category = channel.type === "GUILD_CATEGORY";
    return Util.discordSort(
      this.channels.cache.filter(
        (c: GuildChannel) =>
          (["GUILD_TEXT", "GUILD_NEWS", "GUILD_STORE"].includes(
            String(channel.type)
          )
            ? ["GUILD_TEXT", "GUILD_NEWS", "GUILD_STORE"].includes(
                String(c.type)
              )
            : c.type === channel.type) &&
          (category || c.parent === channel.parent)
      )
    );
  }
}

export { Guild, deletedGuilds };
export default { Guild, deletedGuilds };
