import BaseMessageComponent from './BaseMessageComponent';
import _ConstantsModule from '../util/Constants';
const { MessageComponentTypes } = _ConstantsModule;

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
  constructor(data: any = {}, client: any = null) {
    super({ type: 'ACTION_ROW' });

    /**
     * The components in this action row
     * @type {MessageActionRowComponent[]}
     */
    this.components = data.components?.map((c: any) => BaseMessageComponent.create(c, client)) ?? [];

    super.setup(data);
  }

  /**
   * Adds components to the action row.
   * @param {...MessageActionRowComponentResolvable[]} components The components to add
   * @returns {MessageActionRow}
   */
  addComponents(...components: any[]) {
    this.components.push(...components.flat(Infinity).map((c: any) => BaseMessageComponent.create(c)));
    return this;
  }

  /**
   * Sets the components of the action row.
   * @param {...MessageActionRowComponentResolvable[]} components The components to set
   * @returns {MessageActionRow}
   */
  setComponents(...components: any[]) {
    this.spliceComponents(0, this.components.length, components);
    return this;
  }

  /**
   * Removes, replaces, and inserts components in the action row.
   * @param {number} index The index to start at
   * @param {number} deleteCount The number of components to remove
   * @param {...MessageActionRowComponentResolvable[]} [components] The replacing components
   * @returns {MessageActionRow}
   */
  spliceComponents(index: any, deleteCount: any, ...components: any[]) {
    this.components.splice(
      index,
      deleteCount,
      ...components.flat(Infinity).map((c: any) => BaseMessageComponent.create(c)),
    );
    return this;
  }

  /**
   * Transforms the action row to a plain object.
   * @returns {APIMessageComponent} The raw data of this action row
   */
  toJSON() {
    return {
      components: this.components.map((c: any) => c.toJSON()),
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
