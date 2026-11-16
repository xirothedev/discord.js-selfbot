# Use jscodeshift as the codemod engine

**Status:** Accepted

The v13→v14 upgrade path for user projects needs an AST-based source rewriter. The
team audited the codemod ecosystem (`jscodeshift` ~3M weekly downloads, `ts-morph`
~2M general AST library, `@ast-grep/napi` fastest but smallest codemod ecosystem).
Ecosystem upgrades that match our exact use case — `npx @next/codemod upgrade`,
`react-codemod` — all run on jscodeshift.

## Decision

- Build the user-project upgrade tool on `jscodeshift` as engine and runner. Reuse
  its runner result (`ok`/`nochange`/`error`/`skip` + `stats` counters) as the
  machine-readable report instead of writing a runner.
- Keep every rule a pure transform `(fileInfo, options) => string | undefined`. The
  runner stays the only jscodeshift-coupled layer, so a future engine swap touches
  one module.
- Run the codemod in user projects under Node via `npx`. In this repo's CI, test
  rules by importing transforms with `jscodeshift/dist/testUtils` `applyTransform`
  under `bun test`; never spawn jscodeshift workers here. Use `--run-in-band` when
  a Bun child-process problem appears during the verification spike.
- The Babel dependency tree lives only in the codemod package, never in
  `@discord-selfbot/core`.

## Considered Options

- Dependency-free regex/`Bun.Transpiler` rewrite: not AST-safe on TypeScript.
- `ts-morph`: type-aware power we cannot use — public typings are hand-maintained
  `typings/index.d.ts`, and no rule needs types.
- `@ast-grep/napi`: good pattern syntax, but we would hand-roll the runner, worker
  model, format preservation, and fixture test utils the audit says to reuse.

## Consequences

- `package.json` edits cannot ride the AST path (jscodeshift parses JS/TS only);
  they go through their own literal JSON edit.
- The codemod package is a deliberate exception to the no-new-library baseline in
  `rules/libraries.md`: no installed or native option covers AST-to-AST rewrite.
