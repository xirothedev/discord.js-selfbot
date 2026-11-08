/**
 * Events and partials example (TypeScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-ts events
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, Events, Partials, Status } from 'discord-ts-selfbot';
import type { Message, PartialTypes } from 'discord-ts-selfbot';

// The runtime Partials enum is numeric, while ClientOptions.partials uses the
// v14 string union. Cast until the package typings and enum agree.
const partials = [Partials.Channel, Partials.Message, Partials.Reaction] as unknown as PartialTypes[];

const client = new Client({ partials });

const announceReady = (readyClient: Client<true>) => {
  const gatewayStatus = Status[readyClient.ws.status] ?? 'unknown';
  console.log(`${readyClient.user.tag} is ready (gateway status: ${gatewayStatus}).`);
};

// discord.js v14 names this event `clientReady`. The current gateway also
// emits the legacy `ready` name, so register both handlers.
client.once(Events.ClientReady, announceReady);
client.once(Events.CLIENT_READY, announceReady);

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.id === client.user?.id) return;

  if (message.content === '!hello') {
    await message.reply('Hello from the events example!');
  }
});

client.on(Events.Error, (error: Error) => {
  console.error('Client error:', error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('Set DISCORD_TOKEN before running this example.');
}

await client.login(token);
