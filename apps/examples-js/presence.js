/**
 * Presence example (JavaScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-js presence
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, CustomStatus, Events } from 'discord-ts-selfbot';

const client = new Client();

client.once(Events.CLIENT_READY, (readyClient) => {
  const customStatus = new CustomStatus(readyClient).setEmoji('🎮').setState('discord-ts-selfbot v14 example');

  readyClient.user.setPresence({
    status: 'online',
    afk: false,
    activities: [customStatus],
  });

  console.log(`Presence set for ${readyClient.user.tag}.`);
});

client.on(Events.Error, (error) => {
  console.error('Client error:', error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('Set DISCORD_TOKEN before running this example.');
}

await client.login(token);
