/**
 * Manages the API methods of a data model.
 * @abstract
 */
class BaseManager {
  declare client: import('../client/Client').default;
  constructor(client: import('../client/Client').default) {
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
