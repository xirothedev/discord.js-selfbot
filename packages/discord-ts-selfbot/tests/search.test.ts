import { afterAll, beforeAll, expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client } from '../src/index';
import {
  DM_CHANNEL_ID,
  FRIEND_USER_ID,
  TEST_USER,
  TEST_USER_ID,
  rawMessage,
  readyPayloadWithDM,
} from './helpers';

const GUILD_ID = '900000000000000100';
const GUILD_CHANNEL_ID = '900000000000000101';
const DM_SEARCH_PATH = `/v9/channels/${DM_CHANNEL_ID}/messages/search`;
const GUILD_SEARCH_PATH = `/v9/guilds/${GUILD_ID}/messages/search`;
const MEMBER_SEARCH_PATH = `/v9/guilds/${GUILD_ID}/members/search`;

let fake;
let client;
let responses = {};

beforeAll(async () => {
  fake = startFakeDiscord({
    readyPayload: readyPayloadWithDM(),
    respond: ({ path }) => responses[path],
  });
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login('fake-token');
  client.guilds._add({
    channels: [
      {
        id: GUILD_CHANNEL_ID,
        name: 'general',
        permission_overwrites: [],
        type: 0,
      },
    ],
    id: GUILD_ID,
    members: [],
    name: 'Search Guild',
    roles: [],
  });
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

function dmChannel() {
  return client.channels.cache.get(DM_CHANNEL_ID);
}

function guildChannel() {
  return client.guilds.cache.get(GUILD_ID).channels.cache.get(GUILD_CHANNEL_ID);
}

test('MessageManager#search builds the DM query string and parses the results', async () => {
  const message = rawMessage({ content: 'needle', id: '900000000000000110' });
  responses = { [DM_SEARCH_PATH]: { messages: [[message]], total_results: 1 } };

  const result = await dmChannel().messages.search({
    authors: [TEST_USER_ID],
    content: 'hello world',
    has: ['link', 'reaction', 'sticker'],
    limit: 10,
    maxId: '900000000000000120',
    mentions: [FRIEND_USER_ID],
    minId: '900000000000000100',
    nsfw: true,
    offset: 25,
    pinned: true,
    sortBy: 'relevance',
    sortOrder: 'asc',
  });

  const request = fake.getLastRequest();
  expect(request.method).toBe('GET');
  expect(request.path).toBe(DM_SEARCH_PATH);
  expect(request.query).toBe(
    `?author_id=${TEST_USER_ID}` +
      '&content=hello%20world' +
      `&mentions=${FRIEND_USER_ID}` +
      '&has=link&has=sticker' +
      '&max_id=900000000000000120' +
      '&min_id=900000000000000100' +
      '&offset=25' +
      '&limit=10' +
      '&sort_by=relevance' +
      '&sort_order=asc' +
      '&pinned=true'
  );

  expect(result.total).toBe(1);
  expect(result.messages.size).toBe(1);
  expect(result.messages.get('900000000000000110').content).toBe('needle');
});

test('MessageManager#search defaults to 25 results sorted by timestamp descending', async () => {
  responses = { [DM_SEARCH_PATH]: { messages: [], total_results: 0 } };

  const result = await dmChannel().messages.search({ content: 'only' });

  expect(fake.getLastRequest().query).toBe(
    '?content=only&sort_by=timestamp&sort_order=desc&pinned=false'
  );
  expect(result.messages.size).toBe(0);
  expect(result.total).toBe(0);
});

test('MessageManager#search rejects a limit above 25 before making a request', async () => {
  responses = {};
  const previous = fake.getLastRequest();

  await expect(
    dmChannel().messages.search({ content: 'too many', limit: 26 })
  ).rejects.toThrow('MESSAGE_SEARCH_LIMIT');
  expect(fake.getLastRequest()).toBe(previous);
});

test('MessageManager#search uses the guild route and keeps the NSFW filter', async () => {
  const message = rawMessage({
    channel_id: GUILD_CHANNEL_ID,
    content: 'guild needle',
    id: '900000000000000130',
  });
  responses = {
    [GUILD_SEARCH_PATH]: { messages: [[message]], total_results: 3 },
  };

  const result = await guildChannel().messages.search({
    content: 'guild needle',
    nsfw: true,
  });

  const request = fake.getLastRequest();
  expect(request.path).toBe(GUILD_SEARCH_PATH);
  expect(request.query).toBe(
    '?content=guild%20needle&include_nsfw=true&sort_by=timestamp&sort_order=desc&pinned=false'
  );
  expect(result.total).toBe(3);
  expect(result.messages.get('900000000000000130').channelId).toBe(
    GUILD_CHANNEL_ID
  );
});

test('GuildMemberManager#search queries the member route and parses members', async () => {
  responses = {
    [MEMBER_SEARCH_PATH]: [
      {
        deaf: false,
        flags: 0,
        joined_at: '2024-01-01T00:00:00.000Z',
        mute: false,
        nick: 'buddy',
        roles: [],
        user: { ...TEST_USER, id: FRIEND_USER_ID, username: 'friend' },
      },
    ],
  };

  const guild = client.guilds.cache.get(GUILD_ID);
  const result = await guild.members.search({
    cache: false,
    limit: 5,
    query: 'fri',
  });

  const request = fake.getLastRequest();
  expect(request.method).toBe('GET');
  expect(request.path).toBe(MEMBER_SEARCH_PATH);
  const query = new URLSearchParams(request.query?.slice(1));
  expect(query.get('query')).toBe('fri');
  expect(query.get('limit')).toBe('5');
  expect(result.size).toBe(1);

  const member = result.get(FRIEND_USER_ID);
  expect(member.nickname).toBe('buddy');
  expect(member.guild.id).toBe(GUILD_ID);
  expect(guild.members.cache.has(FRIEND_USER_ID)).toBe(false);
});

test('GuildMemberManager#search caches members by default', async () => {
  responses = {
    [MEMBER_SEARCH_PATH]: [
      {
        deaf: false,
        flags: 0,
        joined_at: '2024-01-01T00:00:00.000Z',
        mute: false,
        roles: [],
        user: { ...TEST_USER, id: FRIEND_USER_ID, username: 'friend' },
      },
    ],
  };

  const guild = client.guilds.cache.get(GUILD_ID);
  const result = await guild.members.search({ query: 'friend' });

  const query = new URLSearchParams(fake.getLastRequest().query?.slice(1));
  expect(query.get('query')).toBe('friend');
  expect(query.get('limit')).toBe('1');
  expect(result.size).toBe(1);
  expect(guild.members.cache.get(FRIEND_USER_ID)).toBe(
    result.get(FRIEND_USER_ID)
  );
});
