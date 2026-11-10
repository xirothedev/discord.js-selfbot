import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
import BaseClient from "./BaseClient";
import _errorsModule from "../errors";
import type { WebhookClientData } from "../../typings";
import type { ClientOptions } from "../../typings";

const { Error } = _errorsModule;

class WebhookClient extends BaseClient {
  declare id: string | null;

  constructor(data: WebhookClientData, options?: ClientOptions) {
    super(options);
    Object.defineProperty(this, "client", { value: this });
    let id: string | null = null;
    let token: string | null = null;

    if ("url" in data) {
      const url = data.url.match(
        // eslint-disable-next-line no-useless-escape
        /^https?:\/\/(?:canary|ptb)?\.?discord\.com\/api\/webhooks(?:\/v[0-9]\d*)?\/([^\/]+)\/([^\/]+)/i
      );

      if (!url || url.length <= 1) {
        throw new Error("WEBHOOK_URL_INVALID");
      }

      [, id, token] = url;
    } else {
      id = data.id;
      token = data.token;
    }

    this.id = id;
    Object.defineProperty(this, "token", {
      configurable: true,
      value: token,
      writable: true,
    });
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
    return;
  }
  get createdAt() {
    return;
  }
  get url() {
    return;
  }
}

export default WebhookClient;
export { WebhookClient };

setTimeout(() => {
  try {
    const Webhook = require("../structures/Webhook");
    Webhook.applyToClass(WebhookClient);
  } catch {}
}, 0);
