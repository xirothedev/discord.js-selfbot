import { afterAll, beforeAll, expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client } from '../src/index';
import { TEST_USER_ID, readyPayloadWithDM } from './helpers';

const GUILD_ID = '900000000000000100';
const RULES_CHANNEL_ID = '900000000000000101';
const UPDATES_CHANNEL_ID = '900000000000000102';
const EMOJI_ID = '900000000000000103';

const rawGuild = {
  afk_channel_id: null,
  afk_timeout: 300,
  application_id: null,
  approximate_member_count: 2,
  approximate_presence_count: 1,
  banner: null,
  channels: [
    {
      guild_id: GUILD_ID,
      id: RULES_CHANNEL_ID,
      name: 'rules',
      parent_id: null,
      permission_overwrites: [],
      position: 1,
      type: 0,
    },
    {
      guild_id: GUILD_ID,
      id: UPDATES_CHANNEL_ID,
      name: 'updates',
      parent_id: null,
      permission_overwrites: [],
      position: 2,
      type: 5,
    },
  ],
  default_message_notifications: 0,
  description: null,
  discovery_splash: null,
  emojis: [
    {
      animated: false,
      available: true,
      id: EMOJI_ID,
      managed: false,
      name: 'wave',
      require_colons: true,
      roles: [],
    },
  ],
  explicit_content_filter: 0,
  features: [],
  icon: null,
  id: GUILD_ID,
  max_members: 100,
  max_presences: null,
  max_video_channel_users: 25,
  mfa_level: 0,
  name: 'Settings Guild',
  nsfw_level: 0,
  owner_id: TEST_USER_ID,
  preferred_locale: 'en-US',
  premium_progress_bar_enabled: false,
  premium_subscription_count: 0,
  premium_tier: 0,
  public_updates_channel_id: UPDATES_CHANNEL_ID,
  roles: [
    {
      color: 0,
      hoist: false,
      id: GUILD_ID,
      managed: false,
      mentionable: false,
      name: '@everyone',
      permissions: '0',
      position: 0,
    },
  ],
  rules_channel_id: RULES_CHANNEL_ID,
  safety_alerts_channel_id: null,
  splash: null,
  stickers: [],
  system_channel_flags: 0,
  system_channel_id: null,
  vanity_url_code: 'old-code',
  verification_level: 0,
  widget_enabled: false,
};

function readyPayloadWithGuild() {
  return {
    ...readyPayloadWithDM(),
    guilds: [rawGuild],
    user_guild_settings: [
      {
        channel_overrides: [],
        flags: 0,
        guild_id: GUILD_ID,
        hide_muted_channels: false,
        message_notifications: 2,
        mobile_push: false,
        mute_scheduled_events: false,
        muted: false,
        notify_highlights: 0,
        suppress_everyone: true,
        suppress_roles: false,
        version: 3,
      },
    ],
  };
}

let fake;
let client;
let guild;

beforeAll(async () => {
  fake = startFakeDiscord({
    readyPayload: readyPayloadWithGuild(),
    routes: {
      [`GET /v9/guilds/${GUILD_ID}/top-emojis`]: {
        body: { items: [{ emoji_id: EMOJI_ID, emoji_rank: 1 }] },
      },
      [`PATCH /v9/guilds/${GUILD_ID}/vanity-url`]: {
        body: { code: 'elysia', uses: 42 },
      },
      [`PATCH /v9/users/@me/guilds/${GUILD_ID}/settings`]: {
        body: {
          guild_id: GUILD_ID,
          muted: true,
          suppress_everyone: false,
          version: 7,
        },
      },
    },
  });
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login('fake-token');
  await fake.waitForShard();
  guild = client.guilds.cache.get(GUILD_ID);
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

test('READY user_guild_settings hydrates Guild#settings', () => {
  expect(guild).toBeDefined();
  expect(guild.settings.suppressEveryone).toBe(true);
  expect(guild.settings.messageNotifications).toBe(2);
  expect(guild.settings.muted).toBe(false);
  expect(guild.settings.version).toBe(3);
});

test('Guild#markAsRead POSTs to the guild ack route', async () => {
  await guild.markAsRead();

  const req = fake.getLastRequest();
  expect(req.method).toBe('POST');
  expect(req.path).toBe(`/v9/guilds/${GUILD_ID}/ack`);
  expect(req.body).toBeNull();
});

test('Guild#setCommunity enables COMMUNITY and requires the updates and rules channels', async () => {
  await guild.setCommunity(
    true,
    UPDATES_CHANNEL_ID,
    RULES_CHANNEL_ID,
    'enable community'
  );

  const req = fake.getLastRequest();
  expect(req.method).toBe('PATCH');
  expect(req.path).toBe(`/v9/guilds/${GUILD_ID}`);
  expect(req.body).toEqual({
    default_message_notifications: 1,
    explicit_content_filter: 2,
    features: ['COMMUNITY'],
    public_updates_channel_id: UPDATES_CHANNEL_ID,
    rules_channel_id: RULES_CHANNEL_ID,
    verification_level: 1,
  });
  expect(req.headers['x-audit-log-reason']).toBe(
    encodeURIComponent('enable community')
  );
});

test('Guild#setCommunity disables COMMUNITY and clears the community channels', async () => {
  await guild.setCommunity(false, undefined, undefined, 'disable community');

  const req = fake.getLastRequest();
  expect(req.method).toBe('PATCH');
  expect(req.path).toBe(`/v9/guilds/${GUILD_ID}`);
  expect(req.body).toEqual({
    description: null,
    features: [],
    preferred_locale: 'en-US',
    public_updates_channel_id: null,
    rules_channel_id: null,
  });
  expect(req.headers['x-audit-log-reason']).toBe(
    encodeURIComponent('disable community')
  );
});

test('Guild#topEmojis GETs the top-emojis route and keys the collection by rank', async () => {
  const emojis = await guild.topEmojis();

  const req = fake.getLastRequest();
  expect(req.method).toBe('GET');
  expect(req.path).toBe(`/v9/guilds/${GUILD_ID}/top-emojis`);
  expect(req.body).toBeNull();
  expect(emojis.size).toBe(1);
  expect(emojis.get(1)).toBe(guild.emojis.cache.get(EMOJI_ID));
});

test('Guild#setVanityCode PATCHes the vanity code and stores the response', async () => {
  const vanity = await guild.setVanityCode('elysia');

  const req = fake.getLastRequest();
  expect(req.method).toBe('PATCH');
  expect(req.path).toBe(`/v9/guilds/${GUILD_ID}/vanity-url`);
  expect(req.body).toEqual({ code: 'elysia' });
  expect(vanity).toEqual({ code: 'elysia', uses: 42 });
  expect(guild.vanityURLCode).toBe('elysia');
  expect(guild.vanityURLUses).toBe(42);
});

test('Guild#setVanityCode rejects a non-string code', async () => {
  await expect(guild.setVanityCode(42)).rejects.toThrow(
    'INVALID_VANITY_URL_CODE'
  );
});

test('GuildSettingManager#edit PATCHes the guild settings route and patches the manager', async () => {
  const data = { muted: true, suppress_everyone: false };
  const result = await guild.settings.edit(data);

  const req = fake.getLastRequest();
  expect(req.method).toBe('PATCH');
  expect(req.path).toBe(`/v9/users/@me/guilds/${GUILD_ID}/settings`);
  expect(req.body).toEqual(data);
  expect(result).toBe(guild.settings);
  expect(guild.settings.muted).toBe(true);
  expect(guild.settings.suppressEveryone).toBe(false);
  expect(guild.settings.version).toBe(7);
});
