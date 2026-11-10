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
      id: 'crypto.sha256.64b',
      group: 'crypto',
      label: 'SHA-256 64 B',
      bytes: SIXTY_FOUR_B,
      iterations: 20000,
      node: () => createHash('sha256').update(tiny).digest('base64'),
      bun: () => Bun.CryptoHasher.hash('sha256', tiny, 'base64'),
    },
    {
      id: 'crypto.sha256.64k',
      group: 'crypto',
      label: 'SHA-256 64 KiB',
      bytes: SIXTY_FOUR_K,
      iterations: 2000,
      node: () => createHash('sha256').update(small).digest('base64'),
      bun: () => Bun.CryptoHasher.hash('sha256', small, 'base64'),
    },
    {
      id: 'crypto.sha256.1m',
      group: 'crypto',
      label: 'SHA-256 1 MiB',
      bytes: ONE_M,
      iterations: 200,
      node: () => createHash('sha256').update(large).digest('base64'),
      bun: () => Bun.CryptoHasher.hash('sha256', large, 'base64'),
    },
    {
      id: 'crypto.gzip.1m',
      group: 'crypto',
      label: 'gzip 1 MiB',
      bytes: ONE_M,
      iterations: 100,
      node: () => gzipSync(large),
      bun: () => Bun.gzipSync(large),
    },
    {
      id: 'crypto.gunzip.1m',
      group: 'crypto',
      label: 'gunzip 1 MiB',
      bytes: ONE_M,
      iterations: 100,
      node: () => gunzipSync(gzipped),
      bun: () => Bun.gunzipSync(gzipped),
    },
    {
      id: 'crypto.uuid',
      group: 'crypto',
      label: 'UUID v4',
      iterations: 50000,
      node: () => randomUUID(),
      bun: () => crypto.randomUUID(),
    },
  ];
}
