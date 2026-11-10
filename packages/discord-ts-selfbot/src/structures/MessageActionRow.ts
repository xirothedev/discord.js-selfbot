import { ComponentType, type APIActionRowComponent, type APIComponentInMessageActionRow } from 'discord-api-types/v10';
import BaseMessageComponent, {
  isComponentDataSource,
  readComponentArray,
  type MessageComponentInstance,
} from './BaseMessageComponent';
import MessageButton from './MessageButton';
import MessageSelectMenu from './MessageSelectMenu';
import TextInputComponent from './TextInputComponent';
import type { Client } from '../client/Client';
import type { MessageActionRowComponentResolvable } from '../../typings';

type ActionRowChild = MessageButton | MessageSelectMenu | TextInputComponent;

function isActionRowChild(component: MessageComponentInstance | null): component is ActionRowChild {
  return (
    component instanceof MessageButton ||
    component instanceof MessageSelectMenu ||
    component instanceof TextInputComponent
  );
}

function flattenComponents(
  components: (MessageActionRowComponentResolvable | MessageActionRowComponentResolvable[])[],
): MessageActionRowComponentResolvable[] {
  const flattened: MessageActionRowComponentResolvable[] = [];
  for (const component of components) {
    if (Array.isArray(component)) flattened.push(...component);
    else flattened.push(component);
  }
  return flattened;
}

/**
 * Represents an action row containing message components.
 * @extends {BaseMessageComponent}
 */
class MessageActionRow extends BaseMessageComponent {
  declare components: ActionRowChild[];
  /**
   * Components that can be placed in an action row
   * * MessageButton
   * * MessageSelectMenu
   * * TextInputComponent
   * @typedef {MessageButton|MessageSelectMenu|TextInputComponent} MessageActionRowComponent
   */

  /**
   * Options for components that can be placed in an action row
   * * MessageButtonOptions
   * * MessageSelectMenuOptions
   * * TextInputComponentOptions
   * @typedef {MessageButtonOptions|MessageSelectMenuOptions|TextInputComponentOptions} MessageActionRowComponentOptions
   */

  /**
   * Data that can be resolved into components that can be placed in an action row
   * * MessageActionRowComponent
   * * MessageActionRowComponentOptions
   * @typedef {MessageActionRowComponent|MessageActionRowComponentOptions} MessageActionRowComponentResolvable
   */

  /**
   * @typedef {BaseMessageComponentOptions} MessageActionRowOptions
   * @property {MessageActionRowComponentResolvable[]} [components]
   * The components to place in this action row
   */

  /**
   * @param {MessageActionRow|MessageActionRowOptions} [data={}] MessageActionRow to clone or raw data
   * @param {Client} [client] The client constructing this MessageActionRow, if provided
   */
  constructor(data: unknown = { components: [] }, client: Client | null = null) {
    super({ type: 'ACTION_ROW' });
    const source = isComponentDataSource(data) ? data : {};

    /**
     * The components in this action row
     * @type {MessageActionRowComponent[]}
     */
    this.components = readComponentArray(source, 'components')
      .map(component => BaseMessageComponent.create(component, client))
      .filter(isActionRowChild);

    super.setup(data);
  }

  /**
   * Adds components to the action row.
   * @param {...MessageActionRowComponentResolvable[]} components The components to add
   * @returns {MessageActionRow}
   */
  addComponents(...components: (MessageActionRowComponentResolvable | MessageActionRowComponentResolvable[])[]) {
    this.components.push(
      ...flattenComponents(components)
        .map(component => BaseMessageComponent.create(component))
        .filter(isActionRowChild),
    );
    return this;
  }

  /**
   * Sets the components of the action row.
   * @param {...MessageActionRowComponentResolvable[]} components The components to set
   * @returns {MessageActionRow}
   */
  setComponents(...components: (MessageActionRowComponentResolvable | MessageActionRowComponentResolvable[])[]) {
    this.spliceComponents(0, this.components.length, ...components);
    return this;
  }

  /**
   * Removes, replaces, and inserts components in the action row.
   * @param {number} index The index to start at
   * @param {number} deleteCount The number of components to remove
   * @param {...MessageActionRowComponentResolvable[]} [components] The replacing components
   * @returns {MessageActionRow}
   */
  spliceComponents(
    index: number,
    deleteCount: number,
    ...components: (MessageActionRowComponentResolvable | MessageActionRowComponentResolvable[])[]
  ) {
    this.components.splice(
      index,
      deleteCount,
      ...flattenComponents(components)
        .map(component => BaseMessageComponent.create(component))
        .filter(isActionRowChild),
    );
    return this;
  }

  /**
   * Transforms the action row to a plain object.
   * @returns {APIMessageComponent} The raw data of this action row
   */
  toJSON(): APIActionRowComponent<APIComponentInMessageActionRow> {
    return {
      components: this.components
        .map(component => component.toJSON())
        .filter((component): component is APIComponentInMessageActionRow => component.type !== ComponentType.TextInput),
      type: ComponentType.ActionRow,
    };
  }
}

export default MessageActionRow;
export { MessageActionRow };

/**
 * @external APIMessageComponent
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object}
 */
