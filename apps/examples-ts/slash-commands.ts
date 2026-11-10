/**
 * Slash commands example (TypeScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-ts slash-commands
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, Events } from 'discord-ts-selfbot';
import type {
  ApplicationCommandData,
  ApplicationCommandManager,
} from 'discord-ts-selfbot';

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
