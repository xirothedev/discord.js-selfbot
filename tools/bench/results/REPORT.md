# Node API vs Bun API: benchmark report

Date: 2026-11-10. Machine: Apple Silicon (darwin arm64). Runtimes:

- Stable: Bun 1.4.4 (`3bf1a0646`)
- Canary: npm `bun@1.4.4-canary.20261109.1`, revision `2596ac5d3`
  (`Bun.version` still reports `1.4.4`)

Raw results:

- `2026-11-10-darwin-arm64-bun-stable.json` and `.md`
- `2026-11-10-darwin-arm64-bun-canary.json` and `.md`

Method: each case runs both APIs in the same process. Both variants get a
warm-up. Rounds alternate the order. The table reports the median time per
operation, then converts it to throughput. The ratio is Bun throughput divided
by Node throughput. `1.00x` means no difference. A 5% band is noise.

## Key results

| Case                   | Stable | Canary | Verdict        |
| ---------------------- | -----: | -----: | -------------- |
| `fs.read.1k`           |  0.94x |  1.00x | Neutral        |
| `fs.read.64k`          |  1.05x |  0.84x | Neutral        |
| `fs.read.1m`           |  1.20x |  0.98x | Neutral        |
| `fs.write.1k`          |  1.60x |  1.54x | Bun wins       |
| `fs.write.1m`          |  0.36x |  0.52x | Node wins      |
| `fs.copy.1m`           |  0.30x |  0.33x | Node wins      |
| `crypto.sha256.64b`    |  1.12x |  1.09x | Neutral        |
| `crypto.sha256.64k`    |  1.02x |  1.00x | Neutral        |
| `crypto.sha256.1m`     |  1.00x |  1.00x | Neutral        |
| `crypto.gzip.1m`       |  1.03x |  1.01x | Neutral        |
| `crypto.gunzip.1m`     |  1.39x |  1.45x | Bun wins       |
| `crypto.uuid`          |  0.98x |  1.08x | Neutral        |
| `process.spawnSync`    |  1.05x |  1.05x | Neutral        |
| `process.spawn`        |  1.09x |  1.16x | Slight Bun win |
| `process.sleep.1`      |  1.00x |  1.00x | Neutral        |
| `glob.ts`              |  1.52x |  1.54x | Bun wins       |
| `http.get.1k`          |  0.97x |  1.05x | Neutral        |
| `http.get.1m`          |  1.09x |  1.00x | Neutral        |
| `http.get.1k.x50`      |  1.04x |  1.01x | Neutral        |
| `http.upload.1m`       |  1.25x |  1.22x | Bun wins       |
| `http.upload.5m`       |  1.30x |  1.06x | Mixed          |
| `ws.echo.64b`          |  1.04x |  0.96x | Neutral        |
| `ws.echo.1k`           |  0.98x |  0.98x | Neutral        |
| `voice.aesgcm.encrypt` |  0.05x |  0.03x | Node wins      |
| `voice.aesgcm.decrypt` |  0.04x |  0.04x | Node wins      |

`process.sleep.0` is omitted from the table. Node clamps a zero timer to about
1 ms; `Bun.sleep(0)` returns at once. The code only sleeps for positive rate
limit and shard delays, so the difference does not apply.

## What this means

1. **The runtime already makes most Node APIs native.** `fs.readFile`,
   `fs.writeFile`, `node:crypto`, `node:zlib`, `undici` fetch, and `ws` run
   through Bun's native code. A `node:` import does not mean a slow path.
2. **Do not swap the transport.** HTTP and WebSocket throughput is equal.
   `undici` and `ws` keep proxy, cipher, cookie, and `zlib-stream` support.
3. **Do not swap voice crypto.** WebCrypto AES-GCM is 20 to 33 times slower
   per packet. Bun 1.4.4 also expects the auth tag appended to the ciphertext
   on decrypt, not in the `tag` option. That is a compatibility trap.
4. **Do not use `Bun.write` for large files.** It is 2 to 3 times slower than
   `fs.writeFile` and `fs.copyFile` for 1 MiB. It is faster for 1 KiB writes.
5. **Use Bun for the cases with a real win.** `Bun.Glob` (1.5x),
   `Bun.gunzipSync` (1.4x), `Bun.spawn` (about 1.1x), and small `Bun.write`
   calls. These are tooling wins, not client hot-path wins.
6. **Canary adds no new API for this task.** The `Bun.*` key set is identical
   to stable 1.4.4. Canary changes performance, not surface.

## Changes selected from this evidence

- `crypto.randomUUID()` instead of a `node:crypto` import.
- `Bun.sleep` for positive delays, with a 1 ms floor where the old timer
  clamped to 1 ms.
- `Bun.CryptoHasher` for the one-shot SHA-256 in `RemoteAuth`.
- `Bun.fileURLToPath` in the schema tool.
- `@types/bun` for the library, with the docs TypeDoc program pinned to
  `types: ['node']` so Bun globals do not leak into generated docs.

No transport, voice-crypto, stream, or large-file write swap is justified by
these numbers.
