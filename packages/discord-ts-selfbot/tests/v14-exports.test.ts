import { expect, test } from 'bun:test';
import { Buffer } from 'node:buffer';

import * as discord from '../src/index';

test('v14 builders are exported and constructible', () => {
  const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, EmbedBuilder } =
    discord;

  expect(typeof ActionRowBuilder).toBe('function');
  expect(typeof AttachmentBuilder).toBe('function');
  expect(typeof ButtonBuilder).toBe('function');
  expect(typeof EmbedBuilder).toBe('function');

  const embed = new EmbedBuilder()
    .setTitle('v14 parity')
    .setDescription('Builder check');
  expect(embed.data.title).toBe('v14 parity');
  expect(embed.data.description).toBe('Builder check');

  const button = new ButtonBuilder()
    .setCustomId('test-button')
    .setLabel('Click me')
    .setStyle(1);
  const row = new ActionRowBuilder().addComponents(button);
  const rowJson = row.toJSON();
  expect(rowJson.type).toBe(1);
  expect(rowJson.components).toHaveLength(1);
  expect(rowJson.components[0]).toMatchObject({
    custom_id: 'test-button',
    label: 'Click me',
    style: 1,
    type: 2,
  });

  const attachment = new AttachmentBuilder(Buffer.from('hello'), {
    description: 'greeting',
    name: 'hello.txt',
  });
  expect(attachment.name).toBe('hello.txt');
  expect(attachment.description).toBe('greeting');
  expect(attachment.toJSON()).toMatchObject({
    description: 'greeting',
    name: 'hello.txt',
  });
});

test('v13 builder aliases reference the same builder classes', () => {
  expect(discord.ActionRow).toBe(discord.ActionRowBuilder);
  expect(discord.Button).toBe(discord.ButtonBuilder);
  expect(discord.SelectMenu).toBe(discord.StringSelectMenuBuilder);
  expect(discord.Embed).toBe(discord.EmbedBuilder);
  expect(discord.Attachment).toBe(discord.AttachmentBuilder);
  expect(discord.TextInput).toBe(discord.TextInputBuilder);
});

test('the 11 v14 BitField aliases reference the same classes as their v13 counterparts', () => {
  const aliases = [
    [discord.ActivityFlagsBitField, discord.ActivityFlags],
    [discord.ApplicationFlagsBitField, discord.ApplicationFlags],
    [discord.AttachmentFlagsBitField, discord.AttachmentFlags],
    [discord.GuildMemberFlagsBitField, discord.GuildMemberFlags],
    [discord.IntentsBitField, discord.Intents],
    [discord.MessageFlagsBitField, discord.MessageFlags],
    [discord.PermissionsBitField, discord.Permissions],
    [discord.RoleFlagsBitField, discord.RoleFlags],
    [discord.SystemChannelFlagsBitField, discord.SystemChannelFlags],
    [discord.ThreadMemberFlagsBitField, discord.ThreadMemberFlags],
    [discord.UserFlagsBitField, discord.UserFlags],
  ];

  expect(aliases).toHaveLength(11);

  for (const [v14Alias, v13Alias] of aliases) {
    expect(typeof v14Alias).toBe('function');
    expect(typeof v13Alias).toBe('function');
    expect(v14Alias).toBe(v13Alias);
  }
});
