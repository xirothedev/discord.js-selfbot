# Presence

This example creates a `CustomStatus` and sets it on the client user after the ready event.

## Run it

```sh
DISCORD_TOKEN=your-token bun run --cwd apps/examples-ts presence
```


  ### TypeScript

```ts check
/**
 * Presence example (TypeScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-ts presence
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, CustomStatus, Events } from "discord-ts-selfbot";

const client = new Client();

client.once(Events.CLIENT_READY, (readyClient: Client<true>) => {
  const customStatus = new CustomStatus(readyClient)
    .setEmoji("🎮")
    .setState("discord-ts-selfbot v14 example");

  readyClient.user.setPresence({
    activities: [customStatus],
    afk: false,
    status: "online",
  });

  console.log(`Presence set for ${readyClient.user.tag}.`);
});

client.on(Events.Error, (error: Error) => {
  console.error("Client error:", error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("Set DISCORD_TOKEN before running this example.");
}

await client.login(token);
```
  
  ### JavaScript

```js
/**
 * Presence example (JavaScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-js presence
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, CustomStatus, Events } from "discord-ts-selfbot";

const client = new Client();

client.once(Events.CLIENT_READY, (readyClient) => {
  const customStatus = new CustomStatus(readyClient)
    .setEmoji("🎮")
    .setState("discord-ts-selfbot v14 example");

  readyClient.user.setPresence({
    activities: [customStatus],
    afk: false,
    status: "online",
  });

  console.log(`Presence set for ${readyClient.user.tag}.`);
});

client.on(Events.Error, (error) => {
  console.error("Client error:", error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("Set DISCORD_TOKEN before running this example.");
}

await client.login(token);
```
  


## What it shows

- `CustomStatus` with an emoji and state text.
- `client.user.setPresence` with a status and activity list.
- `Events.CLIENT_READY` as the safe point to touch the user cache.

## Next

- [Account and profile](../guides/account-profile.md)
- [Basic client](basic-client.md)
