import { expect, test } from 'bun:test';
import { Client, Permissions } from '../src/index';

const APPLICATION_ID = '900000000000000099';

function createClient() {
  const client = new Client({ http: { api: 'https://discord.com/api', version: 9 } });
  // Client#application is populated from READY in v14 (tracked by issue #15).
  client.application = { id: APPLICATION_ID };
  return client;
}

test('Client#generateInvite builds the expected OAuth2 URL', () => {
  const client = createClient();

  try {
    const url = client.generateInvite({
      scopes: ['bot', 'applications.commands'],
      permissions: ['MANAGE_GUILD'],
      disableGuildSelect: true,
    });

    expect(url.startsWith('https://discord.com/api/oauth2/authorize?')).toBe(true);

    const params = new URL(url).searchParams;
    expect(params.get('client_id')).toBe(APPLICATION_ID);
    expect(params.get('scope')).toBe('bot applications.commands');
    expect(params.get('permissions')).toBe(String(Permissions.FLAGS.MANAGE_GUILD));
    expect(params.get('disable_guild_select')).toBe('true');
  } finally {
    client.destroy();
  }
});

test('Client#generateInvite rejects scopes without bot or applications.commands', () => {
  const client = createClient();

  try {
    expect(() => client.generateInvite({ scopes: ['identify'] })).toThrow();
    expect(() => client.generateInvite({})).toThrow();
  } finally {
    client.destroy();
  }
});
