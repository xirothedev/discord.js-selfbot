import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';
import { test, expect } from 'bun:test';
import { Client } from '../src/index.js';

test('REST request builds correct URL and headers', async () => {
  const fake = startFakeDiscord();
  const client = new Client({ http: { api: fake.url, version: 9 } });

  try {
    await client.login('fake-token');

    const result = await client.api.users('@me').get();
    expect(result.id).toBe('123');
    expect(result.username).toBe('test');

    const req = fake.getLastRequest();
    expect(req.method).toBe('GET');
    expect(req.path).toBe('/v9/users/@me');
    expect(req.headers['x-super-properties']).toBeTruthy();
    expect(req.headers['user-agent']).toBeTruthy();
    expect(req.headers['x-discord-locale']).toBe('en-US');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15000);
