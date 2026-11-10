import { rmSync } from 'node:fs';
import { createContext } from './context';
import { printTable, runCase, writeOutputs } from './harness';
import { createCryptoCases } from './cases/crypto';
import { createFsCases } from './cases/fs';
import { createGlobCases } from './cases/glob';
import { createHttpCases } from './cases/http';
import { createProcessCases } from './cases/process';
import { createVoiceCases } from './cases/voice';
import { closeWsSockets, createWsCases } from './cases/ws';
import type { BenchCase, RunResult } from './types';

const args = process.argv.slice(2);

function value(flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

const filters: string[] = [];
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--filter' && args[index + 1]) filters.push(args[index + 1]);
}

const rounds = Number(value('--rounds') ?? 7);
const jsonPath = value('--json');
const markdownPath = value('--markdown');
const quiet = args.includes('--quiet');

if (!Number.isInteger(rounds) || rounds < 1) {
  console.error('--rounds must be a positive integer');
  process.exit(1);
}

const context = createContext();
let cases: BenchCase[] = [
  ...createFsCases(context),
  ...createCryptoCases(),
  ...createProcessCases(),
  ...createGlobCases(context),
  ...createHttpCases(context),
  ...createWsCases(context),
  ...createVoiceCases(),
];

if (filters.length) {
  cases = cases.filter(benchCase => filters.some(filter => benchCase.id.includes(filter)));
}

if (args.includes('--list')) {
  for (const benchCase of cases) console.log(`${benchCase.group.padEnd(12)} ${benchCase.id}`);
  await context.stop();
  rmSync(context.dir, { recursive: true, force: true });
  process.exit(0);
}

if (!cases.length) {
  console.error('no cases matched');
  await context.stop();
  rmSync(context.dir, { recursive: true, force: true });
  process.exit(1);
}

const results: RunResult['results'] = [];
try {
  for (const benchCase of cases) {
    if (!quiet) console.error(`run ${benchCase.id}`);
    results.push(await runCase(benchCase, rounds));
  }
} finally {
  closeWsSockets();
  await context.stop();
  rmSync(context.dir, { recursive: true, force: true });
}

const run: RunResult = {
  meta: {
    date: new Date().toISOString(),
    bunVersion: Bun.version,
    bunRevision: Bun.revision,
    nodeCompatVersion: process.versions.node,
    platform: process.platform,
    arch: process.arch,
    rounds,
    filters,
  },
  results,
};

if (!quiet) printTable(results);
await writeOutputs(run, jsonPath, markdownPath);
