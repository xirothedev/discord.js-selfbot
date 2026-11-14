import { expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client, MissingTokenError, createRestClient } from '../src/index';
import { deriveRoute } from '../src/rest/RequestOptions';
import { parseProxyUrl } from '../src/rest/proxyFetch';

function restClient(url: string, options: Record<string, unknown> = {}) {
  const { http, ...rest } = options as {
    http?: Record<string, unknown>;
    [key: string]: unknown;
  };
  const client = new Client({ http: { api: url, ...http }, ...rest });
  client.token = 'fake-token';
  return client;
}

test('REST-only token assignment skips the gateway', async () => {
  const fake = startFakeDiscord();
  const client = restClient(fake.url);
  try {
    expect(client.token).toBe('fake-token');
    const me = await client.api.users('@me').get<{ id: string }>();
    expect(me.id).toBe('123');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('createRestClient sets the token and strips prefixes', async () => {
  const fake = startFakeDiscord();
  const client = createRestClient({
    http: { api: fake.url },
    token: 'Bot fake-token',
  });
  try {
    expect(client.token).toBe('fake-token');
    expect(client.isReady()).toBe(false);
    const me = await client.rest.request<{ id: string }>('get', '/users/@me');
    expect(me.id).toBe('123');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('empty token throws MissingTokenError before HTTP', async () => {
  const fake = startFakeDiscord();
  const client = restClient(fake.url);
  client.token = '';
  try {
    const failure = await client.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(MissingTokenError);
    expect(fake.getRequests()).toHaveLength(0);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('missing token throws MissingTokenError without a request', async () => {
  const fake = startFakeDiscord();
  const client = restClient(fake.url);
  client.token = null;
  try {
    const failure = await client.rest
      .request('get', '/users/@me')
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(MissingTokenError);
    expect((failure as MissingTokenError).retryable).toBe(false);
    expect(fake.getRequests()).toHaveLength(0);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('per-request version overrides http.version', async () => {
  const fake = startFakeDiscord({ apiVersion: 10 });
  const client = restClient(fake.url);
  try {
    const v10 = await client.rest.request<{ id: string }>('get', '/users/@me', {
      version: 10,
    });
    expect(v10.id).toBe('123');
    const paths = fake.getRequests().map((entry) => entry.path);
    expect(paths).toEqual(['/v10/users/@me']);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('paths with snowflakes share one derived route bucket', async () => {
  const fake = startFakeDiscord();
  const client = restClient(fake.url);
  try {
    await client.rest.request('get', '/users/900000000000000001');
    await client.rest.request('get', '/users/900000000000000002');
    expect(deriveRoute('/users/900000000000000001')).toBe(
      deriveRoute('/users/900000000000000002')
    );
    expect(client.rest.handlers.size).toBe(1);
    await client.rest.request('get', '/users/900000000000000001', {
      route: 'explicit',
    });
    expect(client.rest.handlers.size).toBe(2);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('destroy closes the dispatcher and clears handlers', async () => {
  const fake = startFakeDiscord();
  const client = restClient(fake.url);
  try {
    client.rest.getDispatcher();
    await client.api.users('@me').get();
    expect(client.rest.handlers.size).toBeGreaterThan(0);
  } finally {
    client.destroy();
    fake.stop();
  }
  expect(client.rest.handlers.size).toBe(0);
  expect(client.rest.agent).toBeNull();
}, 15_000);

test('parseProxyUrl accepts http and socks strings', () => {
  expect(parseProxyUrl('http://proxy.local:8080')?.protocol).toBe('http');
  expect(parseProxyUrl('socks5://proxy.local:1080')?.protocol).toBe('socks5');
  expect(parseProxyUrl('socks5h://proxy.local:1080')?.protocol).toBe('socks5h');
  expect(parseProxyUrl('gopher://proxy.local:70')).toBe(false);
  expect(parseProxyUrl('not a url')).toBe(false);
});
