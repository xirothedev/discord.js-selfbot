import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';
import { beforeAll, afterAll, test, expect } from 'bun:test';
import { DM_CHANNEL_ID, readyPayloadWithDM } from './helpers';
import { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from '../src/index';

let fake;
let client;

beforeAll(async () => {
  fake = startFakeDiscord({
    readyPayload: readyPayloadWithDM(),
    responses: {
      [`POST /v9/channels/${DM_CHANNEL_ID}/messages`]: {
        id: '900000000000000010',
        channel_id: DM_CHANNEL_ID,
        content: 'hello',
        timestamp: new Date().toISOString(),
        edited_timestamp: null,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        pinned: false,
        type: 0,
      },
      [`GET /v9/channels/${DM_CHANNEL_ID}/messages/900000000000000010`]: {
        id: '900000000000000010',
        channel_id: DM_CHANNEL_ID,
        content: 'hello',
        timestamp: new Date().toISOString(),
        edited_timestamp: null,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        pinned: false,
        type: 0,
      },
      [`GET /v9/channels/${DM_CHANNEL_ID}/messages`]: [
        {
          id: '900000000000000010',
          channel_id: DM_CHANNEL_ID,
          content: 'hello',
          timestamp: new Date().toISOString(),
          edited_timestamp: null,
          tts: false,
          mention_everyone: false,
          mentions: [],
          mention_roles: [],
          attachments: [],
          embeds: [],
          pinned: false,
          type: 0,
        },
      ],
      [`PATCH /v9/channels/${DM_CHANNEL_ID}/messages/900000000000000010`]: {
        id: '900000000000000010',
        channel_id: DM_CHANNEL_ID,
        content: 'edited',
        timestamp: new Date().toISOString(),
        edited_timestamp: new Date().toISOString(),
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        pinned: false,
        type: 0,
      },
    },
  });
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login('fake-token');
  await fake.waitForShard();
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

test('payload-shape: plain message body', async () => {
  const ch = client.channels.cache.get(DM_CHANNEL_ID);
  const msg = await ch.send('hello');
  expect(msg.content).toBe('hello');
  const req = fake.getLastRequest();
  expect(req.method).toBe('POST');
  expect(req.path).toBe(`/v9/channels/${DM_CHANNEL_ID}/messages`);
  expect(req.body.content).toBe('hello');
});

test('payload-shape: embed + components body', async () => {
  const ch = client.channels.cache.get(DM_CHANNEL_ID);
  const embed = new EmbedBuilder().setTitle('t').setDescription('d');
  const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('b').setLabel('Click').setStyle(1));
  await ch.send({ embeds: [embed], components: [row] });
  const req = fake.getLastRequest();
  expect(req.body.embeds).toHaveLength(1);
  expect(req.body.embeds[0].title).toBe('t');
  expect(req.body.components).toHaveLength(1);
  expect(req.body.components[0].components[0].custom_id).toBe('b');
});

test('payload-shape: edit message body', async () => {
  const ch = client.channels.cache.get(DM_CHANNEL_ID);
  await ch.send('hello');
  const msg = await ch.messages.fetch('900000000000000010');
  await msg.edit('edited');
  const req = fake.getLastRequest();
  expect(req.method).toBe('PATCH');
  expect(req.body.content).toBe('edited');
});
