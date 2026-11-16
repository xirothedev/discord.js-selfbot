import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { SOURCE_PACKAGE, TARGET_PACKAGE } from './rename-map';

export const USAGE = `Usage: discord-selfbot-codemod upgrade [paths...] [options]
       discord-selfbot-codemod list

Upgrade a user project from ${SOURCE_PACKAGE} to ${TARGET_PACKAGE}.

Options:
  --write                 apply changes (default: dry-run with diff)
  --json                  machine-readable report on stdout
  --extensions=<list>     comma-separated (default: js,cjs,mjs,ts,tsx,mts,jsx)
  --ignore-pattern=<g>    repeatable gitignore-style pattern
  --ignore-config=<file>  repeatable file of patterns
  --rule=<id>             repeatable: run only these rules (markers always run)
  --no-modernize          skip modernization-tier rewrites
  --esm                   convert require() to import and set "type": "module"
  --force                 write even without a clean git tree
  --no-fail-on-error      do not exit 1 on per-file errors
  --exit-code             exit 1 when files would change (CI check)
`;

export interface CliOptions {
  readonly command: 'upgrade' | 'list';
  readonly paths: readonly string[];
  readonly write: boolean;
  readonly json: boolean;
  readonly extensions: readonly string[];
  readonly ignorePatterns: readonly string[];
  readonly only: readonly string[] | undefined;
  readonly modernize: boolean;
  readonly esm: boolean;
  readonly force: boolean;
  readonly failOnError: boolean;
  readonly exitCode: boolean;
}

function commandFor(argv: readonly string[]): CliOptions['command'] {
  return argv[0] === 'list' ? 'list' : 'upgrade';
}

export function parseCli(argv: readonly string[]): CliOptions {
  const command = commandFor(argv);
  let args: readonly string[] = argv;
  if (command === 'list') {
    args = [];
  } else if (argv[0] === 'upgrade') {
    args = argv.slice(1);
  }
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    args: [...args],
    options: {
      esm: { default: false, type: 'boolean' },
      'exit-code': { default: false, type: 'boolean' },
      extensions: { default: 'js,cjs,mjs,ts,tsx,mts,jsx', type: 'string' },
      force: { default: false, type: 'boolean' },
      help: { default: false, type: 'boolean' },
      'ignore-config': { multiple: true, type: 'string' },
      'ignore-pattern': { multiple: true, type: 'string' },
      json: { default: false, type: 'boolean' },
      'no-fail-on-error': { default: false, type: 'boolean' },
      'no-modernize': { default: false, type: 'boolean' },
      rule: { multiple: true, type: 'string' },
      write: { default: false, type: 'boolean' },
    },
  });
  if (values.help) {
    process.stdout.write(USAGE);
    process.exit(0);
  }
  const ignorePatterns = [...(values['ignore-pattern'] ?? [])];
  for (const file of values['ignore-config'] ?? []) {
    ignorePatterns.push(
      ...readFileSync(file, 'utf-8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '' && !line.startsWith('#'))
    );
  }
  return {
    command,
    esm: values.esm ?? false,
    exitCode: values['exit-code'] ?? false,
    extensions: (values.extensions ?? '').split(',').filter(Boolean),
    failOnError: !(values['no-fail-on-error'] ?? false),
    force: values.force ?? false,
    ignorePatterns,
    json: values.json ?? false,
    modernize: !(values['no-modernize'] ?? false),
    only: values.rule && values.rule.length > 0 ? values.rule : undefined,
    paths: positionals.length > 0 ? positionals : ['.'],
    write: values.write ?? false,
  };
}
