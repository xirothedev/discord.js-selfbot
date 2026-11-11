import { afterAll, beforeAll, expect, test } from 'bun:test';

import { startFakeDiscord } from '@discord-ts-selfbot/test-harness';

import { Client, Widget } from '../src/index';

let fake: ReturnType<typeof startFakeDiscord>;
let client: Client;

beforeAll(async () => {
  fake = startFakeDiscord();
  client = new Client({ http: { api: fake.url, version: 9 } });
  await client.login('fake-token');
}, 15_000);

afterAll(() => {
  client?.destroy();
  fake?.stop();
});

test('GuildManager#widgetImageURL builds the widget.png URL', () => {
  expect(client.guilds.widgetImageURL('123')).toBe(
    `${fake.url}/guilds/123/widget.png?style=shield`
  );
  expect(client.guilds.widgetImageURL('123', 'banner2')).toBe(
    `${fake.url}/guilds/123/widget.png?style=banner2`
  );
});

test('GuildManager#widgetImageURL rejects an unresolvable guild', () => {
  expect(() => client.guilds.widgetImageURL({} as never)).toThrow();
});

test('Widget#imageURL builds the widget.png URL', () => {
  const widget = new Widget(client, {
    channels: [],
    id: '123',
    members: [],
    name: 'g',
    presence_count: 0,
  } as never);

  expect(widget.imageURL()).toBe(
    `${fake.url}/guilds/123/widget.png?style=shield`
  );
  expect(widget.imageURL('banner1')).toBe(
    `${fake.url}/guilds/123/widget.png?style=banner1`
  );
});

test('Guild#widgetImageURL builds the widget.png URL', () => {
  const guild = client.guilds._add({ id: '123', name: 'g' } as never, false);

  expect(guild?.widgetImageURL('banner3')).toBe(
    `${fake.url}/guilds/123/widget.png?style=banner3`
  );
});
