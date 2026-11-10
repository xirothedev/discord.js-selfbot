import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { BenchContext } from "./types";

const ONE_K = 1024;
const ONE_M = 1024 * 1024;

export function createContext(): BenchContext {
  const dir = mkdtempSync(join(tmpdir(), "discord-ts-selfbot-bench-"));
  const repoRoot = join(import.meta.dir, "..", "..", "..");
  const small = Buffer.alloc(ONE_K, 1);
  const medium = Buffer.alloc(64 * ONE_K, 2);
  const large = Buffer.alloc(ONE_M, 3);
  const upload = Buffer.alloc(5 * ONE_M, 4);

  writeFileSync(join(dir, "one-k.bin"), small);
  writeFileSync(join(dir, "sixty-four-k.bin"), medium);
  writeFileSync(join(dir, "one-m.bin"), large);
  writeFileSync(join(dir, "five-m.bin"), upload);

  const bigResponse = large;
  const server = Bun.serve({
    async fetch(request, instance) {
      const path = new URL(request.url).pathname;
      if (path === "/ws") {
        if (instance.upgrade(request)) {
          return undefined as never;
        }
        return new Response("upgrade failed", { status: 400 });
      }
      if (path === "/upload") {
        const body = await request.arrayBuffer();
        return new Response(String(body.byteLength));
      }
      if (path === "/big") {
        return new Response(bigResponse);
      }
      if (path === "/small") {
        return new Response("ok");
      }
      return new Response("not found", { status: 404 });
    },
    maxRequestBodySize: 64 * ONE_M,
    port: 0,
    websocket: {
      message(ws, message) {
        ws.send(message);
      },
    },
  });

  const origin = `http://127.0.0.1:${server.port}`;
  return {
    dir,
    origin,
    repoRoot,
    stop: async () => {
      await server.stop(true);
    },
    uploadFile: join(dir, "five-m.bin"),
    url: (path) => `${origin}${path}`,
    wsUrl: `ws://127.0.0.1:${server.port}/ws`,
  };
}
