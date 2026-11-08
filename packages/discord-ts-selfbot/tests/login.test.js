import { test, expect } from 'bun:test';
import { Client } from '../src/index.js';

test('Client.login connects through a fake Discord server and emits ready', async () => {
  let server;
  server = Bun.serve({
    port: 0,
    fetch(req, srv) {
      if (srv.upgrade(req)) return;
      const url = new URL(req.url);
      if (url.pathname === '/v9/gateway') {
        return Response.json({ url: `ws://localhost:${srv.port}` });
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
          // Ignore non-JSON frames
        }
      },
      close() {},
    },
  });

  const port = server.port;
  const client = new Client({ http: { api: `http://localhost:${port}`, version: 9 } });

  let readyFired = false;
  client.on('ready', () => {
    readyFired = true;
  });

  try {
    const token = await client.login('fake-token');
    expect(token).toBe('fake-token');
    expect(readyFired).toBe(true);
    expect(client.user).not.toBeNull();
    expect(client.user.id).toBe('123');
    expect(client.user.username).toBe('test');
  } finally {
    client.destroy();
    server.stop(true);
  }
}, 15000);
