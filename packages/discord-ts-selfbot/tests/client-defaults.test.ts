import { Buffer } from 'node:buffer';

import { expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client } from '../src/index';

const CAPTURED_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9267 Chrome/152.0.7977.169 Electron/44.10.0 Safari/537.36';

test('default REST and gateway versions are v9', async () => {
  const fake = startFakeDiscord();
  const client = new Client({ http: { api: fake.url } });

  try {
    await client.login('fake-token');

    expect(client.options.http.version).toBe(9);
    expect(client.options.ws.version).toBe(9);

    await client.api.users('@me').get();

    const req = fake.getLastRequest();
    if (!req) {
      throw new Error('No REST request captured');
    }
    expect(req.path).toBe('/v9/users/@me');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('v10 remains available as an explicit option', async () => {
  const fake = startFakeDiscord({ apiVersion: 10 });
  const client = new Client({ http: { api: fake.url, version: 10 } });

  try {
    await client.login('fake-token');
    await client.api.users('@me').get();

    const req = fake.getLastRequest();
    if (!req) {
      throw new Error('No REST request captured');
    }
    expect(req.path).toBe('/v10/users/@me');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);

test('existing client properties match the captured desktop client', async () => {
  const fake = startFakeDiscord();
  const client = new Client({ http: { api: fake.url } });

  try {
    await client.login('fake-token');
    await client.api.users('@me').get();

    const req = fake.getLastRequest();
    if (!req) {
      throw new Error('No REST request captured');
    }

    expect(req.headers['user-agent']).toBe(CAPTURED_USER_AGENT);
    expect(req.headers['sec-ch-ua']).toBe(
      '"Not?A_Brand";v="24", "Chromium";v="152"'
    );
    expect(req.headers.origin).toBe('https://discord.com');
    expect(req.headers['x-installation-id']).toBeUndefined();

    const raw = req.headers['x-super-properties'];
    if (!raw) {
      throw new Error('Missing x-super-properties');
    }

    const properties = JSON.parse(
      Buffer.from(raw, 'base64').toString('utf-8')
    ) as Record<string, unknown>;

    expect(properties).toMatchObject({
      browser_version: '44.10.0',
      client_build_number: 667_580,
      client_version: '1.0.9267',
      native_build_number: 97_793,
      os_sdk_version: '26200',
      os_version: '10.0.26200',
    });
    expect(properties).not.toHaveProperty('os_version_is_release');
    expect(properties).not.toHaveProperty('os_build_revision');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);
