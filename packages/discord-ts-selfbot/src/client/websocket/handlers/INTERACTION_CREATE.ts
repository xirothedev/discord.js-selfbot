import AutocompleteInteraction from '../../../structures/AutocompleteInteraction';
import ButtonInteraction from '../../../structures/ButtonInteraction';
import CommandInteraction from '../../../structures/CommandInteraction';
import MessageContextMenuInteraction from '../../../structures/MessageContextMenuInteraction';
import ModalSubmitInteraction from '../../../structures/ModalSubmitInteraction';
import SelectMenuInteraction from '../../../structures/SelectMenuInteraction';
import UserContextMenuInteraction from '../../../structures/UserContextMenuInteraction';
import _ConstantsModule from '../../../util/Constants';
const { ApplicationCommandTypes, Events, InteractionTypes, MessageComponentTypes } = _ConstantsModule;
import type { Client } from '../../Client';
import type { WebSocketShard } from '../WebSocketShard';
import type { RawInteractionData } from '../../../../typings/rawDataTypes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isInteractionData(value: unknown): value is RawInteractionData {
  return isRecord(value) && typeof value.type === 'number';
}

type InteractionConstructor = new (...args: never[]) => unknown;

function resolveInteractionType(data: RawInteractionData): InteractionConstructor | null {
  const payload: unknown = data.data;
  switch (data.type) {
    case InteractionTypes.APPLICATION_COMMAND:
      switch (isRecord(payload) ? payload.type : undefined) {
        case ApplicationCommandTypes.USER:
          return UserContextMenuInteraction;
        case ApplicationCommandTypes.MESSAGE:
          return MessageContextMenuInteraction;
        default:
          return CommandInteraction;
      }
    case InteractionTypes.MESSAGE_COMPONENT:
      switch (isRecord(payload) ? payload.component_type : undefined) {
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

export default (client: Client, packet: { d?: unknown }, _shard: WebSocketShard) => {
  if (!isInteractionData(packet.d)) return;
  const data = packet.d;
  const InteractionType = resolveInteractionType(data);
  const interaction = InteractionType ? Reflect.construct(InteractionType, [client, data]) : data;

  /**
   * Emitted when an interaction is created.
   * @event Client#interactionCreate
   * @param {Interaction} interaction The interaction that was created
   */
  client.emit(Events.INTERACTION_CREATE, interaction);
};
