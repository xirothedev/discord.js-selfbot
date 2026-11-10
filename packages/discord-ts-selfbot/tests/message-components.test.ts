import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';
import { afterAll, beforeAll, expect, test } from 'bun:test';
import {
  TEST_USER_ID,
  actionRowWithButton,
  dispatchButtonInteraction,
  dispatchMessage,
  readyPayloadWithDM,
  waitForEvent,
} from './helpers';
import { ButtonInteraction, Client } from '../src/index';

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

test('INTERACTION_CREATE gateway packets emit a button interaction', async () => {
  const interactionPromise = waitForEvent(client, 'interactionCreate');
  dispatchButtonInteraction(fake, { id: '900000000000000071' });
  const interaction = await interactionPromise;

  expect(interaction).toBeInstanceOf(ButtonInteraction);
  expect(interaction.customId).toBe('test-button');
  expect(interaction.componentType).toBe('BUTTON');
});

test('Message#awaitMessageComponent resolves with a button interaction', async () => {
  const messagePromise = waitForEvent(client, 'messageCreate');
  dispatchMessage(fake, { components: actionRowWithButton() });
  const message = await messagePromise;

  expect(message.components).toHaveLength(1);
  expect(message.components[0].components[0].customId).toBe('test-button');

  const interactionPromise = message.awaitMessageComponent({
    filter: interaction => interaction.customId === 'test-button',
    time: 5_000,
  });

  dispatchButtonInteraction(fake);
  const interaction = await interactionPromise;

  expect(interaction).toBeInstanceOf(ButtonInteraction);
  expect(interaction.customId).toBe('test-button');
  expect(interaction.componentType).toBe('BUTTON');
  expect(interaction.user.id).toBe(TEST_USER_ID);
  expect(interaction.message.id).toBe(message.id);
  expect(interaction.channelId).toBe(message.channelId);
});

test('Message#createMessageComponentCollector collects button interactions for the message', async () => {
  const messagePromise = waitForEvent(client, 'messageCreate');
  dispatchMessage(fake, { id: '900000000000000011' });
  const message = await messagePromise;

  const collector = message.createMessageComponentCollector({ max: 1, time: 5_000 });
  const collectPromise = waitForEvent(collector, 'collect');
  const endPromise = waitForEvent(collector, 'end');

  // An interaction for a different message must not be collected.
  dispatchButtonInteraction(fake, { id: '900000000000000021', messageId: '900000000000000099' });
  dispatchButtonInteraction(fake, { id: '900000000000000022', messageId: message.id });

  const interaction = await collectPromise;
  expect(interaction.message.id).toBe(message.id);
  expect(interaction.customId).toBe('test-button');

  const [collected, reason] = await endPromise;
  expect(reason).toBe('limit');
  expect(collected.size).toBe(1);
  expect(collector.total).toBe(1);
  expect(collector.users.get(TEST_USER_ID)).not.toBeUndefined();
  expect(collector.ended).toBe(true);
});
