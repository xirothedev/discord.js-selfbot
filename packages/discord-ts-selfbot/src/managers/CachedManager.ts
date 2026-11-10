import { Collection } from '@discordjs/collection';
import DataManager, { readId, type DataHold } from './DataManager';
import _ConstantsModule from '../util/Constants';
const { _cleanupSymbol } = _ConstantsModule;

type ManagerCache<Holds> = Collection<string, Holds> & {
  maxSize?: number;
  sweepFilter?: { isDefault?: boolean };
};

class CachedManager<Holds extends DataHold = DataHold> extends DataManager<Holds> {
  declare _cache: ManagerCache<Holds>;

  constructor(
    client: import('../client/Client').default,
    holds: new (...args: never[]) => Holds,
    iterable?: Iterable<Holds>,
  ) {
    super(client, holds);

    Object.defineProperty(this, '_cache', { value: this.client.options.makeCache(this.constructor, this.holds) });

    const cleanupFactory = Reflect.get(this._cache, _cleanupSymbol, this._cache) as
      (() => (() => void) | undefined) | undefined;
    let cleanup = cleanupFactory?.call(this._cache);
    if (cleanup) {
      cleanup = cleanup.bind(this._cache);
      client._cleanups.add(cleanup);
      client._finalizers.register(this, {
        cleanup,
        message:
          `Garbage collection completed on ${this.constructor.name}, ` +
          `which had a ${this._cache.constructor.name} of ${this.holds.name}.`,
        name: this.constructor.name,
      });
    }

    if (iterable) {
      for (const item of iterable) {
        this._add(item);
      }
    }
  }

  get cache(): ManagerCache<Holds> {
    return this._cache;
  }

  _add(data: unknown, cache = true, { id, extras = [] }: { id?: string; extras?: unknown[] } = {}): Holds {
    const key = id ?? (typeof data === 'object' && data !== null ? readId(data) : undefined);
    const existing = key ? this.cache.get(key) : undefined;
    if (existing) {
      if (cache) {
        patch(existing, data);
        return existing;
      }
      const clone = cloneOf(existing);
      patch(clone, data);
      return clone;
    }

    const entry: Holds =
      typeof this.holds === 'function'
        ? Reflect.construct(this.holds, [this.client, data, ...extras])
        : (data as Holds);
    const entryId = key ?? readId(entry);
    if (cache && entryId) this.cache.set(entryId, entry);
    return entry;
  }
}

function patch(hold: object, data: unknown): void {
  const method = Reflect.get(hold, '_patch');
  if (typeof method === 'function') Reflect.apply(method, hold, [data]);
}

function cloneOf<Holds extends DataHold>(hold: Holds): Holds {
  const method = Reflect.get(hold, '_clone');
  return typeof method === 'function' ? Reflect.apply(method, hold, []) : hold;
}

export default CachedManager;
export { CachedManager };
