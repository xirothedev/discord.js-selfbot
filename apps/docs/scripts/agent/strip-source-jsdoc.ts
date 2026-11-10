// One-time migration helper: removed the old source JSDoc. Kept for audit.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const packageDir = path.resolve(
  import.meta.dir,
  '../../../../packages/discord-ts-selfbot'
);
const sourceDir = path.join(packageDir, 'src');
const KEEP = /@(?:deprecated|internal|ts-ignore|ts-expect-error|ts-nocheck)\b/u;

function walk(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function strip(source: string): { output: string; removed: number } {
  const lines = source.split('\n');
  const kept: string[] = [];
  let removed = 0;

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].trimStart().startsWith('/**')) {
      kept.push(lines[index]);
      continue;
    }

    const start = index;
    while (index < lines.length && !lines[index].includes('*/')) {
      index += 1;
    }
    const block = lines.slice(start, index + 1).join('\n');
    if (KEEP.test(block)) {
      kept.push(...lines.slice(start, index + 1));
    } else {
      removed += 1;
    }
  }

  return {
    output: `${kept
      .join('\n')
      .replaceAll(/\n{3,}/gu, '\n\n')
      .replace(/\n+$/u, '')}\n`,
    removed,
  };
}

function main(): void {
  const check = process.argv.includes('--check');
  let removed = 0;
  const changed: string[] = [];

  const entitiesDir = path.join(sourceDir, 'types/entities');
  const schemaFile = path.join(sourceDir, 'types/schema.ts');

  for (const file of walk(sourceDir)) {
    if (file === schemaFile || file.startsWith(`${entitiesDir}${path.sep}`)) {
      continue;
    }
    const source = readFileSync(file, 'utf-8');
    const result = strip(source);
    if (result.output === source) {
      continue;
    }
    changed.push(path.relative(packageDir, file));
    removed += result.removed;
    if (!check) {
      writeFileSync(file, result.output);
    }
  }

  console.log(
    `${check ? 'Would remove' : 'Removed'} ${removed} JSDoc blocks from ${changed.length} files.`
  );
  if (check && changed.length) {
    process.exitCode = 1;
  }
}

main();
