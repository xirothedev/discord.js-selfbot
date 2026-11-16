import { expect, test } from 'bun:test';
import { expectIdempotent, output, upgrade } from './helpers';

const V13 = 'discord.js-selfbot-v13';
const CORE = '@discord-selfbot/core';

test('specifier rewrite: ESM import', () => {
  const out = output(
    `import { Client } from '${V13}';\nexport const c = new Client();\n`
  );
  expect(out).toContain(`from "${CORE}"`);
  expect(out).not.toContain(V13);
  expectIdempotent(
    `import { Client } from '${V13}';\nexport const c = new Client();\n`
  );
});

test('specifier rewrite: require + rename of vanished export', () => {
  const source = `const { MessageSelectMenu } = require('${V13}');\nmodule.exports = new MessageSelectMenu();\n`;
  const out = output(source, 'src/a.js');
  expect(out).toContain(`require("${CORE}")`);
  expect(out).toContain('StringSelectMenuBuilder');
  expect(out).not.toContain('MessageSelectMenu');
});

test('modernize: builder renames on imports and usages', () => {
  const source = `import { MessageEmbed, MessageButton } from '${V13}';\nexport const x = new MessageEmbed().setTitle('t');\nexport const y = new MessageButton();\n`;
  const out = output(source);
  expect(out).toContain('EmbedBuilder');
  expect(out).toContain('ButtonBuilder');
  expect(out).not.toContain('MessageEmbed');
  expectIdempotent(source);
});

test('modernize: disabled by --no-modernize for aliases but breaking renames still apply', () => {
  const source = `import { MessageEmbed, MessageSelectMenu } from '${V13}';\nexport const x = new MessageEmbed();\nexport const s = new MessageSelectMenu();\n`;
  const out = output(source, 'src/index.ts', { modernize: false });
  expect(out).toContain('MessageEmbed');
  expect(out).toContain('StringSelectMenuBuilder');
});

test('modernize: namespace member renames', () => {
  const source = `import * as Discord from '${V13}';\nexport const embed = new Discord.MessageEmbed();\n`;
  const out = output(source);
  expect(out).toContain('Discord.EmbedBuilder');
});

test('modernize: default import becomes namespace import', () => {
  const source = `import Discord from '${V13}';\nexport const c = new Discord.Client();\n`;
  const out = output(source);
  expect(out).toContain(`import * as Discord from "${CORE}"`);
});

test('modernize: event strings to value-preserving Events constants', () => {
  const source = `import { Client } from '${V13}';\nconst client = new Client();\nclient.once('ready', () => {});\nclient.on('messageCreate', () => {});\n`;
  const out = output(source);
  expect(out).toContain('Events.CLIENT_READY');
  expect(out).toContain('Events.MESSAGE_CREATE');
  expect(out).toMatch(/import\s*\{\s*Client, Events\s*\}\s*from/u);
  expectIdempotent(source);
});

test('dead automod handler gets a migration marker', () => {
  const source = `import { Client } from '${V13}';\nconst client = new Client();\nclient.on('autoModerationActionExecution', () => {});\n`;
  const out = output(source);
  expect(out).toContain('TODO(codemod:dead-automod-handlers)');
  const result = upgrade(source);
  expect(
    result.todos.some((todo) => todo.ruleId === 'dead-automod-handlers')
  ).toBe(true);
});

test('setStyle strings and numbers become ButtonStyle enum with explicit import', () => {
  const source = `import { MessageButton } from '${V13}';\nexport const b = new MessageButton().setStyle('PRIMARY');\nexport const c = new MessageButton().setStyle(4);\n`;
  const out = output(source);
  expect(out).toContain('ButtonStyle.Primary');
  expect(out).toContain('ButtonStyle.Danger');
  expect(out).toContain(`from "discord-api-types/v10"`);
  expectIdempotent(source);
});

test('method and option key renames', () => {
  const source = `export const p = client.fetchPremiumStickerPacks();\nexport const r = interaction.reply({ content: 'x', fetchReply: true });\n`;
  const out = output(source);
  expect(out).toContain('fetchStickerPacks');
  expect(out).toContain('withResponse: true');
  expect(out).not.toContain('fetchReply');
});

test('heuristic member renames respect receiver hints', () => {
  const source = `role.setColor('#ff0000');\nwidget.setColor(1);\nmessage.interaction;\nthing.interaction;\n`;
  const out = output(source);
  expect(out).toContain('role.setColors');
  expect(out).toContain('widget.setColor(1)');
  expect(out).toContain('message.interactionMetadata');
  expect(out).toContain('thing.interaction;');
});

test('partials get the documented cast (TS only)', () => {
  const source = `import { Client, Partials } from '${V13}';\nexport const c = new Client({ partials: [Partials.Message, Partials.Channel] });\n`;
  const out = output(source);
  expect(out).toContain('as unknown as PartialTypes[]');
  expect(out).toContain('import type { PartialTypes }');
  const js = output(source, 'src/a.js');
  expect(js).not.toContain('as unknown as');
  expectIdempotent(source);
});

test('markers: stubbed relationship mutations', () => {
  const source = `async function run() {\n  await client.relationships.addFriend('me');\n  await client.relationships.deleteRelationship(user);\n}\n`;
  const result = upgrade(source);
  expect(
    result.todos.filter(
      (todo) => todo.ruleId === 'stubbed-relationship-mutations'
    ).length
  ).toBe(2);
  expect(result.output).toContain(
    'TODO(codemod:stubbed-relationship-mutations)'
  );
  expectIdempotent(source, 'src/a.js');
});

test('markers: MFA methods, await destroy, deprecated client options, StoreChannel, guarded util/guild', () => {
  const source = [
    `guild.members.bulkBan(['1']);`,
    `client.passLogin('a@b.c', 'pw');`,
    `async function close() { await client.destroy(); }`,
    `const c = new Client({ messageCacheLifetime: 60, messageSweepInterval: 60 });`,
    `import { StoreChannel } from '${CORE}';`,
    `Util.removeMentions('hi');`,
    `guild.delete();`,
    `card.delete();`,
    ``,
  ].join('\n');
  const result = upgrade(source, 'src/b.js');
  const ids = result.todos.map((todo) => todo.ruleId);
  expect(ids).toContain('mfa-bound-methods');
  expect(ids).toContain('destroy-returns-void');
  expect(ids).toContain('deprecated-client-option');
  expect(ids).toContain('removed-store-channel');
  expect(ids).toContain('util-remove-mentions');
  expect(ids).toContain('destructive-guild-methods');
  expect(ids.filter((id) => id === 'destructive-guild-methods').length).toBe(1);
});

test('markerExports: typings-only and star-export gap imports are marked not rewritten', () => {
  const source = `import { Interaction, REST, SlashCommandBuilder } from '${CORE}';\nexport const r = new REST();\nexport const s = new SlashCommandBuilder();\n`;
  const result = upgrade(source);
  const ids = result.todos.map((todo) => todo.ruleId);
  expect(ids).toContain('star-export-gap');
  expect(ids).toContain('removed-interaction-types');
  expect(result.output).toContain('SlashCommandBuilder');
});

test('CJS-to-ESM under --esm converts requires and skips exports files', () => {
  const source = `const { Client } = require('${V13}');\nconst http = require('node:http');\nmodule.exports = { http };\n`;
  const kept = upgrade(source, 'src/c.js', { esm: true });
  expect(kept.output).toContain('module.exports');
  const converted = upgrade(
    `const { Client } = require('${V13}');\nexport const c = new Client();\n`,
    'src/d.js',
    { esm: true }
  );
  expect(converted.output).toContain(`import { Client } from "${CORE}"`);
  expect(converted.output).not.toContain('require(');
});

test('doNotTouch signatures survive every rule byte-identical', () => {
  const source = [
    `guild.members.edit(member, { nick: 'x' }, 'reason');`,
    `guild.members.setFlags(member, 1);`,
    `voice.setRequestToSpeak(true);`,
    `voice.setSuppressed(false);`,
    ``,
  ].join('\n');
  const result = upgrade(source, 'src/e.js');
  expect(result.status).toBe('nochange');
  expect(result.output).toBe(source);
});
