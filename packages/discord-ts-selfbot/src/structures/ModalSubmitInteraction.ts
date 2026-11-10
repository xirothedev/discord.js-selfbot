import Interaction from './Interaction';
import InteractionWebhook from './InteractionWebhook';
import ModalSubmitFieldsResolver from './ModalSubmitFieldsResolver';
import InteractionResponses from './interfaces/InteractionResponses';
import _ConstantsModule from '../util/Constants';
import type { APIMessage } from 'discord-api-types/v10';
import type { CacheType, PartialModalActionRow, PartialTextInputData } from '../../typings';
import type { RawModalSubmitInteractionData } from '../../typings/rawDataTypes';
import type { Message } from './Message';

/**
 * Represents a modal submit interaction.
 * @extends {Interaction}
 * @implements {InteractionResponses}
 */
class ModalSubmitInteraction<Cached extends CacheType = CacheType> extends Interaction<Cached> {
  declare customId: string;
  declare components: PartialModalActionRow[];
  declare deferred: boolean;
  declare ephemeral: boolean | null;
  declare message: Message | APIMessage | null;
  declare fields: ModalSubmitFieldsResolver;
  declare replied: boolean;
  declare webhook: InteractionWebhook;

  constructor(client: import('../client/Client').default, data: RawModalSubmitInteractionData) {
    super(client, data);

    /**
     * The custom id of the modal.
     * @type {string}
     */
    this.customId = data.data.custom_id;

    /**
     * @typedef {Object} PartialTextInputData
     * @property {string} [customId] A unique string to be sent in the interaction when submitted
     * @property {MessageComponentType} [type] The type of this component
     * @property {string} [value] Value of this text input component
     */

    /**
     * @typedef {Object} PartialModalActionRow
     * @property {MessageComponentType} [type] The type of this component
     * @property {PartialTextInputData[]} [components] Partial text input components
     */

    /**
     * The inputs within the modal
     * @type {PartialModalActionRow[]}
     */
    this.components =
      data.data.components?.map(component => ({
        type: 'TEXT_INPUT' as const,
        components: 'components' in component ? ModalSubmitInteraction.transformComponent(component) : [],
      })) ?? [];

    /**
     * The message associated with this interaction
     * @type {Message|APIMessage|null}
     */
    this.message = data.message ? (this.channel?.messages._add(data.message) ?? data.message) : null;

    /**
     * The fields within the modal
     * @type {ModalSubmitFieldsResolver}
     */
    this.fields = new ModalSubmitFieldsResolver(this.components);

    /**
     * Whether the reply to this interaction has been deferred
     * @type {boolean}
     */
    this.deferred = false;

    /**
     * Whether the reply to this interaction is ephemeral
     * @type {?boolean}
     */
    this.ephemeral = null;

    /**
     * Whether this interaction has already been replied to
     * @type {boolean}
     */
    this.replied = false;

    /**
     * An associated interaction webhook, can be used to further interact with this interaction
     * @type {InteractionWebhook}
     */
    this.webhook = new InteractionWebhook(this.client, this.applicationId, this.token);
  }

  /**
   * Transforms component data to discord.js-compatible data
   * @param {*} rawComponent The data to transform
   * @returns {PartialTextInputData[]}
   */
  static transformComponent(rawComponent: {
    components: { value: string; type: number; custom_id: string }[];
  }): PartialTextInputData[] {
    return rawComponent.components.map(component => ({
      value: component.value,
      type: 'TEXT_INPUT' as const,
      customId: component.custom_id,
    }));
  }

  /**
   * Whether this is from a {@link MessageComponentInteraction}.
   * @returns {boolean}
   */
  isFromMessage() {
    return Boolean(this.message);
  }

  // These are here only for documentation purposes - they are implemented by InteractionResponses
  /* eslint-disable no-empty-function */
  deferReply() {}
  reply() {}
  fetchReply() {}
  editReply() {}
  deleteReply() {}
  followUp() {}
  update() {}
  deferUpdate() {}
}

InteractionResponses.applyToClass(ModalSubmitInteraction, ['showModal', 'awaitModalSubmit']);

export default ModalSubmitInteraction;
export { ModalSubmitInteraction };
