import EventEmitter from 'node:events';
import { setTimeout, clearTimeout } from 'node:timers';
import { Collection } from '@discordjs/collection';
import _errorsModule from '../../errors';
const { TypeError } = _errorsModule;
import Util from '../../util/Util';
import type { CollectorFilter, CollectorOptions, CollectorResetTimerOptions } from '../../../typings';
import type Client from '../../client/Client';

/**
 * Filter to be applied to the collector.
 * @typedef {Function} CollectorFilter
 * @param {...*} args Any arguments received by the listener
 * @param {Collection} collection The items collected by this collector
 * @returns {boolean|Promise<boolean>}
 */

/**
 * Options to be applied to the collector.
 * @typedef {Object} CollectorOptions
 * @property {CollectorFilter} [filter] The filter applied to this collector
 * @property {number} [time] How long to run the collector for in milliseconds
 * @property {number} [idle] How long to stop the collector after inactivity in milliseconds
 * @property {boolean} [dispose=false] Whether to dispose data when it's deleted
 */

/**
 * Abstract class for defining a new Collector.
 * @extends {EventEmitter}
 * @abstract
 */
class Collector<K = unknown, V = unknown, F extends unknown[] = []> extends EventEmitter {
  declare client: Client;
  declare collected: Collection<K, V>;
  declare options: CollectorOptions<[V, ...F]>;
  declare filter: CollectorFilter<[V, ...F]>;
  declare ended: boolean;
  declare _timeout: NodeJS.Timeout | null;
  declare _idletimeout: NodeJS.Timeout | null;

  constructor(client: Client, options: CollectorOptions<[V, ...F]> = {}) {
    super();

    /**
     * The client that instantiated this Collector
     * @name Collector#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The filter applied to this collector
     * @type {CollectorFilter}
     * @returns {boolean|Promise<boolean>}
     */
    this.filter = options.filter ?? (() => true);

    /**
     * The options of this collector
     * @type {CollectorOptions}
     */
    this.options = options;

    /**
     * The items collected by this collector
     * @type {Collection}
     */
    this.collected = new Collection<K, V>();

    /**
     * Whether this collector has finished collecting
     * @type {boolean}
     */
    this.ended = false;

    /**
     * Timeout for cleanup
     * @type {?Timeout}
     * @private
     */
    this._timeout = null;

    /**
     * Timeout for cleanup due to inactivity
     * @type {?Timeout}
     * @private
     */
    this._idletimeout = null;

    if (typeof this.filter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'options.filter', 'function');
    }

    this.handleCollect = this.handleCollect.bind(this);
    this.handleDispose = this.handleDispose.bind(this);

    if (options.time) this._timeout = setTimeout(() => this.stop('time'), options.time).unref();
    if (options.idle) this._idletimeout = setTimeout(() => this.stop('idle'), options.idle).unref();
  }

  /**
   * Call this to handle an event as a collectable element. Accepts any event data as parameters.
   * @param {...*} args The arguments emitted by the listener
   * @returns {Promise<void>}
   * @emits Collector#collect
   */
  async handleCollect(...args: [V, ...F]) {
    const collect = await this.collect(...args);

    // The filter also receives the collection at runtime; the public filter
    // type only describes the event arguments.
    if (collect && (await Reflect.apply(this.filter, undefined, [...args, this.collected]))) {
      this.collected.set(collect, args[0]);

      /**
       * Emitted whenever an element is collected.
       * @event Collector#collect
       * @param {...*} args The arguments emitted by the listener
       */
      this.emit('collect', ...args);

      if (this._idletimeout) {
        clearTimeout(this._idletimeout);
        this._idletimeout = setTimeout(() => this.stop('idle'), this.options.idle).unref();
      }
    }
    this.checkEnd();
  }

  /**
   * Call this to remove an element from the collection. Accepts any event data as parameters.
   * @param {...*} args The arguments emitted by the listener
   * @returns {Promise<void>}
   * @emits Collector#dispose
   */
  async handleDispose(...args: [V, ...F]) {
    if (!this.options.dispose) return;

    const dispose = this.dispose(...args);
    if (!dispose || !(await Reflect.apply(this.filter, undefined, args)) || !this.collected.has(dispose)) return;
    this.collected.delete(dispose);

    /**
     * Emitted whenever an element is disposed of.
     * @event Collector#dispose
     * @param {...*} args The arguments emitted by the listener
     */
    this.emit('dispose', ...args);
    this.checkEnd();
  }

  /**
   * Returns a promise that resolves with the next collected element;
   * rejects with collected elements if the collector finishes without receiving a next element
   * @type {Promise}
   * @readonly
   */
  get next(): Promise<V> {
    return new Promise<V>((resolve, reject) => {
      if (this.ended) {
        reject(this.collected);
        return;
      }

      const cleanup = () => {
        this.removeListener('collect', onCollect);
        this.removeListener('end', onEnd);
      };

      const onCollect = (item: V) => {
        cleanup();
        resolve(item);
      };

      const onEnd = () => {
        cleanup();
        reject(this.collected); // eslint-disable-line prefer-promise-reject-errors
      };

      this.on('collect', onCollect);
      this.on('end', onEnd);
    });
  }

  /**
   * Stops this collector and emits the `end` event.
   * @param {string} [reason='user'] The reason this collector is ending
   * @emits Collector#end
   */
  stop(reason: string = 'user') {
    if (this.ended) return;

    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    if (this._idletimeout) {
      clearTimeout(this._idletimeout);
      this._idletimeout = null;
    }
    this.ended = true;

    /**
     * Emitted when the collector is finished collecting.
     * @event Collector#end
     * @param {Collection} collected The elements collected by the collector
     * @param {string} reason The reason the collector ended
     */
    this.emit('end', this.collected, reason);
  }

  /**
   * Options used to reset the timeout and idle timer of a {@link Collector}.
   * @typedef {Object} CollectorResetTimerOptions
   * @property {number} [time] How long to run the collector for (in milliseconds)
   * @property {number} [idle] How long to wait to stop the collector after inactivity (in milliseconds)
   */

  /**
   * Resets the collector's timeout and idle timer.
   * @param {CollectorResetTimerOptions} [options] Options for resetting
   */
  resetTimer({ time, idle }: CollectorResetTimerOptions = {}) {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(() => this.stop('time'), time ?? this.options.time).unref();
    }
    if (this._idletimeout) {
      clearTimeout(this._idletimeout);
      this._idletimeout = setTimeout(() => this.stop('idle'), idle ?? this.options.idle).unref();
    }
  }

  /**
   * Checks whether the collector should end, and if so, ends it.
   * @returns {boolean} Whether the collector ended or not
   */
  checkEnd() {
    const reason = this.endReason;
    if (reason) this.stop(reason);
    return Boolean(reason);
  }

  /**
   * Allows collectors to be consumed with for-await-of loops
   * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for-await...of}
   */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<V> {
    const queue: V[] = [];
    const onCollect = (item: V) => queue.push(item);
    this.on('collect', onCollect);

    try {
      while (queue.length || !this.ended) {
        if (queue.length) {
          yield queue.shift()!;
        } else {
          // eslint-disable-next-line no-await-in-loop
          await new Promise<void>(resolve => {
            const tick = () => {
              this.removeListener('collect', tick);
              this.removeListener('end', tick);
              return resolve();
            };
            this.on('collect', tick);
            this.on('end', tick);
          });
        }
      }
    } finally {
      this.removeListener('collect', onCollect);
    }
  }

  toJSON(): unknown {
    return Util.flatten(this);
  }

  /* eslint-disable no-empty-function */
  /**
   * The reason this collector has ended with, or null if it hasn't ended yet
   * @type {?string}
   * @readonly
   * @abstract
   */
  get endReason(): string | null {
    return null;
  }

  /**
   * Handles incoming events from the `handleCollect` function. Returns null if the event should not
   * be collected, or returns an object describing the data that should be stored.
   * @see Collector#handleCollect
   * @param {...*} args Any args the event listener emits
   * @returns {?(*|Promise<?*>)} Data to insert into collection, if any
   * @abstract
   */
  collect(..._args: [V, ...F]): K | null | Promise<K | null> {
    return null;
  }

  /**
   * Handles incoming events from the `handleDispose`. Returns null if the event should not
   * be disposed, or returns the key that should be removed.
   * @see Collector#handleDispose
   * @param {...*} args Any args the event listener emits
   * @returns {?*} Key to remove from the collection, if any
   * @abstract
   */
  dispose(..._args: [V, ...F]): K | null {
    return null;
  }
  /* eslint-enable no-empty-function */
}

export default Collector;
export { Collector };
