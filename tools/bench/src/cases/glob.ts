import { globSync } from 'node:fs';
import type { BenchCase, BenchContext } from '../types';

export function createGlobCases(ctx: BenchContext): BenchCase[] {
  return [
    {
      id: 'glob.ts',
      group: 'glob',
      label: 'find all .ts files',
      iterations: 10,
      node: () =>
        globSync('**/*.ts', {
          cwd: ctx.repoRoot,
          exclude: ['**/node_modules/**', '**/.git/**'],
        }).length,
      bun: async () => {
        let count = 0;
        for await (const path of new Bun.Glob('**/*.ts').scan({ cwd: ctx.repoRoot })) {
          void path;
          count++;
        }
        return count;
      },
    },
  ];
}
