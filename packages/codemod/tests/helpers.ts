import { runRulesOnSource } from '../src/engine';
import type { FileOutcome } from '../src/engine';
import { rulesFor } from '../src/rules';

export interface UpgradeOptions {
  readonly modernize?: boolean;
  readonly esm?: boolean;
  readonly only?: readonly string[];
}

export function upgrade(
  source: string,
  path = 'src/index.ts',
  options: UpgradeOptions = {}
): FileOutcome {
  return runRulesOnSource(
    { path, source },
    rulesFor({
      esm: options.esm ?? false,
      modernize: options.modernize ?? true,
      only: options.only,
    }),
    {}
  );
}

export function output(
  source: string,
  path = 'src/index.ts',
  options: UpgradeOptions = {}
): string {
  const result = upgrade(source, path, options);
  if (result.status === 'error') {
    throw new Error(`${result.path}: ${result.error}`);
  }
  return result.output;
}

export function expectIdempotent(
  source: string,
  path = 'src/index.ts',
  options: UpgradeOptions = {}
): void {
  const first = output(source, path, options);
  const second = upgrade(first, path, options);
  if (second.status !== 'nochange') {
    throw new Error(`not idempotent, second run produced:\n${second.output}`);
  }
}
