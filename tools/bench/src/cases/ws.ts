import { WebSocket as WS } from "ws";

import type { BenchCase, BenchContext } from "../types";

type Send = () => Promise<void>;

interface PendingState {
  pending: (() => void) | null;
}

const sockets: { close: () => void }[] = [];

function createSend(
  socket: { send: (data: string) => void },
  payload: string,
  state: PendingState
): Send {
  return () => {
    const { promise, reject, resolve } = Promise.withResolvers<undefined>();
    const timer = setTimeout(() => {
      state.pending = null;
      reject(new Error("ws echo timeout"));
    }, 5000);
    state.pending = () => {
      clearTimeout(timer);
      resolve(undefined);
    };
    socket.send(payload);
    return promise;
  };
}

function connectNode(url: string, payload: string): Promise<Send> {
  const { promise, reject, resolve } = Promise.withResolvers<Send>();
  const socket = new WS(url);
  sockets.push(socket);
  socket.once("error", reject);
  socket.once("open", () => {
    const state: PendingState = { pending: null };
    socket.on("message", () => {
      const done = state.pending;
      state.pending = null;
      done?.();
    });
    resolve(createSend(socket, payload, state));
  });
  return promise;
}

function connectBun(url: string, payload: string): Promise<Send> {
  const { promise, reject, resolve } = Promise.withResolvers<Send>();
  const socket = new WebSocket(url);
  sockets.push(socket as unknown as { close: () => void });
  socket.addEventListener("error", () => reject(new Error("ws error")));
  socket.addEventListener("open", () => {
    const state: PendingState = { pending: null };
    socket.addEventListener("message", () => {
      const done = state.pending;
      state.pending = null;
      done?.();
    });
    resolve(createSend(socket, payload, state));
  });
  return promise;
}

export function closeWsSockets(): void {
  for (const socket of sockets) {
    socket.close();
  }
  sockets.length = 0;
}

export function createWsCases(ctx: BenchContext): BenchCase[] {
  const small = "x".repeat(64);
  const medium = "x".repeat(1024);
  let nodeSmall: Promise<Send> | null = null;
  let bunSmall: Promise<Send> | null = null;
  let nodeMedium: Promise<Send> | null = null;
  let bunMedium: Promise<Send> | null = null;

  const node = (slot: "small" | "medium") => {
    const connection =
      slot === "small"
        ? (nodeSmall ??= connectNode(ctx.wsUrl, small))
        : (nodeMedium ??= connectNode(ctx.wsUrl, medium));
    return connection.then((send) => send());
  };
  const bun = (slot: "small" | "medium") => {
    const connection =
      slot === "small"
        ? (bunSmall ??= connectBun(ctx.wsUrl, small))
        : (bunMedium ??= connectBun(ctx.wsUrl, medium));
    return connection.then((send) => send());
  };

  return [
    {
      bun: () => bun("small"),
      bytes: 64,
      group: "websocket",
      id: "ws.echo.64b",
      iterations: 5000,
      label: "echo 64 B",
      node: () => node("small"),
    },
    {
      bun: () => bun("medium"),
      bytes: 1024,
      group: "websocket",
      id: "ws.echo.1k",
      iterations: 3000,
      label: "echo 1 KiB",
      node: () => node("medium"),
    },
  ];
}
