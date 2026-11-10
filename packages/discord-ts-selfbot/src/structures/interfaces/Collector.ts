import EventEmitter from "node:events";
import { setTimeout, clearTimeout } from "node:timers";
import { Collection } from "@discordjs/collection";
import _errorsModule from "../../errors";

const { TypeError } = _errorsModule;
import Util from "../../util/Util";
import type {
  CollectorFilter,
  CollectorOptions,
  CollectorResetTimerOptions,
} from "../../../typings";
import type Client from "../../client/Client";

class Collector<
  TKey = unknown,
  TValue = unknown,
  TRest extends unknown[] = [],
> extends EventEmitter {
  declare client: Client;
  declare collected: Collection<TKey, TValue>;
  declare options: CollectorOptions<[TValue, ...TRest]>;
  declare filter: CollectorFilter<[TValue, ...TRest]>;
  declare ended: boolean;
  declare _timeout: NodeJS.Timeout | null;
  declare _idletimeout: NodeJS.Timeout | null;

  constructor(
    client: Client,
    options: CollectorOptions<[TValue, ...TRest]> = {}
  ) {
    super();

    Object.defineProperty(this, "client", { value: client });

    this.filter = options.filter ?? (() => true);

    this.options = options;

    this.collected = new Collection<TKey, TValue>();

    this.ended = false;

    this._timeout = null;

    this._idletimeout = null;

    if (typeof this.filter !== "function") {
      throw new TypeError("INVALID_TYPE", "options.filter", "function");
    }

    this.handleCollect = this.handleCollect.bind(this);
    this.handleDispose = this.handleDispose.bind(this);

    if (options.time) {
      this._timeout = setTimeout(() => this.stop("time"), options.time).unref();
    }
    if (options.idle) {
      this._idletimeout = setTimeout(
        () => this.stop("idle"),
        options.idle
      ).unref();
    }
  }

  async handleCollect(...args: [TValue, ...TRest]) {
    const collect = await this.collect(...args);

    // The filter also receives the collection at runtime; the public filter
    // type only describes the event arguments.
    if (
      collect &&
      (await Reflect.apply(this.filter, undefined, [...args, this.collected]))
    ) {
      this.collected.set(collect, args[0]);

      this.emit("collect", ...args);

      if (this._idletimeout) {
        clearTimeout(this._idletimeout);
        this._idletimeout = setTimeout(
          () => this.stop("idle"),
          this.options.idle
        ).unref();
      }
    }
    this.checkEnd();
  }

  async handleDispose(...args: [TValue, ...TRest]) {
    if (!this.options.dispose) {
      return;
    }

    const dispose = this.dispose(...args);
    if (
      !dispose ||
      !(await Reflect.apply(this.filter, undefined, args)) ||
      !this.collected.has(dispose)
    ) {
      return;
    }
    this.collected.delete(dispose);

    this.emit("dispose", ...args);
    this.checkEnd();
  }

  get next(): Promise<TValue> {
    const { promise, reject, resolve } = Promise.withResolvers<TValue>();
    if (this.ended) {
      reject(this.collected);
      return promise;
    }

    const state: {
      onCollect: (item: TValue) => void;
      onEnd: () => void;
    } = { onCollect: () => null, onEnd: () => null };
    const cleanup = () => {
      this.removeListener("collect", state.onCollect);
      this.removeListener("end", state.onEnd);
    };

    state.onCollect = (item: TValue) => {
      cleanup();
      resolve(item);
    };

    state.onEnd = () => {
      cleanup();
      reject(this.collected);
    };

    this.on("collect", state.onCollect);
    this.on("end", state.onEnd);
    return promise;
  }

  stop(reason = "user") {
    if (this.ended) {
      return;
    }

    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    if (this._idletimeout) {
      clearTimeout(this._idletimeout);
      this._idletimeout = null;
    }
    this.ended = true;

    this.emit("end", this.collected, reason);
  }

  resetTimer({ time, idle }: CollectorResetTimerOptions = {}) {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(
        () => this.stop("time"),
        time ?? this.options.time
      ).unref();
    }
    if (this._idletimeout) {
      clearTimeout(this._idletimeout);
      this._idletimeout = setTimeout(
        () => this.stop("idle"),
        idle ?? this.options.idle
      ).unref();
    }
  }

  checkEnd() {
    const reason = this.endReason;
    if (reason) {
      this.stop(reason);
    }
    return Boolean(reason);
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<TValue> {
    const queue: TValue[] = [];
    const onCollect = (item: TValue) => queue.push(item);
    this.on("collect", onCollect);

    try {
      while (queue.length || !this.ended) {
        if (queue.length) {
          const item = queue.shift();
          if (item !== undefined) {
            yield item;
          }
        } else {
          const { promise, resolve } = Promise.withResolvers<undefined>();
          const tick = () => {
            this.removeListener("collect", tick);
            this.removeListener("end", tick);
            resolve(undefined);
          };
          this.on("collect", tick);
          this.on("end", tick);
          await promise;
        }
      }
    } finally {
      this.removeListener("collect", onCollect);
    }
  }

  toJSON(): unknown {
    return Util.flatten(this);
  }

  get endReason(): string | null {
    return null;
  }

  collect(..._args: [TValue, ...TRest]): TKey | null | Promise<TKey | null> {
    return null;
  }

  dispose(..._args: [TValue, ...TRest]): TKey | null {
    return null;
  }
}

export default Collector;
export { Collector };
