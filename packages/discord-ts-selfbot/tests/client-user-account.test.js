import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';
import { afterAll, beforeAll, expect, test } from 'bun:test';
import { Client } from '../src/index.js';

const API = '/v9';

let fake;
let client;

beforeAll(async () => {
  fake = startFakeDiscord({
    responses: {
      [`${API}/users/@me/burst-credits`]: { amount: 42 },
    },
  });
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login('fake-token');
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

function lastRequest() {
  const request = fake.getLastRequest();
  expect(request).not.toBeNull();
  return request;
}

test('ClientUser#setBanner PATCHes /users/@me with the resolved banner', async () => {
  const banner = 'data:image/png;base64,aGVsbG8=';

  await client.user.setBanner(banner);

  expect(lastRequest()).toMatchObject({
    method: 'PATCH',
    path: `${API}/users/@me`,
    body: { banner },
  });
});

test('ClientUser#setBanner clears the banner with null', async () => {
  await client.user.setBanner(null);

  expect(lastRequest()).toMatchObject({
    method: 'PATCH',
    path: `${API}/users/@me`,
    body: { banner: null },
  });
});

test('ClientUser#setHypeSquad POSTs the house id for a named house', async () => {
  await client.user.setHypeSquad('HOUSE_BRAVERY');

  expect(lastRequest()).toMatchObject({
    method: 'POST',
    path: `${API}/hypesquad/online`,
    body: { house_id: 1 },
  });
});

test('ClientUser#setHypeSquad leaves the house with DELETE on LEAVE', async () => {
  await client.user.setHypeSquad('LEAVE');

  expect(lastRequest()).toMatchObject({
    method: 'DELETE',
    path: `${API}/hypesquad/online`,
    body: null,
  });
});

test('ClientUser#setAccentColor PATCHes /users/@me with a resolved color', async () => {
  await client.user.setAccentColor('#ff0000');

  expect(lastRequest()).toMatchObject({
    method: 'PATCH',
    path: `${API}/users/@me`,
    body: { accent_color: 0xff0000 },
  });
});

test('ClientUser#setAccentColor clears the color with null', async () => {
  await client.user.setAccentColor(null);

  expect(lastRequest()).toMatchObject({
    method: 'PATCH',
    path: `${API}/users/@me`,
    body: { accent_color: null },
  });
});

test('ClientUser#setAboutMe PATCHes /users/@me with the bio', async () => {
  await client.user.setAboutMe('Hello, world!');

  expect(lastRequest()).toMatchObject({
    method: 'PATCH',
    path: `${API}/users/@me`,
    body: { bio: 'Hello, world!' },
  });
});

test('ClientUser#setAboutMe clears the bio by default', async () => {
  await client.user.setAboutMe();

  expect(lastRequest()).toMatchObject({
    method: 'PATCH',
    path: `${API}/users/@me`,
    body: { bio: null },
  });
});

test('ClientUser#setPronouns PATCHes /users/@me with the pronouns', async () => {
  await client.user.setPronouns('they/them');

  expect(lastRequest()).toMatchObject({
    method: 'PATCH',
    path: `${API}/users/@me`,
    body: { pronouns: 'they/them' },
  });
});

test('ClientUser#setGlobalName PATCHes /users/@me with the global name', async () => {
  await client.user.setGlobalName('New Name');

  expect(lastRequest()).toMatchObject({
    method: 'PATCH',
    path: `${API}/users/@me`,
    body: { global_name: 'New Name' },
  });
});

test('ClientUser#setSamsungActivity POSTs the package name and uppercased update type', async () => {
  await client.user.setSamsungActivity('com.YostarJP.BlueArchive', 'start');

  expect(lastRequest()).toMatchObject({
    method: 'POST',
    path: `${API}/presences`,
    body: { package_name: 'com.YostarJP.BlueArchive', update: 'START' },
  });
});

test('ClientUser#setSamsungActivity defaults to START and rejects invalid input', async () => {
  await client.user.setSamsungActivity('com.miHoYo.GenshinImpact');

  expect(lastRequest()).toMatchObject({
    method: 'POST',
    path: `${API}/presences`,
    body: { package_name: 'com.miHoYo.GenshinImpact', update: 'START' },
  });

  await expect(client.user.setSamsungActivity('com.miHoYo.GenshinImpact', 'PAUSE')).rejects.toThrow(
    'Invalid type (Must be START, UPDATE, or STOP)',
  );
  await expect(client.user.setSamsungActivity('', 'START')).rejects.toThrow('Package name is required.');
});

test('ClientUser#fetchBurstCredit GETs /users/@me/burst-credits and returns the amount', async () => {
  const amount = await client.user.fetchBurstCredit();

  expect(amount).toBe(42);
  expect(lastRequest()).toMatchObject({
    method: 'GET',
    path: `${API}/users/@me/burst-credits`,
    body: null,
  });
});
