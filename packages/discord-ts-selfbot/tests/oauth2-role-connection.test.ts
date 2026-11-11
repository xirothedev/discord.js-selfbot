import { afterAll, beforeAll, expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client, OAuth2RoleConnection } from '../src/index';

const API = '/v9';
const PATH = `${API}/users/@me/applications/123/role-connection`;

let fake: ReturnType<typeof startFakeDiscord>;
let client: Client;
let oauth: OAuth2RoleConnection;

beforeAll(async () => {
  fake = startFakeDiscord({
    routes: {
      [`GET ${PATH}`]: {
        body: {
          metadata: { level: '10' },
          platform_name: 'Steam',
          platform_username: 'octocat',
        },
      },
      [`PUT ${PATH}`]: {
        body: {
          metadata: { level: '11' },
          platform_name: 'Steam',
          platform_username: 'octocat',
        },
      },
      [`DELETE ${PATH}`]: { body: null, status: 200 },
    },
  });
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login('fake-token');
  oauth = new OAuth2RoleConnection(client, 'oauth-token');
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

test('OAuth2RoleConnection#fetch uses a Bearer token and maps the response', async () => {
  const data = await oauth.fetch('123');
  const request = fake.getLastRequest();

  expect(request).toMatchObject({ method: 'GET', path: PATH });
  expect(request.headers.authorization).toBe('Bearer oauth-token');
  expect(data).toEqual({
    metadata: { level: '10' },
    platformName: 'Steam',
    platformUsername: 'octocat',
  });
});

test('OAuth2RoleConnection#update sends snake_case fields', async () => {
  await oauth.update('123', {
    metadata: { level: '11' },
    platformName: 'Steam',
    platformUsername: 'octocat',
  });

  expect(fake.getLastRequest()).toMatchObject({
    body: {
      metadata: { level: '11' },
      platform_name: 'Steam',
      platform_username: 'octocat',
    },
    method: 'PUT',
    path: PATH,
  });
});

test('OAuth2RoleConnection#delete sends DELETE', async () => {
  await oauth.delete('123');

  expect(fake.getLastRequest()).toMatchObject({
    method: 'DELETE',
    path: PATH,
  });
});
