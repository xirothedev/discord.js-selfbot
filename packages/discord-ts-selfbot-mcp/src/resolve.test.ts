import { afterEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveDocs } from './resolve';

const roots: string[] = [];

function tempProject(): { root: string; project: string } {
  const root = mkdtempSync(path.join(os.tmpdir(), 'discord-ts-selfbot-mcp-'));
  roots.push(root);
  const project = path.join(root, 'packages/app');
  mkdirSync(project, { recursive: true });
  writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({ name: 'app', dependencies: { 'discord-ts-selfbot': '^14.0.0' } }),
  );
  return { root, project };
}

function install(root: string, version = '14.0.0', withDocs = true): string {
  const packageDir = path.join(root, 'node_modules/discord-ts-selfbot');
  mkdirSync(packageDir, { recursive: true });
  writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify({ name: 'discord-ts-selfbot', version }));
  if (withDocs) {
    mkdirSync(path.join(packageDir, 'docs'), { recursive: true });
    writeFileSync(path.join(packageDir, 'docs/llms.txt'), '# Agent docs\n');
  }
  return packageDir;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('resolveDocs', () => {
  test('returns the installed docs path in a hoisted workspace', () => {
    const { root, project } = tempProject();
    const packageDir = install(root);

    const result = resolveDocs(project, 'send a message');

    expect(result.status).toBe('use_bundled_docs');
    expect(result.version).toBe('14.0.0');
    expect(result.versionSource).toBe('installed');
    const realPackageDir = realpathSync(packageDir);
    expect(result.docsPath).toBe(path.join(realPackageDir, 'docs'));
    expect(result.indexPath).toBe(path.join(realPackageDir, 'docs/llms.txt'));
    expect(result.docsAvailable).toBe(true);
    expect(result.instructions.join(' ')).toContain('send a message');
  });

  test('asks for an install when the package is missing', () => {
    const { project } = tempProject();

    const result = resolveDocs(project);

    expect(result.status).toBe('install_required');
    expect(result.version).toBe('^14.0.0');
    expect(result.versionSource).toBe('declared');
    expect(result.docsAvailable).toBe(false);
  });

  test('reports a package without bundled docs', () => {
    const { root, project } = tempProject();
    install(root, '14.0.0', false);

    const result = resolveDocs(project);

    expect(result.status).toBe('missing_docs');
    expect(result.version).toBe('14.0.0');
    expect(result.docsAvailable).toBe(false);
    expect(result.indexPath).toBeNull();
  });
});
