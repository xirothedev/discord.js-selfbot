# Plan: Resolve all non-type-safe code and `any`

Status: Draft (agreed via grilling session)
Owner: TBD
Tracking: ratcheting counter in CI

## Goal

Remove every `any`, unsafe cast, and untyped boundary from `packages/discord-ts-selfbot/src` and `packages/discord-ts-selfbot/typings`, so the package's public and internal surface is type-checked end to end, matching the type-safety bar of `discord.js@14.28.1`.

## Baseline (measured)

| Metric                                          | Count     | Scope              |
| ----------------------------------------------- | --------- | ------------------ |
| `: any` annotations                             | 2,914     | src                |
| `as any` casts                                  | 127       | src                |
| Other `as Type` casts                           | ~221      | src                |
| `any[]`                                         | 81        | src                |
| `@ts-ignore`                                    | 7         | src                |
| `any` in typings                                | 42        | typings/index.d.ts |
| `any` in discord.js 14.28.1 typings (reference) | 29        | parity harness     |
| Source files with `any`                         | 290 / 316 | src                |
| Source LOC                                      | 50,958    | src                |

`bun check` currently passes (strict mode, 317 files).

## Agreed decisions

1. **Definition of resolved**: zero `any` / `@ts-ignore` / unsafe casts in `src`+`typings`. Tightening tsconfig (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`) is a follow-up phase. Tests are not in the core gate but get a separate `test:types` script.
2. **Public API typing source**: hand-derive `typings/index.d.ts`, using discord.js 14.28.1's typings (in `tools/parity/node_modules/discord.js`) as the reference spec we diff against. No runtime/type dependency on discord.js in the published package.
3. **Raw payloads**: REST layer typed with `discord-api-types` `API*` types (already a dependency). Gateway event boundary stays `unknown` and is narrowed at the structure boundary.
4. **Strategy**: bottom-up by module: `util` → `structures` → `managers` → `rest` → `client` → `sharding` → `WebSocket` → `voice`. Each module is its own PR.
5. **Allowed substitutes for `any`**: `unknown` + narrowing, generics with constraints, `Record<string, unknown>`, and a single documented `DiscordPayload` alias for raw API blobs. No `eslint-disable` / `@ts-ignore` without an ADR.
6. **Tests**: add `test:types` script (separate gate). Main `bun check` stays src+typings only until the migration is complete, then fold tests in.
7. **Definition of done**: `grep` for `\bany\b` returns 0 in src+typings; `bun check` + a new `no-explicit-any` lint rule pass; parity harness type-checks against discord.js's public surface.
8. **Delivery**: incremental per-module PRs with a ratcheting counter in CI (the `any` count must not increase). No mega-PR.

## Work breakdown

### Phase 0 — Scaffolding (1 PR)

- Add `DiscordPayload` alias (e.g. in `src/util/types.ts` or `typings`) documented as the one allowed raw-blob type.
- Add lint rule `@typescript-eslint/no-explicit-any` (error) and `no-unsafe-*` rules to the lint config, but scoped to a ratchet: initially allow existing count via a baseline file, then ratchet down per PR.
- Add `test:types` script: `tsc --noEmit -p tsconfig.test.json` (new tsconfig including `tests`).
- Add CI ratchet check: count `any` in src+typings; fail if greater than committed baseline; update baseline only when count decreases.
- Document the migration in this plan and link from `docs/agents`.

### Phase 1 — `util` (lowest dependency)

Modules: `BitField`, `Collection` re-exports, `Constants`, `Sweepers`, `Util`, `RemoteAuth`, `Voice*` helpers.

- Replace `: any` params with concrete types or generics.
- Type `Util` helpers (`flatten`, `parseEmoji`, etc.) against discord-api-types where applicable.
- Gate: `any` count in `src/util` → 0.

### Phase 2 — `structures`

- `User`, `Guild`, `Channel` hierarchy, `Message`, `MessageEmbed`, `Role`, `GuildMember`, `Presence`, `ThreadChannel`, `AutoModerationRule`, etc.
- Type constructors to accept `API*` raw data and narrow internally.
- Public getters typed to match discord.js reference signatures.
- Gate: `any` count in `src/structures` → 0; diff public signatures vs discord.js typings.

### Phase 3 — `managers`

- All `*Manager` classes: typed collections, fetch/create/edit/delete signatures.
- Replace `any` params (`reason`, `options`, `data`) with `*Options` / `*Data` types from discord.js reference or our own.
- Gate: `any` count in `src/managers` → 0.

### Phase 4 — `rest`

- `RESTManager`, `RequestHandler`: type request bodies/responses with `API*` types and generics on `request<T>`.
- Type rate-limit and retry paths.
- Keep transport-level `unknown` only at the socket boundary.
- Gate: `any` count in `src/rest` → 0.

### Phase 5 — `client`

- Type `Client` fields (currently `declare x: any`) to their concrete managers/services (`ChannelManager`, `GuildManager`, `UserManager`, `WebSocketManager`, `ClientVoiceManager`, `Sweepers`, `ClientUser | null`, etc.), mirroring discord.js's `Client<Ready>`.
- Type `login`, `fetch*` methods against `API*`/structure types.
- Type event emitter payloads.
- Gate: `any` count in `src/client` → 0.

### Phase 6 — `sharding`

- Type `Shard`, `ShardingManager`, `ShardClientUtil` IPC messages as a discriminated union (or `unknown` + narrowing at the boundary).
- Gate: `any` count in `src/sharding` → 0.

### Phase 7 — `WebSocket`

- Type gateway payloads with `Gateway*` types from discord-api-types where available; selfbot-specific events remain `unknown` + narrowing.
- Type dispatch handlers.
- Gate: `any` count in `src/WebSocket.ts` and `src/client/websocket` → 0.

### Phase 8 — `voice`

- Largest `any` concentration (voice connection, dispatcher, receiver, media player, recorder, opus, encryption).
- Type RTP/SDP handling; use `unknown` + narrowing at the native/binary boundary (Buffer, Uint8Array).
- Gate: `any` count in `src/client/voice` → 0.

### Phase 9 — `typings` public surface

- Rewrite `typings/index.d.ts` to remove all 42 `any`, aligning signatures with discord.js reference.
- Update `typings/rawDataTypes.d.ts` to re-export/alias discord-api-types where possible.
- Add type tests in `typings/index.test-d.ts` (tsd or `expectTypeOf`) covering key public APIs.
- Gate: `any` count in `typings` → 0; type tests pass.

### Phase 10 — Final gate & tsconfig tightening (follow-up)

- Fold `tests` into `bun check` (remove separate script) once stable.
- Enable `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` one at a time, fixing fallout.
- Remove the ratchet baseline; lint rule becomes a hard error with no exceptions.
- Run parity harness type-check as the final acceptance gate.

## Risks & mitigations

- **Behavior drift from narrowing**: adding runtime guards can change behavior. Mitigation: every PR must keep `bun test` green; type-only changes preferred; guards added only at trust boundaries.
- **Public API breakage**: changing `any` to concrete types may break consumers relying on loose typing. Mitigation: diff public signatures against discord.js 14.28.1 before merging each phase; document breaking changes in release notes.
- **Scope creep into refactors**: type-safety work can tempt large refactors. Mitigation: keep changes type-only within each PR; separate refactors into their own PRs.
- **Performance of type-checking**: 51k LOC may slow `tsc`. Mitigation: measure; if needed, split tsconfig project references by module.
- **discord-api-types gaps**: not every selfbot-specific payload exists. Mitigation: `DiscordPayload` alias + local interfaces; contribute upstream only if a gap blocks.

## Verification per PR

1. `bun run check` passes.
2. `bun run lint` passes (ratchet not increased).
3. `bun run test` passes.
4. `bun run fmt:check` passes.
5. `bun run lint:boundaries` passes.
6. Ratchet counter decreased (or unchanged only if phase not yet touching that module).
7. Public-signature diff vs discord.js reference reviewed.

## Tracking

- Ratchet baseline file: `tools/typesafety/baseline.txt` (or `.github/typesafety-baseline`), committed, updated only downward.
- Per-phase progress tracked as GitHub issues (one per phase) with labels `typesafety`, `ready-for-agent`.
- This plan lives at `docs/plans/typesafety-plan.md`.

## Out of scope

- Runtime behavior changes unrelated to typing.
- Node compatibility (Bun-only remains).
- Translating JSDoc or docs site content.
- Performance optimization.
