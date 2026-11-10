import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FormData as UndiciFormData, fetch as undiciFetch } from 'undici';
import type { BenchCase, BenchContext } from '../types';

const ONE_K = 1024;
const ONE_M = 1024 * 1024;
const BATCH = 50;

export function createHttpCases(ctx: BenchContext): BenchCase[] {
  const oneMFile = join(ctx.dir, 'one-m.bin');
  const small = ctx.url('/small');
  const big = ctx.url('/big');
  const upload = ctx.url('/upload');

  const getSmallNode = async () => (await (await undiciFetch(small)).arrayBuffer()).byteLength;
  const getSmallBun = async () => (await (await fetch(small)).arrayBuffer()).byteLength;
  const getBigNode = async () => (await (await undiciFetch(big)).arrayBuffer()).byteLength;
  const getBigBun = async () => (await (await fetch(big)).arrayBuffer()).byteLength;

  return [
    {
      id: 'http.get.1k',
      group: 'http',
      label: 'GET 1 KiB body',
      bytes: ONE_K,
      iterations: 500,
      node: getSmallNode,
      bun: getSmallBun,
    },
    {
      id: 'http.get.1m',
      group: 'http',
      label: 'GET 1 MiB body',
      bytes: ONE_M,
      iterations: 100,
      node: getBigNode,
      bun: getBigBun,
    },
    {
      id: 'http.get.1k.x50',
      group: 'http',
      label: 'GET 1 KiB, 50 parallel',
      bytes: ONE_K * BATCH,
      iterations: 20,
      node: async () => {
        const responses = await Promise.all(Array.from({ length: BATCH }, () => undiciFetch(small)));
        const bodies = await Promise.all(responses.map(response => response.arrayBuffer()));
        return bodies.reduce((total, body) => total + body.byteLength, 0);
      },
      bun: async () => {
        const responses = await Promise.all(Array.from({ length: BATCH }, () => fetch(small)));
        const bodies = await Promise.all(responses.map(response => response.arrayBuffer()));
        return bodies.reduce((total, body) => total + body.byteLength, 0);
      },
    },
    {
      id: 'http.upload.1m',
      group: 'http',
      label: 'multipart upload 1 MiB',
      bytes: ONE_M,
      iterations: 30,
      node: async () => {
        const data = await readFile(oneMFile);
        const form = new UndiciFormData();
        form.set('files[0]', new Blob([data]), 'one-m.bin');
        form.append('payload_json', '{}');
        return (await undiciFetch(upload, { method: 'POST', body: form as never })).text();
      },
      bun: async () => {
        const form = new FormData();
        form.append('files[0]', Bun.file(oneMFile), 'one-m.bin');
        form.append('payload_json', '{}');
        return (await fetch(upload, { method: 'POST', body: form })).text();
      },
    },
    {
      id: 'http.upload.5m',
      group: 'http',
      label: 'multipart upload 5 MiB',
      bytes: 5 * ONE_M,
      iterations: 10,
      node: async () => {
        const data = await readFile(ctx.uploadFile);
        const form = new UndiciFormData();
        form.set('files[0]', new Blob([data]), 'five-m.bin');
        form.append('payload_json', '{}');
        return (await undiciFetch(upload, { method: 'POST', body: form as never })).text();
      },
      bun: async () => {
        const form = new FormData();
        form.append('files[0]', Bun.file(ctx.uploadFile), 'five-m.bin');
        form.append('payload_json', '{}');
        return (await fetch(upload, { method: 'POST', body: form })).text();
      },
    },
  ];
}
