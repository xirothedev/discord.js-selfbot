# Support Node.js and Bun as published runtimes for the library

**Status:** Accepted

`@discord-selfbot/core` shipped Bun-only. The owner committed to official Node.js
support to extend the user target: the v13 audience lives on npm and `require()`
today, and the codemod (ADR 0011) delivers them to exactly that audience. This
decision activates the upgrade trigger ADR 0009 already wrote ("Do not market
`dist` as a Node entry until `Bun.sleep` is gone from `RequestHandler` and
`Client`").

## Decision

- Supersedes the Bun-only marketing clauses of ADR 0006 and ADR 0009. The Bun
  contract stays for development and for `exports.bun` (raw TypeScript source);
  it is no longer the only supported runtime.
- Node floor is **22 LTS**. `exports.node` resolves to a built `dist` published
  as ESM (`dist/index.js`) **and** CJS (`dist/index.cjs`), so
  `require('@discord-selfbot/core')` works on npm without any bundler.
- The blocker audit found an **empty first-release exclusion list**: the only
  Bun-specific runtime code in `src/**` was nine `Bun.sleep` calls
  (`ShardingManager`, `Shard`, `RequestHandler`, `WebSocketManager`, `Client`)
  and one `Bun.CryptoHasher` call (`RemoteAuth`), all replaced by the
  `node:timers/promises` and `node:crypto` equivalents ADR 0006 already keeps
  elsewhere. Voice (`node:dgram`, `node:child_process`, pure-JS secretbox first),
  proxies (`node:net`/`node:tls` + undici), and rate limits are runtime-agnostic
  today. Optional native accelerators (`zlib-sync`, `erlpack`, native sodium,
  opus coders) are declared optional peers and degrade gracefully on both
  runtimes.
- Shared runtime code contains no `Bun.*` calls. A test in the library's Bun
  suite pins "no `Bun.*` in `src/**` except tools-permitted sites": if a
  future change reintroduces a Bun-only API into shared runtime code, the
  suite fails loudly before release — never a silent Node no-op. (This
  replaces the earlier draft of this clause, which referenced a
  `NotSupportedOnNodeError` class the audit found was never in `src`.)
- Staged delivery: the codemod ships first (independently valuable to the Node
  audience), then the runtime-seam refactor per `docs/plans/node-support.md`,
  then the Node marketing flip (`installation.mdx`, README, `llms.txt` corpus,
  `engines.node`, CI Node job) all land together so docs never contradict the
  package.

## Considered Options

- ESM-only on Node: rejected — abandoning `require()` contradicts the whole
  reason for Node support (the v13 CJS audience).
- Node 20 floor: rejected — stable global `fetch`/`WebSocket` start at 22; the
  seams cost more below it.
- Wait for 100% feature parity (voice, proxy) before any Node release: rejected —
  documented loud exclusions beat indefinite silence, and match ADR 0009's habit
  of stating limits exactly.

## Consequences

- The shared runtime code drops `Bun.sleep` and `Bun.CryptoHasher` for the
  `node:*` equivalents ADR 0006 already keeps elsewhere (with the 1 ms floor and
  a hash-parity test against Bun output); ADR 0006's Bun-API allowance survives
  for tools and for `exports.bun`.
- The one top-level `await` (`zlib-sync` load in `WebSocketShard.ts`) must become
  lazy before a CJS `dist` can ship.
- `AGENTS.md` "Bun-only runtime (no Node compatibility)" is amended to
  "Bun-first development; the published library supports Bun and Node >= 22".
