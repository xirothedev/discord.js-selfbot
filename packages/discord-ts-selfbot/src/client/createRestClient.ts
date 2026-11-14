import Client from './Client';
import type { ClientOptions } from '../../typings';

function createRestClient(options: ClientOptions & { token: string }): Client {
  const { token, ...rest } = options;
  const client = new Client(rest);
  client.token = token.replace(/^(?:Bot|Bearer)\s*/iu, '');
  return client;
}

export default createRestClient;
export { createRestClient };
