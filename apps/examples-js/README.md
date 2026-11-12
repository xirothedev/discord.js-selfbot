# JavaScript examples

Runnable JavaScript examples for `@discord-selfbot/core`, executed with Bun.

## Setup

```sh
bun install
export DISCORD_TOKEN="your-token"
```

Run every command from the repository root.

## Examples

| Example                                    | Run command                                     | Shows                                                      |
| ------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| [`basic-client.js`](./basic-client.js)     | `bun run --cwd apps/examples-js basic`          | Client login, ready event, `messageCreate` handler         |
| [`events.js`](./events.js)                 | `bun run --cwd apps/examples-js events`         | `Events` enum, `Partials`, `clientReady`, gateway `Status` |
| [`presence.js`](./presence.js)             | `bun run --cwd apps/examples-js presence`       | `setPresence` with a `CustomStatus` activity               |
| [`slash-commands.js`](./slash-commands.js) | `bun run --cwd apps/examples-js slash-commands` | `ApplicationCommandManager#set`                            |

The TypeScript versions of these examples live in `apps/examples-ts`.
