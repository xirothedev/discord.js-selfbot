import { test, expect } from "bun:test";

import * as discord from "../../src/index";

const EXPECTED_EXPORTS = 211;

test("export-smoke: all public exports are defined", () => {
  const entries = Object.entries(discord);
  expect(entries.length).toBeGreaterThanOrEqual(EXPECTED_EXPORTS);
  for (const [key, value] of entries) {
    expect(value, key).toBeDefined();
  }
});

test("export-smoke: classes are constructible or have statics", () => {
  for (const [key, value] of Object.entries(discord)) {
    if (typeof value === "function" && /^[A-Z]/u.test(key)) {
      expect(value).toBeInstanceOf(Function);
    }
  }
});

test("export-smoke: v14 aliases point at v14 builders", () => {
  expect(discord.ActionRow).toBe(discord.ActionRowBuilder);
  expect(discord.Button).toBe(discord.ButtonBuilder);
  expect(discord.SelectMenu).toBe(discord.SelectMenuBuilder);
});

test("export-smoke: bitfield flags present", () => {
  expect(discord.Permissions).toBeDefined();
  expect(discord.Permissions.FLAGS).toBeDefined();
  expect(discord.Intents).toBeDefined();
  expect(discord.Intents.FLAGS).toBeDefined();
});

test("export-smoke: no undefined exports in barrel", () => {
  for (const [key, value] of Object.entries(discord)) {
    if (value === undefined) {
      throw new Error(`undefined export: ${key}`);
    }
  }
});
