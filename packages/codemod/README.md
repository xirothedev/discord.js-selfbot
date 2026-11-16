# @discord-selfbot/codemod

Upgrade a user project from `discord.js-selfbot-v13` to
[`@discord-selfbot/core`](https://www.npmjs.com/package/@discord-selfbot/core)
v14. Run it from the user project root:

```bash
npx @discord-selfbot/codemod@latest upgrade          # dry run: diff + marker report
npx @discord-selfbot/codemod@latest upgrade --write  # apply (needs a clean git tree)
npx @discord-selfbot/codemod@latest list             # show every rule
```

## What it does

- Rewrites `discord.js-selfbot-v13` specifiers, `require` calls, and the
  `package.json` dependency to `@discord-selfbot/core`.
- Renames exports that no longer exist (`MessageSelectMenu` →
  `StringSelectMenuBuilder`, …) and modernizes deprecated builder aliases.
- Converts raw event strings to `Events.*` constants and `setStyle('PRIMARY')`
  to `ButtonStyle.Primary` (adding the pinned `discord-api-types` dependency).
- Renames changed option keys (`fetchReply` → `withResponse`) and methods
  (`fetchPremiumStickerPacks` → `fetchStickerPacks`).
- Flags companion deps (`@discordjs/opus`, `erlpack`, `zlib-sync`, sodium
  packages) in the report. It never removes them.

## What it never does

- It never silently changes runtime behavior. Anything that needs judgment gets
  a `TODO(codemod:<rule-id>): <message> [<docs anchor>]` marker instead, and
  you resolve each marker by following the linked docs section.
- It refuses `--write` outside a clean git tree unless you pass `--force`.
- Dry run is the default; `--json` emits a machine-readable report and
  `--exit-code` turns "would change" into a CI failure.

After an upgrade run: `bun install`, resolve every `TODO(codemod:` marker, and
run the project's checks. See the
[migration guide](https://github.com/The-Resonance-Team/discord.js-selfbot)
for what each marker means.

## Options

| Option                | Meaning                                                     |
| --------------------- | ----------------------------------------------------------- |
| `--write`             | apply changes (default: dry run with diff)                  |
| `--json`              | machine-readable report on stdout                           |
| `--extensions=<list>` | comma-separated extensions (default `js,cjs,mjs,ts,tsx,mts,jsx`) |
| `--ignore-pattern`    | repeatable gitignore-style pattern                          |
| `--ignore-config`     | repeatable file of patterns                                 |
| `--rule=<id>`         | repeatable: run only these rules (markers always run)       |
| `--no-modernize`      | skip modernization-tier rewrites                            |
| `--esm`               | convert `require()` to `import` and set `"type": "module"`  |
| `--force`             | write even without a clean git tree                         |
| `--no-fail-on-error`  | do not exit 1 on per-file errors                            |
| `--exit-code`         | exit 1 when files would change (CI check)                   |

Exit codes: `0` success, `1` errors (or `--exit-code` diff), `2` bad usage or
a refused git gate.
