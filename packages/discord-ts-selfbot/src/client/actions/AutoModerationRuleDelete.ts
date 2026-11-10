import Action from './Action';
import type { GatewayAutoModerationRuleDeleteDispatchData } from 'discord-api-types/v10';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;

class AutoModerationRuleDeleteAction extends Action {
  handle(data: GatewayAutoModerationRuleDeleteDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      const autoModerationRule = guild.autoModerationRules.cache.get(data.id);

      if (autoModerationRule) {
        guild.autoModerationRules.cache.delete(autoModerationRule.id);

        /**
         * Emitted whenever an auto moderation rule is deleted.
         * <info>This event requires the {@link Permissions.FLAGS.MANAGE_GUILD} permission.</info>
         * @event Client#autoModerationRuleDelete
         * @param {AutoModerationRule} autoModerationRule The deleted auto moderation rule
         * @deprecated This event is not received by user accounts.
         */
        client.emit(Events.AUTO_MODERATION_RULE_DELETE, autoModerationRule);
      }
    }

    return {};
  }
}

export default AutoModerationRuleDeleteAction;
export { AutoModerationRuleDeleteAction };
