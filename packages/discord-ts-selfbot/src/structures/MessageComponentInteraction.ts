import Interaction from './Interaction';
import InteractionWebhook from './InteractionWebhook';
import InteractionResponses from './interfaces/InteractionResponses';
import _ConstantsModule from '../util/Constants';
import type { APIMessage, Snowflake } from 'discord-api-types/v10';
import type { CacheType, MessageComponentType } from '../../typings';
import type { RawMessageComponentInteractionData } from '../../typings/rawDataTypes';
import type { Message } from './Message';
const { MessageComponentTypes } = _ConstantsModule;

function isComponentType(value: unknown): value is Exclude<MessageComponentType, 'ACTION_ROW'> {
  return typeof value === 'string' && value in MessageComponentTypes && value !== 'ACTION_ROW';
}

/**
 * Represents a message component interaction.
 * @extends {Interaction}
 * @implements {InteractionResponses}
 */
class MessageComponentInteraction<Cached extends CacheType = CacheType> extends Interaction<Cached> {
  declare componentType: Exclude<MessageComponentType, 'ACTION_ROW'>;
  declare customId: string;
  declare channelId: Snowflake;
  declare deferred: boolean;
  declare ephemeral: boolean | null;
  declare message: Message | APIMessage;
  declare replied: boolean;
  declare webhook: InteractionWebhook;

  constructor(client: import('../client/Client').default, data: RawMessageComponentInteractionData) {
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
    const componentType = MessageComponentInteraction.resolveType(data.data.component_type);
    if (!componentType) throw new Error('INVALID_COMPONENT_TYPE');
    this.componentType = componentType;

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
    const rows = 'components' in this.message && this.message.components ? this.message.components : [];
    const components: unknown[] = [];
    for (const row of rows) {
      if ('components' in row && Array.isArray(row.components)) components.push(...row.components);
    }
    return components.find(component => {
      if (typeof component !== 'object' || component === null) return false;
      if ('customId' in component && component.customId === this.customId) return true;
      return 'custom_id' in component && component.custom_id === this.customId;
    });
  }

  /**
   * Resolves the type of a MessageComponent
   * @param {MessageComponentTypeResolvable} type The type to resolve
   * @returns {MessageComponentType}
   * @private
   */
  static resolveType(type: string | number | undefined): Exclude<MessageComponentType, 'ACTION_ROW'> | undefined {
    if (typeof type === 'number') {
      const name = MessageComponentTypes[type];
      return isComponentType(name) ? name : undefined;
    }
    return isComponentType(type) ? type : undefined;
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
