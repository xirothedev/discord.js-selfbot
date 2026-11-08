import { test, expect } from 'bun:test';
import { Client } from '../src/index.js';

function makeServer() {
  let lastRequest = null;
  const server = Bun.serve({
    port: 0,
    fetch(req, srv) {
      if (srv.upgrade(req)) return;
      const url = new URL(req.url);
      if (url.pathname === '/v9/gateway') {
        return Response.json({ url: `ws://localhost:${srv.port}` });
      }
      if (url.pathname === '/v9/users/@me') {
        lastRequest = {
          method: req.method,
          path: url.pathname,
          headers: Object.fromEntries(req.headers.entries()),
        };
        return Response.json({ id: '123', username: 'test', discriminator: '0' });
      }
      return new Response('Not found', { status: 404 });
    },
    websocket: {
      open(ws) {
        ws.send(JSON.stringify({ op: 10, d: { heartbeat_interval: 45000 } }));
      },
      message(ws, msg) {
        try {
          const data = JSON.parse(typeof msg === 'string' ? msg : new TextDecoder().decode(msg));
          if (data && data.op === 2) {
            ws.send(
              JSON.stringify({
                op: 0,
                t: 'READY',
                d: {
                  user: { id: '123', username: 'test', discriminator: '0', avatar: null, bot: false, flags: 0 },
                  private_channels: [],
                  guilds: [],
                  notes: [],
                  relationships: [],
                  user_settings: {},
                  user_guild_settings: [],
                  auth_session_id_hash: 'hash',
                },
              }),
            );
          }
        } catch {
          // Ignore
        }
      },
      close() {},
    },
  });
  return { server, getLastRequest: () => lastRequest };
}

test('REST request builds correct URL and headers', async () => {
  const { server, getLastRequest } = makeServer();
  const port = server.port;
  const client = new Client({ http: { api: `http://localhost:${port}`, version: 9 } });

  try {
    await client.login('fake-token');

    const result = await client.api.users('@me').get();
    expect(result.id).toBe('123');
    expect(result.username).toBe('test');

    const req = getLastRequest();
    expect(req.method).toBe('GET');
    expect(req.path).toBe('/v9/users/@me');
    expect(req.headers['x-super-properties']).toBeTruthy();
    expect(req.headers['user-agent']).toBeTruthy();
    expect(req.headers['x-discord-locale']).toBe('en-US');
  } finally {
    client.destroy();
    server.stop(true);
  }
}, 15000);
