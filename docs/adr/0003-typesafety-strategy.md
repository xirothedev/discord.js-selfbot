# Type-safety strategy: no `any`, discord-api-types at the REST boundary

**Status:** Accepted

## Context

The TypeScript port of discord.js-selfbot carried over JavaScript-era looseness: ~2,900 `: any` annotations, ~120 `as any` casts, and untyped REST/gateway payloads. `bun check` passed because `any` silences the compiler. We want the package to match discord.js@14.28.1's type-safety bar.

## Decision

1. **Ban `any`** in `src` and `typings`. Allowed substitutes: `unknown` + narrowing, generics with constraints, `Record<string, unknown>`, and one documented `DiscordPayload` alias for raw API blobs. `@ts-ignore`/`eslint-disable` require an ADR.
2. **REST payloads** are typed with `discord-api-types`'s `API*` types (already a dependency), since they are the HTTP contract.
3. **Gateway event payloads** stay `unknown` and are narrowed at the structure boundary, because they are loosely shaped and selfbot-specific.
4. **Public surface** (`typings/index.d.ts`) is hand-derived, using discord.js 14.28.1's typings as the reference spec we diff against. No runtime or type dependency on discord.js in the published package.
5. **Migration is bottom-up** by module (util → structures → managers → rest → client → sharding → WebSocket → voice → typings), one PR per module, with a ratcheting CI counter that only decreases.

## Considered options

- **Keep `any` at boundaries.** Rejected: it defeats the purpose and hides regressions.
- **Define our own raw types everywhere.** Rejected: duplicates discord-api-types and drifts from the real API.
- **Import discord.js's typings.** Rejected: adds a dependency on the reference implementation and couples our published types to its release cycle.
- **Top-down or vertical-slice migration.** Rejected: top-down blocks on the public surface; vertical slices duplicate type work across modules.

## Consequences

- `bun check` remains the hard gate; a new `test:types` script covers `tests` separately.
- Each PR must keep `bun test` green and decrease (or not increase) the `any` ratchet.
- Consumers relying on loose `any` typing may see new compile errors; these are documented as breaking changes per phase.
- Follow-up phase tightens tsconfig (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`).
