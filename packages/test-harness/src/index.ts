// Fake Discord HTTP + WebSocket server for TDD seams (S1a / S1b).
// Bun-only: uses Bun.serve for the HTTP + WebSocket transport.

export interface FakeDiscordRequest {
  method: string;
  path: string;
  /** Raw query string including the leading `?`, or an empty string. */
  query: string;
  url: URL;
}

export interface FakeDiscordOptions {
  /** Custom READY payload. Defaults to a minimal user with no guilds/channels. */
  readyPayload?: Record<string, unknown>;
  /** API version segment (default 9). */
  apiVersion?: number;
  /** Called with the IDENTIFY payload (op 2) when received. */
  onIdentify?: (payload: Record<string, unknown>) => void;
  /**
   * Returns a JSON body or `Response` for an API request. Return `undefined` to use the default stub.
   * Gateway requests are never passed to this handler.
   */
  respond?: (request: FakeDiscordRequest) => unknown | Response | undefined;
}

export interface FakeDiscord {
  server: ReturnType<typeof Bun.serve>;
  url: string;
  port: number;
  getLastRequest(): {
    method: string;
    path: string;
    query: string;
    headers: Record<string, string>;
  } | null;
  getIdentifyPayload(): Record<string, unknown> | null;
  /** Sends a raw gateway packet (op 0 dispatch shape) to every connected shard. */
  sendGatewayPacket(packet: Record<string, unknown>): void;
  /** Resolves when at least one gateway shard is connected. */
  waitForShard(timeoutMs?: number): Promise<void>;
  stop(): void;
}

const DEFAULT_READY = {
  user: {
    id: '123',
    username: 'test',
    discriminator: '0',
    avatar: null,
    bot: false,
    flags: 0,
  },
  private_channels: [],
  guilds: [],
  notes: [],
  relationships: [],
  user_settings: {},
  user_guild_settings: [],
  auth_session_id_hash: 'hash',
};

export function startFakeDiscord(options: FakeDiscordOptions = {}): FakeDiscord {
  const apiVersion = options.apiVersion ?? 9;
  const readyPayload = options.readyPayload ?? DEFAULT_READY;
  const onIdentify = options.onIdentify;
  const respond = options.respond;

  let lastRequest: {
    method: string;
    path: string;
    query: string;
    headers: Record<string, string>;
  } | null = null;

  let lastIdentify: Record<string, unknown> | null = null;

  type GatewaySocket = { send(data: string): unknown };

  const sockets = new Set<GatewaySocket>();
  const shardWaiters = new Set<{
    resolve: () => void;
    timer: ReturnType<typeof setTimeout>;
  }>();

  function notifyShardConnected() {
    for (const waiter of shardWaiters) {
      clearTimeout(waiter.timer);
      waiter.resolve();
    }
    shardWaiters.clear();
  }

  const server = Bun.serve({
    port: 0,
    fetch(req, srv) {
      if (srv.upgrade(req)) return;
      const url = new URL(req.url);
      if (url.pathname === `/v${apiVersion}/gateway`) {
        return Response.json({ url: `ws://localhost:${srv.port}` });
      }
      if (url.pathname.startsWith(`/v${apiVersion}/`)) {
        lastRequest = {
          method: req.method,
          path: url.pathname,
          query: url.search,
          headers: Object.fromEntries(req.headers.entries()),
        };
        const custom = respond?.({
          method: req.method,
          path: url.pathname,
          query: url.search,
          url,
        });
        if (custom instanceof Response) return custom;
        if (custom !== undefined) return Response.json(custom);
        return Response.json({
          id: '123',
          username: 'test',
          discriminator: '0',
        });
      }
      return new Response('Not found', { status: 404 });
    },
    websocket: {
      open(ws) {
        sockets.add(ws);
        notifyShardConnected();
        ws.send(JSON.stringify({ op: 10, d: { heartbeat_interval: 45000 } }));
      },
      message(ws, msg) {
        try {
          const text = typeof msg === 'string' ? msg : new TextDecoder().decode(msg);
          const data = JSON.parse(text);
          if (data && data.op === 2) {
            lastIdentify = (data.d ?? null) as Record<string, unknown> | null;
            if (onIdentify && lastIdentify) onIdentify(lastIdentify);
            ws.send(JSON.stringify({ op: 0, t: 'READY', d: readyPayload }));
          }
        } catch {
          // ignore non-JSON frames
        }
      },
      close(ws) {
        sockets.delete(ws);
      },
    },
  });

  return {
    server,
    url: `http://localhost:${server.port}`,
    port: server.port as number,
    getLastRequest: () => lastRequest,
    getIdentifyPayload: () => lastIdentify,
    sendGatewayPacket(packet) {
      if (!sockets.size) throw new Error('No gateway shard is connected');
      const payload = JSON.stringify(packet);
      for (const socket of sockets) socket.send(payload);
    },
    waitForShard(timeoutMs = 10_000) {
      if (sockets.size) return Promise.resolve();
      return new Promise<void>((resolve, reject) => {
        const waiter = {
          resolve: () => resolve(),
          timer: setTimeout(() => {
            shardWaiters.delete(waiter);
            reject(new Error('Timed out waiting for a gateway shard connection'));
          }, timeoutMs),
        };
        shardWaiters.add(waiter);
      });
    },
    stop: () => server.stop(true),
  };
}

export { DEFAULT_READY };
