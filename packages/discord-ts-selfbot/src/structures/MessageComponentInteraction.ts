import Interaction from './Interaction';
import InteractionWebhook from './InteractionWebhook';
import InteractionResponses from './interfaces/InteractionResponses';
import _ConstantsModule from '../util/Constants';
import type { CacheType } from '../../typings';
const { MessageComponentTypes } = _ConstantsModule;

/**
 * Represents a message component interaction.
 * @extends {Interaction}
 * @implements {InteractionResponses}
 */
class MessageComponentInteraction<Cached extends CacheType = CacheType> extends Interaction<Cached> {
  [key: string]: any;
  constructor(client: any, data: any) {
    super(client, data);

    /**
     * The id of the channel this interaction was sent in
     * @type {Snowflake}
     * @name MessageComponentInteraction#channelId
     */

    /**
     * The message to which the component was attached
     * @type {Message|APIMessage}
     */
    this.message = this.channel?.messages._add(data.message) ?? data.message;

    /**
     * The custom id of the component which was interacted with
     * @type {string}
     */
    this.customId = data.data.custom_id;

    /**
     * The type of component which was interacted with
     * @type {string}
     */
    this.componentType = MessageComponentInteraction.resolveType(data.data.component_type);

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
   * Raw message components from the API
   * * APIMessageButton
   * * APIMessageSelectMenu
   * @typedef {APIMessageButton|APIMessageSelectMenu} APIMessageActionRowComponent
   */

  /**
   * The component which was interacted with
   * @type {MessageActionRowComponent|APIMessageActionRowComponent}
   * @readonly
   */
  get component() {
    return this.message.components
      .flatMap((row: any) => row.components)
      .find((component: any) => (component.customId ?? component.custom_id) === this.customId);
  }

  /**
   * Resolves the type of a MessageComponent
   * @param {MessageComponentTypeResolvable} type The type to resolve
   * @returns {MessageComponentType}
   * @private
   */
  static resolveType(type: any) {
    return typeof type === 'string' ? type : MessageComponentTypes[type];
  }

  // These are here only for documentation purposes - they are implemented by InteractionResponses
  /* eslint-disable no-empty-function */
  deferReply() {}
  reply() {}
  fetchReply() {}
  editReply() {}
  deleteReply() {}
  followUp() {}
  deferUpdate() {}
  update() {}
  showModal() {}
  awaitModalSubmit() {}
}

InteractionResponses.applyToClass(MessageComponentInteraction);

/**
 * @external APIMessageSelectMenu
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object}
 */

/**
 * @external APIMessageButton
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object}
 */

export default MessageComponentInteraction;
export { MessageComponentInteraction };
