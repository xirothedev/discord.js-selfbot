# Entity schema: one object model derived from the public typings

**Status:** Accepted

## Context

The type-safety migration removed `any` from structures one module at a time. The first pass exposed a structural problem:

- `Base` declares `[key: string]: any`, so every undeclared structure property is still `any`.
- `_patch(data: Record<string, unknown>)` forces one cast per field (`data.name as string`, `data.colors as {...}`).
- The public `typings/index.d.ts` and `src` describe the same objects twice, and they drift. `User.username` is `string` in the public typings, but `User._patch` has a `??= null` fallback.
- `ApiRouter` returns `Promise<unknown>` and `BaseClient.rest` is `any`, so REST results arrive untyped.

The wire contract already exists: `discord-api-types` and `typings/rawDataTypes.d.ts` (`RawUserData`, `RawRoleData`, ...). What was missing was the object contract.

## Decision

1. **Three layers per entity.**
   - `Raw*Data` — the wire shape (snake_case), from `discord-api-types`, declared in `typings/rawDataTypes.d.ts`.
   - `*Entity` — the object shape (camelCase), declared in `src/types/entities/<entity>.ts`.
   - `EntitySchema` — the database map in `src/types/schema.ts`, pairing raw and entity and tagging each non-API field as `selfbot`, `internal`, or `relation`.
2. **The public typings remain the parity contract.** The generator reads `typings/index.d.ts` for property names and public types, intersects them with the `this.<prop> =` assignments in `src/structures`, and records every runtime/public disagreement as **drift**. The drift count is baselined and ratcheted down; it is not silently cast away.
3. **`_patch` takes `PatchOf<K>`** (`Partial<Raw*Data>`). Optionality is narrowed with `data.x !== undefined`, not `'x' in data`, because the mapped `Partial` type does not narrow reliably under the Bun type checker. Structure properties are declared with `declare`, which is erased at runtime and does not overwrite `Object.defineProperty` fields.
4. **The schema is generated, not hand-written.** `tools/schema/generate.ts` is the only writer. `schema:check` runs inside `bun check`. A field type that is not in the entity's import config fails the generator instead of producing an unimported name.
5. **The model is type-only.** `_patch` stays hand-written. No runtime mapper; the transforms (`_add`, `BitField`, `Date.parse`, `Collection`) are not uniform enough to close.

## Considered options

- **Payload-only typing.** Rejected: `this.x` stays `any` through `Base`, so the casts move rather than disappear.
- **Hand-write all 52 entities.** Rejected: 105 of 108 structure files have no property declarations; the codemod is the only realistic path.
- **Generate `typings/index.d.ts` from `src`.** Rejected for now: the public typings carry discord.js parity, overloads, and JSDoc that `src` does not express. Revisit as a separate ADR.
- **Runtime schema mapper.** Rejected: behavior change and a new bug surface.

## Consequences

- `Base`'s index signature is removed at the end of the migration, not per module. Until then, a converted structure is only as strong as its `declare` fields.
- The first report is 116 candidate classes, 740 fields, 85 assigned-but-undeclared fields, and 96 runtime/public drift rows across 38 entities. Each is triaged in `docs/plans/entity-schema-triage.md`, not ignored. The first follow-up (`User`, `ClientUser`, `GuildMember`) removed 26 rows and left zero drift in those entities. The following passes (`VoiceState`, `GuildBoost`, `AutoModerationRule`, then the small structures and `GuildScheduledEvent`) removed 54 rows in total; 42 remain. Generic classes (`Collector<K, V>`, `GuildAuditLogs<T>`) need type parameters in their entities and are deferred to their module phase.
- `bun check` now includes `schema:check` and the `any`/cast ratchet; a hand edit to a generated entity fails the gate.
- The `as` ratchet is added alongside the `any` ratchet so the cast count can only go down.
