import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import BaseClient from './BaseClient';
import _errorsModule from '../errors';
const { Error } = _errorsModule;

/**
 * The webhook client.
 * @implements {Webhook}
 * @extends {BaseClient}
 */
class WebhookClient extends BaseClient {
  declare id: any;

  /**
   * The data for the webhook client containing either an id and token or just a URL
   * @typedef {Object} WebhookClientData
   * @property {Snowflake} [id] The id of the webhook
   * @property {string} [token] The token of the webhook
   * @property {string} [url] The full URL for the webhook client
   */

  /**
   * @param {WebhookClientData} data The data of the webhook
   * @param {ClientOptions} [options] Options for the client
   */
  constructor(data: any, options?: any) {
    super(options);
    Object.defineProperty(this, 'client', { value: this });
    let { id, token } = data;

    if ('url' in data) {
      const url = data.url.match(
        // eslint-disable-next-line no-useless-escape
        /^https?:\/\/(?:canary|ptb)?\.?discord\.com\/api\/webhooks(?:\/v[0-9]\d*)?\/([^\/]+)\/([^\/]+)/i,
      );

      if (!url || url.length <= 1) throw new Error('WEBHOOK_URL_INVALID');

      [, id, token] = url;
    }

    this.id = id;
    Object.defineProperty(this, 'token', { value: token, writable: true, configurable: true });
  }

  // These are here only for documentation purposes - they are implemented by Webhook
  /* eslint-disable no-empty-function */
  send() {}
  sendSlackMessage() {}
  fetchMessage() {}
  edit() {}
  editMessage() {}
  delete() {}
  deleteMessage() {}
  get createdTimestamp() {
    return undefined;
  }
  get createdAt() {
    return undefined;
  }
  get url() {
    return undefined;
  }
}

export default WebhookClient;
export { WebhookClient };

setTimeout(() => {
  try {
    const Webhook = require('../structures/Webhook');
    Webhook.applyToClass(WebhookClient);
  } catch {}
}, 0);
