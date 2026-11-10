import { WebSocket as WS } from 'ws';
import type { BenchCase, BenchContext } from '../types';

type Send = () => Promise<void>;

const sockets: Array<{ close: () => void }> = [];

function connectNode(url: string, payload: string): Promise<Send> {
  return new Promise((resolve, reject) => {
    const socket = new WS(url);
    sockets.push(socket);
    socket.once('error', reject);
    socket.once('open', () => {
      let pending: (() => void) | null = null;
      socket.on('message', () => {
        const done = pending;
        pending = null;
        done?.();
      });
      resolve(
        () =>
          new Promise<void>((done, fail) => {
            const timer = setTimeout(() => {
              pending = null;
              fail(new Error('ws echo timeout'));
            }, 5_000);
            pending = () => {
              clearTimeout(timer);
              done();
            };
            socket.send(payload);
          }),
      );
    });
  });
}

function connectBun(url: string, payload: string): Promise<Send> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    sockets.push(socket as unknown as { close: () => void });
    socket.onerror = () => reject(new Error('ws error'));
    socket.onopen = () => {
      let pending: (() => void) | null = null;
      socket.onmessage = () => {
        const done = pending;
        pending = null;
        done?.();
      };
      resolve(
        () =>
          new Promise<void>((done, fail) => {
            const timer = setTimeout(() => {
              pending = null;
              fail(new Error('ws echo timeout'));
            }, 5_000);
            pending = () => {
              clearTimeout(timer);
              done();
            };
            socket.send(payload);
          }),
      );
    };
  });
}

export function closeWsSockets(): void {
  for (const socket of sockets) socket.close();
  sockets.length = 0;
}

export function createWsCases(ctx: BenchContext): BenchCase[] {
  const small = 'x'.repeat(64);
  const medium = 'x'.repeat(1024);
  let nodeSmall: Promise<Send> | null = null;
  let bunSmall: Promise<Send> | null = null;
  let nodeMedium: Promise<Send> | null = null;
  let bunMedium: Promise<Send> | null = null;

  const node = (slot: 'small' | 'medium') => {
    if (slot === 'small') nodeSmall ??= connectNode(ctx.wsUrl, small);
    else nodeMedium ??= connectNode(ctx.wsUrl, medium);
    return (slot === 'small' ? nodeSmall : nodeMedium)!.then(send => send());
  };
  const bun = (slot: 'small' | 'medium') => {
    if (slot === 'small') bunSmall ??= connectBun(ctx.wsUrl, small);
    else bunMedium ??= connectBun(ctx.wsUrl, medium);
    return (slot === 'small' ? bunSmall : bunMedium)!.then(send => send());
  };

  return [
    {
      id: 'ws.echo.64b',
      group: 'websocket',
      label: 'echo 64 B',
      bytes: 64,
      iterations: 5000,
      node: () => node('small'),
      bun: () => bun('small'),
    },
    {
      id: 'ws.echo.1k',
      group: 'websocket',
      label: 'echo 1 KiB',
      bytes: 1024,
      iterations: 3000,
      node: () => node('medium'),
      bun: () => bun('medium'),
    },
  ];
}
