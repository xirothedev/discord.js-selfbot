import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { runRulesOnSource } from './engine';
import type { FileOutcome } from './engine';
import { rulesFor } from './rules';
import type { RunRuleOptions } from './rules';
import { companionDepsToFlag } from './rename-map';

export interface DiscoverOptions {
  readonly extensions: readonly string[];
  readonly ignorePatterns: readonly string[];
}

const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  '.git',
]);

function toRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replaceAll(/[.+^${}()|[\]\\]/gu, String.raw`\$&`)
    .replaceAll('*', '[^/]*')
    .replaceAll('?', '.');
  return new RegExp(String.raw`(^|/)${escaped}($|/)`, 'u');
}

export function discoverFiles(
  root: string,
  options: DiscoverOptions
): string[] {
  const ignores = options.ignorePatterns.map(toRegExp);
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (DEFAULT_IGNORE_DIRS.has(entry)) {
        continue;
      }
      const full = path.join(dir, entry);
      const rel = path.relative(root, full).split(path.sep).join('/');
      if (ignores.some((matcher) => matcher.test(rel))) {
        continue;
      }
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (
        options.extensions.some((extension) => full.endsWith(`.${extension}`))
      ) {
        files.push(full);
      }
    }
  };
  walk(root);
  return files.toSorted();
}

export interface PackageJsonOutcome {
  readonly path: string;
  readonly flaggedCompanionDeps: readonly string[];
}

interface Manifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  type?: string;
}

function detectIndent(source: string): string {
  return source.match(/\n(?<indent>\s+)"/u)?.groups?.indent ?? '  ';
}

export function upgradeFile(
  filePath: string,
  ruleOptions: RunRuleOptions
): FileOutcome {
  const source = readFileSync(filePath, 'utf-8');
  return runRulesOnSource(
    { path: filePath, source },
    rulesFor(ruleOptions),
    {}
  );
}

export function planPackageJson(dir: string): PackageJsonOutcome | undefined {
  const manifestPath = path.join(dir, 'package.json');
  let source: string;
  try {
    source = readFileSync(manifestPath, 'utf-8');
  } catch {
    return;
  }
  const manifest = JSON.parse(source) as Manifest;
  const deps = manifest.dependencies ?? {};
  const devDeps = manifest.devDependencies ?? {};
  const flagged = companionDepsToFlag.filter(
    (name) => name in deps || name in devDeps
  );
  return { flaggedCompanionDeps: flagged, path: manifestPath };
}

export function writePackageJson(
  outcome: PackageJsonOutcome,
  replacements: Record<string, string>,
  removed: readonly string[],
  esm = false
): void {
  const original = readFileSync(outcome.path, 'utf-8');
  const manifest = JSON.parse(original) as Manifest;
  const kept = (
    deps: Record<string, string> | undefined
  ): Record<string, string> =>
    Object.fromEntries(
      Object.entries(deps ?? {}).filter(([name]) => !removed.includes(name))
    );
  manifest.dependencies = { ...kept(manifest.dependencies), ...replacements };
  if (manifest.devDependencies) {
    manifest.devDependencies = kept(manifest.devDependencies);
  }
  if (esm) {
    manifest.type = 'module';
  }
  writeFileSync(
    outcome.path,
    `${JSON.stringify(manifest, null, detectIndent(original))}\n`
  );
}
