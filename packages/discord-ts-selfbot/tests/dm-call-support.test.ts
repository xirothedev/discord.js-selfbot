import { DEFAULT_READY, startFakeDiscord } from '@discord-ts-selfbot/test-harness';
import { afterAll, beforeAll, expect, test } from 'bun:test';
import { waitForEvent } from './helpers';
import { DMChannel, GroupDMChannel, Client } from '../src/index';

const TEST_USER_ID = '900000000000000101';
const FRIEND_USER_ID = '900000000000000102';
const OTHER_FRIEND_USER_ID = '900000000000000103';

const DM_CHANNEL_ID = '900000000000000201';
const MESSAGE_REQUEST_ID = '900000000000000202';
const CANCELLED_MESSAGE_REQUEST_ID = '900000000000000203';
const GROUP_DM_CHANNEL_ID = '900000000000000204';

const TEST_USER = {
  id: TEST_USER_ID,
  username: 'test',
  discriminator: '0',
  global_name: null,
  avatar: null,
  bot: false,
  flags: 0,
};

const FRIEND = {
  id: FRIEND_USER_ID,
  username: 'friend',
  discriminator: '0',
  global_name: null,
  avatar: null,
};

const OTHER_FRIEND = {
  id: OTHER_FRIEND_USER_ID,
  username: 'other-friend',
  discriminator: '0',
  global_name: null,
  avatar: null,
};

function readyPayloadWithCallChannels() {
  return {
    ...DEFAULT_READY,
    user: TEST_USER,
    private_channels: [
      {
        id: DM_CHANNEL_ID,
        type: 1,
        recipients: [FRIEND],
        last_message_id: null,
      },
      {
        id: MESSAGE_REQUEST_ID,
        type: 1,
        recipients: [FRIEND],
        is_message_request: true,
        is_message_request_timestamp: '2024-01-01T00:00:00.000Z',
      },
      {
        id: CANCELLED_MESSAGE_REQUEST_ID,
        type: 1,
        recipients: [FRIEND],
        is_message_request: true,
        is_message_request_timestamp: '2024-01-01T00:00:00.000Z',
      },
      {
        id: GROUP_DM_CHANNEL_ID,
        type: 3,
        name: 'Test group call',
        owner_id: TEST_USER_ID,
        recipients: [FRIEND, OTHER_FRIEND],
      },
    ],
  };
}

let fake;
let client;

beforeAll(async () => {
  fake = startFakeDiscord({ readyPayload: readyPayloadWithCallChannels() });
  client = new Client({ http: { api: fake.url, version: 9 } });

  const ready = waitForEvent(client, 'ready');
  await client.login('fake-token');
  await ready;
  await fake.waitForShard();
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

function channel(id) {
  return client.channels.cache.get(id);
}

test('DMChannel#ring posts a call ring request with null recipients', async () => {
  const dmChannel = channel(DM_CHANNEL_ID);
  expect(dmChannel).toBeInstanceOf(DMChannel);

  await dmChannel.ring();

  const request = fake.getLastRequest();
  expect(request.method).toBe('POST');
  expect(request.path).toBe(`/v9/channels/${DM_CHANNEL_ID}/call/ring`);
  expect(request.body).toEqual({ recipients: null });
});

test('GroupDMChannel#ring posts the resolved recipient list, or null when empty', async () => {
  const groupChannel = channel(GROUP_DM_CHANNEL_ID);
  expect(groupChannel).toBeInstanceOf(GroupDMChannel);

  await groupChannel.ring([FRIEND_USER_ID, OTHER_FRIEND_USER_ID]);

  let request = fake.getLastRequest();
  expect(request.method).toBe('POST');
  expect(request.path).toBe(`/v9/channels/${GROUP_DM_CHANNEL_ID}/call/ring`);
  expect(request.body).toEqual({ recipients: [FRIEND_USER_ID, OTHER_FRIEND_USER_ID] });

  await groupChannel.ring([]);

  request = fake.getLastRequest();
  expect(request.method).toBe('POST');
  expect(request.path).toBe(`/v9/channels/${GROUP_DM_CHANNEL_ID}/call/ring`);
  expect(request.body).toEqual({ recipients: null });
});

test('DMChannel#acceptMessageRequest consents through the recipients route', async () => {
  const requestChannel = channel(MESSAGE_REQUEST_ID);
  expect(requestChannel.messageRequest).toBe(true);

  await requestChannel.acceptMessageRequest();

  const request = fake.getLastRequest();
  expect(request.method).toBe('PUT');
  expect(request.path).toBe(`/v9/channels/${MESSAGE_REQUEST_ID}/recipients/@me`);
  expect(request.body).toEqual({ consent_status: 2 });
  expect(requestChannel.messageRequest).toBe(false);
});

test('DMChannel#cancelMessageRequest deletes through the recipients route', async () => {
  const requestChannel = channel(CANCELLED_MESSAGE_REQUEST_ID);
  expect(requestChannel.messageRequest).toBe(true);

  const returned = await requestChannel.cancelMessageRequest();

  const request = fake.getLastRequest();
  expect(request.method).toBe('DELETE');
  expect(request.path).toBe(`/v9/channels/${CANCELLED_MESSAGE_REQUEST_ID}/recipients/@me`);
  expect(returned).toBe(requestChannel);
});

test('CALL_CREATE emits callCreate with a CallState for the DM channel', async () => {
  const callPromise = waitForEvent(client, 'callCreate');

  fake.sendGatewayPacket({
    op: 0,
    t: 'CALL_CREATE',
    s: 201,
    d: {
      channel_id: DM_CHANNEL_ID,
      region: 'us-west',
      ringing: [],
      voice_states: [],
    },
  });

  const call = await callPromise;
  expect(call.channelId).toBe(DM_CHANNEL_ID);
  expect(call.region).toBe('us-west');
  expect(call.ringing.size).toBe(0);
  expect(call.channel).toBe(channel(DM_CHANNEL_ID));
});

test('CALL_UPDATE emits callUpdate and patches region and ringing users', async () => {
  const callPromise = waitForEvent(client, 'callUpdate');

  fake.sendGatewayPacket({
    op: 0,
    t: 'CALL_UPDATE',
    s: 202,
    d: {
      channel_id: DM_CHANNEL_ID,
      region: 'eu-central',
      ringing: [FRIEND_USER_ID],
      voice_states: [],
    },
  });

  const call = await callPromise;
  expect(call.channelId).toBe(DM_CHANNEL_ID);
  expect(call.region).toBe('eu-central');
  expect(call.ringing.size).toBe(1);
  expect(call.ringing.get(FRIEND_USER_ID).id).toBe(FRIEND_USER_ID);
});

test('CALL_DELETE emits callDelete with the group DM channel state', async () => {
  const callPromise = waitForEvent(client, 'callDelete');

  fake.sendGatewayPacket({
    op: 0,
    t: 'CALL_DELETE',
    s: 203,
    d: {
      channel_id: GROUP_DM_CHANNEL_ID,
      region: 'brazil',
      ringing: [],
      voice_states: [],
    },
  });

  const call = await callPromise;
  expect(call.channelId).toBe(GROUP_DM_CHANNEL_ID);
  expect(call.region).toBe('brazil');
  expect(call.channel).toBe(channel(GROUP_DM_CHANNEL_ID));
});

test('DMChannel#voiceAdapterCreator returns a gateway adapter and registers it by channel id', () => {
  const dmChannel = channel(DM_CHANNEL_ID);
  const methods = {
    onVoiceServerUpdate: () => {},
    onVoiceStateUpdate: () => {},
  };

  expect(typeof dmChannel.voiceAdapterCreator).toBe('function');

  const adapter = dmChannel.voiceAdapterCreator(methods);
  expect(typeof adapter.sendPayload).toBe('function');
  expect(typeof adapter.destroy).toBe('function');
  expect(client.voice.adapters.get(DM_CHANNEL_ID)).toBe(methods);

  adapter.destroy();
  expect(client.voice.adapters.has(DM_CHANNEL_ID)).toBe(false);
});

test('GroupDMChannel#voiceAdapterCreator returns a gateway adapter and unregisters it on destroy', () => {
  const groupChannel = channel(GROUP_DM_CHANNEL_ID);
  const methods = {
    onVoiceServerUpdate: () => {},
    onVoiceStateUpdate: () => {},
  };

  expect(typeof groupChannel.voiceAdapterCreator).toBe('function');

  const adapter = groupChannel.voiceAdapterCreator(methods);
  expect(typeof adapter.sendPayload).toBe('function');
  expect(typeof adapter.destroy).toBe('function');
  expect(client.voice.adapters.get(GROUP_DM_CHANNEL_ID)).toBe(methods);

  adapter.destroy();
  expect(client.voice.adapters.has(GROUP_DM_CHANNEL_ID)).toBe(false);
});
