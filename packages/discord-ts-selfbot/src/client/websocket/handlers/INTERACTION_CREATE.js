'use strict';

const AutocompleteInteraction = require('../../../structures/AutocompleteInteraction');
const ButtonInteraction = require('../../../structures/ButtonInteraction');
const CommandInteraction = require('../../../structures/CommandInteraction');
const MessageContextMenuInteraction = require('../../../structures/MessageContextMenuInteraction');
const ModalSubmitInteraction = require('../../../structures/ModalSubmitInteraction');
const SelectMenuInteraction = require('../../../structures/SelectMenuInteraction');
const UserContextMenuInteraction = require('../../../structures/UserContextMenuInteraction');
const { ApplicationCommandTypes, Events, InteractionTypes, MessageComponentTypes } = require('../../../util/Constants');

function resolveInteractionType(data) {
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

module.exports = (client, { d: data }) => {
  const InteractionType = resolveInteractionType(data);
  const interaction = InteractionType ? new InteractionType(client, data) : data;

  /**
   * Emitted when an interaction is created.
   * @event Client#interactionCreate
   * @param {Interaction} interaction The interaction that was created
   */
  client.emit(Events.INTERACTION_CREATE, interaction);
};
