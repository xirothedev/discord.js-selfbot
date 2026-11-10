import { createRequire } from "node:module";
import type Client from "../client/Client";
import type { Snowflake } from "discord-api-types/v10";

const require = createRequire(import.meta.url);

class InteractionWebhook {
  declare client: Client;
  declare id: Snowflake;
  declare token: string;

  constructor(client: Client, id: Snowflake, token: string) {
    Object.defineProperty(this, "client", { value: client });
    this.id = id;
    Object.defineProperty(this, "token", {
      configurable: true,
      value: token,
      writable: true,
    });
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
    const Webhook = require("./Webhook");
    Webhook.applyToClass(InteractionWebhook, [
      "sendSlackMessage",
      "edit",
      "delete",
      "createdTimestamp",
      "createdAt",
    ]);
  } catch {}
}, 0);
