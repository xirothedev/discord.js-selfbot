import EventEmitter from "node:events";
import process from "node:process";
import RESTManager from "../rest/RESTManager";
import Options from "../util/Options";
import type { ResolvedClientOptions } from "../util/Options";
import Util from "../util/Util";
import type { ClientOptions } from "../../typings";
import type { authenticator } from "otplib";

class BaseClient extends EventEmitter {
  declare options: ResolvedClientOptions;
  declare authenticator: typeof authenticator;
  declare rest: RESTManager;

  constructor(options: ClientOptions = {}) {
    super({ captureRejections: true });

    if (options.intents) {
      process.emitWarning("Intents is not available.", "DeprecationWarning");
    }

    this.options = Util.mergeDefault(Options.createDefault(), options);

    this.rest = new RESTManager(this);
  }

  get api() {
    return this.rest.api;
  }

  destroy() {
    if (this.rest.sweepInterval) {
      clearInterval(this.rest.sweepInterval);
    }
  }

  incrementMaxListeners() {
    const maxListeners = this.getMaxListeners();
    if (maxListeners !== 0) {
      this.setMaxListeners(maxListeners + 1);
    }
  }

  decrementMaxListeners() {
    const maxListeners = this.getMaxListeners();
    if (maxListeners !== 0) {
      this.setMaxListeners(maxListeners - 1);
    }
  }

  toJSON(...props: unknown[]) {
    return Util.flatten(this, { domain: false }, ...props);
  }
}

export default BaseClient;
export { BaseClient };
