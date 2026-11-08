# discord-ts-selfbot monorepo

Bun workspaces + Turborepo. The library lives in `packages/discord-ts-selfbot`.

## Layout

```
/
├── packages/
│   ├── discord-ts-selfbot/   # published library (src, typings, examples)
│   └── test-harness/        # private fake Discord HTTP + WS server (TDD seam S1)
├── apps/
│   └── examples/            # example apps (added later)
├── tools/
│   └── parity/              # private differential harness vs discord.js@14.28.1
├── turbo.json
└── bunfig.toml
```

## Commands (run from root)

- `bun install` — install all workspaces
- `bun run check` — type check (turbo)
- `bun run lint` — lint (turbo)
- `bun run fmt` — format
- `bun run fmt:check` — format check (turbo)
- `bun run test` — tests (turbo)
- `bun run build` — build (turbo)
- `bun run docs` — docs (turbo)
- `bun run lint:boundaries` — deep-module boundary check

## Issue tracker

Issues live in the repo's GitHub Issues (uses the `gh` CLI). See `docs/agents/issue-tracker.md`.

## Triage labels

Default canonical triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

## Domain docs

Single-context layout (one `GLOSSARY.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.

Packages are deep modules: see `packages/discord-ts-selfbot/src/packages/README.md` before adding or importing one.
