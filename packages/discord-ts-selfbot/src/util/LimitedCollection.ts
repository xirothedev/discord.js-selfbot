import { setInterval, clearInterval } from 'node:timers';
import { Collection } from '@discordjs/collection';
import _ConstantsModule from './Constants';
const { _cleanupSymbol } = _ConstantsModule;
import Sweepers from './Sweepers';
import _DJSErrorModule from '../errors/DJSError';
const { TypeError } = _DJSErrorModule;

class LimitedCollection<K = unknown, V = unknown> extends Collection<K, V> {
  [key: string]: unknown;
  maxSize: number;
  keepOverLimit: ((value: V, key: K, collection: this) => boolean) | null;
  sweepFilter: ((collection: this) => ((value: V, key: K, collection: this) => boolean) | null) | null;
  interval: ReturnType<typeof setInterval> | null;
  constructor(options: unknown = {}, iterable?: Iterable<readonly [K, V]>) {
    if (typeof options !== 'object' || options === null) {
      throw new TypeError('INVALID_TYPE', 'options', 'object', true);
    }
    const opts = (options ?? {}) as Record<string, unknown>;
    const {
      maxSize = Infinity,
      keepOverLimit = null,
      sweepInterval = 0,
      sweepFilter = null,
    } = opts as {
      maxSize?: unknown;
      keepOverLimit?: unknown;
      sweepInterval?: unknown;
      sweepFilter?: unknown;
    };

    if (typeof maxSize !== 'number') {
      throw new TypeError('INVALID_TYPE', 'maxSize', 'number');
    }
    if (keepOverLimit !== null && typeof keepOverLimit !== 'function') {
      throw new TypeError('INVALID_TYPE', 'keepOverLimit', 'function');
    }
    if (typeof sweepInterval !== 'number') {
      throw new TypeError('INVALID_TYPE', 'sweepInterval', 'number');
    }
    if (sweepFilter !== null && typeof sweepFilter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'sweepFilter', 'function');
    }

    super(iterable);

    this.maxSize = maxSize as number;

    this.keepOverLimit = keepOverLimit as ((value: V, key: K, collection: this) => boolean) | null;

    /**
     * A function called every sweep interval that returns a function passed to `sweep`.
     * @deprecated in favor of {@link Client#sweepers}
     * @type {?SweepFilter}
     */
    this.sweepFilter = sweepFilter as
      ((collection: this) => ((value: V, key: K, collection: this) => boolean) | null) | null;

    /**
     * The id of the interval being used to sweep.
     * @deprecated in favor of {@link Client#sweepers}
     * @type {?Timeout}
     */
    this.interval =
      sweepInterval > 0 && sweepInterval !== Infinity && sweepFilter
        ? setInterval(() => {
            const sf = this.sweepFilter;
            if (!sf) return;
            const sweepFn = sf(this);
            if (sweepFn === null) return;
            if (typeof sweepFn !== 'function') throw new TypeError('SWEEP_FILTER_RETURN');
            this.sweep(sweepFn);
          }, sweepInterval * 1_000).unref()
        : null;
  }

  set(key: K, value: V): this {
    if (this.maxSize === 0) return this;
    if (this.size >= this.maxSize && !this.has(key)) {
      for (const [k, v] of this.entries()) {
        const keep = this.keepOverLimit?.(v, k, this) ?? false;
        if (!keep) {
          this.delete(k);
          break;
        }
      }
    }
    return super.set(key, value);
  }

  /**
   * Create a sweepFilter function that uses a lifetime to determine sweepability.
   * @param {LifetimeFilterOptions} [options={}] The options used to generate the filter function
   * @deprecated Use {@link Sweepers.filterByLifetime} instead
   * @returns {SweepFilter}
   */
  static filterByLifetime({
    lifetime = 14400,
    getComparisonTimestamp = (e: unknown) => (e as { createdTimestamp?: number } | null)?.createdTimestamp,
    excludeFromSweep = () => false,
  } = {}) {
    return Sweepers.filterByLifetime({ lifetime, getComparisonTimestamp, excludeFromSweep });
  }

  [_cleanupSymbol]() {
    return this.interval ? () => clearInterval(this.interval as ReturnType<typeof setInterval>) : null;
  }

  static get [Symbol.species]() {
    return Collection;
  }
}

export default LimitedCollection;
export { LimitedCollection };
