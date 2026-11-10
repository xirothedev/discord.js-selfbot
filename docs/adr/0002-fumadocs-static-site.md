# Fumadocs static docs site on GitHub Pages

**Status:** Accepted

**Superseded in part by:** [0005](./0005-agent-docs-and-mcp-gateway.md), which removes the docgen mirror and moves the prose to `apps/docs/scripts/agent/api.json`.

The legacy docgen JSON and TypeDoc HTML could not run under Bun and did not look like a product docs site. We rebuilt the documentation as a Fumadocs 16 app in `apps/docs`, statically exported with Next.js 16 and deployed to GitHub Pages at `/discord.js-selfbot`. The API reference is generated at build time from TypeDoc over `typings/index.d.ts`, with descriptions merged from the legacy docgen parser through a Bun/Node 26 `util` shim. Docgen cannot read TypeScript, so the build compiles the source to a temporary JavaScript mirror that never enters the repository.

## Considered options

- **Keep the legacy docgen site.** Rejected: the pipeline fails under Bun (`jsdoc` 3.6.11 uses removed `util` helpers), and the output is a single JSON blob plus generated TypeDoc HTML.
- **TypeDoc HTML only.** Rejected: no guides, no navigation, no search, and the HTML is not integrated with the rest of the docs.
- **Vercel-hosted Fumadocs.** Rejected for v1: GitHub Pages needs no external account or server, and the site is fully static.
- **Single v14 version.** Rejected a version selector: the fork has not shipped v13, so a second content tree would be empty work.

## Consequences

- The docs build runs TypeDoc and docgen on every build. The generated API tree is gitignored and regenerated in CI.
- The static Orama index excludes generated API pages. The API reference is navigable from the sidebar, and the search payload stays around 1 MB instead of 16 MB.
- Docgen needs a `NODE_OPTIONS=--require util-shim.cjs` shim because the child `jsdoc` process runs on Node 26, which removed `util.isRegExp`, `util.isDate`, and the other legacy type checks.
- The docs site is English-only, has no analytics, and uses GitHub Pages project-path base routing. A custom domain or i18n can be added later without changing the content tree.
