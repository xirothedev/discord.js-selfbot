import { expect, test } from 'bun:test';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { planPackageJson, writePackageJson } from '../src/runner';
import { unifiedDiff } from '../src/diff';
import { SOURCE_PACKAGE, TARGET_PACKAGE } from '../src/rename-map';

function tempProject(files: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'codemod-'));
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

test('planPackageJson flags companion deps without touching them', () => {
  const dir = tempProject({
    'package.json': JSON.stringify(
      {
        dependencies: {
          [SOURCE_PACKAGE]: '^3.7.0',
          '@discordjs/opus': '^0.9.0',
        },
      },
      null,
      2
    ),
  });
  const plan = planPackageJson(dir);
  expect(plan?.flaggedCompanionDeps).toEqual(['@discordjs/opus']);
});

test('writePackageJson swaps the dependency and preserves indent', () => {
  const dir = tempProject({
    'package.json': `{\n    "name": "app",\n    "dependencies": {\n        "${SOURCE_PACKAGE}": "^3.7.0"\n    }\n}\n`,
  });
  const plan = planPackageJson(dir);
  if (!plan) {
    throw new Error('missing plan');
  }
  writePackageJson(plan, { [TARGET_PACKAGE]: '^14.0.0' }, [SOURCE_PACKAGE]);
  const written = JSON.parse(
    readFileSync(path.join(dir, 'package.json'), 'utf-8')
  ) as {
    dependencies: Record<string, string>;
  };
  expect(written.dependencies[TARGET_PACKAGE]).toBe('^14.0.0');
  expect(written.dependencies[SOURCE_PACKAGE]).toBeUndefined();
  expect(readFileSync(path.join(dir, 'package.json'), 'utf-8')).toContain(
    '    "dependencies"'
  );
});

test('writePackageJson --esm sets type module', () => {
  const dir = tempProject({
    'package.json': JSON.stringify({ name: 'app' }, null, 2),
  });
  const plan = planPackageJson(dir);
  if (!plan) {
    throw new Error('missing plan');
  }
  writePackageJson(plan, {}, [], true);
  expect(
    JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf-8')).type
  ).toBe('module');
});

test('unifiedDiff marks removed and added lines', () => {
  const diff = unifiedDiff(
    'a.ts',
    'const a = 1;\nconst b = 2;\n',
    'const a = 1;\nconst b = 3;\n'
  );
  expect(diff).toContain('-const b = 2;');
  expect(diff).toContain('+const b = 3;');
});
