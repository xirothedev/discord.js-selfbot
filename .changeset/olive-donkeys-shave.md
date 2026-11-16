---
'@discord-selfbot/core': minor
---

Support Node.js >= 22 as a published runtime alongside Bun (ADR 0013).

- `exports.node` resolves a built `dist/node` (ESM `index.mjs` + CJS
  `index.cjs`), so `require('@discord-selfbot/core')` works on npm without a
  bundler; `exports.bun` keeps serving the raw TypeScript source.
- Shared runtime code drops `Bun.sleep` and `Bun.CryptoHasher` for the
  `node:timers/promises` and `node:crypto` equivalents; a test suite pins
  "no `Bun.*` and no top-level await in `src/**`".
- Optional native accelerators (`zlib-sync`, `erlpack`,
  `@stablelib/xchacha20poly1305`, `libsodium-wrappers`) are declared optional
  peers and degrade gracefully on both runtimes.
- `engines.node` is `>=22`; CI and release now smoke both dist entries on
  plain Node.
