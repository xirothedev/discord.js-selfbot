import { test, expect } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client } from '../src/index';

test('gateway IDENTIFY (op 2) omits intents/shard and includes capabilities/client_state', async () => {
  const fake = startFakeDiscord();
  const client = new Client({ http: { api: fake.url, version: 9 } });

  try {
    await client.login('fake-token');

    const payload = fake.getIdentifyPayload();
    expect(payload).not.toBeNull();
    expect(payload).not.toHaveProperty('intents');
    expect(payload).not.toHaveProperty('shard');
    expect(payload).toHaveProperty('capabilities');
    expect(payload).toHaveProperty('client_state');
  } finally {
    client.destroy();
    fake.stop();
  }
}, 15_000);
