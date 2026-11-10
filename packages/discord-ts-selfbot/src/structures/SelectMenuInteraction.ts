import MessageComponentInteraction from './MessageComponentInteraction';
import type { CacheType } from '../../typings';
import type { RawMessageComponentInteractionData } from '../../typings/rawDataTypes';

class SelectMenuInteraction<Cached extends CacheType = CacheType> extends MessageComponentInteraction<Cached> {
  declare values: string[];

  constructor(
    client: import('../client/Client').default,
    data: RawMessageComponentInteractionData & { data: { values?: string[] } },
  ) {
    super(client, data);

    this.values = data.data.values ?? [];
  }
}

export default SelectMenuInteraction;
export { SelectMenuInteraction };
