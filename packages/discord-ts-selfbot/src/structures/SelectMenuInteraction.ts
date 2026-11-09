import MessageComponentInteraction from './MessageComponentInteraction';
import type { CacheType } from '../../typings';
import type { RawMessageComponentInteractionData } from '../../typings/rawDataTypes';

/**
 * Represents a select menu interaction.
 * @extends {MessageComponentInteraction}
 */
class SelectMenuInteraction<Cached extends CacheType = CacheType> extends MessageComponentInteraction<Cached> {
  declare values: string[];

  constructor(
    client: import('../client/Client').default,
    data: RawMessageComponentInteractionData & { data: { values?: string[] } },
  ) {
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
