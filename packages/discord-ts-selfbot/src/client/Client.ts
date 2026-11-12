import process from 'node:process';
import { setInterval } from 'node:timers';
import { Collection } from '@discordjs/collection';
import { authenticator } from 'otplib';
import BaseClient from './BaseClient';
import ActionsManager from './actions/ActionsManager';
import ClientVoiceManager from './voice/ClientVoiceManager';
import WebSocketManager from './websocket/WebSocketManager';
import _errorsModule from '../errors';

const { Error, TypeError } = _errorsModule;
import BaseGuildEmojiManager from '../managers/BaseGuildEmojiManager';
import BillingManager from '../managers/BillingManager';
import ChannelManager from '../managers/ChannelManager';
import ClientUserSettingManager from '../managers/ClientUserSettingManager';
import GuildManager from '../managers/GuildManager';
import PresenceManager from '../managers/PresenceManager';
import RelationshipManager from '../managers/RelationshipManager';
import SessionManager from '../managers/SessionManager';
import UserManager from '../managers/UserManager';
import UserNoteManager from '../managers/UserNoteManager';
import VoiceStateManager from '../managers/VoiceStateManager';
import WidgetManager from '../managers/WidgetManager';
import ShardClientUtil from '../sharding/ShardClientUtil';
import ClientPresence from '../structures/ClientPresence';
import GuildPreview from '../structures/GuildPreview';
import GuildTemplate from '../structures/GuildTemplate';
import Invite from '../structures/Invite';
import _StickerModule from '../structures/Sticker';

const { Sticker } = _StickerModule;
import StickerPack from '../structures/StickerPack';
import VoiceRegion from '../structures/VoiceRegion';
import Webhook from '../structures/Webhook';
import Widget from '../structures/Widget';
import Application from '../structures/interfaces/Application';
import _ConstantsModule from '../util/Constants';

const { Events, Status } = _ConstantsModule;
import DataResolver from '../util/DataResolver';
import Intents from '../util/Intents';
import type { ResolvedClientOptions } from '../util/Options';
import Permissions from '../util/Permissions';
import DiscordAuthWebsocket from '../util/RemoteAuth';
import Sweepers from '../util/Sweepers';
import type {
  RawGuildPreviewData,
  RawGuildTemplateData,
  RawStickerData,
  RawStickerPackData,
  RawVoiceRegionData,
  RawWebhookData,
  RawWidgetData,
} from '../../typings/rawDataTypes';
import type { RawInviteDataSource } from '../structures/Invite';
import type { Snowflake } from 'discord-api-types/v10';
import type {
  AcceptInviteOptions,
  ClientFetchInviteOptions,
  ClientOptions,
  GuildResolvable,
  GuildTemplateResolvable,
  InviteGenerationOptions,
  InviteResolvable,
  OAuth2AuthorizeOptions,
  StickerPackFetchOptions,
  TextChannelResolvable,
  WebhookDeleteOptions,
} from '../../typings';
import type ClientUser from '../structures/ClientUser';
import type { Sticker as StickerType } from '../structures/Sticker';

let deprecationEmitted = false;

interface OnboardingPromptOption {
  id: Snowflake;
}

interface OnboardingPrompt {
  id: Snowflake;
  required: boolean;
  in_onboarding: boolean;
  options: OnboardingPromptOption[];
}

interface OnboardingData {
  enabled: boolean;
  prompts: OnboardingPrompt[];
}

interface AuthorizedToken {
  id: Snowflake;
  application: { id: Snowflake };
  scopes: string[];
}

interface InstalledApplicationData {
  integration_types_config: Record<
    string,
    { oauth2_install_params: { scopes: string[] } } | undefined
  >;
}

type LoginResult = { token: string } | { ticket: string };

interface AcceptInviteResult {
  show_verification_form?: boolean;
  channel?: { id: Snowflake };
}

interface MemberVerificationField {
  field_type?: number;
  label?: string;
  description?: string | null;
  placeholder?: string | null;
  required?: boolean;
  values?: string[] | null;
  response?: boolean;
}

interface MemberVerificationData {
  form_fields: MemberVerificationField[];
  version: string;
}

function validateBasicOptions(options: ResolvedClientOptions): void {
  if (typeof options.makeCache !== 'function') {
    throw new TypeError('CLIENT_INVALID_OPTION', 'makeCache', 'a function');
  }
  if (
    typeof options.messageCacheLifetime !== 'number' ||
    Number.isNaN(options.messageCacheLifetime)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'The messageCacheLifetime',
      'a number'
    );
  }
  if (
    typeof options.messageSweepInterval !== 'number' ||
    Number.isNaN(options.messageSweepInterval)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'messageSweepInterval',
      'a number'
    );
  }
  if (typeof options.sweepers !== 'object' || options.sweepers === null) {
    throw new TypeError('CLIENT_INVALID_OPTION', 'sweepers', 'an object');
  }
  if (
    typeof options.invalidRequestWarningInterval !== 'number' ||
    Number.isNaN(options.invalidRequestWarningInterval)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'invalidRequestWarningInterval',
      'a number'
    );
  }
  if (!Array.isArray(options.partials)) {
    throw new TypeError('CLIENT_INVALID_OPTION', 'partials', 'an Array');
  }
}

function validateTimeoutOptions(options: ResolvedClientOptions): void {
  if (
    typeof options.DMChannelVoiceStatusSync !== 'number' ||
    Number.isNaN(options.DMChannelVoiceStatusSync)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'DMChannelVoiceStatusSync',
      'a number'
    );
  }
  if (
    typeof options.waitGuildTimeout !== 'number' ||
    Number.isNaN(options.waitGuildTimeout)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'waitGuildTimeout',
      'a number'
    );
  }
  if (
    typeof options.restWsBridgeTimeout !== 'number' ||
    Number.isNaN(options.restWsBridgeTimeout)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'restWsBridgeTimeout',
      'a number'
    );
  }
  if (
    typeof options.restRequestTimeout !== 'number' ||
    Number.isNaN(options.restRequestTimeout)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'restRequestTimeout',
      'a number'
    );
  }
  if (
    typeof options.restGlobalRateLimit !== 'number' ||
    Number.isNaN(options.restGlobalRateLimit)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'restGlobalRateLimit',
      'a number'
    );
  }
  if (
    typeof options.restSweepInterval !== 'number' ||
    Number.isNaN(options.restSweepInterval)
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'restSweepInterval',
      'a number'
    );
  }
  if (
    typeof options.retryLimit !== 'number' ||
    Number.isNaN(options.retryLimit)
  ) {
    throw new TypeError('CLIENT_INVALID_OPTION', 'retryLimit', 'a number');
  }
  if (typeof options.failIfNotExists !== 'boolean') {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'failIfNotExists',
      'a boolean'
    );
  }
  if (
    options.rejectOnRateLimit !== undefined &&
    !(
      typeof options.rejectOnRateLimit === 'function' ||
      Array.isArray(options.rejectOnRateLimit)
    )
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'rejectOnRateLimit',
      'an array or a function'
    );
  }
  if (typeof options.TOTPKey === 'string') {
    // Convert to base32 if not already
    options.TOTPKey = options.TOTPKey.replaceAll(/ +/gu, '').toUpperCase();
  }
}

function validateShardOptions(options: ResolvedClientOptions): void {
  // Selfbot divergence: a selfbot can shard when configured, but defaults to one shard.
  // discord.js also validates `intents` here. User accounts never send intents, so the
  // option is accepted for type parity and ignored below.
  if (
    typeof options.shardCount !== 'number' ||
    !Number.isInteger(options.shardCount) ||
    options.shardCount < 1
  ) {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'shardCount',
      'a number greater than or equal to 1'
    );
  }
  if (options.shards === 'auto') {
    // The recommended shard count is resolved on gateway connect.
  } else if (typeof options.shards === 'number') {
    options.shards = [options.shards];
  } else if (Array.isArray(options.shards)) {
    options.shards = [
      ...new Set(
        options.shards.filter((id: number) => Number.isInteger(id) && id >= 0)
      ),
    ];
    if (!options.shards.length) {
      throw new RangeError('CLIENT_INVALID_PROVIDED_SHARDS');
    }
    if (options.shardCount === 1) {
      options.shardCount = options.shards.length;
    }
  } else if (options.shards === undefined) {
    options.shards = Array.from(
      { length: options.shardCount },
      (_index, id) => id
    );
  } else {
    throw new TypeError(
      'CLIENT_INVALID_OPTION',
      'shards',
      "'auto', a number or array of numbers"
    );
  }
}

class Client extends BaseClient {
  declare _cleanups: Set<() => void>;
  declare _finalizers: FinalizationRegistry<{
    cleanup: () => void;
    message?: string;
    name?: string;
  }>;
  declare ws: WebSocketManager;
  declare actions: ActionsManager;
  declare voice: ClientVoiceManager;
  declare voiceStates: VoiceStateManager;
  declare shard: ShardClientUtil | null;
  declare users: UserManager;
  declare guilds: GuildManager;
  declare channels: ChannelManager;
  declare sweepers: Sweepers;
  declare presence: ClientPresence;
  declare presences: PresenceManager;
  declare notes: UserNoteManager;
  declare relationships: RelationshipManager;
  declare billing: BillingManager;
  declare sessions: SessionManager;
  declare settings: ClientUserSettingManager;
  declare widgets: WidgetManager;
  declare token: string | null;
  declare user: ClientUser | null;
  declare application: Application | null;
  declare readyAt: Date | null;
  declare authenticator: typeof authenticator;
  declare sweepMessageInterval: NodeJS.Timeout | null;
  declare code: string | null;

  constructor(options?: ClientOptions) {
    super(options);

    this._validateOptions();

    this._cleanups = new Set();

    this._finalizers = new FinalizationRegistry(this._finalize.bind(this));

    this.ws = new WebSocketManager(this);

    this.actions = new ActionsManager(this);

    this.voice = new ClientVoiceManager(this);

    this.voiceStates = new VoiceStateManager({ client: this });

    const shardingMode = process.env.SHARDING_MANAGER_MODE;
    this.shard =
      process.env.SHARDING_MANAGER &&
      (shardingMode === 'process' || shardingMode === 'worker')
        ? ShardClientUtil.singleton(this, shardingMode)
        : null;

    this.users = new UserManager(this);

    this.guilds = new GuildManager(this);

    this.channels = new ChannelManager(this);

    this.sweepers = new Sweepers(this, this.options.sweepers);

    this.presence = new ClientPresence(this, this.options.presence);

    this.presences = new PresenceManager(this);

    this.notes = new UserNoteManager(this);

    this.relationships = new RelationshipManager(this);

    this.billing = new BillingManager(this);

    this.sessions = new SessionManager(this);

    this.settings = new ClientUserSettingManager(this);

    this.widgets = new WidgetManager(this);

    Object.defineProperty(this, 'token', { writable: true });
    this.token =
      !this.token && 'DISCORD_TOKEN' in process.env
        ? (process.env.DISCORD_TOKEN ?? null)
        : null;

    this.user = null;

    this.application = null;

    this.readyAt = null;

    this.authenticator = authenticator;

    this.authenticator.options = {
      digits: 6,
      step: 30,
    };

    if (this.options.messageSweepInterval > 0) {
      process.emitWarning(
        'The message sweeping client options are deprecated, use the global sweepers instead.',
        'DeprecationWarning'
      );
      this.sweepMessageInterval = setInterval(
        this.sweepMessages.bind(this),
        this.options.messageSweepInterval * 1000
      ).unref();
    } else {
      this.sweepMessageInterval = null;
    }
  }

  get emojis() {
    const emojis = new BaseGuildEmojiManager(this);
    for (const guild of this.guilds.cache.values()) {
      if (guild.available) {
        for (const emoji of guild.emojis.cache.values()) {
          if (emoji.id) {
            emojis.cache.set(emoji.id, emoji);
          }
        }
      }
    }
    return emojis;
  }

  get readyTimestamp() {
    return this.readyAt?.getTime() ?? null;
  }

  get uptime() {
    return this.readyAt ? Date.now() - this.readyAt.getTime() : null;
  }

  async login(token: string | null = this.token): Promise<string> {
    if (!token || typeof token !== 'string') {
      throw new Error('TOKEN_INVALID');
    }
    const normalizedToken = token.replace(/^(?:Bot|Bearer)\s*/iu, '');
    this.token = normalizedToken;
    this.emit(
      Events.DEBUG,
      `
      Logging on with a user token is unfortunately against the Discord
      \`Terms of Service\` <https://support.discord.com/hc/en-us/articles/115002192352>
      and doing so might potentially get your account banned.
      Use this at your own risk.`
    );
    this.emit(
      Events.DEBUG,
      `Provided token: ${normalizedToken
        .split('.')
        .map((value: string, index: number) =>
          index > 1 ? value.replaceAll(/./gu, '*') : value
        )
        .join('.')}`
    );

    if (this.options.presence) {
      this.options.ws.presence = this.presence._parse(this.options.presence);
    }

    this.emit(Events.DEBUG, 'Preparing to connect to the gateway...');

    try {
      await this.ws.connect();
      return normalizedToken;
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  QRLogin() {
    const ws = new DiscordAuthWebsocket();
    ws.once('ready', () => ws.generateQR());
    return ws.connect(this);
  }

  /**
   * Logs the client in, establishing a WebSocket connection to Discord.
   * @param {string} email The email associated with the account
   * @param {string} password The password assicated with the account
   * @returns {string | null} Token of the account used
   *
   * @example
   * client.passLogin("test@gmail.com", "SuperSecretPa$$word", 1234)
   * @deprecated This method will not be updated until I find the most convenient way to implement MFA.
   */
  async passLogin(email: string, password: string): Promise<string | null> {
    const initial = await this.api.auth.login.post<LoginResult>({
      auth: false,
      data: {
        gift_code_sku_id: null,
        login: email,
        login_source: null,
        password,
        undelete: false,
      },
      versioned: true,
    });

    if ('token' in initial) {
      return this.login(initial.token);
    } else if ('ticket' in initial) {
      if (!this.options.TOTPKey) {
        throw new Error('TOTPKEY_MISSING');
      }
      const otp = this.authenticator.generate(this.options.TOTPKey);
      const totp = await this.api.auth.mfa.totp.post<LoginResult>({
        auth: false,
        data: {
          code: otp,
          gift_code_sku_id: null,
          login_source: null,
          ticket: initial.ticket,
        },
        versioned: true,
      });
      if ('token' in totp) {
        return this.login(totp.token);
      }
    }

    return null;
  }

  isReady() {
    return !this.ws.destroyed && this.ws.status === Status.READY;
  }

  destroy() {
    super.destroy();

    for (const fn of this._cleanups) {
      fn();
    }
    this._cleanups.clear();

    if (this.sweepMessageInterval) {
      clearInterval(this.sweepMessageInterval);
    }

    this.sweepers.destroy();
    this.ws.destroy();
    this.token = null;
  }

  async logout() {
    await this.api.auth.logout.post({
      data: {
        provider: null,
        voip_provider: null,
      },
    });
    return this.destroy();
  }

  async fetchInvite(
    invite: InviteResolvable,
    options?: ClientFetchInviteOptions
  ) {
    const code = DataResolver.resolveInviteCode(invite);
    const data = await this.api.invites(code).get<RawInviteDataSource>({
      query: {
        guild_scheduled_event_id: options?.guildScheduledEventId,
        with_counts: options?.withCounts ?? true,
        with_permissions: options?.withPermissions,
      },
    });
    return new Invite(this, data);
  }

  async fetchGuildTemplate(template: GuildTemplateResolvable) {
    const code = DataResolver.resolveGuildTemplateCode(template);
    const data = await this.api.guilds
      .templates(code)
      .get<RawGuildTemplateData>();
    return new GuildTemplate(this, data);
  }

  async fetchWebhook(id: Snowflake, token?: string) {
    const data = await this.api.webhooks(id, token).get<RawWebhookData>();
    return new Webhook(this, { token, ...data });
  }

  async deleteWebhook(
    id: Snowflake,
    { reason, token }: WebhookDeleteOptions = {}
  ) {
    if (typeof id !== 'string') {
      throw new TypeError('INVALID_TYPE', 'id', 'Snowflake');
    }
    if (typeof token !== 'string') {
      throw new TypeError('WEBHOOK_TOKEN_UNAVAILABLE');
    }
    await this.api.webhooks(id, token).delete({ reason });
  }

  async fetchVoiceRegions() {
    const apiRegions = await this.api.voice.regions.get<RawVoiceRegionData[]>();
    const regions = new Collection<string, VoiceRegion>();
    for (const region of apiRegions) {
      regions.set(region.id, new VoiceRegion(region));
    }
    return regions;
  }

  async fetchSticker(id: Snowflake): Promise<StickerType> {
    const data = await this.api.stickers(id).get<RawStickerData>();
    return new Sticker(this, data);
  }

  async fetchStickerPacks(options: { packId: Snowflake }): Promise<StickerPack>;
  async fetchStickerPacks(
    options?: StickerPackFetchOptions
  ): Promise<Collection<Snowflake, StickerPack>>;
  async fetchStickerPacks({ packId }: StickerPackFetchOptions = {}) {
    if (packId) {
      const data = await this.api(
        'sticker-packs',
        packId
      ).get<RawStickerPackData>();
      return new StickerPack(this, data);
    }

    const data = await this.api('sticker-packs').get<{
      sticker_packs: RawStickerPackData[];
    }>();
    return new Collection<Snowflake, StickerPack>(
      data.sticker_packs.map((pack: RawStickerPackData) => [
        pack.id,
        new StickerPack(this, pack),
      ])
    );
  }

  /**
   * Obtains the list of sticker packs available to Nitro subscribers from Discord.
   * @returns {Promise<Collection<Snowflake, StickerPack>>}
   * @deprecated Use {@link Client#fetchStickerPacks} instead.
   * @example
   * client.fetchPremiumStickerPacks()
   *   .then(packs => console.log(`Available sticker packs are: ${packs.map(pack => pack.name).join(', ')}`))
   *   .catch(console.error);
   */
  fetchPremiumStickerPacks() {
    if (!deprecationEmitted) {
      process.emitWarning(
        'The Client#fetchPremiumStickerPacks() method is deprecated. Use Client#fetchStickerPacks() instead.',
        'DeprecationWarning'
      );
      deprecationEmitted = true;
    }

    return this.fetchStickerPacks();
  }
  _finalize({
    cleanup,
    message,
    name,
  }: {
    cleanup: () => void;
    message?: string;
    name?: string;
  }) {
    try {
      cleanup();
      this._cleanups.delete(cleanup);
      if (message) {
        this.emit(Events.DEBUG, message);
      }
    } catch {
      this.emit(
        Events.DEBUG,
        `Garbage collection failed on ${name ?? 'an unknown item'}.`
      );
    }
  }

  sweepMessages(lifetime: number = this.options.messageCacheLifetime) {
    if (typeof lifetime !== 'number' || Number.isNaN(lifetime)) {
      throw new TypeError('INVALID_TYPE', 'lifetime', 'number');
    }
    if (lifetime <= 0) {
      this.emit(Events.DEBUG, "Didn't sweep messages - lifetime is unlimited");
      return -1;
    }

    const filter = Sweepers.outdatedMessageSweepFilter(lifetime)();
    if (!filter) {
      return -1;
    }
    const messages = this.sweepers.sweepMessages(filter);
    this.emit(
      Events.DEBUG,
      `Swept ${messages} messages older than ${lifetime} seconds`
    );
    return messages;
  }

  async fetchGuildPreview(guild: GuildResolvable) {
    const id = this.guilds.resolveId(guild);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    }
    const data = await this.api.guilds(id).preview.get<RawGuildPreviewData>();
    return new GuildPreview(this, data);
  }

  async fetchGuildWidget(guild: GuildResolvable) {
    const id = this.guilds.resolveId(guild);
    if (!id) {
      throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    }
    const data = await this.api.guilds(id, 'widget.json').get<RawWidgetData>();
    return new Widget(this, data);
  }

  async refreshAttachmentURL(...urls: string[]) {
    // Clean up the URLs
    urls = urls.map((url) => {
      const urlObject = new URL(url);
      // Clean query
      urlObject.search = '';
      return urlObject.toString();
    });
    const data = await this.api.attachments('refresh-urls').post<{
      refreshed_urls: { original: string; refreshed: string }[];
    }>({
      data: { attachment_urls: urls },
    });
    return data.refreshed_urls;
  }

  generateInvite(options: Partial<InviteGenerationOptions> = {}): string {
    if (typeof options !== 'object' || options === null) {
      throw new TypeError('INVALID_TYPE', 'options', 'object', true);
    }
    if (!this.application) {
      throw new Error('CLIENT_NOT_READY', 'generate an invite link');
    }

    const { scopes } = options;
    if (scopes === undefined || !Array.isArray(scopes)) {
      throw new TypeError(
        'INVALID_TYPE',
        'scopes',
        'Array of Invite Scopes',
        true
      );
    }
    if (
      !scopes.some((scope: string) =>
        ['bot', 'applications.commands'].includes(scope)
      )
    ) {
      throw new TypeError(
        'INVALID_TYPE',
        'scopes',
        'Array of Invite Scopes',
        true
      );
    }
    if (!scopes.includes('bot') && options.permissions) {
      throw new TypeError(
        'INVALID_TYPE',
        'permissions',
        'null when scopes does not include bot'
      );
    }

    const query = new URLSearchParams({
      client_id: this.application.id,
      scope: scopes.join(' '),
    });

    if (options.disableGuildSelect !== undefined) {
      query.set('disable_guild_select', String(options.disableGuildSelect));
    }

    if (options.permissions) {
      const permissions = Permissions.resolve(options.permissions);
      if (permissions) {
        query.set('permissions', permissions.toString());
      }
    }

    if (options.guild) {
      const guildId = this.guilds.resolveId(options.guild);
      if (!guildId) {
        throw new TypeError('INVALID_TYPE', 'options.guild', 'GuildResolvable');
      }
      query.set('guild_id', guildId);
    }

    return `${this.options.http.api}/oauth2/authorize?${query.toString()}`;
  }

  sleep(timeout: number): Promise<void> {
    return Bun.sleep(timeout);
  }

  toJSON() {
    return super.toJSON({
      readyAt: false,
    });
  }

  get sessionId() {
    return this.ws.shards.first()?.sessionId;
  }

  async acceptInvite(invite: InviteResolvable, options?: AcceptInviteOptions) {
    // ! throw new Error('METHOD_WARNING');
    const resolvedOptions = options ?? {
      bypassOnboarding: true,
      bypassVerify: true,
    };
    const code = DataResolver.resolveInviteCode(invite);
    if (!code) {
      throw new Error('INVITE_RESOLVE_CODE');
    }
    const inviteInfo = await this.fetchInvite(code);
    const guildId = inviteInfo.guild?.id;
    if (guildId && this.guilds.cache.has(guildId)) {
      return this.guilds.cache.get(guildId);
    }
    if (inviteInfo.channelId && this.channels.cache.has(inviteInfo.channelId)) {
      return this.channels.cache.get(inviteInfo.channelId);
    }
    const data = await this.api.invites(code).post<AcceptInviteResult>({
      DiscordContext: { location: 'Markdown Link' },
      data: {
        session_id: this.sessionId,
      },
    });
    this.emit(Events.DEBUG, `[Invite > Guild ${guildId}] Joined`);
    if (!guildId) {
      const channelId = inviteInfo.channelId || data.channel?.id;
      return channelId ? this.channels.cache.has(channelId) : false;
    }

    const guild = this.guilds.cache.get(guildId);
    if (inviteInfo.flags.has('GUEST')) {
      this.emit(Events.DEBUG, `[Invite > Guild ${guildId}] Guest invite`);
      return guild;
    }
    if (resolvedOptions.bypassOnboarding) {
      await this.bypassOnboarding(guildId);
    }
    if (data.show_verification_form && resolvedOptions.bypassVerify) {
      await this.bypassVerification(
        guildId,
        String(inviteInfo.guild?.verificationLevel ?? '')
      );
    }
    return guild;
  }

  async bypassOnboarding(guildId: Snowflake) {
    const onboardingData =
      await this.api.guilds[guildId].onboarding.get<OnboardingData>();
    if (!onboardingData.enabled) {
      return;
    }
    const prompts = onboardingData.prompts.filter(
      (entry) => entry.in_onboarding
    );
    if (!prompts.length) {
      return;
    }
    const onboarding_prompts_seen: Record<string, number> = {};
    const onboarding_responses: Snowflake[] = [];
    const onboarding_responses_seen: Record<string, number> = {};

    const currentDate = Date.now();

    for (const prompt of prompts) {
      onboarding_prompts_seen[prompt.id] = currentDate;
      if (prompt.required) {
        onboarding_responses.push(prompt.options[0].id);
      }
      for (const option of prompt.options) {
        onboarding_responses_seen[option.id] = currentDate;
      }
    }

    await this.api.guilds[guildId]['onboarding-responses'].post({
      data: {
        onboarding_prompts_seen,
        onboarding_responses,
        onboarding_responses_seen,
      },
    });
    this.emit(Events.DEBUG, `[Invite > Guild ${guildId}] Bypassed onboarding`);
  }

  async bypassVerification(guildId: Snowflake, verificationLevel: string) {
    if (verificationLevel === 'VERY_HIGH' && !this.user?.phone) {
      this.emit(
        Events.DEBUG,
        `[Invite > Guild ${guildId}] Cannot bypass verify (Phone required)`
      );
      return;
    }
    if (verificationLevel !== 'NONE' && !this.user?.email) {
      this.emit(
        Events.DEBUG,
        `[Invite > Guild ${guildId}] Cannot bypass verify (Email required)`
      );
      return;
    }
    let getForm: MemberVerificationData | undefined;
    try {
      getForm = await this.api
        .guilds(guildId)
        ['member-verification'].get<MemberVerificationData>({
          query: { invite_code: this.code, with_guild: false },
        });
    } catch {
      // A failed form fetch just skips the verification bypass.
    }
    if (getForm && getForm.form_fields[0]) {
      const form = Object.assign(getForm.form_fields[0], {
        response: true,
      });
      await this.api.guilds(guildId).requests['@me'].put({
        data: { form_fields: [form], version: getForm.version },
      });
      this.emit(Events.DEBUG, `[Invite > Guild ${guildId}] Bypassed verify`);
    }
  }

  redeemNitro(
    nitro: string,
    channel?: TextChannelResolvable,
    paymentSourceId?: Snowflake
  ): Promise<unknown> | false {
    if (typeof nitro !== 'string') {
      throw new TypeError('INVALID_NITRO');
    }
    const nitroCode =
      nitro.match(
        /(?:discord.gift|discord.com|discordapp.com\/gifts)\/(?<code>\w{16,25})/u
      ) ||
      nitro.match(
        /(?:discord\.gift\/|discord\.com\/gifts\/|discordapp\.com\/gifts\/)(?<code>\w+)/u
      );
    if (!nitroCode) {
      return false;
    }
    const code = nitroCode.groups?.code;
    if (!code) {
      return false;
    }
    const channelId = this.channels.resolveId(channel);
    return this.api.entitlements['gift-codes'](code).redeem.post({
      auth: true,
      data: {
        channel_id: channelId || null,
        payment_source_id: paymentSourceId || null,
      },
    });
  }

  authorizeURL(urlOAuth2: string, options: OAuth2AuthorizeOptions = {}) {
    // ! throw new Error('METHOD_WARNING');
    const url = new URL(urlOAuth2);
    if (
      !/^https:\/\/(?:canary\.|ptb\.)?discord\.com(?:\/api(?:\/v\d{1,2})?)?\/oauth2\/authorize\?/u.test(
        urlOAuth2
      )
    ) {
      throw new Error('INVALID_URL', urlOAuth2);
    }
    const searchParams = Object.fromEntries(url.searchParams);
    // Assign options
    const resolvedOptions = {
      authorize: true,
      integration_type: 0,
      location_context: {
        channel_id: '10000',
        channel_type: 10_000,
        guild_id: '10000',
      },
      permissions: '0',
      ...searchParams,
      ...options,
    };
    delete searchParams.permissions;
    delete searchParams.integration_type;
    delete searchParams.guild_id;
    return this.api.oauth2.authorize.post<{ location: string }>({
      data: resolvedOptions,
      query: searchParams,
    });
  }

  installUserApps(applicationId: Snowflake) {
    return this.api
      .applications(applicationId)
      .public.get<InstalledApplicationData>({
        query: {
          with_guild: false,
        },
      })
      .then<{ location: string } | false>(
        (rawData: InstalledApplicationData) => {
          const installTypes = rawData.integration_types_config['1'];
          if (installTypes) {
            return this.api.oauth2.authorize.post<{ location: string }>({
              data: {
                authorize: true,
                integration_type: 1,
                permissions: '0',
              },
              query: {
                client_id: applicationId,
                scope: installTypes.oauth2_install_params.scopes.join(' '),
              },
            });
          }
          return false;
        }
      );
  }

  async deauthorize(
    id: Snowflake,
    type: 'application' | 'token' = 'application'
  ): Promise<void> {
    if (type === 'application') {
      const tokens = await this.api.oauth2.tokens.get<AuthorizedToken[]>();
      const token = tokens.find((entry) => entry.application.id === id);
      if (token) {
        await this.api.oauth2.tokens(token.id).delete<undefined>();
      }
    } else {
      await this.api.oauth2.tokens(id).delete<undefined>();
    }
  }

  authorizedApplications() {
    return this.api.oauth2.tokens
      .get<AuthorizedToken[]>()
      .then((data: AuthorizedToken[]) => {
        const results = new Collection<
          Snowflake,
          {
            application: Application;
            authorizedApplicationId: Snowflake;
            scopes: string[];
            deauthorize: () => Promise<void>;
          }
        >();
        for (const o of data) {
          const application = new Application(this, o.application);
          const entry = {
            application,
            authorizedApplicationId: o.id,
            deauthorize: () => this.deauthorize(o.id, 'token'),
            scopes: o.scopes,
          };
          results.set(o.application.id, entry);
        }
        return results;
      });
  }

  _eval(script: string) {
    return eval(script);
  }

  _validateOptions(options: ResolvedClientOptions = this.options) {
    validateBasicOptions(options);
    validateTimeoutOptions(options);
    validateShardOptions(options);
    // Selfbot divergence: user accounts do not use gateway intents. Keep the option for type
    // parity and force full intents so guild-wait behaviour stays the same.
    options.intents = Intents.ALL;
  }
}

export default Client;
export { Client };
