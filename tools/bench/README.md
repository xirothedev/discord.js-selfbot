# Benchmarks

This private workspace compares the Node API with the Bun API for the calls this
monorepo actually uses. It is a decision tool, not a performance gate.

## Run

From the repository root:

```sh
bun run bench
bun run bench -- --filter http
bun run bench -- --rounds 9 --json tools/bench/results/latest.json
```

Run the same file with a canary binary:

```sh
/path/to/bun-canary tools/bench/src/index.ts --markdown tools/bench/results/canary.md
```

## What it measures

- Files: `fs.promises.readFile` vs `Bun.file().bytes()`, write, copy.
- Crypto: `node:crypto` SHA-256 vs `Bun.CryptoHasher`, `node:zlib` vs
  `Bun.gzipSync`/`gunzipSync`, UUID.
- Process: `child_process` vs `Bun.spawn`, timers vs `Bun.sleep`.
- Glob: `fs.globSync` vs `Bun.Glob`.
- HTTP: `undici` fetch vs global `fetch`, small and large bodies, concurrency,
  and multipart upload.
- WebSocket: `ws` echo vs global `WebSocket` echo.
- Voice: `node:crypto` AES-GCM per packet vs WebCrypto AES-GCM per packet.

## Read the result

The `Bun/Node` column is the throughput ratio. `1.00` means no difference. Run
on the same machine and the same runtime. Compare stable and canary in separate
runs. A win below 5% is noise for this harness.
