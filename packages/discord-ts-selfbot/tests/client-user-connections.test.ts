import { afterAll, beforeAll, expect, test } from 'bun:test';

import {
  DEFAULT_READY,
  startFakeDiscord,
} from '@discord-ts-selfbot/test-harness';

import { Client } from '../src/index';

const API = '/v9';

let fake: ReturnType<typeof startFakeDiscord>;
let client: Client;

beforeAll(async () => {
  fake = startFakeDiscord({
    readyPayload: {
      ...DEFAULT_READY,
      user: { ...DEFAULT_READY.user, locale: 'en-US' },
    },
    routes: {
      [`GET ${API}/users/@me/connections`]: {
        body: [
          {
            access_token: 'secret',
            friend_sync: false,
            id: 'github-1',
            integrations: [],
            metadata: { followers: '10' },
            metadata_visibility: 1,
            name: 'octocat',
            revoked: false,
            show_activity: true,
            two_way_link: false,
            type: 'github',
            verified: true,
            visibility: 0,
          },
        ],
      },
    },
  });
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login('fake-token');
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

test('ClientUser#fetchConnections maps fields and drops secrets', async () => {
  const connections = await client.user.fetchConnections();

  expect(fake.getLastRequest()).toMatchObject({
    method: 'GET',
    path: `${API}/users/@me/connections`,
  });

  const connection = connections.get('github-1');
  expect(connection).toEqual({
    friendSync: false,
    id: 'github-1',
    integrations: [],
    metadataVisibility: 1,
    name: 'octocat',
    revoked: false,
    showActivity: true,
    twoWayLink: false,
    type: 'github',
    verified: true,
    visibility: 0,
  });
  expect(connection).not.toHaveProperty('access_token');
  expect(connection).not.toHaveProperty('accessToken');
  expect(connection).not.toHaveProperty('metadata');
});

test('ClientUser#locale reads the READY payload', () => {
  expect(client.user.locale).toBe('en-US');
});
