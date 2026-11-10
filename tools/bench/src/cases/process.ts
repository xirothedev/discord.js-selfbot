import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import type { BenchCase } from '../types';

const TRUE = '/usr/bin/true';

export function createProcessCases(): BenchCase[] {
  return [
    {
      id: 'process.spawnSync',
      group: 'process',
      label: 'spawn process sync',
      iterations: 30,
      node: () => spawnSync(TRUE).status ?? 0,
      bun: () => Bun.spawnSync({ cmd: [TRUE] }).exitCode,
    },
    {
      id: 'process.spawn',
      group: 'process',
      label: 'spawn process async',
      iterations: 30,
      node: () =>
        new Promise<number>((resolve, reject) => {
          const child = spawn(TRUE);
          child.on('exit', code => resolve(code ?? 0));
          child.on('error', reject);
        }),
      bun: () => Bun.spawn({ cmd: [TRUE] }).exited,
    },
    {
      id: 'process.sleep.0',
      group: 'process',
      label: 'sleep 0 ms',
      iterations: 2000,
      node: () => sleep(0),
      bun: () => Bun.sleep(0),
    },
    {
      id: 'process.sleep.1',
      group: 'process',
      label: 'sleep 1 ms',
      iterations: 200,
      node: () => sleep(1),
      bun: () => Bun.sleep(1),
    },
  ];
}
