import { Collection } from '@discordjs/collection';
import BaseManager from './BaseManager';
import _errorsModule from '../errors';
const { Error } = _errorsModule;

/**
 * A cached structure that is identifiable by a snowflake.
 */
type DataHold = object;

function readId(hold: object): string | undefined {
  return 'id' in hold && typeof hold.id === 'string' ? hold.id : undefined;
}

/**
 * Manages the API methods of a data model along with a collection of instances.
 * @extends {BaseManager}
 * @abstract
 */
class DataManager<Holds extends DataHold = DataHold> extends BaseManager {
  declare holds: new (...args: never[]) => Holds;

  constructor(client: any, holds: new (...args: never[]) => Holds) {
    super(client);

    /**
     * The data structure belonging to this manager.
     * @name DataManager#holds
     * @type {Function}
     * @private
     * @readonly
     */
    Object.defineProperty(this, 'holds', { value: holds });
  }

  /**
   * The cache of items for this manager.
   * @type {Collection}
   * @abstract
   */
  get cache(): Collection<string, Holds> {
    throw new Error('NOT_IMPLEMENTED', 'get cache', this.constructor.name);
  }

  /**
   * Resolves a data entry to a data Object.
   * @param {string|Object} idOrInstance The id or instance of something in this Manager
   * @returns {?Object} An instance from this Manager
   */
  resolve(idOrInstance: unknown): Holds | null {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === 'string') return this.cache.get(idOrInstance) ?? null;
    return null;
  }

  /**
   * Resolves a data entry to an instance id.
   * @param {string|Object} idOrInstance The id or instance of something in this Manager
   * @returns {?Snowflake}
   */
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
