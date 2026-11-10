import { Collection } from '@discordjs/collection';
import CachedManager from './CachedManager';
import _errorsModule from '../errors';

const { TypeError } = _errorsModule;
import AutoModerationRule from '../structures/AutoModerationRule';
import _ConstantsModule from '../util/Constants';
import type {
  APIAutoModerationRule,
  RESTGetAPIAutoModerationRuleResult,
  RESTPatchAPIAutoModerationRuleResult,
  RESTPostAPIAutoModerationRuleResult,
  Snowflake,
} from 'discord-api-types/v10';
import type {
  AutoModerationActionOptions,
  AutoModerationRuleCreateOptions,
  AutoModerationRuleEditOptions,
  FetchAutoModerationRuleOptions,
  FetchAutoModerationRulesOptions,
} from '../../typings';
import type { Guild } from '../structures/Guild';

type AutoModerationRuleResolvableSource = AutoModerationRule | Snowflake;

function isFetchRuleOptions(
  value: unknown
): value is FetchAutoModerationRuleOptions {
  return (
    typeof value === 'object' && value !== null && 'autoModerationRule' in value
  );
}

function isFetchRulesOptions(
  value: unknown
): value is FetchAutoModerationRulesOptions {
  return typeof value === 'object' && value !== null && 'cache' in value;
}

interface FetchSingleAutoModerationRuleOptions {
  autoModerationRule: Snowflake;
  cache?: boolean;
  force?: boolean;
}
const {
  AutoModerationRuleEventTypes,
  AutoModerationRuleTriggerTypes,
  AutoModerationActionTypes,
  AutoModerationRuleKeywordPresetTypes,
} = _ConstantsModule;

function mapAction(
  action: AutoModerationActionOptions,
  guild: Guild
): Record<string, unknown> {
  return {
    metadata: {
      channel_id:
        action.metadata?.channel &&
        guild.channels.resolveId(action.metadata.channel),
      custom_message: action.metadata?.customMessage,
      duration_seconds: action.metadata?.durationSeconds,
    },
    type:
      typeof action.type === 'number'
        ? action.type
        : AutoModerationActionTypes[action.type],
  };
}

class AutoModerationRuleManager extends CachedManager<AutoModerationRule> {
  declare guild: Guild;
  constructor(guild: Guild, iterable?: Iterable<AutoModerationRule>) {
    super(guild.client, AutoModerationRule, iterable);

    this.guild = guild;
  }

  _add(data: APIAutoModerationRule, cache = true): AutoModerationRule {
    return super._add(data, cache, { extras: [this.guild] });
  }

  async create({
    name,
    eventType,
    triggerType,
    triggerMetadata,
    actions,
    enabled,
    exemptRoles,
    exemptChannels,
    reason,
  }: AutoModerationRuleCreateOptions): Promise<AutoModerationRule> {
    const { rules } = this.client.api.guilds(this.guild.id)['auto-moderation'];
    const data = await rules.post<RESTPostAPIAutoModerationRuleResult>({
      data: {
        actions: actions.map((action: AutoModerationActionOptions) =>
          mapAction(action, this.guild)
        ),
        enabled,
        event_type:
          typeof eventType === 'number'
            ? eventType
            : AutoModerationRuleEventTypes[eventType],
        exempt_channels: (exemptChannels instanceof Collection
          ? [...exemptChannels.values()]
          : exemptChannels
        )?.map((exemptChannel) => this.guild.channels.resolveId(exemptChannel)),
        exempt_roles: (exemptRoles instanceof Collection
          ? [...exemptRoles.values()]
          : exemptRoles
        )?.map((exemptRole) => this.guild.roles.resolveId(exemptRole)),
        name,
        trigger_metadata: triggerMetadata && {
          allow_list: triggerMetadata.allowList,
          keyword_filter: triggerMetadata.keywordFilter,
          mention_raid_protection_enabled:
            triggerMetadata.mentionRaidProtectionEnabled,
          mention_total_limit: triggerMetadata.mentionTotalLimit,
          presets: triggerMetadata.presets?.map((preset) =>
            typeof preset === 'number'
              ? preset
              : AutoModerationRuleKeywordPresetTypes[preset]
          ),
          regex_patterns: triggerMetadata.regexPatterns,
        },
        trigger_type:
          typeof triggerType === 'number'
            ? triggerType
            : AutoModerationRuleTriggerTypes[triggerType],
      },
      reason,
    });

    return this._add(data);
  }

  async edit(
    autoModerationRule: AutoModerationRuleResolvableSource,
    {
      name,
      eventType,
      triggerMetadata,
      actions,
      enabled,
      exemptRoles,
      exemptChannels,
      reason,
    }: AutoModerationRuleEditOptions
  ): Promise<AutoModerationRule> {
    const autoModerationRuleId = this.resolveId(autoModerationRule);

    let resolvedEventType: number | string | undefined;
    if (typeof eventType === 'number') {
      resolvedEventType = eventType;
    } else if (eventType) {
      resolvedEventType = AutoModerationRuleEventTypes[eventType];
    }

    const data = await this.client.api
      .guilds(this.guild.id)('auto-moderation')
      .rules(autoModerationRuleId)
      .patch<RESTPatchAPIAutoModerationRuleResult>({
        data: {
          actions: actions?.map((action: AutoModerationActionOptions) =>
            mapAction(action, this.guild)
          ),
          enabled,
          event_type: resolvedEventType,
          exempt_channels: (exemptChannels instanceof Collection
            ? [...exemptChannels.values()]
            : exemptChannels
          )?.map((exemptChannel) =>
            this.guild.channels.resolveId(exemptChannel)
          ),
          exempt_roles: (exemptRoles instanceof Collection
            ? [...exemptRoles.values()]
            : exemptRoles
          )?.map((exemptRole) => this.guild.roles.resolveId(exemptRole)),
          name,
          trigger_metadata: triggerMetadata && {
            allow_list: triggerMetadata.allowList,
            keyword_filter: triggerMetadata.keywordFilter,
            mention_raid_protection_enabled:
              triggerMetadata.mentionRaidProtectionEnabled,
            mention_total_limit: triggerMetadata.mentionTotalLimit,
            presets: triggerMetadata.presets?.map((preset) =>
              typeof preset === 'number'
                ? preset
                : AutoModerationRuleKeywordPresetTypes[preset]
            ),
            regex_patterns: triggerMetadata.regexPatterns,
          },
        },
        reason,
      });

    return this._add(data);
  }

  fetch(
    options: AutoModerationRuleResolvableSource | FetchAutoModerationRuleOptions
  ): Promise<AutoModerationRule>;
  fetch(
    options?: FetchAutoModerationRulesOptions
  ): Promise<Collection<Snowflake, AutoModerationRule>>;
  fetch(
    options?:
      | AutoModerationRuleResolvableSource
      | FetchAutoModerationRuleOptions
      | FetchAutoModerationRulesOptions
  ): Promise<AutoModerationRule | Collection<Snowflake, AutoModerationRule>> {
    if (!options) {
      return this._fetchMany();
    }
    const ruleOptions = isFetchRuleOptions(options) ? options : undefined;
    const resolvedAutoModerationRule = this.resolveId(
      ruleOptions?.autoModerationRule ?? options
    );
    if (resolvedAutoModerationRule) {
      return this._fetchSingle({
        autoModerationRule: resolvedAutoModerationRule,
        cache: ruleOptions?.cache,
        force: ruleOptions?.force,
      });
    }
    return this._fetchMany(isFetchRulesOptions(options) ? options : undefined);
  }

  async _fetchSingle({
    autoModerationRule,
    cache,
    force = false,
  }: FetchSingleAutoModerationRuleOptions): Promise<AutoModerationRule> {
    if (!force) {
      const existing = this.cache.get(autoModerationRule);
      if (existing) {
        return existing;
      }
    }

    const data = await this.client.api
      .guilds(this.guild.id)('auto-moderation')
      .rules(autoModerationRule)
      .get<RESTGetAPIAutoModerationRuleResult>();
    return this._add(data, cache);
  }

  async _fetchMany(
    options: FetchAutoModerationRulesOptions = {}
  ): Promise<Collection<Snowflake, AutoModerationRule>> {
    const data: APIAutoModerationRule[] = await this.client.api
      .guilds(this.guild.id)('auto-moderation')
      .rules.get();

    const rules = new Collection<Snowflake, AutoModerationRule>();
    for (const autoModerationRule of data) {
      rules.set(
        autoModerationRule.id,
        this._add(autoModerationRule, options.cache)
      );
    }
    return rules;
  }

  async delete(
    autoModerationRule: AutoModerationRuleResolvableSource,
    reason?: string
  ): Promise<void> {
    const autoModerationRuleId = this.resolveId(autoModerationRule);
    if (!autoModerationRuleId) {
      throw new TypeError(
        'INVALID_TYPE',
        'autoModerationRule',
        'AutoModerationRuleResolvable'
      );
    }
    await this.client.api
      .guilds(this.guild.id)('auto-moderation')
      .rules(autoModerationRuleId)
      .delete({ reason });
  }
}

export default AutoModerationRuleManager;
export { AutoModerationRuleManager };
