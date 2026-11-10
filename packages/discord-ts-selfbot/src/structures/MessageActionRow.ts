import BaseMessageComponent from './BaseMessageComponent';
import _ConstantsModule from '../util/Constants';
const { MessageComponentTypes } = _ConstantsModule;
import type { Client } from '../client/Client';
import type { MessageActionRowComponentResolvable, MessageActionRowOptions } from '../../typings';

type MessageActionRowData = MessageActionRow | MessageActionRowOptions;

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
  declare components: import('../../typings').MessageActionRowComponent[];
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
  constructor(data: MessageActionRowData = { components: [] }, client: Client | null = null) {
    super({ type: 'ACTION_ROW' });

    /**
     * The components in this action row
     * @type {MessageActionRowComponent[]}
     */
    this.components = data.components?.map(c => BaseMessageComponent.create(c, client)) ?? [];

    super.setup(data);
  }

  /**
   * Adds components to the action row.
   * @param {...MessageActionRowComponentResolvable[]} components The components to add
   * @returns {MessageActionRow}
   */
  addComponents(...components: (MessageActionRowComponentResolvable | MessageActionRowComponentResolvable[])[]) {
    this.components.push(...flattenComponents(components).map(c => BaseMessageComponent.create(c)));
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
      ...flattenComponents(components).map(c => BaseMessageComponent.create(c)),
    );
    return this;
  }

  /**
   * Transforms the action row to a plain object.
   * @returns {APIMessageComponent} The raw data of this action row
   */
  toJSON() {
    return {
      components: this.components.map(c => c.toJSON()),
      type: MessageComponentTypes[this.type!],
    };
  }
}

export default MessageActionRow;
export { MessageActionRow };

/**
 * @external APIMessageComponent
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object}
 */
