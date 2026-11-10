# Agent docs as package Markdown with an AGENTS.md pointer

**Status:** Accepted

## Context

The public docs grew inside source JSDoc. `src/` held about 3,300 JSDoc blocks: class docs, method docs, and about 1,000 comments above `this.x =` assignments inside `_patch`. The assignment comments are not attached to a declaration, so no editor shows them on hover. They existed only for the legacy docgen parser.

The docs site rendered them through a fragile pipeline: TypeScript compiled `src` to a temporary JavaScript mirror, jsdoc 3.6.11 parsed that mirror, and the API generator merged the result with TypeDoc over `typings/index.d.ts`. The mirror failed on a duplicate declaration and blocked the whole API build. The docs site already emitted `llms.txt`, `llms-full.txt`, and a per-page Markdown tree, but the generated API pages were missing from that tree.

Two constraints shaped the decision:

- The package is published from a tag-triggered job with a 15-minute timeout. A full Next build inside `prepack` does not fit.
- The public typings do not declare every runtime member. Inherited and mixin members, such as `User#send`, have docs only in the old source JSDoc. Moving prose only to `typings/index.d.ts` lost those descriptions and many examples. That experiment was rejected.

## Decision

1. **Extract the API prose once.** `apps/docs/scripts/agent/extract-api-store.ts` turned the docgen output into `apps/docs/scripts/agent/api.json`: class and type descriptions, public properties, methods with parameters and returns, examples, and events. The file is the live prose source.
2. **Delete the source JSDoc.** `apps/docs/scripts/agent/strip-source-jsdoc.ts` removed 3,256 blocks from 291 files, keeping blocks with `@deprecated` or `@internal`. The docgen dependency, `docgen.yml`, and the `util-shim.cjs` mirror are gone.
3. **Generate the reference from the store and the public typings.** The site API generator and the agent generator both read `api.json` and TypeDoc over `typings/index.d.ts`. The site and the package use the same descriptions.
4. **Ship plain Markdown in the package.** `apps/docs/scripts/agent/generate.ts` writes `packages/discord-ts-selfbot/docs/`: `llms.txt`, getting-started pages, guides, examples with their full source, an event catalog, and one reference page per runtime export. The generated tree is committed and guarded by `docs:check`.
5. **Use an AGENTS.md block, not an MCP server.** The package ships `docs/AGENTS.md` with a managed block that tells agents to read `node_modules/discord-ts-selfbot/docs/llms.txt` before writing code. The consumer copies that block into the project `AGENTS.md`. The root `AGENTS.md` uses the same block for contributors, with the workspace path. There is no server, no extra package, and no extra dependency.
6. **Point agents at the files.** The root `AGENTS.md`, the package README, and the site's coding-agents page show the block and the docs path.

The site keeps its Fumadocs UI. It is the human renderer over the same prose store and typings.

## Considered options

- **Keep the source JSDoc and the docgen mirror.** Rejected: the mirror broke the docs build, and the assignment comments were invisible to editors and duplicated the store.
- **Move all prose into `typings/index.d.ts`.** Rejected: the public typings do not declare inherited and mixin members, so this lost descriptions, parameters, and examples for a large part of the runtime surface. It also added about 14,000 lines to a hand-maintained parity file.
- **A gateway MCP tool.** Rejected: the docs are static files. `AGENTS.md` is the discovery path; a server adds a dependency, a process, and version skew. Next.js separates its bundled docs from an optional MCP connector; this repo takes the bundled-docs half.
- **Generate at publish time.** Rejected: the release job has no time for a docs build, and the package would need the docs app at publish. The committed tree plus `docs:check` keeps the release fast and the corpus honest.

## Consequences

- Source comments are no longer the documentation. Contributors update `api.json` and the Markdown under `apps/docs/content/docs`, then run `bun run docs:agent`. `bun run docs:agent:check` fails when the committed corpus is stale.
- The docs app is the source of truth for guides, examples, and prose. The package receives a generated copy.
- The API reference covers runtime exports. Type-only exports stay in `typings/index.d.ts`; `WebSocket` is a runtime shim with no typings and is listed under known gaps.
- The site and the agent docs share prose but not presentation. The site's MDX pages and the package's plain Markdown are generated from the same data.
- There is no MCP server or gateway package, so the library does not gain the MCP SDK as a dependency. The consumer adds the `AGENTS.md` block once and re-copies it after a major upgrade.
- Source-level hover in `src` loses the deleted prose. The public typings keep their existing blocks, and the generated reference is the replacement for contributors and agents.
