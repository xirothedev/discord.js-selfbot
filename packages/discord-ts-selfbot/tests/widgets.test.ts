import { afterAll, beforeAll, expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client } from '../src/index';

const API = '/v9';

let fake: ReturnType<typeof startFakeDiscord>;
let client: Client;

beforeAll(async () => {
  fake = startFakeDiscord({
    routes: {
      [`PUT ${API}/users/@me/widgets`]: {
        body: { widgets: [{ data: { type: 'favorite_games' }, id: 'w1' }] },
      },
      [`GET ${API}/users/@me/widgets/suggested-games`]: {
        body: {
          suggested_games: ['367827983903490050'],
          suggested_wishlist_games: [],
        },
      },
      [`GET ${API}/widget-configs/featured`]: {
        body: { applications: [], configs: {} },
      },
      [`GET ${API}/widget-configs/developer`]: {
        body: { applications: [], configs: {} },
      },
      [`GET ${API}/widget-configs/layout-definitions`]: {
        body: {
          widget_top_hero: {
            components: {},
            display_name: 'Hero',
            key: 'widget_top_hero',
            surface: 'widget_top',
          },
        },
      },
      [`GET ${API}/users/123/application-identities`]: {
        body: { identities: [] },
      },
      [`PATCH ${API}/users/@me/application-identities/app1/ext1/config`]: {
        body: null,
        status: 200,
      },
      [`GET ${API}/users/123/profile`]: {
        body: { user: { id: '123', username: 'test' } },
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

test('WidgetManager#setProfileWidgets sends the full replacement', async () => {
  const data = await client.widgets.setProfileWidgets([
    { data: { type: 'favorite_games' }, id: 'w1', updated_at: 'ignored' },
  ]);

  expect(fake.getLastRequest()).toMatchObject({
    body: { widgets: [{ data: { type: 'favorite_games' }, id: 'w1' }] },
    method: 'PUT',
    path: `${API}/users/@me/widgets`,
  });
  expect(data).toEqual({
    widgets: [{ data: { type: 'favorite_games' }, id: 'w1' }],
  });
});

test('WidgetManager#setProfileWidgets rejects duplicate widget types', async () => {
  const count = fake.getRequests().length;

  await expect(
    client.widgets.setProfileWidgets([
      { data: { type: 'favorite_games' } },
      { data: { type: 'favorite_games' } },
    ])
  ).rejects.toThrow('Duplicate profile widget type');

  expect(fake.getRequests().length).toBe(count);
});

test('WidgetManager#setProfileWidgets rejects a missing array', async () => {
  await expect(
    client.widgets.setProfileWidgets(null as never)
  ).rejects.toThrow();
});

test('WidgetManager reads the suggestion and config routes', async () => {
  await expect(client.widgets.fetchSuggestedGames()).resolves.toEqual({
    suggested_games: ['367827983903490050'],
    suggested_wishlist_games: [],
  });
  await expect(client.widgets.fetchFeaturedConfigs()).resolves.toEqual({
    applications: [],
    configs: {},
  });
  await expect(client.widgets.fetchDeveloperConfigs()).resolves.toEqual({
    applications: [],
    configs: {},
  });
  await expect(client.widgets.fetchLayoutDefinitions()).resolves.toMatchObject({
    widget_top_hero: { key: 'widget_top_hero' },
  });
});

test('User#fetchApplicationIdentities passes with_profiles', async () => {
  const identities = await client.user.fetchApplicationIdentities({
    withProfiles: true,
  });

  expect(identities).toEqual([]);
  expect(fake.getLastRequest()).toMatchObject({
    method: 'GET',
    path: `${API}/users/123/application-identities`,
  });
  expect(fake.getLastRequest().query).toContain('with_profiles=true');
});

test('ClientUser#setApplicationIdentityConfig patches the config route', async () => {
  await client.user.setApplicationIdentityConfig('app1', 'ext1', {
    connectionVisible: '1',
  });

  expect(fake.getLastRequest()).toMatchObject({
    body: { connection_visible: '1' },
    method: 'PATCH',
    path: `${API}/users/@me/application-identities/app1/ext1/config`,
  });
});

test('User#getProfile accepts a guild id and explicit mutual flags', async () => {
  const profile = await client.user.getProfile({
    guildId: 'g1',
    withMutualFriends: false,
  });

  expect(profile).toEqual({ user: { id: '123', username: 'test' } });
  expect(fake.getLastRequest().query).toContain('guild_id=g1');
  expect(fake.getLastRequest().query).toContain('with_mutual_friends=false');
  expect(fake.getLastRequest().query).toContain(
    'with_mutual_friends_count=false'
  );
});

test('UserManager#fetch rejects an unresolvable user', async () => {
  await expect(client.users.fetch({} as never)).rejects.toThrow(
    "Couldn't resolve the user id."
  );
});
