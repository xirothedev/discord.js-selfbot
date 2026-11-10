import { Collection } from '@discordjs/collection';
import BaseManager from './BaseManager';
import _errorsModule from '../errors';
const { Error } = _errorsModule;

type DataHold = object;

function readId(hold: object): string | undefined {
  return 'id' in hold && typeof hold.id === 'string' ? hold.id : undefined;
}

class DataManager<Holds extends DataHold = DataHold> extends BaseManager {
  declare holds: new (...args: never[]) => Holds;

  constructor(client: import('../client/Client').default, holds: new (...args: never[]) => Holds) {
    super(client);

    Object.defineProperty(this, 'holds', { value: holds });
  }

  get cache(): Collection<string, Holds> {
    throw new Error('NOT_IMPLEMENTED', 'get cache', this.constructor.name);
  }

  resolve(idOrInstance: unknown): Holds | null {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === 'string') return this.cache.get(idOrInstance) ?? null;
    return null;
  }

  resolveId(idOrInstance: unknown): string | null {
    if (idOrInstance instanceof this.holds) return readId(idOrInstance) ?? null;
    if (typeof idOrInstance === 'string') return idOrInstance;
    return null;
  }

  valueOf(): Collection<string, Holds> {
    return this.cache;
  }
}

export default DataManager;
export { DataManager };
export type { DataHold };
export { readId };
