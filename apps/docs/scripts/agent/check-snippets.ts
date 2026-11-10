import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const docsDir = path.resolve(import.meta.dir, '../..');
const packageDir = path.resolve(docsDir, '../../packages/discord-ts-selfbot');
const agentDocs = path.join(packageDir, 'docs');

function walk(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

interface Snippet {
  file: string;
  index: number;
  code: string;
}

function collect(): Snippet[] {
  const snippets: Snippet[] = [];

  for (const file of walk(agentDocs)) {
    const relative = path.relative(agentDocs, file).replaceAll(path.sep, '/');
    const lines = readFileSync(file, 'utf-8').split('\n');
    let inFence = false;
    let info = '';
    let buffer: string[] = [];
    let index = 0;

    for (const line of lines) {
      const open = line.match(/^\s*```(?<info>\S.*)?$/u);
      if (!inFence && open) {
        inFence = true;
        info = (open[1] ?? '').trim();
        buffer = [];
        continue;
      }

      if (inFence && /^\s*```\s*$/u.test(line)) {
        const marked = info.startsWith('ts check');
        const example =
          relative.startsWith('examples/') && info.startsWith('ts');
        if ((marked || example) && buffer.length) {
          index += 1;
          snippets.push({ code: buffer.join('\n'), file: relative, index });
        }
        inFence = false;
        continue;
      }

      if (inFence) {
        buffer.push(line);
      }
    }
  }

  return snippets;
}

function main(): void {
  const snippets = collect();
  if (!snippets.length) {
    console.log('No snippets to check.');
    return;
  }

  const cache = path.join(docsDir, 'node_modules/.cache');
  mkdirSync(cache, { recursive: true });
  const temp = mkdtempSync(path.join(cache, 'snippets-'));
  try {
    const config = {
      compilerOptions: {
        baseUrl: packageDir,
        esModuleInterop: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        noEmit: true,
        paths: {
          'discord-ts-selfbot': ['typings/index.d.ts'],
        },
        skipLibCheck: true,
        strict: true,
        target: 'ES2022',
        types: ['bun'],
      },
      include: [path.join(temp, '*.ts')],
    };
    writeFileSync(
      path.join(temp, 'tsconfig.json'),
      JSON.stringify(config, null, 2)
    );

    for (const snippet of snippets) {
      const name = `${snippet.file.replaceAll('/', '__').replace(/\.md$/u, '')}-${snippet.index}.ts`;
      writeFileSync(path.join(temp, name), `${snippet.code}\n`);
    }

    const tsc = Bun.resolveSync('typescript/bin/tsc', docsDir);
    const result = Bun.spawnSync({
      cmd: ['bun', tsc, '-p', path.join(temp, 'tsconfig.json')],
      cwd: packageDir,
      stderr: 'pipe',
      stdout: 'pipe',
    });

    if (result.exitCode !== 0) {
      const output =
        new TextDecoder().decode(result.stdout) +
        new TextDecoder().decode(result.stderr);
      console.error(output.trim());
      console.error(
        `\n${snippets.length} snippets checked; type errors found.`
      );
      process.exitCode = 1;
      return;
    }

    console.log(`${snippets.length} snippets type-check.`);
  } finally {
    rmSync(temp, { force: true, recursive: true });
  }
}

if (import.meta.main) {
  main();
}
