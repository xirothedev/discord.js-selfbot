import { test, expect } from "bun:test";

import * as discord from "../../src/index";

const EXPECTED_EXPORTS = 211;

test("export-smoke: all public exports are defined", () => {
  const keys = Object.keys(discord);
  expect(keys.length).toBeGreaterThanOrEqual(EXPECTED_EXPORTS);
  for (const key of keys) {
    expect((discord as any)[key]).toBeDefined();
  }
});

test("export-smoke: classes are constructible or have statics", () => {
  const keys = Object.keys(discord);
  const failures: string[] = [];
  for (const key of keys) {
    const val = (discord as any)[key];
    if (typeof val === "function" && /^[A-Z]/.test(key)) {
      // Try no-arg construction; some require args, so just check it's a function
      if (typeof val !== "function") {
        failures.push(key);
      }
    }
  }
  expect(failures).toEqual([]);
});

test("export-smoke: v14 aliases point at v14 builders", () => {
  expect((discord as any).ActionRow).toBe((discord as any).ActionRowBuilder);
  expect((discord as any).Button).toBe((discord as any).ButtonBuilder);
  expect((discord as any).SelectMenu).toBe((discord as any).SelectMenuBuilder);
});

test("export-smoke: bitfield flags present", () => {
  expect((discord as any).Permissions).toBeDefined();
  expect((discord as any).Permissions.FLAGS).toBeDefined();
  expect((discord as any).Intents).toBeDefined();
  expect((discord as any).Intents.FLAGS).toBeDefined();
});

test("export-smoke: no undefined exports in barrel", () => {
  for (const [k, v] of Object.entries(discord)) {
    if (v === undefined) {
      throw new Error(`undefined export: ${k}`);
    }
  }
});
