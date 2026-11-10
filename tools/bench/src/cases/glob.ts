import { globSync } from 'node:fs';

import type { BenchCase, BenchContext } from '../types';

export function createGlobCases(ctx: BenchContext): BenchCase[] {
  return [
    {
      bun: async () => {
        let count = 0;
        for await (const path of new Bun.Glob('**/*.ts').scan({
          cwd: ctx.repoRoot,
        })) {
          void path;
          count += 1;
        }
        return count;
      },
      group: 'glob',
      id: 'glob.ts',
      iterations: 10,
      label: 'find all .ts files',
      node: () =>
        globSync('**/*.ts', {
          cwd: ctx.repoRoot,
          exclude: ['**/node_modules/**', '**/.git/**'],
        }).length,
    },
  ];
}
