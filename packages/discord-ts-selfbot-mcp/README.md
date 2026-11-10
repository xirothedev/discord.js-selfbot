# discord-ts-selfbot-mcp

MCP gateway to the version-matched agent docs that ship inside `discord-ts-selfbot`.

The server has one tool, `selfbot_docs`. The tool does **not** fetch documentation. It resolves the installed `discord-ts-selfbot`, checks its `docs/llms.txt`, and returns the absolute docs path with reading instructions.

## Install

```sh
npx add-mcp discord-ts-selfbot-mcp@latest
```

Or add it to your MCP client manually:

```json
{
  "mcpServers": {
    "discord-ts-selfbot": {
      "command": "npx",
      "args": ["-y", "discord-ts-selfbot-mcp@latest"]
    }
  }
}
```

## Tool

### `selfbot_docs`

Inputs:

- `topic` (optional): what you are looking for, such as `send a message` or `record a call`.
- `project_path` (optional): the project that uses `discord-ts-selfbot`. Defaults to the current directory.

Output is JSON:

```json
{
  "status": "use_bundled_docs",
  "version": "14.0.0",
  "versionSource": "installed",
  "docsPath": "/project/node_modules/discord-ts-selfbot/docs",
  "indexPath": "/project/node_modules/discord-ts-selfbot/docs/llms.txt",
  "docsAvailable": true,
  "instructions": [
    "Read /project/node_modules/discord-ts-selfbot/docs/llms.txt first.",
    "Then open only the page for the task."
  ]
}
```

Status values:

- `use_bundled_docs`: the installed package has the docs. Read `indexPath` first.
- `install_required`: the package is not installed. Install dependencies and call the tool again.
- `missing_docs`: the installed package has no bundled docs. Reinstall or upgrade.

The gateway resolves hoisted workspace installs through `createRequire`, so monorepos work without extra configuration.

## Why a gateway

The docs are plain Markdown files, not an MCP server. The gateway only solves discovery and version matching. Agents then read the files directly.
