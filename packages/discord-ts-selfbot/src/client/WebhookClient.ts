import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
import BaseClient from './BaseClient';
import _errorsModule from '../errors';
import type { WebhookClientData, ClientOptions } from '../../typings';

const { Error } = _errorsModule;

class WebhookClient extends BaseClient {
  declare id: string | null;

  constructor(data: WebhookClientData, options?: ClientOptions) {
    super(options);
    Object.defineProperty(this, 'client', { value: this });
    let id: string | null = null;
    let token: string | null = null;

    if ('url' in data) {
      const url = data.url.match(
        /^https?:\/\/(?:canary|ptb)?\.?discord\.com\/api\/webhooks(?:\/v[0-9]\d*)?\/(?<webhookId>[^/]+)\/(?<webhookToken>[^/]+)/iu
      );

      if (!url || url.length <= 1) {
        throw new Error('WEBHOOK_URL_INVALID');
      }

      id = url.groups?.webhookId ?? null;
      token = url.groups?.webhookToken ?? null;
    } else {
      ({ id, token } = data);
    }

    this.id = id;
    Object.defineProperty(this, 'token', {
      configurable: true,
      value: token,
      writable: true,
    });
  }

  // These are here only for documentation purposes - they are implemented by Webhook
  send() {
    // Implemented by the subclass mixin.
  }
  sendSlackMessage() {
    // Implemented by the subclass mixin.
  }
  fetchMessage() {
    // Implemented by the subclass mixin.
  }
  edit() {
    // Implemented by the subclass mixin.
  }
  editMessage() {
    // Implemented by the subclass mixin.
  }
  delete() {
    // Implemented by the subclass mixin.
  }
  deleteMessage() {
    // Implemented by the subclass mixin.
  }
  declare createdTimestamp: number;
  declare createdAt: Date;
  declare url: string;
}

export default WebhookClient;
export { WebhookClient };

setTimeout(() => {
  try {
    const Webhook = require('../structures/Webhook');
    Webhook.applyToClass(WebhookClient);
  } catch {
    // Ignore a missing Webhook structure module.
  }
}, 0);
