import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';
import { afterAll, beforeAll, expect, test } from 'bun:test';
import { Client, Invite } from '../src/index';

const API = '/v9';

const FRIEND_INVITES = [
  {
    code: 'friend-code-1',
    type: 2,
    max_age: 604800,
    max_uses: 1,
    uses: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    expires_at: '2026-01-08T00:00:00.000Z',
  },
  {
    code: 'friend-code-2',
    type: 2,
    max_age: 604800,
    max_uses: 1,
    uses: 1,
    created_at: '2026-01-02T00:00:00.000Z',
    expires_at: '2026-01-09T00:00:00.000Z',
  },
];

let fake;
let client;

beforeAll(async () => {
  fake = startFakeDiscord({
    responses: {
      [`POST ${API}/users/@me/invites`]: FRIEND_INVITES[0],
      [`GET ${API}/users/@me/invites`]: FRIEND_INVITES,
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

test('ClientUser#createFriendInvite POSTs /users/@me/invites with an empty body', async () => {
  const before = fake.getRequests().length;

  const invite = await client.user.createFriendInvite();

  expect(fake.getRequests()).toHaveLength(before + 1);
  expect(lastRequest()).toMatchObject({
    method: 'POST',
    path: `${API}/users/@me/invites`,
    body: {},
  });
  expect(invite).toBeInstanceOf(Invite);
  expect(invite.code).toBe('friend-code-1');
  expect(invite.type).toBe(2);
  expect(invite.maxAge).toBe(604800);
  expect(invite.maxUses).toBe(1);
});

test('ClientUser#getAllFriendInvites GETs /users/@me/invites and keys the collection by code', async () => {
  const before = fake.getRequests().length;

  const invites = await client.user.getAllFriendInvites();

  expect(fake.getRequests()).toHaveLength(before + 1);
  expect(lastRequest()).toMatchObject({
    method: 'GET',
    path: `${API}/users/@me/invites`,
    body: null,
  });
  expect(invites).toHaveLength(2);
  expect([...invites.keys()]).toEqual(['friend-code-1', 'friend-code-2']);
  for (const [code, invite] of invites) {
    expect(invite).toBeInstanceOf(Invite);
    expect(invite.code).toBe(code);
  }
});

test('ClientUser#revokeAllFriendInvites DELETEs /users/@me/invites', async () => {
  const before = fake.getRequests().length;

  await client.user.revokeAllFriendInvites();

  expect(fake.getRequests()).toHaveLength(before + 1);
  expect(lastRequest()).toMatchObject({
    method: 'DELETE',
    path: `${API}/users/@me/invites`,
    body: null,
  });
});
