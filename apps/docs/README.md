# @discord-ts-selfbot/docs

The Fumadocs documentation site for `@discord-selfbot/core`.

## Commands

```sh
bun run dev      # generate the API reference and start Next.js
bun run build    # generate the API reference and build the static site
bun run docs     # build the static site (Turbo task; assumes API is generated)
bun run api      # regenerate the API reference
bun run api:check
bun run check    # generate, then type check
bun run lint
bun run fmt:check
bun run test
```

## Layout

- `app/` — Next.js App Router pages, the landing page, search, OG images, `llms.txt`.
- `content/docs/` — manual MDX pages. Generated API pages live in `content/docs/api/` and are gitignored.
- `scripts/generate-api.ts` — TypeDoc + the API prose store merged into MDX.
- `scripts/agent/` — the `api.json` prose store, the events extraction, and the plain-Markdown agent docs generator.
- `components/` — MDX components, search dialog, icon registry.
- `lib/` — source loader, shared URLs, layout options.

## API generation

The generator runs TypeDoc over `typings/index.d.ts` for signatures, classes, interfaces, and type aliases. It reads descriptions, parameters, examples, and events from `scripts/agent/api.json`.

The prose store was extracted once from the old source JSDoc. The source JSDoc is gone; update `api.json` when a public description changes. The merged output is written as MDX and `meta.json` sidebars.

Do not edit `content/docs/api/` by hand. Edit `scripts/agent/api.json` or the typings, then run `bun run api`.

## Agent docs

`scripts/agent/generate.ts` writes the plain-Markdown corpus into `packages/discord-ts-selfbot/docs`. It converts the guides and examples, generates the runtime reference from the typings and `api.json`, and writes `llms.txt`. Run `bun run docs:agent`; `bun run docs:agent:check` fails when the committed corpus is stale. `bun run docs:snippets` type-checks the full example blocks.

## Deployment

The static site is exported to `out/` and deployed to GitHub Pages by `.github/workflows/docs-deploy.yml`. The production base path is `/discord.js-selfbot`.

## Design and terms

See the root `DESIGN.md` and `GLOSSARY.md`.
