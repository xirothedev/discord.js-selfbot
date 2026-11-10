import Interaction from './Interaction';
import InteractionWebhook from './InteractionWebhook';
import ModalSubmitFieldsResolver from './ModalSubmitFieldsResolver';
import InteractionResponses from './interfaces/InteractionResponses';
import _ConstantsModule from '../util/Constants';
import type { APIMessage } from 'discord-api-types/v10';
import type {
  CacheType,
  PartialModalActionRow,
  PartialTextInputData,
} from '../../typings';
import type { RawModalSubmitInteractionData } from '../../typings/rawDataTypes';
import type { Message } from './Message';
import type Client from '../client/Client';

class ModalSubmitInteraction<
  Cached extends CacheType = CacheType,
> extends Interaction<Cached> {
  declare customId: string;
  declare components: PartialModalActionRow[];
  declare deferred: boolean;
  declare ephemeral: boolean | null;
  declare message: Message | APIMessage | null;
  declare fields: ModalSubmitFieldsResolver;
  declare replied: boolean;
  declare webhook: InteractionWebhook;

  constructor(client: Client, data: RawModalSubmitInteractionData) {
    super(client, data);

    this.customId = data.data.custom_id;

    this.components =
      data.data.components?.map((component) => ({
        components:
          'components' in component
            ? ModalSubmitInteraction.transformComponent(component)
            : [],
        type: 'TEXT_INPUT' as const,
      })) ?? [];

    this.message = data.message
      ? (this.channel?.messages._add(data.message) ?? data.message)
      : null;

    this.fields = new ModalSubmitFieldsResolver(this.components);

    this.deferred = false;

    this.ephemeral = null;

    this.replied = false;

    this.webhook = new InteractionWebhook(
      this.client,
      this.applicationId,
      this.token
    );
  }

  static transformComponent(rawComponent: {
    components: { value: string; type: number; custom_id: string }[];
  }): PartialTextInputData[] {
    return rawComponent.components.map((component) => ({
      customId: component.custom_id,
      type: 'TEXT_INPUT' as const,
      value: component.value,
    }));
  }

  isFromMessage() {
    return Boolean(this.message);
  }

  // These are here only for documentation purposes - they are implemented by InteractionResponses
  deferReply() {
    // Implemented by the subclass mixin.
  }
  reply() {
    // Implemented by the subclass mixin.
  }
  fetchReply() {
    // Implemented by the subclass mixin.
  }
  editReply() {
    // Implemented by the subclass mixin.
  }
  deleteReply() {
    // Implemented by the subclass mixin.
  }
  followUp() {
    // Implemented by the subclass mixin.
  }
  update() {
    // Implemented by the subclass mixin.
  }
  deferUpdate() {
    // Implemented by the subclass mixin.
  }
}

InteractionResponses.applyToClass(ModalSubmitInteraction, [
  'showModal',
  'awaitModalSubmit',
]);

export default ModalSubmitInteraction;
export { ModalSubmitInteraction };
