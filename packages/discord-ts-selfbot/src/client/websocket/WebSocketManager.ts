import EventEmitter from 'node:events';
import { Collection } from '@discordjs/collection';
import { RPCErrorCodes } from 'discord-api-types/v10';
import WebSocketShard from './WebSocketShard';
import GatewayDispatch from './GatewayDispatch';
import type { GatewayPacket } from './GatewayDispatch';
import _errorsModule from '../../errors';

const { Error } = _errorsModule;
import _ConstantsModule from '../../util/Constants';
import type Client from '../Client';

const { Events, ShardEvents, Status, WSCodes } = _ConstantsModule;

interface GatewayInfo {
  url: string;
}

interface CloseEventLike {
  code?: number;
  reason?: string;
  wasClean?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const UNRECOVERABLE_CLOSE_CODES = Object.keys(WSCodes).slice(2).map(Number);
const UNRESUMABLE_CLOSE_CODES = [
  RPCErrorCodes.UnknownError,
  RPCErrorCodes.InvalidPermissions,
  RPCErrorCodes.InvalidClientId,
];

class WebSocketManager extends EventEmitter {
  declare client: Client;
  declare gateway: string | null;
  declare totalShards: number;
  declare shards: Collection<number, WebSocketShard>;
  declare shardQueue: Set<WebSocketShard>;
  declare dispatch: GatewayDispatch;
  declare status: number;
  declare destroyed: boolean;
  declare reconnecting: boolean;

  constructor(client: Client) {
    super();

    Object.defineProperty(this, 'client', { value: client });

    this.gateway = null;

    this.totalShards = Array.isArray(this.client.options.shards)
      ? this.client.options.shards.length
      : this.client.options.shardCount;

    this.shards = new Collection();

    Object.defineProperty(this, 'shardQueue', {
      value: new Set(),
      writable: true,
    });

    this.dispatch = new GatewayDispatch(client);

    this.status = Status.IDLE;

    this.destroyed = false;

    this.reconnecting = false;
  }

  get ping() {
    const sum = this.shards.reduce((total, shard) => total + shard.ping, 0);
    return sum / this.shards.size;
  }

  debug(message: string, shard?: WebSocketShard) {
    this.client.emit(
      Events.DEBUG,
      `[WS => ${shard ? `Shard ${shard.id}` : 'Manager'}] ${message}`
    );
  }

  async connect() {
    let gatewayURL = 'wss://gateway.discord.gg';
    await this.client.api.gateway
      .get<GatewayInfo>({ auth: false })
      .then((r: GatewayInfo) => (gatewayURL = r.url))
      .catch(() => {
        /* empty */
      });

    const total = Infinity;
    const remaining = Infinity;
    const recommendedShards = 1;

    this.debug(`Fetched Gateway Information
    URL: ${gatewayURL}
    Recommended Shards: ${recommendedShards}`);

    this.debug(`Session Limit Information
    Total: ${total}
    Remaining: ${remaining}`);

    this.gateway = `${gatewayURL}/`;

    let { shards } = this.client.options;

    if (shards === 'auto') {
      this.debug(
        `Using the recommended shard count provided by Discord: ${recommendedShards}`
      );
      this.totalShards = recommendedShards;
      this.client.options.shardCount = recommendedShards;
      shards = Array.from(
        { length: recommendedShards },
        (_value, index) => index
      );
      this.client.options.shards = shards;
    }

    if (!Array.isArray(shards)) {
      shards = Array.from(
        { length: this.client.options.shardCount },
        (_value, index) => index
      );
      this.client.options.shards = shards;
    }

    this.totalShards = shards.length;
    this.debug(`Spawning shards: ${shards.join(', ')}`);
    this.shardQueue = new Set(
      shards.map((id: number) => new WebSocketShard(this, id))
    );

    return this.createShards();
  }

  async createShards(): Promise<boolean> {
    // If we don't have any shards to handle, return
    if (!this.shardQueue.size) {
      return false;
    }

    const [shard] = this.shardQueue;

    this.shardQueue.delete(shard);

    if (!shard.eventsAttached) {
      shard.on(
        ShardEvents.ALL_READY,
        (unavailableGuilds?: Set<string> | null) => {
          this.client.emit(Events.SHARD_READY, shard.id, unavailableGuilds);

          if (!this.shardQueue.size) {
            this.reconnecting = false;
          }
          this.checkShardsReady();
        }
      );

      shard.on(ShardEvents.CLOSE, (event: CloseEventLike) => {
        if (
          event.code === 1000
            ? this.destroyed
            : event.code !== undefined &&
              UNRECOVERABLE_CLOSE_CODES.includes(event.code)
        ) {
          this.client.emit(Events.SHARD_DISCONNECT, event, shard.id);
          if (event.code !== undefined) {
            this.debug(WSCodes[event.code], shard);
          }
          return;
        }

        if (
          event.code !== undefined &&
          UNRESUMABLE_CLOSE_CODES.includes(event.code)
        ) {
          // These event codes cannot be resumed
          shard.sessionId = null;
        }

        this.client.emit(Events.SHARD_RECONNECTING, shard.id);

        this.shardQueue.add(shard);

        if (shard.sessionId) {
          this.debug(
            `Session id is present, attempting an immediate reconnect...`,
            shard
          );
        }
        this.reconnect();
      });

      shard.on(ShardEvents.INVALID_SESSION, () => {
        this.client.emit(Events.SHARD_RECONNECTING, shard.id);
      });

      shard.on(ShardEvents.DESTROYED, () => {
        this.debug(
          'Shard was destroyed but no WebSocket connection was present! Reconnecting...',
          shard
        );

        this.client.emit(Events.SHARD_RECONNECTING, shard.id);

        this.shardQueue.add(shard);
        this.reconnect();
      });

      shard.eventsAttached = true;
    }

    this.shards.set(shard.id, shard);

    try {
      await shard.connect();
    } catch (error: unknown) {
      const code =
        isRecord(error) && typeof error.code === 'number'
          ? error.code
          : undefined;
      if (code && UNRECOVERABLE_CLOSE_CODES.includes(code)) {
        throw new Error(WSCodes[code]);
        // Undefined if session is invalid, error event for regular closes
      } else if (!error || code) {
        this.debug('Failed to connect to the gateway, requeueing...', shard);
        this.shardQueue.add(shard);
      } else {
        throw error;
      }
    }
    // If we have more shards, add a 5s delay
    if (this.shardQueue.size) {
      this.debug(
        `Shard Queue Size: ${this.shardQueue.size}; continuing in 5 seconds...`
      );
      await Bun.sleep(5000);
      return this.createShards();
    }

    return true;
  }

  async reconnect(): Promise<boolean> {
    if (this.reconnecting || this.status !== Status.READY) {
      return false;
    }
    this.reconnecting = true;
    try {
      await this.createShards();
    } catch (error: unknown) {
      this.debug(
        `Couldn't reconnect or fetch information about the gateway. ${String(error)}`
      );
      const httpStatus =
        isRecord(error) && typeof error.httpStatus === 'number'
          ? error.httpStatus
          : undefined;
      if (httpStatus !== 401) {
        this.debug(`Possible network error occurred. Retrying in 5s...`);
        await Bun.sleep(5000);
        this.reconnecting = false;
        return this.reconnect();
      }
      // If we get an error at this point, it means we cannot reconnect anymore
      if (this.client.listenerCount(Events.INVALIDATED)) {
        this.client.emit(Events.INVALIDATED);
        // Destroy just the shards. This means you have to handle the cleanup yourself
        this.destroy();
      } else {
        this.client.destroy();
      }
    } finally {
      this.reconnecting = false;
    }
    return true;
  }

  broadcast(packet: unknown) {
    for (const shard of this.shards.values()) {
      shard.send(packet);
    }
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.debug(
      `Manager was destroyed. Called by:\n${new Error('MANAGER_DESTROYED').stack}`
    );
    this.destroyed = true;
    this.shardQueue.clear();
    for (const shard of this.shards.values()) {
      shard.destroy({ closeCode: 1000, emit: false, log: false, reset: true });
    }
  }

  handlePacket(packet?: GatewayPacket, shard?: WebSocketShard) {
    return this.dispatch.handle(packet, shard);
  }

  checkShardsReady() {
    if (this.status === Status.READY) {
      return;
    }
    if (
      this.shards.size !== this.totalShards ||
      this.shards.some((s) => s.status !== Status.READY)
    ) {
      return;
    }

    this.triggerClientReady();
  }

  triggerClientReady() {
    this.status = Status.READY;

    this.client.readyAt = new Date();

    this.client.emit(Events.CLIENT_READY, this.client);

    this.handlePacket();
  }
}

export default WebSocketManager;
export { WebSocketManager };
