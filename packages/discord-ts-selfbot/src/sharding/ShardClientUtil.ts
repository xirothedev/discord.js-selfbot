import { parentPort } from 'node:worker_threads';
import process from 'node:process';
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

type ListenerEmitter = { getMaxListeners(): number; setMaxListeners(n: number): unknown };

interface BroadcastEvalOptions {
  shard?: number;
  context?: unknown;
}

function readProperty(value: unknown, key: string): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

function sendToProcess(message: ShardIPCMessage, callback: (error: Error | null) => void): void {
  const send = Reflect.get(process, 'send');
  if (typeof send === 'function') Reflect.apply(send, process, [message, callback]);
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
    /**
     * Client for the shard
     * @type {Client}
     */
    this.client = client;

    /**
     * Mode the shard was spawned with
     * @type {ShardingManagerMode}
     */
    this.mode = mode;

    /**
     * Message port for the master process (only when {@link ShardClientUtil#mode} is `worker`)
     * @type {?MessagePort}
     */
    this.parentPort = null;

    if (mode === 'process') {
      process.on('message', this._handleMessage.bind(this));
      client.on('ready', () => {
        sendToProcess({ _ready: true }, () => {});
      });
      client.on('disconnect', () => {
        sendToProcess({ _disconnect: true }, () => {});
      });
      client.on('reconnecting', () => {
        sendToProcess({ _reconnecting: true }, () => {});
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

  /**
   * Array of shard ids of this client
   * @type {number[]}
   * @readonly
   */
  get ids(): number[] {
    return this.client.options.shards;
  }

  /**
   * Total number of shards
   * @type {number}
   * @readonly
   */
  get count(): number {
    return this.client.options.shardCount;
  }

  /**
   * Sends a message to the master process.
   * @param {*} message Message to send
   * @returns {Promise<void>}
   * @emits Shard#message
   */
  send(message: ShardIPCMessage): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.mode === 'process') {
        sendToProcess(message, error => {
          if (error) reject(error);
          else resolve();
        });
      } else if (this.mode === 'worker') {
        this.parentPort?.postMessage(message);
        resolve();
      }
    });
  }

  /**
   * Fetches a client property value of each shard, or a given shard.
   * @param {string} prop Name of the client property to get, using periods for nesting
   * @param {number} [shard] Shard to fetch property from, all if undefined
   * @returns {Promise<*|Array<*>>}
   * @example
   * client.shard.fetchClientValues('guilds.cache.size')
   *   .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
   *   .catch(console.error);
   * @see {@link ShardingManager#fetchClientValues}
   */
  fetchClientValues(prop: string, shard?: number): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      const parent = this.parentPort ?? process;

      const listener = (message: ShardIPCMessage) => {
        if (message?._sFetchProp !== prop || message._sFetchPropShard !== shard) return;
        parent.removeListener('message', listener);
        this.decrementMaxListeners(parent);
        if (!message._error) resolve(message._result);
        else reject(Util.makeError(message._error));
      };
      this.incrementMaxListeners(parent);
      parent.on('message', listener);

      this.send({ _sFetchProp: prop, _sFetchPropShard: shard }).catch((err: unknown) => {
        parent.removeListener('message', listener);
        this.decrementMaxListeners(parent);
        reject(err);
      });
    });
  }

  /**
   * Evaluates a script or function on all shards, or a given shard, in the context of the {@link Client}s.
   * @param {Function} script JavaScript to run on each shard
   * @param {BroadcastEvalOptions} [options={}] The options for the broadcast
   * @returns {Promise<*|Array<*>>} Results of the script execution
   * @example
   * client.shard.broadcastEval(client => client.guilds.cache.size)
   *   .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
   *   .catch(console.error);
   * @see {@link ShardingManager#broadcastEval}
   */
  broadcastEval(
    script: string | ((client: Client, context: unknown) => unknown),
    options: BroadcastEvalOptions = {},
  ): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      const parent = this.parentPort ?? process;
      if (typeof script !== 'function') {
        reject(new TypeError('SHARDING_INVALID_EVAL_BROADCAST'));
        return;
      }
      const evalScript = `(${script})(this, ${JSON.stringify(options.context)})`;

      const listener = (message: ShardIPCMessage) => {
        if (message?._sEval !== evalScript || message._sEvalShard !== options.shard) return;
        parent.removeListener('message', listener);
        this.decrementMaxListeners(parent);
        if (!message._error) resolve(message._result);
        else reject(Util.makeError(message._error));
      };
      this.incrementMaxListeners(parent);
      parent.on('message', listener);
      this.send({ _sEval: evalScript, _sEvalShard: options.shard }).catch((err: unknown) => {
        parent.removeListener('message', listener);
        this.decrementMaxListeners(parent);
        reject(err);
      });
    });
  }

  /**
   * Requests a respawn of all shards.
   * @param {MultipleShardRespawnOptions} [options] Options for respawning shards
   * @returns {Promise<void>} Resolves upon the message being sent
   * @see {@link ShardingManager#respawnAll}
   */
  respawnAll({
    shardDelay = 5_000,
    respawnDelay = 500,
    timeout = 30_000,
  }: { shardDelay?: number; respawnDelay?: number; timeout?: number } = {}): Promise<void> {
    return this.send({ _sRespawnAll: { shardDelay, respawnDelay, timeout } });
  }

  /**
   * Handles an IPC message.
   * @param {*} message Message received
   * @private
   */
  async _handleMessage(message: ShardIPCMessage | null | undefined): Promise<void> {
    if (!message) return;
    if (message._fetchProp) {
      try {
        const props = message._fetchProp.split('.');
        let value: unknown = this.client;
        for (const prop of props) value = readProperty(value, prop);
        this._respond('fetchProp', { _fetchProp: message._fetchProp, _result: value });
      } catch (err: unknown) {
        this._respond('fetchProp', { _fetchProp: message._fetchProp, _error: Util.makePlainError(err) });
      }
    } else if (message._eval) {
      try {
        this._respond('eval', { _eval: message._eval, _result: await this.client._eval(message._eval) });
      } catch (err: unknown) {
        this._respond('eval', { _eval: message._eval, _error: Util.makePlainError(err) });
      }
    }
  }

  /**
   * Sends a message to the master process, emitting an error from the client upon failure.
   * @param {string} type Type of response to send
   * @param {*} message Message to send
   * @private
   */
  _respond(type: string, message: ShardIPCMessage): void {
    this.send(message).catch((err: unknown) => {
      const reason = err instanceof Error ? err : new Error(String(err));
      const error = new Error(`Error when sending ${type} response to master process: ${reason.message}`);
      error.stack = reason.stack;
      /**
       * Emitted when the client encounters an error.
       * <warn>Errors thrown within this event do not have a catch handler, it is
       * recommended to not use async functions as `error` event handlers. See the
       * [Node.js docs](https://nodejs.org/api/events.html#capture-rejections-of-promises) for details.</warn>
       * @event Client#error
       * @param {Error} error The error encountered
       */
      this.client.emit(Events.ERROR, error);
    });
  }

  /**
   * Creates/gets the singleton of this class.
   * @param {Client} client The client to use
   * @param {ShardingManagerMode} mode Mode the shard was spawned with
   * @returns {ShardClientUtil}
   */
  static singleton(client: Client, mode: ShardingManagerMode): ShardClientUtil {
    if (!this._singleton) {
      this._singleton = new this(client, mode);
    } else {
      client.emit(
        Events.WARN,
        'Multiple clients created in child process/worker; only the first will handle sharding helpers.',
      );
    }
    return this._singleton;
  }

  /**
   * Get the shard id for a given guild id.
   * @param {Snowflake} guildId Snowflake guild id to get shard id for
   * @param {number} shardCount Number of shards
   * @returns {number}
   */
  static shardIdForGuildId(guildId: Snowflake, shardCount: number): number {
    const shard = Number(BigInt(guildId) >> 22n) % shardCount;
    if (shard < 0) throw new Error('SHARDING_SHARD_MISCALCULATION', shard, guildId, shardCount);
    return shard;
  }

  /**
   * Increments max listeners by one for a given emitter, if they are not zero.
   * @param {EventEmitter|process} emitter The emitter that emits the events.
   * @private
   */
  incrementMaxListeners(emitter: ListenerEmitter): void {
    const maxListeners = emitter.getMaxListeners();
    if (maxListeners !== 0) {
      emitter.setMaxListeners(maxListeners + 1);
    }
  }

  /**
   * Decrements max listeners by one for a given emitter, if they are not zero.
   * @param {EventEmitter|process} emitter The emitter that emits the events.
   * @private
   */
  decrementMaxListeners(emitter: ListenerEmitter): void {
    const maxListeners = emitter.getMaxListeners();
    if (maxListeners !== 0) {
      emitter.setMaxListeners(maxListeners - 1);
    }
  }
}

export default ShardClientUtil;
export { ShardClientUtil };
