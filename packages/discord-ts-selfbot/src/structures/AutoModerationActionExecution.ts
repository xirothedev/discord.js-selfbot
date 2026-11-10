import _ConstantsModule from '../util/Constants';
const { AutoModerationRuleTriggerTypes } = _ConstantsModule;
import type {
  APIAutoModerationAction,
  GatewayAutoModerationActionExecutionDispatchData,
  Snowflake,
} from 'discord-api-types/v10';
import type { AutoModerationRuleTriggerType } from '../../typings';
import type { Guild } from './Guild';

/**
 * Represents the structure of an executed action when an {@link AutoModerationRule} is triggered.
 */
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

  constructor(data: GatewayAutoModerationActionExecutionDispatchData, guild: Guild) {
    /**
     * The guild where this action was executed from.
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * The action that was executed.
     * @type {AutoModerationAction}
     */
    this.action = data.action;

    /**
     * The id of the auto moderation rule this action belongs to.
     * @type {Snowflake}
     */
    this.ruleId = data.rule_id;

    /**
     * The trigger type of the auto moderation rule which was triggered.
     * @type {AutoModerationRuleTriggerType}
     */
    this.ruleTriggerType = AutoModerationRuleTriggerTypes[data.rule_trigger_type];

    /**
     * The id of the user that triggered this action.
     * @type {Snowflake}
     */
    this.userId = data.user_id;

    /**
     * The id of the channel where this action was triggered from.
     * @type {?Snowflake}
     */
    this.channelId = data.channel_id ?? null;

    /**
     * The id of the message that triggered this action.
     * @type {?Snowflake}
     * <info>This will not be present if the message was blocked or the content was not part of any message.</info>
     */
    this.messageId = data.message_id ?? null;

    /**
     * The id of any system auto moderation messages posted as a result of this action.
     * @type {?Snowflake}
     */
    this.alertSystemMessageId = data.alert_system_message_id ?? null;

    /**
     * The content that triggered this action.
     * <info>This property requires the {@link Intents.FLAGS.MESSAGE_CONTENT} privileged gateway intent.</info>
     * @type {string}
     */
    this.content = data.content;

    /**
     * The word or phrase configured in the rule that triggered this action.
     * @type {?string}
     */
    this.matchedKeyword = data.matched_keyword ?? null;

    /**
     * The substring in content that triggered this action.
     * @type {?string}
     */
    this.matchedContent = data.matched_content ?? null;
  }

  /**
   * The auto moderation rule this action belongs to.
   * @type {?AutoModerationRule}
   * @readonly
   */
  get autoModerationRule() {
    return this.guild.autoModerationRules.cache.get(this.ruleId) ?? null;
  }
}

export default AutoModerationActionExecution;
export { AutoModerationActionExecution };
