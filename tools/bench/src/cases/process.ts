import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

import type { BenchCase } from '../types';

const TRUE = '/usr/bin/true';

export function createProcessCases(): BenchCase[] {
  return [
    {
      bun: () => Bun.spawnSync({ cmd: [TRUE] }).exitCode,
      group: 'process',
      id: 'process.spawnSync',
      iterations: 30,
      label: 'spawn process sync',
      node: () => spawnSync(TRUE).status ?? 0,
    },
    {
      bun: () => Bun.spawn({ cmd: [TRUE] }).exited,
      group: 'process',
      id: 'process.spawn',
      iterations: 30,
      label: 'spawn process async',
      node: () => {
        const { promise, reject, resolve } = Promise.withResolvers<number>();
        const child = spawn(TRUE);
        child.on('exit', (code: number | null) => resolve(code ?? 0));
        child.on('error', (error: Error) => reject(error));
        return promise;
      },
    },
    {
      bun: () => Bun.sleep(0),
      group: 'process',
      id: 'process.sleep.0',
      iterations: 2000,
      label: 'sleep 0 ms',
      node: () => sleep(0),
    },
    {
      bun: () => Bun.sleep(1),
      group: 'process',
      id: 'process.sleep.1',
      iterations: 200,
      label: 'sleep 1 ms',
      node: () => sleep(1),
    },
  ];
}
