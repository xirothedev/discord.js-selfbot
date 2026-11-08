// Fake Discord HTTP + WebSocket server for TDD seams (S1a / S1b).
// Bun-only: uses Bun.serve for the HTTP + WebSocket transport.

export interface FakeDiscordRequest {
  method: string;
  path: string;
  query: string;
  url: URL;
  headers: Record<string, string>;
  body: unknown;
  bodyText: string | null;
}

export interface FakeDiscordOptions {
  /** Custom READY payload. Defaults to a minimal user with no guilds/channels. */
  readyPayload?: Record<string, unknown>;
  /** API version segment (default 9). */
  apiVersion?: number;
  /** Called with the IDENTIFY payload (op 2) when received. */
  onIdentify?: (payload: Record<string, unknown>) => void;
  /** JSON response body keyed by `METHOD /v9/path` or `/v9/path`. Defaults to a stub user. */
  apiResponses?: Record<string, unknown>;
  /** Alias for apiResponses; keyed by request path. */
  responses?: Record<string, unknown>;
  /**
   * Returns a JSON body or `Response` for an API request. Return `undefined` to use the default stub.
   * Gateway requests are never passed to this handler.
   */
  respond?: (request: FakeDiscordRequest) => unknown | Response | undefined;
}

export interface FakeRequest {
  method: string;
  path: string;
  query: string;
  headers: Record<string, string>;
  /** Parsed JSON body, raw text body, or null when the request has no body. */
  body: unknown;
  bodyText: string | null;
}

export interface FakeDiscord {
  server: ReturnType<typeof Bun.serve>;
  url: string;
  port: number;
  getLastRequest(): FakeRequest | null;
  getRequests(): FakeRequest[];
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
  const apiResponses = { ...options.responses, ...options.apiResponses };
  const respond = options.respond;

  let lastRequest: FakeRequest | null = null;
  const requests: FakeRequest[] = [];

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
    fetch: async (req, srv) => {
      if (srv.upgrade(req)) return;
      const url = new URL(req.url);
      if (url.pathname === `/v${apiVersion}/gateway`) {
        return Response.json({ url: `ws://localhost:${srv.port}` });
      }
      if (url.pathname.startsWith(`/v${apiVersion}/`)) {
        const bodyText = req.method === 'GET' || req.method === 'HEAD' ? null : await req.text();
        let body: unknown = null;
        if (bodyText) {
          try {
            body = JSON.parse(bodyText);
          } catch {
            body = bodyText;
          }
        }
        const headers = Object.fromEntries(req.headers.entries());
        const request: FakeRequest = {
          method: req.method,
          path: url.pathname,
          query: url.search,
          headers,
          body,
          bodyText,
        };
        lastRequest = request;
        requests.push(request);

        const custom = respond?.({ ...request, url });
        if (custom instanceof Response) return custom;
        if (custom !== undefined) return Response.json(custom);

        const methodKey = `${req.method} ${url.pathname}`;
        if (Object.hasOwn(apiResponses, methodKey)) return Response.json(apiResponses[methodKey]);
        if (Object.hasOwn(apiResponses, url.pathname)) return Response.json(apiResponses[url.pathname]);
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
    getRequests: () => requests,
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
