import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

class InteractionWebhook {
  declare client: import('../client/Client').default;
  declare id: import('discord-api-types/v10').Snowflake;
  declare token: string;

  constructor(
    client: import('../client/Client').default,
    id: import('discord-api-types/v10').Snowflake,
    token: string,
  ) {
    Object.defineProperty(this, 'client', { value: client });
    this.id = id;
    Object.defineProperty(this, 'token', { value: token, writable: true, configurable: true });
  }

  // These are here only for documentation purposes - they are implemented by Webhook
  /* eslint-disable no-empty-function, valid-jsdoc */
  send(..._args: unknown[]) {}
  fetchMessage(..._args: unknown[]) {}
  editMessage(..._args: unknown[]) {}
  deleteMessage(..._args: unknown[]) {}
  get url(): string | undefined {
    return undefined;
  }
}

export default InteractionWebhook;
export { InteractionWebhook };

setTimeout(() => {
  try {
    const Webhook = require('./Webhook');
    Webhook.applyToClass(InteractionWebhook, ['sendSlackMessage', 'edit', 'delete', 'createdTimestamp', 'createdAt']);
  } catch {}
}, 0);
