import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as library from '@discord-selfbot/core';
import { Events } from '@discord-selfbot/core';
import {
  DISCORD_API_TYPES,
  TARGET_PACKAGE,
  modernizeExportRenames,
  tier1ExportRenames,
} from '../src/rename-map';
import { eventConstants } from '../src/generated/event-constants';

const packageRoot = path.join(import.meta.dirname, '..');
const coreRoot = path.join(packageRoot, '..', 'discord-ts-selfbot');
const docsRoot = path.join(
  packageRoot,
  '..',
  '..',
  'apps',
  'docs',
  'content',
  'docs'
);

test('every rename target is exported by the library (Q21 rewrite gate)', () => {
  const exported = new Set(Object.keys(library));
  const missing = [...tier1ExportRenames, ...modernizeExportRenames]
    .map(({ to }) => to)
    .filter((name) => !exported.has(name));
  expect(missing).toEqual([]);
});

test('event snapshot matches the library Events object exactly', () => {
  for (const [value, key] of Object.entries(eventConstants)) {
    expect((Events as Record<string, unknown>)[key]).toBe(value);
  }
  for (const [key, value] of Object.entries(Events)) {
    if (typeof value !== 'string') {
      continue;
    }
    if (!key.includes('_')) {
      continue;
    }
    expect(eventConstants[value]).toBe(key);
  }
});

test('codemod version equals the library version (release lockstep)', () => {
  const codemod = JSON.parse(
    readFileSync(path.join(packageRoot, 'package.json'), 'utf-8')
  ) as { version: string };
  const core = JSON.parse(
    readFileSync(path.join(coreRoot, 'package.json'), 'utf-8')
  ) as { version: string };
  expect(codemod.version).toBe(core.version);
});

test('discord-api-types pin matches the library dependency version', () => {
  const core = JSON.parse(
    readFileSync(path.join(coreRoot, 'package.json'), 'utf-8')
  ) as {
    dependencies: Record<string, string>;
  };
  expect<string>(DISCORD_API_TYPES.version).toBe(
    core.dependencies[DISCORD_API_TYPES.name]
  );
});

test('rename map anchors point at existing docs files', () => {
  const anchors = new Set<string>();
  for (const rule of [...tier1ExportRenames, ...modernizeExportRenames]) {
    anchors.add(rule.anchor);
  }
  for (const anchor of anchors) {
    const [file] = anchor.split('#');
    const candidate = path.join(docsRoot, `${file}.mdx`);
    const exists =
      readFileSync(candidate, 'utf-8').length > 0 ||
      readFileSync(path.join(docsRoot, `${file}.md`), 'utf-8').length > 0;
    expect(exists).toBe(true);
  }
});

test('source and target package names are the audited contract', () => {
  const core = JSON.parse(
    readFileSync(path.join(coreRoot, 'package.json'), 'utf-8')
  ) as { name: string };
  expect(TARGET_PACKAGE).toBe(core.name);
});
