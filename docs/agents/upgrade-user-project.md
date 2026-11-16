# Upgrade a user project from discord.js-selfbot-v13

Runbook for agents asked to migrate a **user project** from `discord.js-selfbot-v13`
to `@discord-selfbot/core` v14. The mechanical half belongs to
`@discord-selfbot/codemod` (see ADR 0010–0012); the judgment half belongs to you.

## Contract

- The codemod is the only allowed bulk editor. Do not hand-run a regex over
  `node_modules`-free source when a rule exists; add or report a rule instead.
- The codemod never changes runtime behavior. Anything that needs judgment gets a
  `TODO(codemod:<rule-id>): <message> [<docs anchor>]` marker.
- Never remove a companion dependency (`@discordjs/opus`, `@discordjs/voice`,
  `erlpack`, `zlib-sync`, `sodium`, `@stablelib/xchacha20poly1305`). The codemod
  flags them in the report; the user decides.
- The user project must be a git repo with a clean tree, or pass `--force`.

## Procedure

1. **Preflight.** In the user project: commit or stash everything, and confirm
   the Bun version (`bun --version`, floor 1.4.4). Record the exact
   `discord.js-selfbot-v13` version from `package.json`.
2. **Dry run.** `npx @discord-selfbot/codemod@latest upgrade` (repo-internal
   equivalent: `bun run codemod upgrade`). Read the full diff and the marker
   list. If the report shows `status: "error"` for any file, stop and fix the
   codemod or skip that file deliberately; never ignore a parse error.
3. **Apply.** `... upgrade --write`. The codemod swaps the dependency, adds
   `@discord-selfbot/core`, adds the pinned `discord-api-types` when it rewrote
   `setStyle`, and prints the marker list.
4. **Resolve every marker.** For each `TODO(codemod:<rule-id>)` line, open the
   linked docs anchor (sections of
   `apps/docs/content/docs/getting-started/migration-v13.mdx`, plus
   `project/v14-parity` and `project/safety`) and apply the documented manual
   step. Stubbed relationship mutations, MFA methods, `Util.removeMentions`,
   dead automod events, `StoreChannel`, deprecated client options, and the
   star-export gap all have documented replacements or removals.
5. **Runtime flip.** The library is Bun-only (until Node enablement lands):
   update scripts, CI, and engines to Bun. Install with `bun install`.
6. **Verify.** `bun install && bun run lint && bun run check && bun test` in the
   user project, plus one smoke run that logs in. No marker may survive
   resolution — grep `TODO(codemod:` before handing back.
7. **Report.** Hand the user the codemod JSON report (`--json`), the marker
   list with what you did for each, and the list of flagged companion deps.

## Codemod development (this repo)

- Rules live in `packages/codemod/src/rules/`; every table the rules read lives
  in `packages/codemod/src/rename-map.ts` (ADR 0012). Add a row there, never in
  a rule.
- Tests are Bun-only: `cd packages/codemod && bun test` (the `test` script also
  builds `dist/` because the CLI e2e test spawns plain Node).
- Gates: `bun run check`, `bun run lint`, `bun run fmt:check` from the repo root
  must stay green, along with `packages/codemod/tests/gates.test.ts`
  (version lockstep, `discord-api-types` pin drift, docs anchors).
- `bun run generate:check` in `packages/codemod` keeps the generated event
  snapshot in sync with the library's `Events` object.
