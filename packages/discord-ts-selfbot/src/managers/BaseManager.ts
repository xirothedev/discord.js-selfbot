class BaseManager {
  declare client: import('../client/Client').default;
  constructor(client: import('../client/Client').default) {
    Object.defineProperty(this, 'client', { value: client });
  }
}

export default BaseManager;
export { BaseManager };
