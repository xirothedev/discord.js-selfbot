// Fake Discord HTTP + WebSocket server for TDD seams (S1a / S1b).
// Bun-only: uses Bun.serve for the HTTP + WebSocket transport.

export interface FakeDiscordOptions {
  /** Custom READY payload. Defaults to a minimal user with no guilds/channels. */
  readyPayload?: Record<string, unknown>;
  /** API version segment (default 9). */
  apiVersion?: number;
}

export interface FakeDiscord {
  server: ReturnType<typeof Bun.serve>;
  url: string;
  port: number;
  getLastRequest(): {
    method: string;
    path: string;
    headers: Record<string, string>;
  } | null;
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

  let lastRequest: {
    method: string;
    path: string;
    headers: Record<string, string>;
  } | null = null;

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
          headers: Object.fromEntries(req.headers.entries()),
        };
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
        ws.send(JSON.stringify({ op: 10, d: { heartbeat_interval: 45000 } }));
      },
      message(ws, msg) {
        try {
          const text = typeof msg === 'string' ? msg : new TextDecoder().decode(msg);
          const data = JSON.parse(text);
          if (data && data.op === 2) {
            ws.send(JSON.stringify({ op: 0, t: 'READY', d: readyPayload }));
          }
        } catch {
          // ignore non-JSON frames
        }
      },
      close() {},
    },
  });

  return {
    server,
    url: `http://localhost:${server.port}`,
    port: server.port as number,
    getLastRequest: () => lastRequest,
    stop: () => server.stop(true),
  };
}

export { DEFAULT_READY };
