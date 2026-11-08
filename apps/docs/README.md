# @discord-ts-selfbot/docs

The Fumadocs documentation site for `discord-ts-selfbot`.

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
- `scripts/generate-api.ts` — TypeDoc + docgen merge into MDX.
- `components/` — MDX components, search dialog, icon registry.
- `lib/` — source loader, shared URLs, layout options.

## API generation

The generator runs TypeDoc twice:

1. Source directories for class and method descriptions.
2. `typings/index.d.ts` for interfaces and type aliases.

It also runs the legacy `@discordjs/docgen` parser (with a Node 26 `util` shim) for JSDoc descriptions, events, examples, and parameter docs. The merged output is written as MDX and `meta.json` sidebars.

Do not edit `content/docs/api/` by hand. Edit the source JSDoc or the typings, then run `bun run api`.

## Deployment

The static site is exported to `out/` and deployed to GitHub Pages by `.github/workflows/docs-deploy.yml`. The production base path is `/discord.js-selfbot`.

## Design and terms

See the root `DESIGN.md` and `GLOSSARY.md`.
