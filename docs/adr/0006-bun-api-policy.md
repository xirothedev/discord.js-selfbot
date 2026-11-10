# Bun API policy: capability and measured wins, not a blanket rewrite

**Status:** Accepted

The runtime is Bun, and ADR 0001 allows Bun APIs. A full audit and benchmark
showed that most Node APIs already run through Bun's native code. We keep those
APIs and use Bun built-ins only where they add a capability or a measured win.

## Decision

Use a Bun API when one of these is true:

- It removes code or a dependency with no behavior change.
- It has a benchmark win of at least 5%, or a clear tail-latency or memory win.
- It adds a capability that the Node API cannot provide.

Keep the Node API when it is equal, faster, or required by the public surface.
The current list:

- Keep `undici` fetch and `ws`. They match Bun throughput and keep proxy,
  cipher, cookie, and `zlib-stream` support.
- Keep `node:crypto` AES-GCM and RSA for voice and `RemoteAuth`.
- Keep `node:fs` for large writes and copies.
- Keep Node `Stream` types in the public API.

Use Bun APIs for:

- `Bun.sleep` for positive delays, with a 1 ms floor where the old timer
  clamped to 1 ms.
- `crypto.randomUUID()` for v4 UUIDs.
- `Bun.CryptoHasher` for one-shot hashes.
- `Bun.fileURLToPath`.
- `Bun.Glob`, `Bun.spawn`, and `Bun.spawnSync` in tools.

Code targets the stable 1.4.4 API. Canary is a benchmark target, not a
requirement. Do not raise `engines` or `packageManager` for a canary feature.

Any new swap needs a case in `tools/bench` and a result that beats this rule.
`tools/bench/results/REPORT.md` holds the current numbers.

## Considered options

- **Full Bun-only rewrite.** Rejected: it would replace `undici`, `ws`, voice
  crypto, and public Node streams. The benchmark shows no HTTP or WebSocket
  win, and WebCrypto AES-GCM is 20 to 33 times slower per packet.
- **Style-only migration of every `node:*` import.** Rejected: it adds risk and
  churn without a speed or capability gain.
- **Pin canary.** Rejected: canary has the same `Bun.*` key set as 1.4.4 and
  would force users onto a pre-release runtime.

## Consequences

- `@types/bun` is a devDependency of the library, referenced from
  `src/bun-env.d.ts`. The docs TypeDoc program pins `types: ['node']` so Bun
  globals do not change the generated API docs.
- Tooling may use `Bun.Glob`, `Bun.spawn`, and `Bun.write` for small files.
- A future Bun version that makes a Node API slower, or a new Bun API that
  removes a real dependency, can reopen a case in `tools/bench`.
