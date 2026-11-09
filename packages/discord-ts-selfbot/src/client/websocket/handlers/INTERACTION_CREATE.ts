import AutocompleteInteraction from '../../../structures/AutocompleteInteraction';
import ButtonInteraction from '../../../structures/ButtonInteraction';
import CommandInteraction from '../../../structures/CommandInteraction';
import MessageContextMenuInteraction from '../../../structures/MessageContextMenuInteraction';
import ModalSubmitInteraction from '../../../structures/ModalSubmitInteraction';
import SelectMenuInteraction from '../../../structures/SelectMenuInteraction';
import UserContextMenuInteraction from '../../../structures/UserContextMenuInteraction';
import _ConstantsModule from '../../../util/Constants';
const { ApplicationCommandTypes, Events, InteractionTypes, MessageComponentTypes } = _ConstantsModule;

function resolveInteractionType(data: any): any {
  switch (data.type) {
    case InteractionTypes.APPLICATION_COMMAND:
      switch (data.data?.type) {
        case ApplicationCommandTypes.USER:
          return UserContextMenuInteraction;
        case ApplicationCommandTypes.MESSAGE:
          return MessageContextMenuInteraction;
        default:
          return CommandInteraction;
      }
    case InteractionTypes.MESSAGE_COMPONENT:
      switch (data.data?.component_type) {
        case MessageComponentTypes.BUTTON:
          return ButtonInteraction;
        case MessageComponentTypes.STRING_SELECT:
        case MessageComponentTypes.USER_SELECT:
        case MessageComponentTypes.ROLE_SELECT:
        case MessageComponentTypes.MENTIONABLE_SELECT:
        case MessageComponentTypes.CHANNEL_SELECT:
          return SelectMenuInteraction;
        default:
          return null;
      }
    case InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE:
      return AutocompleteInteraction;
    case InteractionTypes.MODAL_SUBMIT:
      return ModalSubmitInteraction;
    default:
      return null;
  }
}

export default (client: any, { d: data }: any) => {
  const InteractionType = resolveInteractionType(data);
  const interaction = InteractionType ? new InteractionType(client, data) : data;

  /**
   * Emitted when an interaction is created.
   * @event Client#interactionCreate
   * @param {Interaction} interaction The interaction that was created
   */
  client.emit(Events.INTERACTION_CREATE, interaction);
};
