import EventEmitter from 'node:events';
import { setTimeout, setInterval, clearTimeout } from 'node:timers';
import WebSocket from '../../WebSocket';
import _ConstantsModule from '../../util/Constants';
const { Status, Events, ShardEvents, Opcodes, WSEvents, WSCodes } = _ConstantsModule;
import Intents from '../../util/Intents';
import Util from '../../util/Util';

const STATUS_KEYS = Object.keys(Status);
const CONNECTION_STATE = Object.keys(WebSocket.WebSocket);

interface ZlibStream {
  Inflate: new (options: { chunkSize: number; flush: number; to: string }) => {
    push(data: Uint8Array | Buffer, flush?: number): void;
    result: string;
  };
  Z_SYNC_FLUSH: number;
}

interface CloseEventLike {
  code?: number;
  reason?: string;
  wasClean?: boolean;
}

interface DestroyOptions {
  closeCode?: number;
  reset?: boolean;
  emit?: boolean;
  log?: boolean;
}

interface GatewayPacket {
  op?: number;
  t?: string;
  s?: number;
  d?: unknown;
}

interface UnavailableGuild {
  id: string;
  unavailable?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isZlibStream(value: unknown): value is ZlibStream {
  return (
    isRecord(value) &&
    'Inflate' in value &&
    typeof value.Inflate === 'function' &&
    'Z_SYNC_FLUSH' in value &&
    typeof value.Z_SYNC_FLUSH === 'number'
  );
}

function isGatewayPacket(value: unknown): value is GatewayPacket {
  return isRecord(value);
}

function isUnavailableGuild(value: unknown): value is UnavailableGuild {
  return isRecord(value) && 'id' in value && typeof value.id === 'string';
}

let zlib: ZlibStream | null = null;

try {
  const _zs = 'zlib-sync';
  const loaded: unknown = await import(_zs);
  const candidate = isRecord(loaded) && 'default' in loaded ? loaded.default : loaded;
  zlib = isZlibStream(candidate) ? candidate : isZlibStream(loaded) ? loaded : null;
} catch {} // eslint-disable-line no-empty

class WebSocketShard extends EventEmitter {
  declare manager: import('./WebSocketManager').default;
  declare id: number;
  declare resumeURL: string | null;
  declare status: number;
  declare sequence: number;
  declare closeSequence: number;
  declare sessionId: string | null;
  declare ping: number;
  declare lastPingTimestamp: number;
  declare lastHeartbeatAcked: boolean;
  declare closeEmitted: boolean;
  declare ratelimit: {
    queue: unknown[];
    total: number;
    remaining: number;
    time: number;
    timer: NodeJS.Timeout | null;
  };
  declare connection: import('ws').WebSocket | null;
  declare inflate: { push(data: Uint8Array | Buffer, flush?: number): void; result: string } | null;
  declare helloTimeout: NodeJS.Timeout | null;
  declare wsCloseTimeout: NodeJS.Timeout | null;
  declare eventsAttached: boolean;
  declare expectedGuilds: Set<string> | null;
  declare readyTimeout: NodeJS.Timeout | null;
  declare connectedAt: number;
  declare heartbeatInterval: NodeJS.Timeout | null;

  constructor(manager: import('./WebSocketManager').default, id: number) {
    super();

    this.manager = manager;

    this.id = id;

    this.resumeURL = null;

    this.status = Status.IDLE;

    this.sequence = -1;

    this.closeSequence = 0;

    this.sessionId = null;

    this.ping = -1;

    this.lastPingTimestamp = -1;

    this.lastHeartbeatAcked = true;

    this.closeEmitted = false;

    Object.defineProperty(this, 'ratelimit', {
      value: {
        queue: [],
        total: 120,
        remaining: 120,
        time: 60e3,
        timer: null,
      },
    });

    Object.defineProperty(this, 'connection', { value: null, writable: true });

    Object.defineProperty(this, 'inflate', { value: null, writable: true });

    Object.defineProperty(this, 'helloTimeout', { value: null, writable: true });

    Object.defineProperty(this, 'wsCloseTimeout', { value: null, writable: true });

    Object.defineProperty(this, 'eventsAttached', { value: false, writable: true });

    Object.defineProperty(this, 'expectedGuilds', { value: null, writable: true });

    Object.defineProperty(this, 'readyTimeout', { value: null, writable: true });

    Object.defineProperty(this, 'connectedAt', { value: 0, writable: true });
  }

  debug(message: string) {
    this.manager.debug(message, this);
  }

  connect() {
    const { client } = this.manager;

    if (this.connection?.readyState === WebSocket.OPEN && this.status === Status.READY) {
      return Promise.resolve();
    }

    const gateway = this.resumeURL ?? this.manager.gateway;

    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        this.removeListener(ShardEvents.CLOSE, onClose);
        this.removeListener(ShardEvents.READY, onReady);
        this.removeListener(ShardEvents.RESUMED, onResumed);
        this.removeListener(ShardEvents.INVALID_SESSION, onInvalidOrDestroyed);
        this.removeListener(ShardEvents.DESTROYED, onInvalidOrDestroyed);
      };

      const onReady = () => {
        cleanup();
        resolve();
      };

      const onResumed = () => {
        cleanup();
        resolve();
      };

      const onClose = (event: unknown) => {
        cleanup();
        reject(event);
      };

      const onInvalidOrDestroyed = () => {
        cleanup();
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      };

      this.once(ShardEvents.READY, onReady);
      this.once(ShardEvents.RESUMED, onResumed);
      this.once(ShardEvents.CLOSE, onClose);
      this.once(ShardEvents.INVALID_SESSION, onInvalidOrDestroyed);
      this.once(ShardEvents.DESTROYED, onInvalidOrDestroyed);

      if (this.connection?.readyState === WebSocket.OPEN) {
        this.debug('An open connection was found, attempting an immediate identify.');
        this.identify();
        return;
      }

      if (this.connection) {
        this.debug(`A connection object was found. Cleaning up before continuing.
    State: ${CONNECTION_STATE[this.connection.readyState]}`);
        this.destroy({ emit: false });
      }

      const wsQuery: Record<string, unknown> = { v: client.options.ws.version };

      if (zlib) {
        this.inflate = new zlib.Inflate({
          chunkSize: 65535,
          flush: zlib.Z_SYNC_FLUSH,
          to: WebSocket.encoding === 'json' ? 'string' : '',
        });
        wsQuery.compress = 'zlib-stream';
      }

      this.debug(
        `[CONNECT]
    Gateway    : ${gateway}
    Version    : ${client.options.ws.version}
    Encoding   : ${WebSocket.encoding}
    Compression: ${zlib ? 'zlib-stream' : 'none'}
    Agent      : ${Util.verifyProxyAgent(client.options.ws.agent)}`,
      );

      this.status = this.status === Status.DISCONNECTED ? Status.RECONNECTING : Status.CONNECTING;
      this.setHelloTimeout();
      this.setWsCloseTimeout(-1);
      this.connectedAt = Date.now();

      // Adding a handshake timeout to just make sure no zombie connection appears.
      if (!gateway) return;
      const ws = (this.connection = WebSocket.create(gateway, wsQuery, {
        handshakeTimeout: 30_000,
        agent: Util.verifyProxyAgent(client.options.ws.agent) ? client.options.ws.agent : undefined,
      }));
      ws.onopen = this.onOpen.bind(this);
      ws.onmessage = this.onMessage.bind(this);
      ws.onerror = this.onError.bind(this);
      ws.onclose = this.onClose.bind(this);
    });
  }

  onOpen() {
    this.debug(`[CONNECTED] Took ${Date.now() - this.connectedAt}ms`);
    this.status = Status.NEARLY;
  }

  onMessage({ data }: { data: unknown }) {
    let raw: unknown;
    const chunk =
      typeof data === 'string'
        ? Buffer.from(data)
        : data instanceof Uint8Array
          ? data
          : data instanceof ArrayBuffer
            ? new Uint8Array(data)
            : null;
    if (!chunk) return;
    if (zlib) {
      const l = chunk.length;
      const flush =
        l >= 4 && chunk[l - 4] === 0x00 && chunk[l - 3] === 0x00 && chunk[l - 2] === 0xff && chunk[l - 1] === 0xff;

      this.inflate!.push(chunk, flush ? zlib.Z_SYNC_FLUSH : undefined);
      if (!flush) return;
      raw = this.inflate!.result;
    } else {
      raw = chunk;
    }
    let packet: unknown;
    try {
      packet = WebSocket.unpack(raw);
    } catch (err) {
      this.manager.client.emit(Events.SHARD_ERROR, err, this.id);
      return;
    }
    this.manager.client.emit(Events.RAW, packet, this.id);
    if (!isGatewayPacket(packet)) return;
    if (packet.op === Opcodes.DISPATCH && packet.t) this.manager.emit(packet.t, packet.d, this.id);
    this.onPacket(packet);
  }

  onError(event: unknown) {
    const error = isRecord(event) && 'error' in event ? event.error : event;
    if (!error) return;

    this.manager.client.emit(Events.SHARD_ERROR, error, this.id);
  }

  onClose(event: CloseEventLike) {
    this.closeEmitted = true;
    if (this.sequence !== -1) this.closeSequence = this.sequence;
    this.sequence = -1;
    this.setHeartbeatTimer(-1);
    this.setHelloTimeout(-1);
    // Clearing the WebSocket close timeout as close was emitted.
    this.setWsCloseTimeout(-1);
    // If we still have a connection object, clean up its listeners
    if (this.connection) {
      this._cleanupConnection();
      // Having this after _cleanupConnection to just clean up the connection and not listen to ws.onclose
      this.destroy({ reset: !this.sessionId, emit: false, log: false });
    }
    this.status = Status.DISCONNECTED;
    this.emitClose(event);
  }

  emitClose(
    event: CloseEventLike = {
      code: 1011,
      reason: String(WSCodes[1011] ?? 'Unknown error'),
      wasClean: false,
    },
  ) {
    this.debug(`[CLOSE]
    Event Code: ${event.code}
    Clean     : ${event.wasClean}
    Reason    : ${event.reason ?? 'No reason received'}`);
    this.emit(ShardEvents.CLOSE, event);
  }

  onPacket(packet: GatewayPacket) {
    if (!packet) {
      this.debug(`Received broken packet: '${packet}'.`);
      return;
    }

    switch (packet.t) {
      case WSEvents.READY:
        this.emit(ShardEvents.READY);

        const ready = isRecord(packet.d) ? packet.d : {};
        this.resumeURL = typeof ready.resume_gateway_url === 'string' ? ready.resume_gateway_url : null;
        this.sessionId = typeof ready.session_id === 'string' ? ready.session_id : null;
        const guilds = Array.isArray(ready.guilds) ? ready.guilds : [];
        this.expectedGuilds = new Set(
          guilds
            .filter(isUnavailableGuild)
            .filter(guild => guild.unavailable)
            .map(guild => guild.id),
        );
        this.status = Status.WAITING_FOR_GUILDS;
        this.debug(`[READY] Session ${this.sessionId} | Resume url ${this.resumeURL}.`);
        this.lastHeartbeatAcked = true;
        this.sendHeartbeat('ReadyHeartbeat');
        break;
      case WSEvents.RESUMED: {
        this.emit(ShardEvents.RESUMED);

        this.status = Status.READY;
        const replayed = (packet.s ?? this.sequence) - this.closeSequence;
        this.debug(`[RESUMED] Session ${this.sessionId} | Replayed ${replayed} events.`);
        this.lastHeartbeatAcked = true;
        this.sendHeartbeat('ResumeHeartbeat');
        break;
      }
    }

    if (typeof packet.s === 'number' && packet.s > this.sequence) this.sequence = packet.s;

    switch (packet.op) {
      case Opcodes.HELLO:
        this.setHelloTimeout(-1);
        if (isRecord(packet.d) && typeof packet.d.heartbeat_interval === 'number') {
          this.setHeartbeatTimer(packet.d.heartbeat_interval);
        }
        this.identify();
        break;
      case Opcodes.RECONNECT:
        this.debug('[RECONNECT] Discord asked us to reconnect');
        this.destroy({ closeCode: 4_000 });
        break;
      case Opcodes.INVALID_SESSION:
        this.debug(`[INVALID SESSION] Resumable: ${packet.d}.`);
        // If we can resume the session, do so immediately
        if (packet.d) {
          this.identifyResume();
          return;
        }
        // Reset the sequence
        this.sequence = -1;
        // Reset the session id as it's invalid
        this.sessionId = null;
        // Set the status to reconnecting
        this.status = Status.RECONNECTING;
        // Finally, emit the INVALID_SESSION event
        this.emit(ShardEvents.INVALID_SESSION);
        break;
      case Opcodes.HEARTBEAT_ACK:
        this.ackHeartbeat();
        break;
      case Opcodes.HEARTBEAT:
        this.sendHeartbeat('HeartbeatRequest', true);
        break;
      default:
        this.manager.handlePacket(packet, this);
        if (this.status === Status.WAITING_FOR_GUILDS && packet.t === WSEvents.GUILD_CREATE) {
          if (isRecord(packet.d) && typeof packet.d.id === 'string') this.expectedGuilds?.delete(packet.d.id);
          this.checkReady();
        }
    }
  }

  checkReady() {
    // Step 0. Clear the ready timeout, if it exists
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout);
      this.readyTimeout = null;
    }
    // Step 1. If we don't have any other guilds pending, we are ready
    if (!this.expectedGuilds?.size) {
      this.debug('Shard received all its guilds. Marking as fully ready.');
      this.status = Status.READY;

      this.emit(ShardEvents.ALL_READY);
      return;
    }
    const hasGuildsIntent = new Intents(this.manager.client.options.intents).has(Intents.FLAGS.GUILDS);
    // Step 2. Create a timeout that will mark the shard as ready if there are still unavailable guilds
    // * The timeout is 15 seconds by default
    // * This can be optionally changed in the client options via the `waitGuildTimeout` option
    // * a timeout time of zero will skip this timeout, which potentially could cause the Client to miss guilds.

    const { waitGuildTimeout } = this.manager.client.options;

    this.readyTimeout = setTimeout(
      () => {
        this.debug(
          `Shard ${hasGuildsIntent ? 'did' : 'will'} not receive any more guild packets` +
            `${hasGuildsIntent ? ` in ${waitGuildTimeout} ms` : ''}.\nUnavailable guild count: ${
              this.expectedGuilds?.size
            }`,
        );

        this.readyTimeout = null;

        this.status = Status.READY;

        this.emit(ShardEvents.ALL_READY, this.expectedGuilds);
      },
      hasGuildsIntent ? waitGuildTimeout : 0,
    ).unref();
  }

  setHelloTimeout(time?: number) {
    if (time === -1) {
      if (this.helloTimeout) {
        this.debug('Clearing the HELLO timeout.');
        clearTimeout(this.helloTimeout);
        this.helloTimeout = null;
      }
      return;
    }
    this.debug('Setting a HELLO timeout for 20s.');
    this.helloTimeout = setTimeout(() => {
      this.debug('Did not receive HELLO in time. Destroying and connecting again.');
      this.destroy({ reset: true, closeCode: 4009 });
    }, 20_000).unref();
  }

  setWsCloseTimeout(time?: number) {
    if (this.wsCloseTimeout) {
      this.debug('[WebSocket] Clearing the close timeout.');
      clearTimeout(this.wsCloseTimeout);
    }
    if (time === -1) {
      this.wsCloseTimeout = null;
      return;
    }
    this.wsCloseTimeout = setTimeout(() => {
      this.setWsCloseTimeout(-1);

      // Check if close event was emitted.
      if (this.closeEmitted) {
        this.debug(`[WebSocket] close was already emitted, assuming the connection was closed properly.`);
        // Setting the variable false to check for zombie connections.
        this.closeEmitted = false;
        return;
      }

      this.debug(
        // eslint-disable-next-line max-len
        `[WebSocket] Close Emitted: ${this.closeEmitted} | did not close properly, assuming a zombie connection.\nEmitting close and reconnecting again.`,
      );

      if (this.connection) this._cleanupConnection();

      this.emitClose({
        code: 4009,
        reason: 'Session time out.',
        wasClean: false,
      });
    }, time);
  }

  setHeartbeatTimer(time: number) {
    if (time === -1) {
      if (this.heartbeatInterval) {
        this.debug('Clearing the heartbeat interval.');
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      return;
    }
    this.debug(`Setting a heartbeat interval for ${time}ms.`);
    // Sanity checks
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), time).unref();
  }

  sendHeartbeat(
    tag = 'HeartbeatTimer',
    ignoreHeartbeatAck = [Status.WAITING_FOR_GUILDS, Status.IDENTIFYING, Status.RESUMING].includes(this.status),
  ) {
    if (ignoreHeartbeatAck && !this.lastHeartbeatAcked) {
      this.debug(`[${tag}] Didn't process heartbeat ack yet but we are still connected. Sending one now.`);
    } else if (!this.lastHeartbeatAcked) {
      this.debug(
        `[${tag}] Didn't receive a heartbeat ack last time, assuming zombie connection. Destroying and reconnecting.
    Status          : ${STATUS_KEYS[this.status]}
    Sequence        : ${this.sequence}
    Connection State: ${this.connection ? CONNECTION_STATE[this.connection.readyState] : 'No Connection??'}`,
      );
      this.destroy({ reset: true, closeCode: 4009 });
      return;
    }

    this.debug(`[${tag}] Sending a heartbeat.`);
    this.lastHeartbeatAcked = false;
    this.lastPingTimestamp = Date.now();
    this.send({ op: Opcodes.HEARTBEAT, d: this.sequence }, true);
  }

  ackHeartbeat() {
    this.lastHeartbeatAcked = true;
    const latency = Date.now() - this.lastPingTimestamp;
    this.debug(`Heartbeat acknowledged, latency of ${latency}ms.`);
    this.ping = latency;
  }

  identify() {
    return this.sessionId ? this.identifyResume() : this.identifyNew();
  }

  identifyNew() {
    const { client } = this.manager;
    if (!client.token) {
      this.debug('[IDENTIFY] No token available to identify a new session.');
      return;
    }

    this.status = Status.IDENTIFYING;

    // Patch something
    Object.keys(client.options.ws.properties)
      .filter(k => k.startsWith('$'))
      .forEach(k => {
        client.options.ws.properties[k.slice(1)] = client.options.ws.properties[k];
        delete client.options.ws.properties[k];
      });

    // Clone the identify payload and assign the token and shard info
    const d: Record<string, unknown> = {
      ...client.options.ws,
      token: client.token,
    };

    delete d.version;
    delete d.agent;

    this.debug(`[IDENTIFY] Shard ${this.id}`);
    this.send({ op: Opcodes.IDENTIFY, d }, true);
  }

  identifyResume() {
    if (!this.sessionId) {
      this.debug('[RESUME] No session id was present; identifying as a new session.');
      this.identifyNew();
      return;
    }

    this.status = Status.RESUMING;

    this.debug(`[RESUME] Session ${this.sessionId}, sequence ${this.closeSequence}`);

    const d = {
      token: this.manager.client.token,
      session_id: this.sessionId,
      seq: this.closeSequence,
    };

    this.send({ op: Opcodes.RESUME, d }, true);
  }

  send(data: unknown, important = false) {
    this.ratelimit.queue[important ? 'unshift' : 'push'](data);
    this.processQueue();
  }

  _send(data: unknown) {
    if (this.connection?.readyState !== WebSocket.OPEN) {
      this.debug(`Tried to send packet '${JSON.stringify(data)}' but no WebSocket is available!`);
      this.destroy({ closeCode: 4_000 });
      return;
    }

    this.debug(`[WebSocketShard] send packet '${JSON.stringify(data)}'`);
    this.connection!.send(WebSocket.pack(data), (err?: Error) => {
      if (err) this.manager.client.emit(Events.SHARD_ERROR, err, this.id);
    });
  }

  processQueue() {
    if (this.ratelimit.remaining === 0) return;
    if (this.ratelimit.queue.length === 0) return;
    if (this.ratelimit.remaining === this.ratelimit.total) {
      this.ratelimit.timer = setTimeout(() => {
        this.ratelimit.remaining = this.ratelimit.total;
        this.processQueue();
      }, this.ratelimit.time).unref();
    }
    while (this.ratelimit.remaining > 0) {
      const item = this.ratelimit.queue.shift();
      if (!item) return;
      this._send(item);
      this.ratelimit.remaining--;
    }
  }

  destroy({ closeCode = 1_000, reset = false, emit = true, log = true }: DestroyOptions = {}) {
    if (log) {
      this.debug(`[DESTROY]
    Close Code    : ${closeCode}
    Reset         : ${reset}
    Emit DESTROYED: ${emit}`);
    }

    // Step 0: Remove all timers
    this.setHeartbeatTimer(-1);
    this.setHelloTimeout(-1);

    this.debug(
      `[WebSocket] Destroy: Attempting to close the WebSocket. | WS State: ${
        CONNECTION_STATE[this.connection?.readyState ?? WebSocket.CLOSED]
      }`,
    );
    // Step 1: Close the WebSocket connection, if any, otherwise, emit DESTROYED
    if (this.connection) {
      // If the connection is currently opened, we will (hopefully) receive close
      if (this.connection.readyState === WebSocket.OPEN) {
        this.connection.close(closeCode);
        this.debug(`[WebSocket] Close: Tried closing. | WS State: ${CONNECTION_STATE[this.connection.readyState]}`);
      } else {
        // Connection is not OPEN
        this.debug(`WS State: ${CONNECTION_STATE[this.connection.readyState]}`);
        // Attempt to close the connection just in case
        try {
          this.connection.close(closeCode);
        } catch (err: unknown) {
          this.debug(
            `[WebSocket] Close: Something went wrong while closing the WebSocket: ${
              err instanceof Error ? err.message : String(err)
            }. Forcefully terminating the connection | WS State: ${CONNECTION_STATE[this.connection.readyState]}`,
          );
          this.connection.terminate();
        }
        // Emit the destroyed event if needed
        if (emit) this._emitDestroyed();
      }
    } else if (emit) {
      // We requested a destroy, but we had no connection. Emit destroyed
      this._emitDestroyed();
    }

    this.debug(
      `[WebSocket] Adding a WebSocket close timeout to ensure a correct WS reconnect.
        Timeout: ${this.manager.client.options.closeTimeout}ms`,
    );
    this.setWsCloseTimeout(this.manager.client.options.closeTimeout);

    // Step 2: Null the connection object
    this.connection = null;

    // Step 3: Set the shard status to DISCONNECTED
    this.status = Status.DISCONNECTED;

    // Step 4: Cache the old sequence (use to attempt a resume)
    if (this.sequence !== -1) this.closeSequence = this.sequence;

    // Step 5: Reset the sequence, resume URL and session id if requested
    if (reset) {
      this.resumeURL = null;
      this.sequence = -1;
      this.sessionId = null;
    }

    // Step 6: reset the rate limit data
    this.ratelimit.remaining = this.ratelimit.total;
    this.ratelimit.queue.length = 0;
    if (this.ratelimit.timer) {
      clearTimeout(this.ratelimit.timer);
      this.ratelimit.timer = null;
    }
  }

  _cleanupConnection() {
    this.connection!.onopen = this.connection!.onclose = this.connection!.onmessage = null;
    this.connection!.onerror = () => null;
  }

  _emitDestroyed() {
    this.emit(ShardEvents.DESTROYED);
  }
}

export default WebSocketShard;
export { WebSocketShard };
