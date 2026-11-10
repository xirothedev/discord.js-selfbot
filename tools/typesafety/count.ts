import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dir, '..', '..');
const PKG = path.join(ROOT, 'packages', 'discord-ts-selfbot');
const DIRS = [path.join(PKG, 'src'), path.join(PKG, 'typings')];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
    } else if (entry.name.endsWith('.ts')) {
      out.push(fullPath);
    }
  }
  return out;
}

const files = DIRS.flatMap((dir) => walk(dir));
let any = 0;
let casts = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf-8').replaceAll(/\/\*[\s\S]*?\*\//gu, '');
  for (const line of text.split('\n')) {
    const code = line.replace(/\/\/.*$/u, '');
    if (/: any\b|\bas any\b|\bany\[\]/u.test(code)) {
      any += 1;
    }
    if (/\bas\s+(?!const\b)[A-Za-z_{([]/u.test(code)) {
      casts += 1;
    }
  }
}

const result = { any, casts, files: files.length };
const args = new Set(process.argv.slice(2));

if (args.has('--write')) {
  writeFileSync(path.join(ROOT, 'tools/typesafety/baseline.txt'), `${any}\n`);
  writeFileSync(
    path.join(ROOT, 'tools/typesafety/casts-baseline.txt'),
    `${casts}\n`
  );
}

if (args.has('--check')) {
  const anyBaseline = Number(
    readFileSync(
      path.join(ROOT, 'tools/typesafety/baseline.txt'),
      'utf-8'
    ).trim()
  );
  const castsBaseline = Number(
    readFileSync(
      path.join(ROOT, 'tools/typesafety/casts-baseline.txt'),
      'utf-8'
    ).trim()
  );
  if (any > anyBaseline) {
    console.error(`any count increased: ${any} > ${anyBaseline}`);
    process.exit(1);
  }
  if (casts > castsBaseline) {
    console.error(`cast count increased: ${casts} > ${castsBaseline}`);
    process.exit(1);
  }
}

console.log(JSON.stringify(result, null, 2));
