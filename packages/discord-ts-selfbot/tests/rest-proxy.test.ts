import { once } from 'node:events';
import { createConnection, createServer } from 'node:net';
import { expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client } from '../src/index';

function restClient(url: string, options: Record<string, unknown> = {}) {
  const { http, ...rest } = options as {
    http?: Record<string, unknown>;
    [key: string]: unknown;
  };
  const client = new Client({ http: { api: url, ...http }, ...rest });
  client.token = 'fake-token';
  return client;
}

function readSocksTarget(buffer: Buffer): {
  host: string;
  port: number;
  rest: Buffer;
} | null {
  const addressType = buffer.at(3);
  if (addressType === 1) {
    if (buffer.length < 10) {
      return null;
    }
    const octets = [...buffer.subarray(4, 8)];
    return {
      host: octets.join('.'),
      port: buffer.readUInt16BE(8),
      rest: buffer.subarray(10),
    };
  }
  if (addressType === 3) {
    const length = buffer[4] ?? 0;
    if (buffer.length < 5 + length + 2) {
      return null;
    }
    return {
      host: buffer.subarray(5, 5 + length).toString('utf-8'),
      port: buffer.readUInt16BE(5 + length),
      rest: buffer.subarray(5 + length + 2),
    };
  }
  return null;
}

async function startSocksRelay(): Promise<{
  port: number;
  getConnections: () => number;
  stop: () => void;
}> {
  const state = { connections: 0 };
  const server = createServer((client) => {
    state.connections += 1;
    let stage = 0;
    let buffer = Buffer.alloc(0);
    client.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (stage === 0 && buffer.length >= 2) {
        const count = buffer[1] ?? 0;
        if (buffer.length < 2 + count) {
          return;
        }
        buffer = buffer.subarray(2 + count);
        client.write(Buffer.from([0x05, 0x00]));
        stage = 1;
      }
      if (stage === 1 && buffer.length >= 7) {
        const relayTo = readSocksTarget(buffer);
        if (!relayTo) {
          client.destroy();
          return;
        }
        buffer = relayTo.rest;
        const upstream = createConnection(
          { host: relayTo.host, port: relayTo.port },
          () => {
            client.write(
              Buffer.from([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0])
            );
            stage = 2;
            if (buffer.length) {
              upstream.write(buffer);
              buffer = Buffer.alloc(0);
            }
            client.pipe(upstream).pipe(client);
          }
        );
        upstream.on('error', () => client.destroy());
        client.on('error', () => upstream.destroy());
      } else if (stage === 2 && buffer.length) {
        buffer = Buffer.alloc(0);
      }
    });
    client.on('error', () => {});
  });
  server.listen(0);
  await once(server, 'listening');
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return {
    getConnections: () => state.connections,
    port,
    stop: () => server.close(),
  };
}

test('requests travel through an http proxy', async () => {
  const fake = startFakeDiscord();
  const proxyHits: string[] = [];
  const proxy = Bun.serve({
    async fetch(proxyRequest) {
      const target = new URL(proxyRequest.url);
      proxyHits.push(`${proxyRequest.method} ${target.pathname}`);
      const upstream = await fetch(target, {
        headers: proxyRequest.headers,
        method: proxyRequest.method,
      });
      return new Response(upstream.body, {
        headers: { 'content-type': 'application/json' },
        status: upstream.status,
      });
    },
    port: 0,
  });
  const client = restClient(fake.url, {
    http: { agent: `http://localhost:${proxy.port}` },
  });
  try {
    const me = await client.api.users('@me').get<{ id: string }>();
    expect(me.id).toBe('123');
    expect(proxyHits).toContain('GET /v9/users/@me');
    expect(client.rest.getProxyUri()).toBe(`http://localhost:${proxy.port}`);
  } finally {
    client.destroy();
    fake.stop();
    proxy.stop(true);
  }
}, 15_000);

test('requests travel through a socks5 proxy', async () => {
  const fake = startFakeDiscord();
  const relay = await startSocksRelay();
  const client = restClient(fake.url, {
    http: { agent: `socks5://localhost:${relay.port}` },
  });
  try {
    const me = await client.api.users('@me').get<{ id: string }>();
    expect(me.id).toBe('123');
    expect(relay.getConnections()).toBeGreaterThan(0);
  } finally {
    client.destroy();
    fake.stop();
    relay.stop();
  }
}, 15_000);
