import { createHash, randomUUID } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';

import type { BenchCase } from '../types';

const SIXTY_FOUR_B = 64;
const SIXTY_FOUR_K = 64 * 1024;
const ONE_M = 1024 * 1024;

export function createCryptoCases(): BenchCase[] {
  const tiny = Buffer.alloc(SIXTY_FOUR_B, 5);
  const small = Buffer.alloc(SIXTY_FOUR_K, 6);
  const large = Buffer.alloc(ONE_M, 7);
  const gzipped = gzipSync(large);

  return [
    {
      bun: () => Bun.CryptoHasher.hash('sha256', tiny, 'base64'),
      bytes: SIXTY_FOUR_B,
      group: 'crypto',
      id: 'crypto.sha256.64b',
      iterations: 20_000,
      label: 'SHA-256 64 B',
      node: () => createHash('sha256').update(tiny).digest('base64'),
    },
    {
      bun: () => Bun.CryptoHasher.hash('sha256', small, 'base64'),
      bytes: SIXTY_FOUR_K,
      group: 'crypto',
      id: 'crypto.sha256.64k',
      iterations: 2000,
      label: 'SHA-256 64 KiB',
      node: () => createHash('sha256').update(small).digest('base64'),
    },
    {
      bun: () => Bun.CryptoHasher.hash('sha256', large, 'base64'),
      bytes: ONE_M,
      group: 'crypto',
      id: 'crypto.sha256.1m',
      iterations: 200,
      label: 'SHA-256 1 MiB',
      node: () => createHash('sha256').update(large).digest('base64'),
    },
    {
      bun: () => Bun.gzipSync(large),
      bytes: ONE_M,
      group: 'crypto',
      id: 'crypto.gzip.1m',
      iterations: 100,
      label: 'gzip 1 MiB',
      node: () => gzipSync(large),
    },
    {
      bun: () => Bun.gunzipSync(gzipped),
      bytes: ONE_M,
      group: 'crypto',
      id: 'crypto.gunzip.1m',
      iterations: 100,
      label: 'gunzip 1 MiB',
      node: () => gunzipSync(gzipped),
    },
    {
      bun: () => crypto.randomUUID(),
      group: 'crypto',
      id: 'crypto.uuid',
      iterations: 50_000,
      label: 'UUID v4',
      node: () => randomUUID(),
    },
  ];
}
