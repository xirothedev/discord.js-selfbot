import { createHash } from 'node:crypto';
import { expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { sleep } from '../src/util/sleep';

// ADR 0013 contract: published shared runtime code never touches Bun-only
// APIs. These tests run under Bun (the development runtime); Node consumers
// get dist builds whose behavior is pinned by the same rules.

function sourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      sourceFiles(full, files);
    } else if (entry.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function stripComments(source: string): string {
  return source
    .replaceAll(/\/\*[\s\S]*?\*\//gu, '')
    .replaceAll(/(?<scheme>[^\\:])\/\/.*$/gmu, '$<scheme>');
}

test('shared runtime code never calls Bun.* APIs', () => {
  const srcRoot = path.join(import.meta.dirname, '..', 'src');
  const offenders: string[] = [];
  for (const file of sourceFiles(srcRoot)) {
    const stripped = stripComments(readFileSync(file, 'utf-8'));
    const hit = /\bBun\.[A-Za-z]/u.exec(stripped);
    if (hit) {
      offenders.push(`${path.relative(srcRoot, file)}: ${hit[0]}`);
    }
  }
  expect(offenders).toEqual([]);
});

test('no top-level await in shared runtime code (CJS dist contract)', () => {
  const srcRoot = path.join(import.meta.dirname, '..', 'src');
  const offenders: string[] = [];
  for (const file of sourceFiles(srcRoot)) {
    const stripped = stripComments(readFileSync(file, 'utf-8'));
    // A top-level await sits at column 0 (indented awaits are inside bodies).
    const hit = /^(?:await |const .* = await )/mu.exec(stripped);
    if (hit) {
      offenders.push(`${path.relative(srcRoot, file)}: ${hit[0].trim()}`);
    }
  }
  expect(offenders).toEqual([]);
});

test('RemoteAuth nonce proof hash matches the historical Bun.CryptoHasher output', () => {
  const samples: Buffer[] = [
    Buffer.from(''),
    Buffer.from('discord-nonce-1234567890', 'utf-8'),
    Buffer.from([0x00, 0xff, 0xfe, 0x80, 0x7f, 0x01, 0x2b, 0x2f]),
    Buffer.alloc(64, 0xab),
  ];
  for (const sample of samples) {
    const historical = Bun.CryptoHasher.hash('sha256', sample, 'base64')
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replace(/=+/u, '')
      .replace(/\s+$/u, '');
    const shipped = createHash('sha256').update(sample).digest('base64url');
    expect(shipped).toBe(historical);
  }
});

test('sleep seams resolve like Bun.sleep', async () => {
  const started = Date.now();
  await sleep(15);
  expect(Date.now() - started).toBeGreaterThanOrEqual(10);
});
