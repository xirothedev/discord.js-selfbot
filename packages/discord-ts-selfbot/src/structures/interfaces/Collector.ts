import EventEmitter from 'node:events';
import { setTimeout, clearTimeout } from 'node:timers';
import { Collection } from '@discordjs/collection';
import _errorsModule from '../../errors';
const { TypeError } = _errorsModule;
import Util from '../../util/Util';
import type { CollectorFilter, CollectorOptions, CollectorResetTimerOptions } from '../../../typings';
import type Client from '../../client/Client';

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

    Object.defineProperty(this, 'client', { value: client });

    this.filter = options.filter ?? (() => true);

    this.options = options;

    this.collected = new Collection<K, V>();

    this.ended = false;

    this._timeout = null;

    this._idletimeout = null;

    if (typeof this.filter !== 'function') {
      throw new TypeError('INVALID_TYPE', 'options.filter', 'function');
    }

    this.handleCollect = this.handleCollect.bind(this);
    this.handleDispose = this.handleDispose.bind(this);

    if (options.time) this._timeout = setTimeout(() => this.stop('time'), options.time).unref();
    if (options.idle) this._idletimeout = setTimeout(() => this.stop('idle'), options.idle).unref();
  }

  async handleCollect(...args: [V, ...F]) {
    const collect = await this.collect(...args);

    // The filter also receives the collection at runtime; the public filter
    // type only describes the event arguments.
    if (collect && (await Reflect.apply(this.filter, undefined, [...args, this.collected]))) {
      this.collected.set(collect, args[0]);

      this.emit('collect', ...args);

      if (this._idletimeout) {
        clearTimeout(this._idletimeout);
        this._idletimeout = setTimeout(() => this.stop('idle'), this.options.idle).unref();
      }
    }
    this.checkEnd();
  }

  async handleDispose(...args: [V, ...F]) {
    if (!this.options.dispose) return;

    const dispose = this.dispose(...args);
    if (!dispose || !(await Reflect.apply(this.filter, undefined, args)) || !this.collected.has(dispose)) return;
    this.collected.delete(dispose);

    this.emit('dispose', ...args);
    this.checkEnd();
  }

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

    this.emit('end', this.collected, reason);
  }

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

  checkEnd() {
    const reason = this.endReason;
    if (reason) this.stop(reason);
    return Boolean(reason);
  }

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
  get endReason(): string | null {
    return null;
  }

  collect(..._args: [V, ...F]): K | null | Promise<K | null> {
    return null;
  }

  dispose(..._args: [V, ...F]): K | null {
    return null;
  }
  /* eslint-enable no-empty-function */
}

export default Collector;
export { Collector };
