# Installation

## Requirements

- **Bun 1.4.4 or newer.** The package engines field rejects older Bun versions.
- **A Discord user token.** This is a selfbot, not a bot application token. Read [Token safety](token-safety.md) before you start.
- **Optional:** TypeScript 5.5 or newer for typed projects.

> **Node.js is not supported**
>
> The package is Bun-only. It uses Bun for installation, tests, type checking, formatting, and the build. Use Bun
> for the application that imports it as well.

## Install

```sh
bun add @discord-selfbot/core
```

The package name is `@discord-selfbot/core`, not the old `discord.js-selfbot-v13`. The published major is `14`, which tracks the `discord.js@14.28.1` API baseline.

## Import

The package is ESM-first. Import the classes and enums by name:

```ts
import { Client, Events } from '@discord-selfbot/core';
```

The source is TypeScript. It uses CommonJS `require` calls internally for compatibility with the original fork, but new code should use `import`.

## Verify the install

Create a small file and run it with Bun:

```ts
import { Client, version } from '@discord-selfbot/core';

console.log(`@discord-selfbot/core ${version}`);
console.log(typeof Client);
```

```sh
bun run check.ts
```

## Project layout

If you are working inside this repository:

```sh
bun install
bun run check
bun run test
bun run docs
```

The docs site is a static Next.js app in `apps/docs`. The library lives in `packages/discord-ts-selfbot`.

## Next

- [Token safety](token-safety.md) — Store the token without leaking it.
- [First client](first-client.md) — Connect, listen for events, and shut down.
- [Migration from v13](migration-v13.md) — Rename the package and update the API calls.
