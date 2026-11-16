# Installation

## Requirements

- **Bun 1.4.4 or newer (recommended).** The package engines field rejects older Bun versions. Under Bun the package resolves to the TypeScript source directly.
- **Or Node.js 22 or newer.** `require('@discord-selfbot/core')` and `import` both work from the published `dist` builds. The library never needs a bundler.
- **A Discord user token.** This is a selfbot, not a bot application token. Read [Token safety](token-safety.md) before you start.
- **Optional:** TypeScript 5.5 or newer for typed projects.

> **Bun first, Node supported**
>
> This repository is developed and tested on Bun: `bun install`, `bun test`, `bun check`, and a Bun-native build.
> The published package also ships Node-ready ESM and CommonJS entries and is smoke-tested on plain Node 22 in CI
> (see [Node support](https://xirothedev.github.io/discord.js-selfbot/docs/project/node-support)). Use Bun for new projects when you can.

## Install

```sh
bun add @discord-selfbot/core
```

On Node, `npm install @discord-selfbot/core` or `pnpm add @discord-selfbot/core` works the same way.

The package name is `@discord-selfbot/core`, not the old `discord.js-selfbot-v13`. The published major is `14`, which tracks the `discord.js@14.28.1` API baseline.

## Import

The package is ESM-first. Import the classes and enums by name:

```ts
import { Client, Events } from '@discord-selfbot/core';
```

On Node CommonJS, require works too:

```js
const { Client, Events } = require('@discord-selfbot/core');
```

Under Bun the source is TypeScript and it uses CommonJS `require` calls internally for compatibility with the original fork; on Node the built bundles carry the same behavior. New code should use `import`.

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
