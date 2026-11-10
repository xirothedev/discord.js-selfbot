import Action from "./Action";
import type { GatewayAutoModerationRuleUpdateDispatchData } from "discord-api-types/v10";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class AutoModerationRuleUpdateAction extends Action {
  handle(data: GatewayAutoModerationRuleUpdateDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      const oldAutoModerationRule =
        guild.autoModerationRules.cache.get(data.id)?._clone() ?? null;
      const newAutoModerationRule = guild.autoModerationRules._add(data);

      /**
       * Emitted whenever an auto moderation rule gets updated.
       * <info>This event requires the {@link Permissions.FLAGS.MANAGE_GUILD} permission.</info>
       * @event Client#autoModerationRuleUpdate
       * @param {?AutoModerationRule} oldAutoModerationRule The auto moderation rule before the update
       * @param {AutoModerationRule} newAutoModerationRule The auto moderation rule after the update
       * @deprecated This event is not received by user accounts.
       */
      client.emit(
        Events.AUTO_MODERATION_RULE_UPDATE,
        oldAutoModerationRule,
        newAutoModerationRule
      );
    }

    return {};
  }
}

export default AutoModerationRuleUpdateAction;
export { AutoModerationRuleUpdateAction };
