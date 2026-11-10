import * as childProcessModule from "node:child_process";
import { Worker as WorkerThread } from "node:worker_threads";
import EventEmitter from "node:events";
import path from "node:path";
import process from "node:process";
import { setTimeout } from "node:timers";
import { promisify } from "node:util";
import _errorsModule from "../errors";

const { Error } = _errorsModule;
import Util from "../util/Util";
import type { ChildProcess } from "node:child_process";
import type { Worker as WorkerType } from "node:worker_threads";
import type { ShardingManager } from "./ShardingManager";
import type { Client } from "../client/Client";

let childProcess: typeof childProcessModule | null = null;
let Worker: typeof WorkerThread | null = null;

interface ShardIPCMessage {
  _ready?: boolean;
  _disconnect?: boolean;
  _reconnecting?: boolean;
  _fetchProp?: string;
  _eval?: string;
  _result?: unknown;
  _error?: unknown;
  _sFetchProp?: string;
  _sFetchPropShard?: number;
  _sEval?: string;
  _sEvalShard?: number;
  _sRespawnAll?: { shardDelay: number; respawnDelay: number; timeout: number };
}

interface ListenerEmitter {
  getMaxListeners: () => number;
  setMaxListeners: (n: number) => unknown;
  on: (event: "message", listener: (message: unknown) => void) => unknown;
  removeListener: (
    event: "message",
    listener: (message: unknown) => void
  ) => unknown;
}

/**
 * A self-contained shard created by the {@link ShardingManager}. Each one has a {@link ChildProcess} that contains
 * an instance of the bot and its {@link Client}. When its child process/worker exits for any reason, the shard will
 * spawn a new one to replace it as necessary.
 * @extends {EventEmitter}
 * @deprecated
 */
class Shard extends EventEmitter {
  manager: ShardingManager;
  id: number;
  args: string[];
  execArgv: string[];
  env: NodeJS.ProcessEnv;
  ready: boolean;
  process: ChildProcess | null;
  worker: WorkerType | null;
  _evals: Map<string, Promise<unknown>>;
  _fetches: Map<string, Promise<unknown>>;
  _exitListener: (() => void) | null;

  constructor(manager: ShardingManager, id: number) {
    super();

    if (manager.mode === "process") {
      childProcess = childProcessModule;
    } else if (manager.mode === "worker") {
      Worker = WorkerThread;
    }

    this.manager = manager;

    this.id = id;

    this.args = manager.shardArgs ?? [];

    this.execArgv = manager.execArgv;

    this.env = Object.assign({}, process.env, {
      DISCORD_TOKEN: this.manager.token,
      SHARDING_MANAGER: true,
      SHARDS: this.id,
      SHARD_COUNT: this.manager.totalShards,
    });

    this.ready = false;

    this.process = null;

    this.worker = null;

    this._evals = new Map();

    this._fetches = new Map();

    this._exitListener = null;
  }

  spawn(timeout = 30_000): Promise<ChildProcess | WorkerType> {
    if (this.process) {
      throw new Error("SHARDING_PROCESS_EXISTS", this.id);
    }
    if (this.worker) {
      throw new Error("SHARDING_WORKER_EXISTS", this.id);
    }

    this._exitListener = this._handleExit.bind(this, undefined, timeout);

    if (this.manager.mode === "process") {
      if (!childProcess) {
        throw new Error("SHARDING_PROCESS_UNAVAILABLE");
      }
      this.process = childProcess
        .fork(path.resolve(this.manager.file), this.args, {
          env: this.env,
          execArgv: this.execArgv,
        })
        .on("message", this._handleMessage.bind(this))
        .on("exit", this._exitListener);
    } else if (this.manager.mode === "worker") {
      if (!Worker) {
        throw new Error("SHARDING_WORKER_UNAVAILABLE");
      }
      this.worker = new Worker(path.resolve(this.manager.file), {
        workerData: this.env,
      })
        .on("message", this._handleMessage.bind(this))
        .on("exit", this._exitListener);
    }

    this._evals.clear();
    this._fetches.clear();

    const child = this.process ?? this.worker;
    if (!child) {
      throw new Error("SHARDING_CHILD_UNAVAILABLE");
    }

    this.emit("spawn", child);

    if (timeout === -1 || timeout === Infinity) {
      return Promise.resolve(child);
    }
    const { promise, resolve, reject } = Promise.withResolvers<
      ChildProcess | WorkerType
    >();
    const timeoutState: { timer?: ReturnType<typeof setTimeout> } = {};
    const handlers: {
      ready?: () => void;
      disconnect?: () => void;
      death?: () => void;
      timeout?: () => void;
    } = {};
    const cleanup = () => {
      if (timeoutState.timer) {
        clearTimeout(timeoutState.timer);
      }
      if (handlers.ready) {
        this.off("ready", handlers.ready);
      }
      if (handlers.disconnect) {
        this.off("disconnect", handlers.disconnect);
      }
      if (handlers.death) {
        this.off("death", handlers.death);
      }
    };

    handlers.ready = () => {
      cleanup();
      resolve(child);
    };
    handlers.disconnect = () => {
      cleanup();
      reject(new Error("SHARDING_READY_DISCONNECTED", this.id));
    };
    handlers.death = () => {
      cleanup();
      reject(new Error("SHARDING_READY_DIED", this.id));
    };
    handlers.timeout = () => {
      cleanup();
      reject(new Error("SHARDING_READY_TIMEOUT", this.id));
    };

    timeoutState.timer = setTimeout(handlers.timeout, timeout);
    this.once("ready", handlers.ready);
    this.once("disconnect", handlers.disconnect);
    this.once("death", handlers.death);
    return promise;
  }

  kill(): void {
    const exitListener = this._exitListener;
    if (this.process) {
      if (exitListener) {
        this.process.removeListener("exit", exitListener);
      }
      this.process.kill();
    } else if (this.worker) {
      if (exitListener) {
        this.worker.removeListener("exit", exitListener);
      }
      this.worker.terminate();
    }

    this._handleExit(false);
  }

  async respawn({
    delay = 500,
    timeout = 30_000,
  }: { delay?: number; timeout?: number } = {}): Promise<
    ChildProcess | WorkerType
  > {
    this.kill();
    if (delay > 0) {
      await Bun.sleep(delay);
    }
    return this.spawn(timeout);
  }

  async send(message: ShardIPCMessage): Promise<Shard> {
    if (this.process) {
      const sendAsync = promisify(
        this.process.send.bind(this.process) as (
          payload: ShardIPCMessage,
          callback: (error: Error | null) => void
        ) => boolean
      );
      await sendAsync(message);
      return this;
    }
    if (this.worker) {
      this.worker.postMessage(message, undefined);
      return this;
    }
    const { promise } = Promise.withResolvers<Shard>();
    return promise;
  }

  async fetchClientValue(prop: string): Promise<unknown> {
    // Shard is dead (maybe respawning), don't cache anything and error immediately
    const child = this.process ?? this.worker;
    if (!child) {
      throw new Error("SHARDING_NO_CHILD_EXISTS", this.id);
    }

    // Cached promise from previous call
    const cached = this._fetches.get(prop);
    if (cached) {
      return cached;
    }

    const { promise, resolve, reject } = Promise.withResolvers<unknown>();

    const listener = (message: ShardIPCMessage) => {
      if (message?._fetchProp !== prop) {
        return;
      }
      child.removeListener("message", listener);
      this.decrementMaxListeners(child);
      this._fetches.delete(prop);
      if (message._error) {
        reject(Util.makeError(message._error));
      } else {
        resolve(message._result);
      }
    };

    this.incrementMaxListeners(child);
    child.on("message", listener);
    this._fetches.set(prop, promise);

    try {
      await this.send({ _fetchProp: prop });
    } catch (error: unknown) {
      child.removeListener("message", listener);
      this.decrementMaxListeners(child);
      this._fetches.delete(prop);
      reject(error);
    }

    return promise;
  }

  eval<Result>(fn: (client: Client) => Result): Promise<Result>;
  eval<Result, Context>(
    fn: (client: Client, context: Context) => Result,
    context: Context
  ): Promise<Result>;
  eval(script: string): Promise<unknown>;
  async eval(
    script: string | ((client: Client, context?: unknown) => unknown),
    context?: unknown
  ): Promise<unknown> {
    // Stringify the script if it's a Function
    const evalScript =
      typeof script === "function"
        ? `(${script})(this, ${JSON.stringify(context)})`
        : script;

    // Shard is dead (maybe respawning), don't cache anything and error immediately
    const child = this.process ?? this.worker;
    if (!child) {
      throw new Error("SHARDING_NO_CHILD_EXISTS", this.id);
    }

    // Cached promise from previous call
    const cached = this._evals.get(evalScript);
    if (cached) {
      return cached;
    }

    const { promise, resolve, reject } = Promise.withResolvers<unknown>();

    const listener = (message: ShardIPCMessage) => {
      if (message?._eval !== evalScript) {
        return;
      }
      child.removeListener("message", listener);
      this.decrementMaxListeners(child);
      this._evals.delete(evalScript);
      if (message._error) {
        reject(Util.makeError(message._error));
      } else {
        resolve(message._result);
      }
    };

    this.incrementMaxListeners(child);
    child.on("message", listener);
    this._evals.set(evalScript, promise);

    try {
      await this.send({ _eval: evalScript });
    } catch (error: unknown) {
      child.removeListener("message", listener);
      this.decrementMaxListeners(child);
      this._evals.delete(evalScript);
      reject(error);
    }

    return promise;
  }

  _handleMessage(message: ShardIPCMessage | null | undefined): void {
    if (message) {
      // Shard is ready
      if (message._ready) {
        this.ready = true;
        this.emit("ready");
        return;
      }

      // Shard has disconnected
      if (message._disconnect) {
        this.ready = false;
        this.emit("disconnect");
        return;
      }

      // Shard is attempting to reconnect
      if (message._reconnecting) {
        this.ready = false;
        this.emit("reconnecting");
        return;
      }

      // Shard is requesting a property fetch
      if (message._sFetchProp) {
        this.sendFetchedValues(message._sFetchProp, message._sFetchPropShard);
        return;
      }

      // Shard is requesting an eval broadcast
      if (message._sEval) {
        this.sendEvalResults(message._sEval, message._sEvalShard);
        return;
      }

      // Shard is requesting a respawn of all shards
      if (message._sRespawnAll) {
        const { shardDelay, respawnDelay, timeout } = message._sRespawnAll;
        this.manager
          .respawnAll({ respawnDelay, shardDelay, timeout })
          .catch(() => {
            // Do nothing
          });
        return;
      }
    }

    this.emit("message", message);
  }

  _handleExit(respawn = this.manager.respawn, timeout?: number): void {
    this.emit("death", this.process ?? this.worker);

    this.ready = false;
    this.process = null;
    this.worker = null;
    this._evals.clear();
    this._fetches.clear();

    if (respawn) {
      this.respawnShard(timeout);
    }
  }

  private async respawnShard(timeout?: number): Promise<void> {
    try {
      await this.spawn(timeout);
    } catch (error: unknown) {
      this.emit("error", error);
    }
  }

  private async sendFetchedValues(prop: string, shard?: number): Promise<void> {
    const resp = { _sFetchProp: prop, _sFetchPropShard: shard };
    let results: unknown;
    try {
      results = await this.manager.fetchClientValues(prop, shard);
    } catch (error: unknown) {
      await this.send({ ...resp, _error: Util.makePlainError(error) });
      return;
    }
    await this.send({ ...resp, _result: results });
  }

  private async sendEvalResults(script: string, shard?: number): Promise<void> {
    const resp = { _sEval: script, _sEvalShard: shard };
    let results: unknown;
    try {
      results = await this.manager._performOnShards("eval", [script], shard);
    } catch (error: unknown) {
      await this.send({ ...resp, _error: Util.makePlainError(error) });
      return;
    }
    await this.send({ ...resp, _result: results });
  }

  incrementMaxListeners(emitter: ListenerEmitter): void {
    const maxListeners = emitter.getMaxListeners();
    if (maxListeners !== 0) {
      emitter.setMaxListeners(maxListeners + 1);
    }
  }

  decrementMaxListeners(emitter: ListenerEmitter): void {
    const maxListeners = emitter.getMaxListeners();
    if (maxListeners !== 0) {
      emitter.setMaxListeners(maxListeners - 1);
    }
  }
}

export default Shard;
export type { ShardIPCMessage };
export { Shard };
