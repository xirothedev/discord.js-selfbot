# discord-ts-selfbot monorepo

Bun workspaces + Turborepo. **Bun-only runtime** (no Node compatibility). The library lives in `packages/discord-ts-selfbot`.

## Layout

```
/
├── packages/
│   ├── discord-ts-selfbot/   # published library (src, typings, examples)
│   └── test-harness/        # private fake Discord HTTP + WS server (TDD seam S1)
├── apps/
│   ├── docs/                # Fumadocs documentation site (static Next.js)
│   ├── examples-js/         # runnable JavaScript examples
│   └── examples-ts/         # runnable TypeScript examples
├── tools/
│   └── parity/              # private differential harness vs discord.js@14.28.1
├── turbo.json
└── bunfig.toml
```

<!-- BEGIN:discord-ts-selfbot-agent-rules -->

## discord-ts-selfbot: read docs before coding

Before you change the public API, read `packages/discord-ts-selfbot/docs/llms.txt` and the page for the task. Run `bun run docs:agent` after the change; `bun run docs:agent:check` fails when the committed corpus is stale.

The corpus source is `apps/docs/scripts/agent/api.json` plus the Markdown under `apps/docs/content/docs`.

<!-- END:discord-ts-selfbot-agent-rules -->

## Commands (run from root)

- `bun install` — install all workspaces
- `bun run check` — type check (turbo)
- `bun run lint` — lint (turbo)
- `bun run fmt` — format
- `bun run fmt:check` — format check (turbo)
- `bun run test` — tests (turbo)
- `bun run build` — build (turbo)
- `bun run docs` — build the docs site (turbo)
- `bun run docs:dev` — run the docs site locally
- `bun run docs:api` — regenerate the API reference from source and typings
- `bun run docs:agent` — regenerate the agent docs corpus
- `bun run docs:agent:check` — check the committed agent docs corpus
- `bun run docs:snippets` — type-check the full example snippets
- `bun run lint:boundaries` — deep-module boundary check
- `bun run bench` — Node API vs Bun API benchmarks; see `tools/bench/README.md`

## Issue tracker

Issues live in the repo's GitHub Issues (uses the `gh` CLI). See `docs/agents/issue-tracker.md`.

## Triage labels

Default canonical triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

## Domain docs

Single-context layout (one `GLOSSARY.md` + `DESIGN.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.

Packages are deep modules: see `packages/discord-ts-selfbot/src/packages/README.md` before adding or importing one.
