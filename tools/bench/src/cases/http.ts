import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { FormData as UndiciFormData, fetch as undiciFetch } from "undici";

import type { BenchCase, BenchContext } from "../types";

const ONE_K = 1024;
const ONE_M = 1024 * 1024;
const BATCH = 50;

export function createHttpCases(ctx: BenchContext): BenchCase[] {
  const oneMFile = join(ctx.dir, "one-m.bin");
  const small = ctx.url("/small");
  const big = ctx.url("/big");
  const upload = ctx.url("/upload");

  const getSmallNode = async () =>
    (await (await undiciFetch(small)).arrayBuffer()).byteLength;
  const getSmallBun = async () =>
    (await (await fetch(small)).arrayBuffer()).byteLength;
  const getBigNode = async () =>
    (await (await undiciFetch(big)).arrayBuffer()).byteLength;
  const getBigBun = async () =>
    (await (await fetch(big)).arrayBuffer()).byteLength;

  return [
    {
      bun: getSmallBun,
      bytes: ONE_K,
      group: "http",
      id: "http.get.1k",
      iterations: 500,
      label: "GET 1 KiB body",
      node: getSmallNode,
    },
    {
      bun: getBigBun,
      bytes: ONE_M,
      group: "http",
      id: "http.get.1m",
      iterations: 100,
      label: "GET 1 MiB body",
      node: getBigNode,
    },
    {
      bun: async () => {
        const responses = await Promise.all(
          Array.from({ length: BATCH }, () => fetch(small))
        );
        const bodies = await Promise.all(
          responses.map((response) => response.arrayBuffer())
        );
        return bodies.reduce((total, body) => total + body.byteLength, 0);
      },
      bytes: ONE_K * BATCH,
      group: "http",
      id: "http.get.1k.x50",
      iterations: 20,
      label: "GET 1 KiB, 50 parallel",
      node: async () => {
        const responses = await Promise.all(
          Array.from({ length: BATCH }, () => undiciFetch(small))
        );
        const bodies = await Promise.all(
          responses.map((response) => response.arrayBuffer())
        );
        return bodies.reduce((total, body) => total + body.byteLength, 0);
      },
    },
    {
      bun: async () => {
        const form = new FormData();
        form.append("files[0]", Bun.file(oneMFile), "one-m.bin");
        form.append("payload_json", "{}");
        return (await fetch(upload, { body: form, method: "POST" })).text();
      },
      bytes: ONE_M,
      group: "http",
      id: "http.upload.1m",
      iterations: 30,
      label: "multipart upload 1 MiB",
      node: async () => {
        const data = await readFile(oneMFile);
        const form = new UndiciFormData();
        form.set("files[0]", new Blob([data]), "one-m.bin");
        form.append("payload_json", "{}");
        return (
          await undiciFetch(upload, { body: form as never, method: "POST" })
        ).text();
      },
    },
    {
      bun: async () => {
        const form = new FormData();
        form.append("files[0]", Bun.file(ctx.uploadFile), "five-m.bin");
        form.append("payload_json", "{}");
        return (await fetch(upload, { body: form, method: "POST" })).text();
      },
      bytes: 5 * ONE_M,
      group: "http",
      id: "http.upload.5m",
      iterations: 10,
      label: "multipart upload 5 MiB",
      node: async () => {
        const data = await readFile(ctx.uploadFile);
        const form = new UndiciFormData();
        form.set("files[0]", new Blob([data]), "five-m.bin");
        form.append("payload_json", "{}");
        return (
          await undiciFetch(upload, { body: form as never, method: "POST" })
        ).text();
      },
    },
  ];
}
