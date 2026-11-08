import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';
import { afterAll, beforeAll, expect, test } from 'bun:test';
import { DM_CHANNEL_ID, dispatchMessage, readyPayloadWithDM, waitForEvent } from './helpers.mjs';
import { Client } from '../src/index.js';

let fake;
let client;

beforeAll(async () => {
  fake = startFakeDiscord({ readyPayload: readyPayloadWithDM() });
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login('fake-token');
  await fake.waitForShard();
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

async function createMessage(overrides) {
  const messagePromise = waitForEvent(client, 'messageCreate');
  dispatchMessage(fake, overrides);
  return messagePromise;
}

test('Message#markUnread POSTs to the message ack route', async () => {
  const message = await createMessage({ id: '910000000000000010' });

  await message.markUnread();

  const req = fake.getLastRequest();
  expect(req.method).toBe('POST');
  expect(req.path).toBe(`/v9/channels/${DM_CHANNEL_ID}/messages/${message.id}/ack`);
  expect(req.body).toEqual({ manual: true, mention_count: 1 });
});

test('Message#markRead POSTs to the message ack route', async () => {
  const message = await createMessage({ id: '910000000000000020' });

  await message.markRead();

  const req = fake.getLastRequest();
  expect(req.method).toBe('POST');
  expect(req.path).toBe(`/v9/channels/${DM_CHANNEL_ID}/messages/${message.id}/ack`);
  expect(req.body).toEqual({ token: null });
});

test('Message#report POSTs to the reporting route with the default elements', async () => {
  const message = await createMessage({ id: '910000000000000030' });

  await message.report([3, 28, 72]);

  const req = fake.getLastRequest();
  expect(req.method).toBe('POST');
  expect(req.path).toBe('/v9/reporting/message');
  expect(req.body).toEqual({
    version: '1.0',
    variant: '4',
    language: 'en',
    breadcrumbs: [3, 28, 72],
    elements: {},
    channel_id: DM_CHANNEL_ID,
    message_id: message.id,
    name: 'message',
  });
});

test('Message#suppressEmbeds PATCHes the SUPPRESS_EMBEDS flag on', async () => {
  const message = await createMessage({ id: '910000000000000040', flags: 0 });

  await message.suppressEmbeds();

  const req = fake.getLastRequest();
  expect(req.method).toBe('PATCH');
  expect(req.path).toBe(`/v9/channels/${DM_CHANNEL_ID}/messages/${message.id}`);
  expect(req.body.flags).toBe(4);
});

test('Message#suppressEmbeds PATCHes the SUPPRESS_EMBEDS flag off', async () => {
  const message = await createMessage({ id: '910000000000000050', flags: 4 });

  await message.suppressEmbeds(false);

  const req = fake.getLastRequest();
  expect(req.method).toBe('PATCH');
  expect(req.path).toBe(`/v9/channels/${DM_CHANNEL_ID}/messages/${message.id}`);
  expect(req.body.flags).toBe(0);
});

test('Message#removeAttachments PATCHes an empty attachments array', async () => {
  const message = await createMessage({
    id: '910000000000000060',
    attachments: [
      {
        id: '910000000000000061',
        filename: 'attachment.txt',
        size: 12,
        url: 'https://cdn.discordapp.com/attachments/1/2/attachment.txt',
      },
    ],
  });

  await message.removeAttachments();

  const req = fake.getLastRequest();
  expect(req.method).toBe('PATCH');
  expect(req.path).toBe(`/v9/channels/${DM_CHANNEL_ID}/messages/${message.id}`);
  expect(req.body.attachments).toEqual([]);
});
