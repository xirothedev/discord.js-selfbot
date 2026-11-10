import { expect, test } from 'bun:test';

import { Client } from '../src/index';

const APPLICATION_ID = '900000000000000099';
const GUILD_ID = '900000000000000001';
const CHANNEL_ID = '900000000000000002';

function createClient(respond) {
  const client = new Client({
    http: { api: 'https://discord.com/api', version: 9 },
  });
  const requests = [];

  client.rest.request = (method, url, options = {}) => {
    requests.push({ method, options, url });
    return Promise.resolve(respond(method, url, options));
  };

  return { client, requests };
}

test('Client#redeemNitro POSTs the gift code to the redeem route', async () => {
  const code = 'a'.repeat(16);
  const { client, requests } = createClient(() => ({ redeemed: true }));

  try {
    const result = await client.redeemNitro(
      `https://discord.gift/${code}`,
      CHANNEL_ID
    );

    expect(result).toEqual({ redeemed: true });
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('post');
    expect(requests[0].url).toBe(`/entitlements/gift-codes/${code}/redeem`);
    expect(requests[0].options.auth).toBe(true);
    expect(requests[0].options.data).toEqual({
      channel_id: CHANNEL_ID,
      payment_source_id: null,
    });
  } finally {
    client.destroy();
  }
});

test('Client#redeemNitro returns false for a non-nitro string', async () => {
  const { client, requests } = createClient(() => ({}));

  try {
    expect(await client.redeemNitro('not-a-nitro-url')).toBe(false);
    expect(requests).toHaveLength(0);
  } finally {
    client.destroy();
  }
});

test('Client#authorizeURL POSTs the OAuth2 query and body', async () => {
  const { client, requests } = createClient(() => ({
    location: 'https://discord.com/oauth2/authorized',
  }));
  const url = `https://discord.com/api/oauth2/authorize?client_id=${APPLICATION_ID}&scope=bot%20applications.commands&permissions=8`;

  try {
    const result = await client.authorizeURL(url, { guild_id: GUILD_ID });

    expect(result).toEqual({
      location: 'https://discord.com/oauth2/authorized',
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('post');
    expect(requests[0].url).toBe('/oauth2/authorize');
    expect(requests[0].options.query).toEqual({
      client_id: APPLICATION_ID,
      scope: 'bot applications.commands',
    });
    expect(requests[0].options.data).toMatchObject({
      authorize: true,
      client_id: APPLICATION_ID,
      guild_id: GUILD_ID,
      integration_type: 0,
      permissions: '8',
      scope: 'bot applications.commands',
    });
  } finally {
    client.destroy();
  }
});

test('Client#authorizeURL rejects a non-Discord URL', () => {
  const { client } = createClient(() => ({}));

  try {
    expect(() =>
      client.authorizeURL('https://example.com/oauth2/authorize')
    ).toThrow();
  } finally {
    client.destroy();
  }
});

test('Client#installUserApps installs an application with user-install support', async () => {
  const { client, requests } = createClient((method, url) => {
    if (url.endsWith('/public')) {
      return {
        integration_types_config: {
          1: {
            oauth2_install_params: {
              permissions: '0',
              scopes: ['applications.commands', 'bot'],
            },
          },
        },
      };
    }
    return { location: 'https://discord.com/oauth2/authorized' };
  });

  try {
    const result = await client.installUserApps(APPLICATION_ID);

    expect(result).toEqual({
      location: 'https://discord.com/oauth2/authorized',
    });
    expect(requests).toHaveLength(2);
    expect(requests[0].method).toBe('get');
    expect(requests[0].url).toBe(`/applications/${APPLICATION_ID}/public`);
    expect(requests[0].options.query).toEqual({ with_guild: false });
    expect(requests[1].method).toBe('post');
    expect(requests[1].url).toBe('/oauth2/authorize');
    expect(requests[1].options.query).toEqual({
      client_id: APPLICATION_ID,
      scope: 'applications.commands bot',
    });
    expect(requests[1].options.data).toEqual({
      authorize: true,
      integration_type: 1,
      permissions: '0',
    });
  } finally {
    client.destroy();
  }
});

test('Client#installUserApps returns false when the app has no user-install config', async () => {
  const { client, requests } = createClient(() => ({
    integration_types_config: {},
  }));

  try {
    expect(await client.installUserApps(APPLICATION_ID)).toBe(false);
    expect(requests).toHaveLength(1);
  } finally {
    client.destroy();
  }
});

test('Client#deauthorize resolves an application to its OAuth2 token', async () => {
  const tokenId = '900000000000000010';
  const { client, requests } = createClient((method, url) => {
    if (method === 'get' && url === '/oauth2/tokens') {
      return [{ application: { id: APPLICATION_ID }, id: tokenId }];
    }
    return {};
  });

  try {
    await client.deauthorize(APPLICATION_ID);

    expect(requests).toHaveLength(2);
    expect(requests[0].method).toBe('get');
    expect(requests[0].url).toBe('/oauth2/tokens');
    expect(requests[1].method).toBe('delete');
    expect(requests[1].url).toBe(`/oauth2/tokens/${tokenId}`);
  } finally {
    client.destroy();
  }
});

test('Client#deauthorize deletes a token directly', async () => {
  const tokenId = '900000000000000010';
  const { client, requests } = createClient(() => ({}));

  try {
    await client.deauthorize(tokenId, 'token');

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('delete');
    expect(requests[0].url).toBe(`/oauth2/tokens/${tokenId}`);
  } finally {
    client.destroy();
  }
});

test('Client#authorizedApplications maps OAuth2 tokens and exposes deauthorize', async () => {
  const { client, requests } = createClient(() => [
    {
      application: { id: 'app-1', name: 'First' },
      id: 'token-1',
      scopes: ['identify', 'guilds'],
    },
    {
      application: { id: 'app-2', name: 'Second' },
      id: 'token-2',
      scopes: ['bot'],
    },
  ]);

  try {
    const result = await client.authorizedApplications();

    expect(result.size).toBe(2);
    expect(result.get('app-1')).toMatchObject({
      authorizedApplicationId: 'token-1',
      scopes: ['identify', 'guilds'],
    });
    expect(result.get('app-1').application.id).toBe('app-1');
    expect(result.get('app-2').application.name).toBe('Second');

    await result.get('app-1').deauthorize();

    expect(requests).toHaveLength(2);
    expect(requests[0].method).toBe('get');
    expect(requests[0].url).toBe('/oauth2/tokens');
    expect(requests[1].method).toBe('delete');
    expect(requests[1].url).toBe('/oauth2/tokens/token-1');
  } finally {
    client.destroy();
  }
});
