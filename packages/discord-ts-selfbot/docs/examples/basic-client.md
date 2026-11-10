# Basic client

This example creates a client, listens for `CLIENT_READY` and `MessageCreate`, and replies to `!ping`.

## Run it

```sh
DISCORD_TOKEN=your-token bun run --cwd apps/examples-ts basic
```


  ### TypeScript

```ts check
/**
 * Basic client example (TypeScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-ts basic
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, Events } from 'discord-ts-selfbot';
import type { Message } from 'discord-ts-selfbot';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('Set DISCORD_TOKEN before running this example.');
}

const client = new Client();

client.once(Events.CLIENT_READY, (readyClient: Client<true>) => {
  console.log(`Logged in as ${readyClient.user.tag}.`);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author?.id === client.user?.id) return;

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

client.on(Events.Error, (error: Error) => {
  console.error('Client error:', error);
});

await client.login(token);
```
  
  ### JavaScript

```js
/**
 * Basic client example (JavaScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-js basic
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, Events } from 'discord-ts-selfbot';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('Set DISCORD_TOKEN before running this example.');
}

const client = new Client();

client.once(Events.CLIENT_READY, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}.`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author.id === client.user?.id) return;

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

client.on(Events.Error, error => {
  console.error('Client error:', error);
});

await client.login(token);
```
  


## What it shows

- Creating a `Client` with no options.
- Waiting for `Events.CLIENT_READY`.
- Filtering out the account's own messages.
- Replying in the same channel.
- Logging client errors.

## Next

- [Events and partials](events.md)
- [First client](../getting-started/first-client.md)
