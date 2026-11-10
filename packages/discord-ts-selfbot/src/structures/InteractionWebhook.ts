import { createRequire } from 'node:module';
import type Client from '../client/Client';
import type { Snowflake } from 'discord-api-types/v10';

const require = createRequire(import.meta.url);

class InteractionWebhook {
  declare client: Client;
  declare id: Snowflake;
  declare token: string;

  constructor(client: Client, id: Snowflake, token: string) {
    Object.defineProperty(this, 'client', { value: client });
    this.id = id;
    Object.defineProperty(this, 'token', {
      configurable: true,
      value: token,
      writable: true,
    });
  }

  // These are here only for documentation purposes - they are implemented by Webhook
  send(..._args: unknown[]) {
    // Implemented by the subclass mixin.
  }
  fetchMessage(..._args: unknown[]) {
    // Implemented by the subclass mixin.
  }
  editMessage(..._args: unknown[]) {
    // Implemented by the subclass mixin.
  }
  deleteMessage(..._args: unknown[]) {
    // Implemented by the subclass mixin.
  }
  get url(): string | undefined {
    return undefined;
  }
}

export default InteractionWebhook;
export { InteractionWebhook };

setTimeout(() => {
  try {
    const Webhook = require('./Webhook');
    Webhook.applyToClass(InteractionWebhook, [
      'sendSlackMessage',
      'edit',
      'delete',
      'createdTimestamp',
      'createdAt',
    ]);
  } catch {
    // The webhook mixin is optional during early circular imports.
  }
}, 0);
