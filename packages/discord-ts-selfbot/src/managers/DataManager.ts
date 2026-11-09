import BaseManager from './BaseManager';
import _errorsModule from '../errors';
const { Error } = _errorsModule;

/**
 * Manages the API methods of a data model along with a collection of instances.
 * @extends {BaseManager}
 * @abstract
 */
class DataManager extends BaseManager {
  declare holds: new (...args: never[]) => { id?: string };

  constructor(client: any, holds: new (...args: never[]) => { id?: string }) {
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
  get cache(): any {
    throw new Error('NOT_IMPLEMENTED', 'get cache', this.constructor.name);
  }

  /**
   * Resolves a data entry to a data Object.
   * @param {string|Object} idOrInstance The id or instance of something in this Manager
   * @returns {?Object} An instance from this Manager
   */
  resolve(idOrInstance: any) {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === 'string') return this.cache.get(idOrInstance) ?? null;
    return null;
  }

  /**
   * Resolves a data entry to an instance id.
   * @param {string|Object} idOrInstance The id or instance of something in this Manager
   * @returns {?Snowflake}
   */
  resolveId(idOrInstance: any) {
    if (idOrInstance instanceof this.holds) return idOrInstance.id ?? null;
    if (typeof idOrInstance === 'string') return idOrInstance;
    return null;
  }

  valueOf() {
    return this.cache;
  }
}

export default DataManager;
export { DataManager };
