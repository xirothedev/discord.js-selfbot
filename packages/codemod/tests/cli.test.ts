import { beforeAll, describe, expect, test } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const packageRoot = path.join(import.meta.dirname, '..');
const cliPath = path.join(packageRoot, 'dist', 'cli.js');

const BOT_SOURCE = `const { Client, MessageButton } = require('discord.js-selfbot-v13');
const client = new Client();
client.on('ready', () => {
  console.log('ready');
});
const button = new MessageButton().setStyle('PRIMARY').setLabel('hi');
client.relationships.addFriend('someone').catch(() => {});
module.exports = { client, button };
`;

const MANIFEST = `${JSON.stringify(
  {
    dependencies: {
      '@discordjs/opus': '^0.9.0',
      'discord.js-selfbot-v13': '^3.7.0',
    },
    name: 'legacy-bot',
  },
  null,
  2
)}\n`;

function runCli(
  args: readonly string[],
  cwd: string
): { code: number; stdout: string; stderr: string } {
  const proc = Bun.spawnSync(['node', cliPath, ...args], {
    cwd,
    stderr: 'pipe',
    stdout: 'pipe',
  });
  return {
    code: proc.exitCode ?? -1,
    stderr: proc.stderr.toString(),
    stdout: proc.stdout.toString(),
  };
}

describe('codemod CLI under Node', () => {
  let dir: string;

  beforeAll(() => {
    if (!existsSync(cliPath)) {
      throw new Error('dist/cli.js missing; run `bun run build`');
    }
    dir = mkdtempSync(path.join(tmpdir(), 'codemod-e2e-'));
    mkdirSync(path.join(dir, 'src'));
    writeFileSync(path.join(dir, 'src', 'bot.js'), BOT_SOURCE);
    writeFileSync(path.join(dir, 'package.json'), MANIFEST);
  });

  test('dry run reports changes without writing and flags companion deps', () => {
    const result = runCli(['upgrade', 'src', '--json'], dir);
    expect(result.code).toBe(0);
    const report = JSON.parse(result.stdout) as {
      dryRun: boolean;
      totals: { changed: number; todos: number };
      packageJson?: { flaggedCompanionDeps: string[] };
    };
    expect(report.dryRun).toBe(true);
    expect(report.totals.changed).toBe(1);
    expect(report.totals.todos).toBeGreaterThanOrEqual(1);
    expect(report.packageJson?.flaggedCompanionDeps).toEqual([
      '@discordjs/opus',
    ]);
    expect(readFileSync(path.join(dir, 'src', 'bot.js'), 'utf-8')).toBe(
      BOT_SOURCE
    );
  });

  test('refuses to write in a non-git project without --force', () => {
    const result = runCli(['upgrade', 'src', '--write'], dir);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain('not a git repo');
  });

  test('--write --force applies the migration and swaps the dependency', () => {
    const result = runCli(
      ['upgrade', '.', '--write', '--force', '--json'],
      dir
    );
    expect(result.code).toBe(0);
    const written = readFileSync(path.join(dir, 'src', 'bot.js'), 'utf-8');
    expect(written).toContain('@discord-selfbot/core');
    expect(written).toContain('Events.READY'.replace('READY', 'CLIENT_READY'));
    expect(written).toContain('ButtonStyle.Primary');
    expect(written).toContain('TODO(codemod:stubbed-relationship-mutations)');
    const manifest = JSON.parse(
      readFileSync(path.join(dir, 'package.json'), 'utf-8')
    ) as {
      dependencies: Record<string, string>;
    };
    expect(manifest.dependencies['@discord-selfbot/core']).toBe('^14.0.0');
    expect(manifest.dependencies['discord.js-selfbot-v13']).toBeUndefined();
    expect(manifest.dependencies['@discordjs/opus']).toBe('^0.9.0');
    expect(manifest.dependencies['discord-api-types']).toBeDefined();
  });

  test('second run is fully idempotent', () => {
    const before = readFileSync(path.join(dir, 'src', 'bot.js'), 'utf-8');
    const result = runCli(
      ['upgrade', 'src', '--write', '--force', '--json'],
      dir
    );
    expect(result.code).toBe(0);
    const report = JSON.parse(result.stdout) as { totals: { changed: number } };
    expect(report.totals.changed).toBe(0);
    expect(readFileSync(path.join(dir, 'src', 'bot.js'), 'utf-8')).toBe(before);
  });
});
