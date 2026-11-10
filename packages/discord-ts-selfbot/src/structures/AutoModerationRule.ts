import { Collection } from "@discordjs/collection";
import type { APIAutoModerationRule } from "discord-api-types/v10";
import type {
  AutoModerationActionOptions,
  AutoModerationRuleEventType,
  AutoModerationRuleKeywordPresetType,
  GuildBasedChannel,
  GuildChannelResolvable,
  RoleResolvable,
} from "../../typings";
import Base from "./Base";
import type { Role } from "./Role";
import type { GuildChannel } from "./GuildChannel";
import type { AutoModerationRuleEntity } from "../types/entities/auto-moderation-rule";
import type { PatchOf } from "../types/schema";
import _ConstantsModule from "../util/Constants";
import type Client from "../client/Client";
import type { Guild } from "./Guild";

const {
  AutoModerationRuleKeywordPresetTypes,
  AutoModerationRuleTriggerTypes,
  AutoModerationRuleEventTypes,
  AutoModerationActionTypes,
} = _ConstantsModule;

class AutoModerationRule extends Base implements AutoModerationRuleEntity {
  declare id: AutoModerationRuleEntity["id"];
  declare guild: AutoModerationRuleEntity["guild"];
  declare name: AutoModerationRuleEntity["name"];
  declare creatorId: AutoModerationRuleEntity["creatorId"];
  declare eventType: AutoModerationRuleEntity["eventType"];
  declare triggerType: AutoModerationRuleEntity["triggerType"];
  declare triggerMetadata: AutoModerationRuleEntity["triggerMetadata"];
  declare actions: AutoModerationRuleEntity["actions"];
  declare enabled: AutoModerationRuleEntity["enabled"];
  declare exemptRoles: AutoModerationRuleEntity["exemptRoles"];
  declare exemptChannels: AutoModerationRuleEntity["exemptChannels"];

  constructor(client: Client, data: APIAutoModerationRule, guild: Guild) {
    super(client);

    this.id = data.id;

    this.guild = guild;

    this.creatorId = data.creator_id;

    this.triggerType = AutoModerationRuleTriggerTypes[data.trigger_type];

    this._patch(data);
  }

  _patch(data: PatchOf<"AutoModerationRule">) {
    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.event_type !== undefined) {
      this.eventType = AutoModerationRuleEventTypes[data.event_type];
    }

    if (data.trigger_metadata !== undefined) {
      this.triggerMetadata = {
        allowList: data.trigger_metadata.allow_list ?? [],
        keywordFilter: data.trigger_metadata.keyword_filter ?? [],
        mentionRaidProtectionEnabled:
          data.trigger_metadata.mention_raid_protection_enabled ?? false,
        mentionTotalLimit: data.trigger_metadata.mention_total_limit ?? null,
        presets:
          data.trigger_metadata.presets?.map(
            (preset) => AutoModerationRuleKeywordPresetTypes[preset]
          ) ?? [],
        regexPatterns: data.trigger_metadata.regex_patterns ?? [],
      };
    }

    if (data.actions !== undefined) {
      this.actions = data.actions.map((action) => ({
        metadata: {
          channelId: action.metadata?.channel_id ?? null,
          customMessage: action.metadata?.custom_message ?? null,
          durationSeconds: action.metadata?.duration_seconds ?? null,
        },
        type: AutoModerationActionTypes[action.type],
      }));
    }

    if (data.enabled !== undefined) {
      this.enabled = data.enabled;
    }

    if (data.exempt_roles !== undefined) {
      this.exemptRoles = new Collection<string, Role>(
        data.exempt_roles
          .map((id) => [id, this.guild.roles.cache.get(id)] as const)
          .filter(
            (entry): entry is readonly [string, Role] => entry[1] !== undefined
          )
      );
    }

    if (data.exempt_channels !== undefined) {
      const exemptChannels = new Collection<string, GuildChannel>();
      for (const id of data.exempt_channels) {
        const channel = this.guild.channels.cache.get(id);
        if (channel) {
          exemptChannels.set(id, channel);
        }
      }
      this.exemptChannels = exemptChannels;
    }
  }

  edit(options: Record<string, unknown>) {
    return this.guild.autoModerationRules.edit(this.id, options);
  }

  delete(reason?: string) {
    return this.guild.autoModerationRules.delete(this.id, reason);
  }

  setName(name: string, reason?: string) {
    return this.edit({ name, reason });
  }

  setEventType(eventType: AutoModerationRuleEventType, reason?: string) {
    return this.edit({ eventType, reason });
  }

  setKeywordFilter(keywordFilter: string[], reason?: string) {
    return this.edit({
      reason,
      triggerMetadata: { ...this.triggerMetadata, keywordFilter },
    });
  }

  setRegexPatterns(regexPatterns: string[], reason?: string) {
    return this.edit({
      reason,
      triggerMetadata: { ...this.triggerMetadata, regexPatterns },
    });
  }

  setPresets(presets: AutoModerationRuleKeywordPresetType[], reason?: string) {
    return this.edit({
      reason,
      triggerMetadata: { ...this.triggerMetadata, presets },
    });
  }

  setAllowList(allowList: string[], reason?: string) {
    return this.edit({
      reason,
      triggerMetadata: { ...this.triggerMetadata, allowList },
    });
  }

  setMentionTotalLimit(mentionTotalLimit: number, reason?: string) {
    return this.edit({
      reason,
      triggerMetadata: { ...this.triggerMetadata, mentionTotalLimit },
    });
  }

  setMentionRaidProtectionEnabled(
    mentionRaidProtectionEnabled: boolean,
    reason?: string
  ) {
    return this.edit({
      reason,
      triggerMetadata: {
        ...this.triggerMetadata,
        mentionRaidProtectionEnabled,
      },
    });
  }

  setActions(actions: AutoModerationActionOptions[], reason?: string) {
    return this.edit({ actions, reason });
  }

  setEnabled(enabled = true, reason?: string) {
    return this.edit({ enabled, reason });
  }

  setExemptRoles(
    exemptRoles: Collection<string, Role> | RoleResolvable[],
    reason?: string
  ) {
    return this.edit({ exemptRoles, reason });
  }

  setExemptChannels(
    exemptChannels:
      | Collection<string, GuildBasedChannel>
      | GuildChannelResolvable[],
    reason?: string
  ) {
    return this.edit({ exemptChannels, reason });
  }
}

export default AutoModerationRule;
export { AutoModerationRule };
