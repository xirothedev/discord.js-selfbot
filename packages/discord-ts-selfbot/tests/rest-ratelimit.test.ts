import { expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client, RateLimitError } from '../src/index';

function restClient(url: string, options: Record<string, unknown> = {}) {
  const { http, ...rest } = options as {
    http?: Record<string, unknown>;
    [key: string]: unknown;
  };
  const client = new Client({ http: { api: url, ...http }, ...rest });
  client.token = 'fake-token';
  return client;
}

function rateLimited(status: number, retryAfter?: string) {
  return Response.json(
    { message: 'slow down' },
    {
      headers: retryAfter ? { 'retry-after': retryAfter } : {},
      status,
    }
  );
}

test('429 retries are bounded and expose the exact delay', async () => {
  const fake = startFakeDiscord({
    respond: () => rateLimited(429, '1'),
  });
  const client = restClient(fake.url);
  try {
    const failure = await client.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(RateLimitError);
    const limited = failure as RateLimitError;
    expect(limited.retryAfter).toBe(1000);
    expect(limited.scope).toBe('sublimit');
    expect(limited.timeout).toBeGreaterThanOrEqual(0);
    expect(fake.getRequests()).toHaveLength(3);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('429 without headers uses the route scope', async () => {
  const fake = startFakeDiscord({
    respond: () => rateLimited(429),
  });
  const client = restClient(fake.url, { restTimeOffset: 0 });
  try {
    const failure = await client.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(RateLimitError);
    expect((failure as RateLimitError).scope).toBe('route');
    expect(typeof (failure as RateLimitError).retryAfter).toBe('number');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('rejectOnRateLimit throws before waiting', async () => {
  const fake = startFakeDiscord({
    respond: () => rateLimited(429, '1'),
  });
  const client = restClient(fake.url, { rejectOnRateLimit: ['/users'] });
  try {
    const failure = await client.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(RateLimitError);
    expect(fake.getRequests()).toHaveLength(1);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('redirects are followed', async () => {
  const fake = startFakeDiscord({
    respond: (request) =>
      request.path === '/v9/redirect-me'
        ? Response.redirect(`http://localhost:${request.url.port}/v9/users/@me`)
        : Response.json({ id: '123' }),
  });
  const client = restClient(fake.url);
  try {
    const me = await client.rest.request<{ id: string }>('get', '/redirect-me');
    expect(me.id).toBe('123');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('cookie jar keeps the session cookie', async () => {
  const fake = startFakeDiscord({
    respond: (request) =>
      request.headers.cookie
        ? Response.json({ id: '123' })
        : Response.json(
            { id: '123' },
            { headers: { 'set-cookie': 'session=abc; Path=/' } }
          ),
  });
  const client = restClient(fake.url);
  try {
    await client.api.users('@me').get();
    await client.api.users('@me').get();
    const requests = fake.getRequests();
    expect(requests).toHaveLength(2);
    expect(requests[1]?.headers.cookie ?? '').toContain('session=abc');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('custom http.fetch sees the request and the rate-limit headers', async () => {
  const fake = startFakeDiscord({
    respond: () =>
      Response.json(
        { id: '123' },
        { headers: { 'x-ratelimit-remaining': '49' } }
      ),
  });
  const seen: string[] = [];
  const client = new Client({
    http: {
      api: fake.url,
      fetch: (async (url, init) => {
        seen.push(`${init?.method ?? 'GET'} ${url}`);
        const res = await globalThis.fetch(url, init);
        seen.push(
          `remaining=${res.headers.get('x-ratelimit-remaining') ?? 'none'}`
        );
        return res;
      }) as typeof fetch,
    },
  });
  client.token = 'fake-token';
  try {
    await client.api.users('@me').get();
    expect(seen[0]).toContain('/v9/users/@me');
    expect(seen[1]).toBe('remaining=49');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);
