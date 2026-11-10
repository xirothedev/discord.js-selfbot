# Bun + Turborepo monorepo with a TypeScript source of truth

**Status:** Accepted

The fork was a single npm package: JavaScript source, hand-written `.d.ts`, no build, no tests. We are re-platforming it as a Bun-workspaces + Turborepo monorepo, with TypeScript modules as the source of truth (the original `.js` files stay as the runtime/reference pair), `discord-ts-selfbot@14` as the package identity, and Bun-only runtime (`engines: bun >=1.4.4`). The reason is the v14 port: v14 parity, the selfbot features, and a TDD harness are too large for a single flat package with no test seam.

## Considered options

- **Keep one package, npm + ESLint.** Rejected: no task graph, no per-package gates, and the worktrees/parity harness have nowhere to live.
- **pnpm + Node.** Rejected: the toolchain is already Bun-native (`bun check`, `bun lint`, `bun fmt`, `bun test`, `bun build --dts`); adding Node/pnpm would keep two toolchains.
- **Greenfield rewrite.** Rejected: the fork is 50k lines of selfbot-specific behavior. The `.js`/`.ts` pair lets us convert incrementally and keep the behavior reference.

## Consequences

- Published code may use Bun APIs; Node consumers are out of scope.
- The `.js` pair files are redundant once every module is TS; they stay until the package ships from `dist/` only.
- Turbo caches `build`, `check`, `lint`, `fmt:check`, `test`, and `docs`; the parity harness and examples are real workspace packages.
- The legacy `@discordjs/docgen` pipeline does not run under Bun (`jsdoc` 3.6.11 uses `util.isRegExp`); TypeDoc in `apps/doc` is the working docs pipeline.
