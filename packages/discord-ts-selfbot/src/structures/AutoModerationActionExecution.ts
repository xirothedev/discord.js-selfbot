import _ConstantsModule from "../util/Constants";

const { AutoModerationRuleTriggerTypes } = _ConstantsModule;
import type {
  APIAutoModerationAction,
  GatewayAutoModerationActionExecutionDispatchData,
  Snowflake,
} from "discord-api-types/v10";
import type { AutoModerationRuleTriggerType } from "../../typings";
import type { Guild } from "./Guild";

class AutoModerationActionExecution {
  declare guild: Guild;
  declare action: APIAutoModerationAction;
  declare ruleId: Snowflake;
  declare ruleTriggerType: AutoModerationRuleTriggerType;
  declare userId: Snowflake;
  declare channelId: Snowflake | null;
  declare messageId: Snowflake | null;
  declare alertSystemMessageId: Snowflake | null;
  declare content: string;
  declare matchedKeyword: string | null;
  declare matchedContent: string | null;

  constructor(
    data: GatewayAutoModerationActionExecutionDispatchData,
    guild: Guild
  ) {
    this.guild = guild;

    this.action = data.action;

    this.ruleId = data.rule_id;

    this.ruleTriggerType =
      AutoModerationRuleTriggerTypes[data.rule_trigger_type];

    this.userId = data.user_id;

    this.channelId = data.channel_id ?? null;

    this.messageId = data.message_id ?? null;

    this.alertSystemMessageId = data.alert_system_message_id ?? null;

    this.content = data.content;

    this.matchedKeyword = data.matched_keyword ?? null;

    this.matchedContent = data.matched_content ?? null;
  }

  get autoModerationRule() {
    return this.guild.autoModerationRules.cache.get(this.ruleId) ?? null;
  }
}

export default AutoModerationActionExecution;
export { AutoModerationActionExecution };
