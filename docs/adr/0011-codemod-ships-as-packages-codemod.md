# Publish the codemod as `packages/codemod`, not a bin on core

**Status:** Accepted

User projects migrating off the legacy v13 package need one command to rewrite
their code. The v13 user base runs Node and npm today, so the tool must run under
Node via `npx`.

## Decision

- Ship the codemod as the published workspace `packages/codemod`
  (`@discord-selfbot/codemod`) with its own `bin`, mirroring the
  `npx @next/codemod upgrade` UX. CLI surface: `upgrade [paths]`, `--rule`
  (repeatable), `list`.
- `@discord-selfbot/core` gets no `bin` and no codemod dependency. The Babel and
  jscodeshift tree stays inside the codemod package.
- The codemod's `version` must equal `@discord-selfbot/core`'s `version`; a test
  asserts it, so a release that forgets the codemod fails `bun run test`.
- `tools/*` stays the home of private harnesses (`private: true`). Published,
  user-facing packages live under `packages/`.

## Considered Options

- `bin` on `@discord-selfbot/core`: rejected — pulls the codemod dependency tree
  into the runtime library whose `exports` intentionally point at raw TypeScript
  source.
- Published package under `tools/`: rejected — breaks the tools-private /
  packages-published layout convention.

## Consequences

- `package.json` of user projects is edited by a dedicated literal-JSON path in the
  codemod, not by the AST engine (jscodeshift parses JS/TS only).
