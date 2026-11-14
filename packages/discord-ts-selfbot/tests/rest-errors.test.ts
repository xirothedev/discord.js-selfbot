import { expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client, DiscordAPIError, HTTPError } from '../src/index';

function restClient(url: string) {
  const client = new Client({ http: { api: url } });
  client.token = 'fake-token';
  return client;
}

test('JSON 401 throws DiscordAPIError with httpStatus', async () => {
  const fake = startFakeDiscord({
    routes: {
      'GET /v9/users/@me': {
        body: { code: 0, message: '401: Unauthorized' },
        status: 401,
      },
    },
  });
  const client = restClient(fake.url);
  try {
    const failure = await client.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(DiscordAPIError);
    expect((failure as DiscordAPIError).httpStatus).toBe(401);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('proxy HTML 401 keeps status 401, not 500', async () => {
  const fake = startFakeDiscord({
    respond: () =>
      new Response('<html>proxy deny</html>', {
        headers: { 'content-type': 'text/html' },
        status: 401,
      }),
  });
  const client = restClient(fake.url);
  try {
    const failure = await client.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(DiscordAPIError);
    expect((failure as DiscordAPIError).httpStatus).toBe(401);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('broken JSON 401 throws HTTPError with status and no retry', async () => {
  const fake = startFakeDiscord({
    respond: () =>
      new Response('{oops', {
        headers: { 'content-type': 'application/json' },
        status: 401,
      }),
  });
  const client = restClient(fake.url);
  try {
    const failure = await client.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(HTTPError);
    expect((failure as HTTPError).status).toBe(401);
    expect((failure as HTTPError).retryable).toBe(false);
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('network failure throws a retryable HTTPError with status 0', async () => {
  const client = restClient('http://127.0.0.1:1');
  try {
    const failure = await client.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(HTTPError);
    expect((failure as HTTPError).status).toBe(0);
    expect((failure as HTTPError).retryable).toBe(true);
  } finally {
    client.destroy();
  }
}, 15_000);

test('request timeout aborts and stays retryable', async () => {
  const stall = Bun.serve({
    async fetch() {
      await Bun.sleep(60_000);
      return new Response('late');
    },
    port: 0,
  });
  const stalled = new Client({
    http: { api: `http://localhost:${stall.port}` },
    restRequestTimeout: 100,
    retryLimit: 0,
  });
  stalled.token = 'fake-token';
  try {
    const failure = await stalled.api
      .users('@me')
      .get()
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(HTTPError);
    expect((failure as HTTPError).retryable).toBe(true);
  } finally {
    stalled.destroy();
    stall.stop(true);
  }
}, 15_000);
