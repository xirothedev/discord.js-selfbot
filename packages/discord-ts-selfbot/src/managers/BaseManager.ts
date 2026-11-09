/**
 * Manages the API methods of a data model.
 * @abstract
 */
class BaseManager {
  [key: string]: any;
  constructor(client: any) {
    /**
     * The client that instantiated this Manager
     * @name BaseManager#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });
  }
}

export default BaseManager;
export { BaseManager };
