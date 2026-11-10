import { parentPort } from 'node:worker_threads';
import process from 'node:process';
import { promisify } from 'node:util';
import _errorsModule from '../errors';

const { Error } = _errorsModule;
import _ConstantsModule from '../util/Constants';

const { Events } = _ConstantsModule;
import Util from '../util/Util';
import type { MessagePort } from 'node:worker_threads';
import type { Snowflake } from 'discord-api-types/v10';
import type { ShardingManagerMode } from '../../typings';
import type { Client } from '../client/Client';

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
}

interface BroadcastEvalOptions {
  shard?: number;
  context?: unknown;
}

function readProperty(value: unknown, key: string): unknown {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  return Reflect.get(value, key);
}

async function sendToProcess(message: ShardIPCMessage): Promise<void> {
  const send = Reflect.get(process, 'send');
  if (typeof send !== 'function') {
    return;
  }
  const sendAsync = promisify(
    send.bind(process) as (
      payload: ShardIPCMessage,
      callback: (error: Error | null) => void
    ) => void
  );
  await sendAsync(message);
}

async function notifyProcess(message: ShardIPCMessage): Promise<void> {
  try {
    await sendToProcess(message);
  } catch {
    // Lifecycle notifications are best-effort; the master process may be gone.
  }
}

/**
 * Helper class for sharded clients spawned as a child process/worker, such as from a {@link ShardingManager}.
 * Utilizes IPC to send and receive data to/from the master process and other shards.
 * @deprecated
 */
class ShardClientUtil {
  static _singleton: ShardClientUtil | null = null;

  client: Client;
  mode: ShardingManagerMode;
  parentPort: MessagePort | null;

  constructor(client: Client, mode: ShardingManagerMode) {
    this.client = client;

    this.mode = mode;

    this.parentPort = null;

    if (mode === 'process') {
      process.on('message', this._handleMessage.bind(this));
      client.on('ready', () => {
        notifyProcess({ _ready: true });
      });
      client.on('disconnect', () => {
        notifyProcess({ _disconnect: true });
      });
      client.on('reconnecting', () => {
        notifyProcess({ _reconnecting: true });
      });
    } else if (mode === 'worker') {
      const port = parentPort;
      if (port) {
        this.parentPort = port;
        port.on('message', this._handleMessage.bind(this));
        client.on('ready', () => {
          port.postMessage({ _ready: true });
        });
        client.on('disconnect', () => {
          port.postMessage({ _disconnect: true });
        });
        client.on('reconnecting', () => {
          port.postMessage({ _reconnecting: true });
        });
      }
    }
  }

  get ids(): number[] {
    const { shards } = this.client.options;
    return Array.isArray(shards) ? shards : [];
  }

  get count(): number {
    return this.client.options.shardCount;
  }

  async send(message: ShardIPCMessage): Promise<void> {
    if (this.mode === 'process') {
      await sendToProcess(message);
      return;
    }
    if (this.mode === 'worker') {
      this.parentPort?.postMessage(message);
      return;
    }
    const { promise } = Promise.withResolvers<undefined>();
    await promise;
  }

  async fetchClientValues(prop: string, shard?: number): Promise<unknown> {
    const { promise, resolve, reject } = Promise.withResolvers<unknown>();
    const parent = this.parentPort ?? process;

    const listener = (message: ShardIPCMessage) => {
      if (message?._sFetchProp !== prop || message._sFetchPropShard !== shard) {
        return;
      }
      parent.removeListener('message', listener);
      this.decrementMaxListeners(parent);
      if (message._error) {
        reject(Util.makeError(message._error));
      } else {
        resolve(message._result);
      }
    };
    this.incrementMaxListeners(parent);
    parent.on('message', listener);

    try {
      await this.send({ _sFetchProp: prop, _sFetchPropShard: shard });
    } catch (error: unknown) {
      parent.removeListener('message', listener);
      this.decrementMaxListeners(parent);
      reject(error);
    }

    return promise;
  }

  async broadcastEval(
    script: string | ((client: Client, context: unknown) => unknown),
    options: BroadcastEvalOptions = {}
  ): Promise<unknown> {
    if (typeof script !== 'function') {
      throw new TypeError('SHARDING_INVALID_EVAL_BROADCAST');
    }
    const { promise, resolve, reject } = Promise.withResolvers<unknown>();
    const parent = this.parentPort ?? process;
    const evalScript = `(${script})(this, ${JSON.stringify(options.context)})`;

    const listener = (message: ShardIPCMessage) => {
      if (
        message?._sEval !== evalScript ||
        message._sEvalShard !== options.shard
      ) {
        return;
      }
      parent.removeListener('message', listener);
      this.decrementMaxListeners(parent);
      if (message._error) {
        reject(Util.makeError(message._error));
      } else {
        resolve(message._result);
      }
    };
    this.incrementMaxListeners(parent);
    parent.on('message', listener);

    try {
      await this.send({ _sEval: evalScript, _sEvalShard: options.shard });
    } catch (error: unknown) {
      parent.removeListener('message', listener);
      this.decrementMaxListeners(parent);
      reject(error);
    }

    return promise;
  }

  respawnAll({
    shardDelay = 5000,
    respawnDelay = 500,
    timeout = 30_000,
  }: {
    shardDelay?: number;
    respawnDelay?: number;
    timeout?: number;
  } = {}): Promise<void> {
    return this.send({ _sRespawnAll: { respawnDelay, shardDelay, timeout } });
  }

  async _handleMessage(
    message: ShardIPCMessage | null | undefined
  ): Promise<void> {
    if (!message) {
      return;
    }
    if (message._fetchProp) {
      try {
        const props = message._fetchProp.split('.');
        let value: unknown = this.client;
        for (const prop of props) {
          value = readProperty(value, prop);
        }
        this._respond('fetchProp', {
          _fetchProp: message._fetchProp,
          _result: value,
        });
      } catch (error: unknown) {
        this._respond('fetchProp', {
          _error: Util.makePlainError(error),
          _fetchProp: message._fetchProp,
        });
      }
    } else if (message._eval) {
      try {
        this._respond('eval', {
          _eval: message._eval,
          _result: await this.client._eval(message._eval),
        });
      } catch (error: unknown) {
        this._respond('eval', {
          _error: Util.makePlainError(error),
          _eval: message._eval,
        });
      }
    }
  }

  _respond(type: string, message: ShardIPCMessage): void {
    this.sendResponse(type, message);
  }

  private async sendResponse(
    type: string,
    message: ShardIPCMessage
  ): Promise<void> {
    try {
      await this.send(message);
    } catch (error: unknown) {
      const reason = error instanceof Error ? error : new Error(String(error));
      const wrapped = new Error(
        `Error when sending ${type} response to master process: ${reason.message}`
      );
      wrapped.stack = reason.stack;
      this.client.emit(Events.ERROR, wrapped);
    }
  }

  static singleton(client: Client, mode: ShardingManagerMode): ShardClientUtil {
    if (this._singleton) {
      client.emit(
        Events.WARN,
        'Multiple clients created in child process/worker; only the first will handle sharding helpers.'
      );
    } else {
      this._singleton = new this(client, mode);
    }
    return this._singleton;
  }

  static shardIdForGuildId(guildId: Snowflake, shardCount: number): number {
    const shard = Number(BigInt(guildId) >> 22n) % shardCount;
    if (shard < 0) {
      throw new Error(
        'SHARDING_SHARD_MISCALCULATION',
        shard,
        guildId,
        shardCount
      );
    }
    return shard;
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

export default ShardClientUtil;
export { ShardClientUtil };
