import type Client from "../client/Client";
class BaseManager {
  declare client: Client;
  constructor(client: Client) {
    Object.defineProperty(this, "client", { value: client });
  }
}

export default BaseManager;
export { BaseManager };
