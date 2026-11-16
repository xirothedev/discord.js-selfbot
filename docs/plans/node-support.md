# Node support plan (ADR 0013)

Status: **shipped**. The runtime flip landed in one release train, per the
staged contract in ADR 0013: the codemod shipped first as `packages/codemod`
(separate PR), and the runtime-seam refactor plus the marketing flip land
together so docs never contradict the package.

## Blocker audit (empty first-release exclusion list)

The only Bun-specific runtime code in `src/**` at audit time:

| Site | Fix |
| --- | --- |
| `Bun.sleep` × 9 (`ShardingManager` ×2, `Shard`, `RequestHandler` ×2, `WebSocketManager` ×2, `Client`) | `setTimeout` from `node:timers/promises` (same ref semantics) |
| `Bun.CryptoHasher` × 1 (`RemoteAuth#receiveNonceProof`) | `createHash('sha256').update(...).digest('base64url')` |
| Top-level `await import('zlib-sync')` (`WebSocketShard`) | synchronous optional `require` (like `erlpack` in `WebSocket.ts`) |
| `createRequire(import.meta.url)` lazy sibling/optional loads (10 files) | plain `require` so the bundler inlines sibling specifiers and keeps bare specifiers external |

Everything else was already runtime-agnostic: proxies on `node:net`/`node:tls`
+ `undici`, voice on `node:dgram`/`node:child_process` with pure-JS secretbox
optional peers, `ws` for the gateway, `node:crypto` for MFA.

## Delivered

- `exports.node` → `dist/node/index.mjs` + `dist/node/index.cjs` (built with
  `bun build --target=node`, `--packages=external`); `exports.bun` keeps the
  raw TypeScript source; `engines.node >= 22`.
- Optional peers with `peerDependenciesMeta.optional`: `zlib-sync`, `erlpack`,
  `@stablelib/xchacha20poly1305`, `libsodium-wrappers`.
- Guards: `packages/discord-ts-selfbot/tests/dual-runtime.test.ts` pins "no
  `Bun.*` in `src/**`" and "no top-level await in `src/**`", plus a
  hash-parity test against the historical `Bun.CryptoHasher` expression.
- Release gate: `bun run test:node` (`scripts/node-smoke.cjs`) loads both
  entries on plain Node 22, including the lazy sibling factory seams; CI runs
  it on a dedicated Node leg (`_ci-reusable.yml#node-dist`) and `release.yml`
  runs it immediately before changesets publish.
- Marketing flip landed with the code: `installation.mdx`, `index.mdx`,
  `migration-v13.mdx` §2/§9, `changelog.mdx`, `proxies.mdx`, README,
  `AGENTS.md`, and the new `project/node-support.mdx` user contract.

## Explicit non-goals

- Node < 22. Stable `fetch`/`WebSocket` are the floor (ADR 0013).
- Native Node modules for opus/sodium beyond the documented optional peers.
- Running the repo's own toolchain on Node. Bun stays the development runtime.

## Follow-ups

- Bench on Node vs Bun (`tools/bench`) to publish a perf note if the gap
  matters to users.
- If any user hits a Bun-only API reintroduction, the guard test fails the
  build before release; no runtime fallback is planned.
