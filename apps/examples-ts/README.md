# TypeScript examples

Runnable TypeScript examples for `discord-ts-selfbot`, executed with Bun.

## Setup

```sh
bun install
export DISCORD_TOKEN="your-token"
```

Run every command from the repository root.

## Examples

| Example                                    | Run command                                     | Shows                                                      |
| ------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| [`basic-client.ts`](./basic-client.ts)     | `bun run --cwd apps/examples-ts basic`          | Client login, ready event, `messageCreate` handler         |
| [`events.ts`](./events.ts)                 | `bun run --cwd apps/examples-ts events`         | `Events` enum, `Partials`, `clientReady`, gateway `Status` |
| [`presence.ts`](./presence.ts)             | `bun run --cwd apps/examples-ts presence`       | `setPresence` with a `CustomStatus` activity               |
| [`slash-commands.ts`](./slash-commands.ts) | `bun run --cwd apps/examples-ts slash-commands` | `ApplicationCommandManager#set`                            |

## Type check

```sh
bun run --cwd apps/examples-ts check
```

The check runs `bun check` against `tsconfig.json` (`strict`, `module: ESNext`,
`moduleResolution: bundler`, `noEmit`, `types: ["bun"]`).

`types/discord-ts-selfbot.d.ts` is a temporary type bridge for runtime exports
that the package typings do not declare yet. Remove it when the package
typings include `Events`, `Partials`, `Status` and `Client#application`.
