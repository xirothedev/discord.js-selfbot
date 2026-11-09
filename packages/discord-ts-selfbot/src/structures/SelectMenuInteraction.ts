import MessageComponentInteraction from './MessageComponentInteraction';

/**
 * Represents a select menu interaction.
 * @extends {MessageComponentInteraction}
 */
class SelectMenuInteraction extends MessageComponentInteraction {
  [key: string]: any;
  constructor(client: any, data: any) {
    super(client, data);

    /**
     * The values selected, if the component which was interacted with was a select menu
     * @type {string[]}
     */
    this.values = data.data.values ?? [];
  }
}

export default SelectMenuInteraction;
export { SelectMenuInteraction };
