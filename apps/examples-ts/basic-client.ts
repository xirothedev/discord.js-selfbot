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
  if (message.author.id === client.user?.id) return;

  if (message.content === '!ping') {
    await message.reply('Pong!');
  }
});

client.on(Events.Error, (error: Error) => {
  console.error('Client error:', error);
});

await client.login(token);
