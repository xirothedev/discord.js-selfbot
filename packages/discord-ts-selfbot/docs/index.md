# Introduction

> **Selfbots carry account risk**
>
> Using a user account with the Discord API is against Discord's Terms of Service. The library is provided
> for educational use. Do not run it on an account you cannot afford to lose.

This documentation covers `discord-ts-selfbot@14.0.0`, a fork of `discord.js-selfbot-v13` re-platformed on Bun with a TypeScript source of truth and a discord.js v14-compatible public surface.

## Start here

- [Installation](getting-started/installation.md) — Install the package with Bun and create your first client.
- [Token safety](getting-started/token-safety.md) — How to store a user token and what can go wrong.
- [API reference](reference/index.md) — Generated reference for every public class, type, and enum.
- [Examples](examples/basic-client.md) — Runnable TypeScript and JavaScript examples.

## What this fork adds

- **discord.js v14 surface:** `Events`, `Partials`, `Status`, builders, interaction classes, collectors, and the v14 client methods.
- **Selfbot features:** presence, account edits, friend invites, message search, guild settings, billing, voice, calls, and recording.
- **Bun runtime:** `bun install`, `bun test`, `bun check`, and a Bun-native build. Node.js is not supported.
- **Test seam:** a fake Discord HTTP and WebSocket server in `packages/test-harness`, with no real token or network.
- **TypeScript source:** every module under `src/` is TypeScript, and Bun runs it directly.

## Guides

- [Client and events](guides/client-events.md) — Client options, gateway events, partials, and status.
- [Messages](guides/messages.md) — Send, edit, react, search, and manage message state.
- [Interactions](guides/interactions.md) — Slash commands, components, modals, and collectors.
- [Voice](guides/voice.md) — Join a channel, play media, and disconnect cleanly.
- [Calls](guides/calls.md) — DM and group calls, ringing, and message requests.
- [Recording](guides/recording.md) — Record audio and video through ffmpeg.

## Project

- [v14 parity report](https://xirothedev.github.io/discord.js-selfbot/docs/project/v14-parity)
- [Changelog](https://xirothedev.github.io/discord.js-selfbot/docs/project/changelog)
- [Contributing](https://xirothedev.github.io/discord.js-selfbot/docs/project/contributing)
- [Safety](https://xirothedev.github.io/discord.js-selfbot/docs/project/safety)
- [License](https://xirothedev.github.io/discord.js-selfbot/docs/project/license)
