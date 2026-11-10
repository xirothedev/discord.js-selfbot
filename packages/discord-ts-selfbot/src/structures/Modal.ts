import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
  readComponentRecord,
  readComponentString,
} from './BaseMessageComponent';
import MessageActionRow from './MessageActionRow';
import _ConstantsModule from '../util/Constants';
const { InteractionTypes } = _ConstantsModule;
import SnowflakeUtil from '../util/SnowflakeUtil';
import Util from '../util/Util';
import { isGuildBasedChannel } from '../types/channels';
import { ComponentType, type APITextInputComponent } from 'discord-api-types/v10';
import type { Client } from '../client/Client';

/**
 * Represents a modal (form) to be shown in response to an interaction
 */
class Modal {
  declare components: MessageActionRow[];
  declare customId: string | null;
  declare title: string | null;
  declare nonce: string;
  declare id: string;
  declare applicationId: string;
  declare channelId: string;
  declare replied: boolean;
  declare client: Client;
  /**
   * @param {Object} data Modal to clone or raw data
   * @param {Client} client The client constructing this Modal, if provided
   */
  constructor(data: unknown = {}, client: Client | null = null) {
    const source = isComponentDataSource(data) ? data : {};
    /**
     * A list of MessageActionRows in the modal
     * @type {MessageActionRow[]}
     */
    this.components = readComponentArray(source, 'components')
      .map(component => BaseMessageComponent.create(component, client))
      .filter((component): component is MessageActionRow => component instanceof MessageActionRow);

    /**
     * A unique string to be sent in the interaction when submitted
     * @type {?string}
     */
    this.customId = readComponentString(source, 'custom_id', 'customId') ?? null;

    /**
     * The title to be displayed on this modal
     * @type {?string}
     */
    this.title = readComponentString(source, 'title') ?? null;

    /**
     * Timestamp (Discord epoch) of when this modal was created
     * @type {Snowflake}
     */
    this.nonce = readComponentString(source, 'nonce') ?? '';

    /**
     * ID slash / button / menu when modal is displayed
     * @type {Snowflake}
     */
    this.id = readComponentString(source, 'id') ?? '';

    /**
     * Application sending the modal
     * @type {Snowflake}
     */
    const application = readComponentRecord(source, 'application');
    this.applicationId = (application ? readComponentString(application, 'id') : undefined) ?? '';

    /**
     * The id of the channel the message was sent in
     * @type {Snowflake}
     */
    this.channelId = readComponentString(source, 'channel_id', 'channelId') ?? '';

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
    const channel = this.client.channels.cache.get(this.channelId);
    return (channel && 'guildId' in channel ? channel.guildId : null) || null;
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
    const channel = this.channel;
    return this.client.guilds.resolve(this.guildId) ?? (channel && isGuildBasedChannel(channel) ? channel.guild : null);
  }

  toJSON() {
    return {
      components: this.components.map(row => ({
        type: ComponentType.ActionRow,
        components: row.components.map(component => component.toJSON()),
      })),
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
    const components = dataFinal.components
      .map(row => {
        const first = row.components[0];
        if (!first || first.type !== ComponentType.TextInput) return null;
        const input: APITextInputComponent = {
          type: first.type,
          style: first.style,
          value: first.value,
          custom_id: first.custom_id,
        };
        return { type: ComponentType.ActionRow, components: [input] };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null && typeof row.components[0]?.value === 'string');
    dataFinal.components = components;
    const nonce = SnowflakeUtil.generate();
    const postData = {
      type: InteractionTypes.MODAL_SUBMIT, // Modal
      application_id: this.applicationId,
      guild_id: this.guildId,
      channel_id: this.channelId,
      data: { ...dataFinal, components },
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
