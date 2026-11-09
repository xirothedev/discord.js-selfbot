import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const PKG = join(ROOT, 'packages', 'discord-ts-selfbot');
const DIRS = [join(PKG, 'src'), join(PKG, 'typings')];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (entry.name.endsWith('.ts')) out.push(path);
  }
  return out;
}

const files = DIRS.flatMap((dir) => walk(dir));
let any = 0;
let casts = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const line of text.split('\n')) {
    const code = line.replace(/\/\/.*$/, '');
    if (/: any\b|\bas any\b|\bany\[\]/.test(code)) any++;
    if (/\bas\s+(?!const\b)[A-Za-z_{([]/.test(code)) casts++;
  }
}

const result = { files: files.length, any, casts };
const args = process.argv.slice(2);

if (args.includes('--write')) {
  writeFileSync(join(ROOT, 'tools/typesafety/baseline.txt'), `${any}\n`);
  writeFileSync(join(ROOT, 'tools/typesafety/casts-baseline.txt'), `${casts}\n`);
}

if (args.includes('--check')) {
  const anyBaseline = Number(readFileSync(join(ROOT, 'tools/typesafety/baseline.txt'), 'utf8').trim());
  const castsBaseline = Number(readFileSync(join(ROOT, 'tools/typesafety/casts-baseline.txt'), 'utf8').trim());
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
