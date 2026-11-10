import Action from "./Action";
import type { GatewayAutoModerationActionExecutionDispatchData } from "discord-api-types/v10";
import AutoModerationActionExecution from "../../structures/AutoModerationActionExecution";
import _ConstantsModule from "../../util/Constants";

const { Events } = _ConstantsModule;

class AutoModerationActionExecutionAction extends Action {
  handle(data: GatewayAutoModerationActionExecutionDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);

    if (guild) {
      /**
       * Emitted whenever an auto moderation rule is triggered.
       * <info>This event requires the {@link Permissions.FLAGS.MANAGE_GUILD} permission.</info>
       * @event Client#autoModerationActionExecution
       * @param {AutoModerationActionExecution} autoModerationActionExecution The data of the execution
       * @deprecated This event is not received by user accounts.
       */
      client.emit(
        Events.AUTO_MODERATION_ACTION_EXECUTION,
        new AutoModerationActionExecution(data, guild)
      );
    }

    return {};
  }
}

export default AutoModerationActionExecutionAction;
export { AutoModerationActionExecutionAction };
