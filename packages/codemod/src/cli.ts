#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseCli, USAGE } from './args';
import type { CliOptions } from './args';
import { unifiedDiff } from './diff';
import { inspectGit } from './git';
import {
  discoverFiles,
  planPackageJson,
  upgradeFile,
  writePackageJson,
} from './runner';
import type { PackageJsonOutcome } from './runner';
import { ruleCatalog } from './rules';
import {
  DISCORD_API_TYPES,
  SOURCE_PACKAGE,
  TARGET_PACKAGE,
  TARGET_VERSION,
} from './rename-map';

function gitGate(options: CliOptions, cwd: string): number | undefined {
  if (!options.write) {
    return undefined;
  }
  const git = inspectGit(cwd);
  if (options.force) {
    return undefined;
  }
  if (!git.isRepo) {
    process.stderr.write(
      'refusing to write: not a git repo (use --force, or `git init && git add -A && git commit`)\n'
    );
    return 2;
  }
  if (git.dirty) {
    process.stderr.write(
      'refusing to write: git tree is dirty (commit first, or use --force)\n'
    );
    return 2;
  }
  return undefined;
}

function planManifest(
  cwd: string,
  targets: readonly string[]
): PackageJsonOutcome | undefined {
  if (targets.length === 1) {
    const target = targets[0] ?? '.';
    const fromTarget = planPackageJson(
      path.isAbsolute(target) ? target : path.resolve(cwd, target)
    );
    if (fromTarget) {
      return fromTarget;
    }
  }
  return planPackageJson(cwd);
}

interface ManifestChanges {
  readonly removed: string[];
  readonly replacements: Record<string, string>;
}

function manifestChanges(
  packagePath: string,
  needsDiscordApiTypes: boolean
): ManifestChanges | undefined {
  const manifest = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const hasLegacy =
    SOURCE_PACKAGE in (manifest.dependencies ?? {}) ||
    SOURCE_PACKAGE in (manifest.devDependencies ?? {});
  const replacements: Record<string, string> = {};
  const removed: string[] = [];
  if (hasLegacy) {
    removed.push(SOURCE_PACKAGE);
    replacements[TARGET_PACKAGE] = TARGET_VERSION;
  }
  if (needsDiscordApiTypes) {
    replacements[DISCORD_API_TYPES.name] = DISCORD_API_TYPES.version;
  }
  if (removed.length === 0 && Object.keys(replacements).length === 0) {
    return undefined;
  }
  return { removed, replacements };
}

function printReport(
  options: CliOptions,
  diffs: readonly string[],
  report: Report,
  todoLines: readonly string[]
): void {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  if (!options.write) {
    for (const diff of diffs) {
      process.stdout.write(`${diff}\n`);
    }
  }
  const unmodified =
    report.totals.files - report.totals.changed - report.totals.errors;
  process.stdout.write(
    `Results: ${report.totals.errors} errors ${unmodified} unmodified ${report.totals.changed} ok, ${report.totals.todos} migration markers\n`
  );
  for (const line of todoLines) {
    process.stdout.write(`  ${line}\n`);
  }
}

interface ReportTotals {
  readonly changed: number;
  readonly errors: number;
  readonly files: number;
  readonly todos: number;
}

interface Report {
  readonly dryRun: boolean;
  readonly files: readonly unknown[];
  readonly packageJson:
    | { flaggedCompanionDeps: readonly string[]; path: string }
    | undefined;
  readonly todos: readonly unknown[];
  readonly totals: ReportTotals;
}

export function main(argv: readonly string[]): number {
  let options: CliOptions;
  try {
    options = parseCli(argv);
  } catch (error) {
    process.stderr.write(`argument error: ${String(error)}\n${USAGE}`);
    return 2;
  }

  if (options.command === 'list') {
    for (const rule of ruleCatalog()) {
      process.stdout.write(`${rule.id} (${rule.tier}) — ${rule.description}\n`);
    }
    return 0;
  }

  const cwd = process.cwd();
  const blocked = gitGate(options, cwd);
  if (blocked !== undefined) {
    return blocked;
  }

  const ruleOptions = {
    esm: options.esm,
    modernize: options.modernize,
    only: options.only,
  };
  const allFiles: string[] = [];
  for (const target of options.paths) {
    const root = path.isAbsolute(target) ? target : path.resolve(cwd, target);
    allFiles.push(
      ...discoverFiles(root, {
        extensions: options.extensions,
        ignorePatterns: options.ignorePatterns,
      })
    );
  }

  const outcomes = allFiles.map((file) => upgradeFile(file, ruleOptions));
  const changedFiles = outcomes.filter((outcome) => outcome.status === 'ok');
  const errors = outcomes.filter((outcome) => outcome.status === 'error');
  const todos = outcomes.flatMap((outcome) => outcome.todos);
  const needsDiscordApiTypes = outcomes.some(
    (outcome) => (outcome.stats['button-style'] ?? 0) > 0
  );
  const packageJson = planManifest(cwd, options.paths);

  const report = {
    dryRun: !options.write,
    files: outcomes.map((outcome) => ({
      path: path.relative(cwd, outcome.path),
      stats: outcome.stats,
      status: outcome.status,
      ...(outcome.error ? { error: outcome.error } : {}),
    })),
    packageJson: packageJson
      ? {
          flaggedCompanionDeps: packageJson.flaggedCompanionDeps,
          path: path.relative(cwd, packageJson.path),
        }
      : undefined,
    todos: todos.map((todo) => ({
      ...todo,
      file: path.relative(cwd, todo.file),
    })),
    totals: {
      changed: changedFiles.length,
      errors: errors.length,
      files: outcomes.length,
      todos: todos.length,
    },
  };

  const diffs = options.write
    ? []
    : changedFiles.map((outcome) =>
        unifiedDiff(
          path.relative(cwd, outcome.path),
          readFileSync(outcome.path, 'utf-8'),
          outcome.output
        )
      );
  const todoLines = todos.map(
    (todo) =>
      `${path.relative(cwd, todo.file)}:${todo.line} TODO(codemod:${todo.ruleId}): ${todo.message}`
  );

  if (options.write) {
    for (const outcome of changedFiles) {
      writeFileSync(outcome.path, outcome.output);
    }
    if (packageJson) {
      const changes = manifestChanges(packageJson.path, needsDiscordApiTypes);
      if (changes) {
        writePackageJson(
          packageJson,
          changes.replacements,
          changes.removed,
          options.esm
        );
      }
    }
  }

  printReport(options, diffs, report, todoLines);

  if (options.exitCode && changedFiles.length > 0) {
    return 1;
  }
  if (errors.length > 0 && options.failOnError) {
    return 1;
  }
  return 0;
}

const invoked =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invoked) {
  process.exitCode = main(process.argv.slice(2));
}
