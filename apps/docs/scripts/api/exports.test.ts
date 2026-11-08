import { describe, expect, test } from 'bun:test';
import { areaFor, parseIndexExports, slugify } from './exports';

const source = `'use strict';

exports.Client = require('./client/Client');
exports.CustomStatus = require('./structures/Presence').CustomStatus;
exports.ActionRow = exports.ActionRowBuilder;
exports.EmbedBuilder = require('@discordjs/builders').EmbedBuilder;
exports.version = require('../package.json').version;
`;

describe('parseIndexExports', () => {
  test('separates public, alias, external, and metadata exports', () => {
    const parsed = parseIndexExports(source);

    expect(parsed.public).toEqual([
      { name: 'Client', path: './client/Client', namedExport: undefined },
      { name: 'CustomStatus', path: './structures/Presence', namedExport: 'CustomStatus' },
    ]);
    expect(parsed.aliases).toEqual([{ name: 'ActionRow', target: 'ActionRowBuilder' }]);
    expect(parsed.external).toEqual(['EmbedBuilder']);
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
