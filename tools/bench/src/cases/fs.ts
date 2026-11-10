import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { BenchCase, BenchContext } from '../types';

const ONE_K = 1024;
const SIXTY_FOUR_K = 64 * 1024;
const ONE_M = 1024 * 1024;

export function createFsCases(ctx: BenchContext): BenchCase[] {
  const oneK = join(ctx.dir, 'one-k.bin');
  const sixtyFourK = join(ctx.dir, 'sixty-four-k.bin');
  const oneM = join(ctx.dir, 'one-m.bin');
  const nodeWriteOneK = join(ctx.dir, 'node-write-one-k.bin');
  const bunWriteOneK = join(ctx.dir, 'bun-write-one-k.bin');
  const nodeWriteOneM = join(ctx.dir, 'node-write-one-m.bin');
  const bunWriteOneM = join(ctx.dir, 'bun-write-one-m.bin');
  const nodeCopy = join(ctx.dir, 'node-copy.bin');
  const bunCopy = join(ctx.dir, 'bun-copy.bin');
  const oneKWrite = Buffer.alloc(ONE_K, 1);
  const oneMWrite = Buffer.alloc(ONE_M, 1);

  return [
    {
      id: 'fs.read.1k',
      group: 'filesystem',
      label: 'read 1 KiB',
      bytes: ONE_K,
      iterations: 5000,
      node: () => readFile(oneK),
      bun: () => Bun.file(oneK).bytes(),
    },
    {
      id: 'fs.read.64k',
      group: 'filesystem',
      label: 'read 64 KiB',
      bytes: SIXTY_FOUR_K,
      iterations: 2000,
      node: () => readFile(sixtyFourK),
      bun: () => Bun.file(sixtyFourK).bytes(),
    },
    {
      id: 'fs.read.1m',
      group: 'filesystem',
      label: 'read 1 MiB',
      bytes: ONE_M,
      iterations: 300,
      node: () => readFile(oneM),
      bun: () => Bun.file(oneM).bytes(),
    },
    {
      id: 'fs.write.1k',
      group: 'filesystem',
      label: 'write 1 KiB',
      bytes: ONE_K,
      iterations: 1000,
      node: () => writeFile(nodeWriteOneK, oneKWrite),
      bun: () => Bun.write(bunWriteOneK, oneKWrite),
    },
    {
      id: 'fs.write.1m',
      group: 'filesystem',
      label: 'write 1 MiB',
      bytes: ONE_M,
      iterations: 200,
      node: () => writeFile(nodeWriteOneM, oneMWrite),
      bun: () => Bun.write(bunWriteOneM, oneMWrite),
    },
    {
      id: 'fs.copy.1m',
      group: 'filesystem',
      label: 'copy 1 MiB',
      bytes: ONE_M,
      iterations: 200,
      node: () => copyFile(oneM, nodeCopy),
      bun: () => Bun.write(bunCopy, Bun.file(oneM)),
    },
  ];
}
