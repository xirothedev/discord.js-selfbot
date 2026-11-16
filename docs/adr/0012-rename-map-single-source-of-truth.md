# The rename map is the single source of truth for v13→v14 changes

**Status:** Accepted

The v13→v14 name and option changes already exist as prose tables in
`apps/docs/content/docs/getting-started/migration-v13.mdx` and
`apps/docs/content/docs/project/v14-parity.mdx`. If the codemod kept its own
copy of those lists, the two would drift silently.

## Decision

- The **rename map** — a checked-in, machine-readable TypeScript table in
  `packages/codemod/src/rules/` — is canonical. Every codemod rule derives from a
  rename map entry; every entry carries its docs anchor.
- A check script asserts the docs parity/migration tables against the rename map
  and fails `bun run check` on drift.

## Considered Options

- Parsing the MDX tables at codemod build time: couples a runtime tool to docs
  prose format.
- Two hand-maintained lists: accepted drift.

## Consequences

- Adding a rename is one commit to the rename map plus the docs row the check
  enforces, never a hunt through transform code.
