# Slash commands

This example registers two global slash commands after the client is ready.

## Run it

```sh
DISCORD_TOKEN=your-token bun run --cwd apps/examples-ts slash-commands
```


  ### TypeScript

```ts check
/**
 * Slash commands example (TypeScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-ts slash-commands
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, Events } from '@discord-selfbot/core';
import type {
  ApplicationCommandData,
  ApplicationCommandManager,
} from '@discord-selfbot/core';

const commands: ApplicationCommandData[] = [
  {
    description: 'Replies with Pong!',
    name: 'ping',
  },
  {
    description: 'Says hello to the selected user',
    name: 'hello',
  },
];

const client = new Client();

client.once(Events.CLIENT_READY, async (readyClient: Client<true>) => {
  const manager: ApplicationCommandManager = readyClient.application.commands;
  const registered = await manager.set(commands);

  console.log(`Registered ${registered.size} application commands.`);
});

client.on(Events.Error, (error: Error) => {
  console.error('Client error:', error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('Set DISCORD_TOKEN before running this example.');
}

await client.login(token);
```
  
  ### JavaScript

```js
/**
 * Slash commands example (JavaScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-js slash-commands
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, Events } from '@discord-selfbot/core';

const commands = [
  {
    description: 'Replies with Pong!',
    name: 'ping',
  },
  {
    description: 'Says hello to the selected user',
    name: 'hello',
  },
];

const client = new Client();

client.once(Events.CLIENT_READY, async (readyClient) => {
  /** @type {import('@discord-selfbot/core').ApplicationCommandManager} */
  const manager = readyClient.application.commands;
  const registered = await manager.set(commands);

  console.log(`Registered ${registered.size} application commands.`);
});

client.on(Events.Error, (error) => {
  console.error('Client error:', error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('Set DISCORD_TOKEN before running this example.');
}

await client.login(token);
```
  


## What it shows

- `client.application.commands.set()`.
- Typed `ApplicationCommandData` objects.
- The ready event as the place to register commands.
- A JS example that uses a JSDoc type annotation instead of TypeScript.

## Next

- [Interactions](../guides/interactions.md)
- [API: ApplicationCommandManager](../reference/managers/application-command-manager.md)
