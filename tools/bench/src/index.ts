import { rmSync } from "node:fs";

import { createCryptoCases } from "./cases/crypto";
import { createFsCases } from "./cases/fs";
import { createGlobCases } from "./cases/glob";
import { createHttpCases } from "./cases/http";
import { createProcessCases } from "./cases/process";
import { createVoiceCases } from "./cases/voice";
import { closeWsSockets, createWsCases } from "./cases/ws";
import { createContext } from "./context";
import { printTable, runCase, writeOutputs } from "./harness";
import type { BenchCase, CaseResult, RunResult } from "./types";

const args = process.argv.slice(2);

function value(flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

const filters: string[] = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--filter" && args[index + 1]) {
    filters.push(args[index + 1]);
  }
}

const rounds = Number(value("--rounds") ?? 7);
const jsonPath = value("--json");
const markdownPath = value("--markdown");
const quiet = args.includes("--quiet");

if (!Number.isInteger(rounds) || rounds < 1) {
  console.error("--rounds must be a positive integer");
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

async function* executeCases(
  benchCases: BenchCase[],
  caseRounds: number,
  silent: boolean
): AsyncGenerator<CaseResult> {
  for (const benchCase of benchCases) {
    if (!silent) {
      console.error(`run ${benchCase.id}`);
    }
    yield runCase(benchCase, caseRounds);
  }
}

if (filters.length) {
  cases = cases.filter((benchCase) =>
    filters.some((filter) => benchCase.id.includes(filter))
  );
}

if (args.includes("--list")) {
  for (const benchCase of cases) {
    console.log(`${benchCase.group.padEnd(12)} ${benchCase.id}`);
  }
  await context.stop();
  rmSync(context.dir, { force: true, recursive: true });
  process.exit(0);
}

if (!cases.length) {
  console.error("no cases matched");
  await context.stop();
  rmSync(context.dir, { force: true, recursive: true });
  process.exit(1);
}

const results: RunResult["results"] = [];
try {
  for await (const result of executeCases(cases, rounds, quiet)) {
    results.push(result);
  }
} finally {
  closeWsSockets();
  await context.stop();
  rmSync(context.dir, { force: true, recursive: true });
}

const run: RunResult = {
  meta: {
    arch: process.arch,
    bunRevision: Bun.revision,
    bunVersion: Bun.version,
    date: new Date().toISOString(),
    filters,
    nodeCompatVersion: process.versions.node,
    platform: process.platform,
    rounds,
  },
  results,
};

if (!quiet) {
  printTable(results);
}
await writeOutputs(run, jsonPath, markdownPath);
