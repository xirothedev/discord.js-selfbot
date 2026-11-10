import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { BenchCase, BenchContext } from '../types';

const ONE_K = 1024;
const SIXTY_FOUR_K = 64 * 1024;
const ONE_M = 1024 * 1024;

export function createFsCases(ctx: BenchContext): BenchCase[] {
  const oneK = path.join(ctx.dir, 'one-k.bin');
  const sixtyFourK = path.join(ctx.dir, 'sixty-four-k.bin');
  const oneM = path.join(ctx.dir, 'one-m.bin');
  const nodeWriteOneK = path.join(ctx.dir, 'node-write-one-k.bin');
  const bunWriteOneK = path.join(ctx.dir, 'bun-write-one-k.bin');
  const nodeWriteOneM = path.join(ctx.dir, 'node-write-one-m.bin');
  const bunWriteOneM = path.join(ctx.dir, 'bun-write-one-m.bin');
  const nodeCopy = path.join(ctx.dir, 'node-copy.bin');
  const bunCopy = path.join(ctx.dir, 'bun-copy.bin');
  const oneKWrite = Buffer.alloc(ONE_K, 1);
  const oneMWrite = Buffer.alloc(ONE_M, 1);

  return [
    {
      bun: () => Bun.file(oneK).bytes(),
      bytes: ONE_K,
      group: 'filesystem',
      id: 'fs.read.1k',
      iterations: 5000,
      label: 'read 1 KiB',
      node: () => readFile(oneK),
    },
    {
      bun: () => Bun.file(sixtyFourK).bytes(),
      bytes: SIXTY_FOUR_K,
      group: 'filesystem',
      id: 'fs.read.64k',
      iterations: 2000,
      label: 'read 64 KiB',
      node: () => readFile(sixtyFourK),
    },
    {
      bun: () => Bun.file(oneM).bytes(),
      bytes: ONE_M,
      group: 'filesystem',
      id: 'fs.read.1m',
      iterations: 300,
      label: 'read 1 MiB',
      node: () => readFile(oneM),
    },
    {
      bun: () => Bun.write(bunWriteOneK, oneKWrite),
      bytes: ONE_K,
      group: 'filesystem',
      id: 'fs.write.1k',
      iterations: 1000,
      label: 'write 1 KiB',
      node: () => writeFile(nodeWriteOneK, oneKWrite),
    },
    {
      bun: () => Bun.write(bunWriteOneM, oneMWrite),
      bytes: ONE_M,
      group: 'filesystem',
      id: 'fs.write.1m',
      iterations: 200,
      label: 'write 1 MiB',
      node: () => writeFile(nodeWriteOneM, oneMWrite),
    },
    {
      bun: () => Bun.write(bunCopy, Bun.file(oneM)),
      bytes: ONE_M,
      group: 'filesystem',
      id: 'fs.copy.1m',
      iterations: 200,
      label: 'copy 1 MiB',
      node: () => copyFile(oneM, nodeCopy),
    },
  ];
}
