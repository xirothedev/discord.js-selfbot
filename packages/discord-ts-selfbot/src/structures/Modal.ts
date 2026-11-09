import BaseMessageComponent from './BaseMessageComponent';
import _ConstantsModule from '../util/Constants';
const { InteractionTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import Util from '../util/Util';

/**
 * Represents a modal (form) to be shown in response to an interaction
 */
class Modal {
  declare components: import('../../typings').MessageActionRow<import('../../typings').ModalActionRowComponent>[];
  declare customId: string | null;
  declare title: string | null;
  declare nonce: string;
  declare id: string;
  declare applicationId: string;
  declare channelId: string;
  declare replied: boolean;
  declare client: import('../client/Client').default;
  /**
   * @param {Object} data Modal to clone or raw data
   * @param {Client} client The client constructing this Modal, if provided
   */
  constructor(data: any = {}, client: import('../client/Client').default | null = null) {
    /**
     * A list of MessageActionRows in the modal
     * @type {MessageActionRow[]}
     */
    this.components = data.components?.map((c: any) => BaseMessageComponent.create(c, client)) ?? [];

    /**
     * A unique string to be sent in the interaction when submitted
     * @type {?string}
     */
    this.customId = data.custom_id;

    /**
     * The title to be displayed on this modal
     * @type {?string}
     */
    this.title = data.title;

    /**
     * Timestamp (Discord epoch) of when this modal was created
     * @type {Snowflake}
     */
    this.nonce = data.nonce;

    /**
     * ID slash / button / menu when modal is displayed
     * @type {Snowflake}
     */
    this.id = data.id;

    /**
     * Application sending the modal
     * @type {Snowflake}
     */
    this.applicationId = data.application.id;

    /**
     * The id of the channel the message was sent in
     * @type {Snowflake}
     */
    this.channelId = data.channel_id;

    /**
     * Whether this interaction has already been replied to
     * @type {boolean}
     */
    this.replied = false;

    Object.defineProperty(this, 'client', {
      value: client,
      writable: false,
    });
  }

  /**
   * The id of the guild the message was sent in, if any
   * @type {?Snowflake}
   * @readonly
   */
  get guildId() {
    return this.client.channels.cache.get(this.channelId)?.guildId || null;
  }

  /**
   * The channel that the message was sent in
   * @type {TextBasedChannels}
   * @readonly
   */
  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  /**
   * The guild the message was sent in (if in a guild channel)
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return this.client.guilds.resolve(this.guildId) ?? this.channel?.guild ?? null;
  }

  toJSON() {
    return {
      components: this.components.map((c: any) => c.toJSON()),
      custom_id: this.customId,
      title: this.title,
      id: this.id,
    };
  }

  /**
   * Reply to this modal with data. (Event only)
   * @returns {Promise<Message|Modal>}
   * @example
   * client.on('interactionModalCreate', modal => {
   *    // Modal > ActionRow > TextInput
   *    modal.components[0].components[0].setValue('1+1');
   *    modal.components[1].components[0].setValue('hello');
   *    modal.reply();
   * })
   */
  reply() {
    if (!this.applicationId || !this.client || !this.channelId || this.replied) throw new Error('Modal cannot reply');
    // Get Object
    const { title: _title, ...dataFinal } = this.toJSON();
    dataFinal.components = dataFinal.components
      .map((c: any) => {
        c.components[0] = {
          type: c.components[0].type,
          value: c.components[0].value,
          custom_id: c.components[0].custom_id,
        };
        return c;
      })
      .filter((c: any) => typeof c.components[0].value == 'string');
    const nonce = SnowflakeUtil.generate();
    const postData = {
      type: InteractionTypes.MODAL_SUBMIT, // Modal
      application_id: this.applicationId,
      guild_id: this.guildId,
      channel_id: this.channelId,
      data: dataFinal,
      nonce,
      session_id: this.client.sessionId,
    };
    this.client.api.interactions.post({
      data: postData,
    });
    this.replied = true;
    return Util.createPromiseInteraction(this.client, nonce, 5_000, true, this);
  }

  // TypeScript
  /**
   * Check data
   * @type {boolean}
   * @readonly
   */
  get isMessage() {
    return false;
  }
}

export default Modal;
export { Modal };
