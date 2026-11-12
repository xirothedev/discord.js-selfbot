# @discord-selfbot/core

> A Bun-first, TypeScript selfbot library with a discord.js v14-compatible API.

[![npm version](https://img.shields.io/npm/v/discord-ts-selfbot.svg)](https://www.npmjs.com/package/discord-ts-selfbot)
[![CI](https://github.com/xirothedev/discord.js-selfbot/actions/workflows/lint.yml/badge.svg)](https://github.com/xirothedev/discord.js-selfbot/actions/workflows/lint.yml)
[![docs](https://img.shields.io/badge/docs-xirothedev.github.io-5865F2)](https://xirothedev.github.io/discord.js-selfbot/)

> [!WARNING]
> **Selfbots carry account risk.** Using a user account with the Discord API is against Discord's Terms of Service.
> The library is provided for educational use. Do not run it on an account you cannot afford to lose.

## About

`@discord-selfbot/core@14` is a fork of `discord.js-selfbot-v13`, re-platformed as a Bun + Turborepo monorepo. It tracks the `discord.js@14.28.1` public surface and keeps the selfbot-only features: presence, account edits, friend invites, search, guild settings, billing, voice, calls, and recording.

- **Runtime:** Bun 1.4.4 or newer. Node.js is not supported.
- **Source:** TypeScript only. Bun runs the `.ts` source directly.
- **Tests:** fake Discord HTTP and WebSocket server, no real token or network.
- **Docs:** Fumadocs static site at <https://xirothedev.github.io/discord.js-selfbot/>.
- **Coding agents:** version-matched Markdown in the package at `docs/llms.txt`; setup is at <https://xirothedev.github.io/discord.js-selfbot/docs/getting-started/agents>.

## Install

```sh
bun add @discord-selfbot/core
```

## Quickstart

```ts
import { Client, Events } from '@discord-selfbot/core';

const client = new Client();

client.once(Events.CLIENT_READY, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}.`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author?.id === client.user?.id) return;

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

await client.login(process.env.DISCORD_TOKEN);
```

Read [Token safety](https://xirothedev.github.io/discord.js-selfbot/docs/getting-started/token-safety) before you run a client with a real token.

## Features

- discord.js v14 surface: `Events`, `Partials`, `Status`, builders, interaction classes, collectors, and client methods.
- Selfbot features: message extras, account profile edits, guild settings, search, billing, Nitro/OAuth, sharding, friend invites, voice, calls, and recording.
- Bun-native toolchain: `bun install`, `bun test`, `bun check`, `bun lint`, `bun fmt`, `bun build`.
- Fake Discord test harness in `packages/test-harness`.
- Historical v14 parity audit in the docs.

## Repository layout

```text
apps/
├── docs/                # Fumadocs docs site
├── examples-js/         # JavaScript examples
└── examples-ts/         # TypeScript examples
packages/
├── discord-ts-selfbot/  # published library
└── test-harness/        # fake Discord HTTP + WebSocket server
tools/
└── parity/              # differential harness vs discord.js v14
docs/
├── adr/                 # architecture decisions
└── agents/              # issue tracker and triage conventions
```

## Development

```sh
bun install
bun run check
bun run lint
bun run fmt:check
bun run test
bun run lint:boundaries
bun run docs
```

Run the docs site locally:

```sh
bun run docs:dev
```

## Documentation

- [Getting started](https://xirothedev.github.io/discord.js-selfbot/docs/getting-started/installation)
- [Guides](https://xirothedev.github.io/discord.js-selfbot/docs/guides/client-events)
- [API reference](https://xirothedev.github.io/discord.js-selfbot/docs/api)
- [v14 parity](https://xirothedev.github.io/discord.js-selfbot/docs/project/v14-parity)
- [Safety](https://xirothedev.github.io/discord.js-selfbot/docs/project/safety)

## Contributing

Read `AGENTS.md`, `docs/agents/issue-tracker.md`, and `DESIGN.md` before you open a pull request. Keep each pull request scoped to one slice and add tests for behavior changes.

## License

GNU General Public License v3.0. See [LICENSE](LICENSE).

## Credits

This fork is based on `discord.js-selfbot-v13` by the original authors, which is based on `discord.js`. Keep the upstream notices when you redistribute the code.
