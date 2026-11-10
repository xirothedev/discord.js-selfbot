import EventEmitter from 'node:events';
import process from 'node:process';
import RESTManager from '../rest/RESTManager';
import Options, { type ResolvedClientOptions } from '../util/Options';
import Util from '../util/Util';
import type { ClientOptions } from '../../typings';

/**
 * The base class for all clients.
 * @extends {EventEmitter}
 */
class BaseClient extends EventEmitter {
  declare options: ResolvedClientOptions;
  declare authenticator: typeof import('otplib').authenticator;
  declare rest: any;

  constructor(options: ClientOptions = {}) {
    super({ captureRejections: true });

    if (options.intents) {
      process.emitWarning('Intents is not available.', 'DeprecationWarning');
    }

    /**
     * The options the client was instantiated with
     * @type {ClientOptions}
     */
    this.options = Util.mergeDefault(Options.createDefault(), options);

    /**
     * The REST manager of the client
     * @type {RESTManager}
     * @private
     */
    this.rest = new RESTManager(this);
  }

  /**
   * API shortcut
   * @type {Object}
   * @readonly
   * @private
   */
  get api() {
    return this.rest.api;
  }

  /**
   * Destroys all assets used by the base client.
   * @returns {void}
   */
  destroy() {
    if (this.rest.sweepInterval) clearInterval(this.rest.sweepInterval);
  }

  /**
   * Increments max listeners by one, if they are not zero.
   * @private
   */
  incrementMaxListeners() {
    const maxListeners = this.getMaxListeners();
    if (maxListeners !== 0) {
      this.setMaxListeners(maxListeners + 1);
    }
  }

  /**
   * Decrements max listeners by one, if they are not zero.
   * @private
   */
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

/**
 * Emitted for general debugging information.
 * @event BaseClient#debug
 * @param {string} info The debug information
 */
