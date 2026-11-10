import { describe, expect, test } from 'bun:test';
import { areaFor, parseIndexExports, slugify } from './exports';

const source = `import pkg from '../package.json';

export { default as Client } from './client/Client';
export { CustomStatus } from './structures/Presence';
export { DefaultClient as ClientAlias } from './client/Client';
export { ActionRowBuilder as ActionRow } from '@discordjs/builders';
export const version = pkg.version;
export {
  Guild,
  Message,
} from './structures/index';
`;

describe('parseIndexExports', () => {
  test('separates public, alias, external, and metadata exports', () => {
    const parsed = parseIndexExports(source);

    expect(parsed.public).toEqual([
      { name: 'Client', path: './client/Client', namedExport: undefined },
      { name: 'CustomStatus', path: './structures/Presence', namedExport: 'CustomStatus' },
      { name: 'version', path: './index', namedExport: undefined },
      { name: 'Guild', path: './structures/index', namedExport: 'Guild' },
      { name: 'Message', path: './structures/index', namedExport: 'Message' },
    ]);
    expect(parsed.aliases).toEqual([{ name: 'ClientAlias', target: 'DefaultClient' }]);
    expect(parsed.external).toEqual(['ActionRow']);
    expect(parsed.unparsed).toEqual([]);
  });
});

describe('slugify', () => {
  test('converts class names to lowercase kebab-case', () => {
    expect(slugify('Client')).toBe('client');
    expect(slugify('ClientUser')).toBe('client-user');
    expect(slugify('RESTManager')).toBe('rest-manager');
    expect(slugify('QRLogin')).toBe('qr-login');
    expect(slugify('WebSocket')).toBe('web-socket');
  });
});

describe('areaFor', () => {
  test('groups public modules by area', () => {
    expect(areaFor('./client/Client')).toBe('client');
    expect(areaFor('./client/voice/ClientVoiceManager')).toBe('voice');
    expect(areaFor('./structures/Message')).toBe('structures');
    expect(areaFor('./managers/GuildManager')).toBe('managers');
    expect(areaFor('./rest/RESTManager')).toBe('rest');
    expect(areaFor('./sharding/Shard')).toBe('sharding');
    expect(areaFor('./util/Events')).toBe('utilities');
    expect(areaFor('./WebSocket')).toBe('client');
  });
});
