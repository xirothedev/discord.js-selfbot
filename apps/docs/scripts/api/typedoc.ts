import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Project, PublicExport, Reflection } from './types';

const decoder = new TextDecoder();

export interface RunTypeDocOptions {
  entryPoints: string[];
  entryPointStrategy: 'resolve' | 'expand';
  outputJson: string;
  packageDir: string;
}

export function runTypeDoc(options: RunTypeDocOptions): Project {
  const tempTsconfig = path.join(
    options.packageDir,
    'node_modules/.cache/typedoc/tsconfig.json'
  );
  mkdirSync(path.dirname(tempTsconfig), { recursive: true });
  writeFileSync(
    tempTsconfig,
    JSON.stringify(
      {
        compilerOptions: {
          module: 'CommonJS',
          moduleResolution: 'node',
          noEmit: true,
          types: ['node'],
        },
        extends: '../../../tsconfig.json',
        include: ['../../../typings/**/*.ts'],
      },
      null,
      2
    )
  );

  const args = [
    'typedoc',
    '--json',
    options.outputJson,
    '--out',
    path.join(path.dirname(options.outputJson), 'html'),
    '--entryPoints',
    ...options.entryPoints,
    '--entryPointStrategy',
    options.entryPointStrategy,
    '--tsconfig',
    tempTsconfig,
    '--gitRevision',
    'main',
    '--readme',
    'none',
  ];

  const result = Bun.spawnSync({
    cmd: ['bunx', ...args],
    cwd: options.packageDir,
    stderr: 'pipe',
    stdout: 'pipe',
  });

  if (result.exitCode !== 0) {
    const stderr = decoder.decode(result.stderr);
    throw new Error(
      `TypeDoc failed (${result.exitCode}):\n${stderr.slice(-4000)}`
    );
  }

  return JSON.parse(readFileSync(options.outputJson, 'utf-8')) as Project;
}

export function modulesByName(project: Project): Map<string, Reflection> {
  return new Map((project.children ?? []).map((child) => [child.name, child]));
}

export function reflectionsByName(project: Project): Map<string, Reflection> {
  return new Map((project.children ?? []).map((child) => [child.name, child]));
}

export function findExportedReflection(
  module: Reflection | undefined,
  exported: PublicExport
): Reflection | undefined {
  if (!module?.children?.length) {
    return undefined;
  }

  const exact = exported.namedExport
    ? module.children.find((child) => child.name === exported.namedExport)
    : undefined;
  if (exact) {
    return exact;
  }

  const exportEquals = module.children.find(
    (child) => child.name === 'export='
  );
  if (exportEquals) {
    const named = exportEquals.type?.declaration?.children?.find(
      (child) => child.name === (exported.namedExport ?? exported.name)
    );
    return named ?? exportEquals;
  }

  if (module.children.length === 1) {
    return module.children[0];
  }

  return module.children.find((child) => child.name === exported.name);
}

export function sourceUrlFor(
  reflection: Reflection | undefined
): string | undefined {
  return reflection?.sources?.find((source) => source.url)?.url;
}
