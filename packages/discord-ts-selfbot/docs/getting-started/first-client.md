# First client

## Minimal client


  ### TypeScript

```ts
import { Client, Events } from 'discord-ts-selfbot';
import type { Message } from 'discord-ts-selfbot';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('Set DISCORD_TOKEN.');

const client = new Client();

client.once(Events.CLIENT_READY, (readyClient: Client<true>) => {
  console.log(`Logged in as ${readyClient.user.tag}.`);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.id === client.user?.id) return;

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
import { Client, Events } from 'discord-ts-selfbot';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('Set DISCORD_TOKEN.');

const client = new Client();

client.once(Events.CLIENT_READY, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}.`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id === client.user?.id) return;

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

client.on(Events.Error, (error) => {
  console.error('Client error:', error);
});

await client.login(token);
```
  


## What happens on login

1. `Client#login` validates the token.
2. The gateway WebSocket opens and identifies the session.
3. Discord sends `READY`.
4. The client caches the user, guilds, channels, and sessions.
5. `Events.CLIENT_READY` fires once.

`Events.ClientReady` is the v14 alias for the same event. Register one handler, not both, unless you need to support a runtime that only emits one name.

## Handle errors

Always listen for `Events.Error`. A rejected login, a closed gateway, or a failed REST request should not become an unhandled rejection.

```ts
client.on(Events.Error, (error) => {
  console.error(error);
});

try {
  await client.login(token);
} catch (error) {
  console.error('Login failed:', error);
}
```

## Shut down

`Client#destroy` closes the gateway and clears timers. Use it for Ctrl+C and process signals:

```ts
process.once('SIGINT', () => {
  client.destroy();
  process.exit(0);
});
```

## Next

- [Client and events](../guides/client-events.md)
- [Messages](../guides/messages.md)
- [API: Client](../reference/client/client.md)
