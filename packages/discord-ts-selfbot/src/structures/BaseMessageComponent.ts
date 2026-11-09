import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import _errorsModule from '../errors';
const { TypeError } = _errorsModule;
import _ConstantsModule from '../util/Constants';
const { MessageComponentTypes, Events } = _ConstantsModule;

/**
 * Represents an interactive component of a Message or Modal. It should not be necessary to construct this directly.
 * See {@link MessageComponent}
 */
class BaseMessageComponent {
  [key: string]: any;

  /**
   * Options for a BaseMessageComponent
   * @typedef {Object} BaseMessageComponentOptions
   * @property {MessageComponentTypeResolvable} type The type of this component
   */

  /**
   * Data that can be resolved into options for a component. This can be:
   * * MessageActionRowOptions
   * * MessageButtonOptions
   * * MessageSelectMenuOptions
   * * TextInputComponentOptions
   * @typedef {MessageActionRowOptions|MessageButtonOptions|MessageSelectMenuOptions} MessageComponentOptions
   */

  /**
   * Components that can be sent in a payload. These can be:
   * * MessageActionRow
   * * MessageButton
   * * MessageSelectMenu
   * * TextInputComponent
   * @typedef {MessageActionRow|MessageButton|MessageSelectMenu} MessageComponent
   * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
   */

  /**
   * Data that can be resolved to a MessageComponentType. This can be:
   * * MessageComponentType
   * * string
   * * number
   * @typedef {string|number|MessageComponentType} MessageComponentTypeResolvable
   */

  /**
   * @param {BaseMessageComponent|BaseMessageComponentOptions} [data={}] The options for this component
   */
  constructor(data: any) {
    /**
     * The type of this component
     * @type {?MessageComponentType}
     */
    this.type = 'type' in data ? BaseMessageComponent.resolveType(data.type) : null;
  }

  setup(data: any) {
    /**
     * The data for this component
     * @type {MessageComponentOptions}
     */
    this.data = data;
  }

  /**
   * The id of this component
   * @type {number}
   * @readonly
   */
  get id() {
    return this.data.id;
  }

  /**
   * Constructs a component based on the type of the incoming data
   * @param {MessageComponentOptions} data Data for a MessageComponent
   * @param {Client|WebhookClient} [client] Client constructing this component
   * @returns {?(MessageComponent|ModalComponent)}
   * @private
   */
  static create(data: any, client: any = null) {
    let component;
    let type = data.type;
    const FileComponent = require('./FileComponent').default;
    const SeparatorComponent = require('./SeparatorComponent').default;
    const ContainerComponent = require('./ContainerComponent').default;
    const MessageActionRow = require('./MessageActionRow').default;
    const MessageButton = require('./MessageButton').default;
    const MessageSelectMenu = require('./MessageSelectMenu').default;
    const TextInputComponent = require('./TextInputComponent').default;
    const SectionComponent = require('./SectionComponent').default;
    const TextDisplayComponent = require('./TextDisplayComponent').default;
    const ThumbnailComponent = require('./ThumbnailComponent').default;
    const MediaGalleryComponent = require('./MediaGalleryComponent').default;

    if (typeof type === 'string') type = MessageComponentTypes[type];

    switch (type) {
      case MessageComponentTypes.ACTION_ROW: {
        component = data instanceof MessageActionRow ? data : new MessageActionRow(data, client);
        break;
      }
      case MessageComponentTypes.BUTTON: {
        component = data instanceof MessageButton ? data : new MessageButton(data);
        break;
      }
      case MessageComponentTypes.STRING_SELECT:
      case MessageComponentTypes.USER_SELECT:
      case MessageComponentTypes.ROLE_SELECT:
      case MessageComponentTypes.MENTIONABLE_SELECT:
      case MessageComponentTypes.CHANNEL_SELECT: {
        component = data instanceof MessageSelectMenu ? data : new MessageSelectMenu(data);
        break;
      }
      case MessageComponentTypes.TEXT_INPUT: {
        component = data instanceof TextInputComponent ? data : new TextInputComponent(data);
        break;
      }
      case MessageComponentTypes.SECTION: {
        component = data instanceof SectionComponent ? data : new SectionComponent(data);
        break;
      }
      case MessageComponentTypes.TEXT_DISPLAY: {
        component = data instanceof TextDisplayComponent ? data : new TextDisplayComponent(data);
        break;
      }
      case MessageComponentTypes.THUMBNAIL: {
        component = data instanceof ThumbnailComponent ? data : new ThumbnailComponent(data);
        break;
      }
      case MessageComponentTypes.MEDIA_GALLERY: {
        component = data instanceof MediaGalleryComponent ? data : new MediaGalleryComponent(data);
        break;
      }
      case MessageComponentTypes.FILE: {
        component = data instanceof FileComponent ? data : new FileComponent(data);
        break;
      }
      case MessageComponentTypes.SEPARATOR: {
        component = data instanceof SeparatorComponent ? data : new SeparatorComponent(data);
        break;
      }
      case MessageComponentTypes.CONTAINER: {
        component = data instanceof ContainerComponent ? data : new ContainerComponent(data);
        break;
      }
      default:
        if (client) {
          client.emit(Events.DEBUG, `[BaseMessageComponent] Received component with unknown type: ${data.type}`);
        } else {
          throw new TypeError('INVALID_TYPE', 'data.type', 'valid MessageComponentType');
        }
    }
    return component;
  }

  /**
   * Resolves the type of a component
   * @param {MessageComponentTypeResolvable} type The type to resolve
   * @returns {MessageComponentType}
   * @private
   */
  static resolveType(type: any) {
    return typeof type === 'string' ? type : MessageComponentTypes[type];
  }

  static extractInteractiveComponents(component: any) {
    let type = component.type;
    if (typeof type === 'string') type = MessageComponentTypes[type];
    switch (type) {
      case MessageComponentTypes.ACTION_ROW:
        return component.components;
      case MessageComponentTypes.SECTION:
        return [...component.components, component.accessory];
      case MessageComponentTypes.CONTAINER:
        return component.components.flatMap(BaseMessageComponent.extractInteractiveComponents);
      default:
        return [component];
    }
  }
}

export default BaseMessageComponent;
export { BaseMessageComponent };
