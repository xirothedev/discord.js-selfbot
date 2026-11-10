/**
 * Basic client example (JavaScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-js basic
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, Events } from "discord-ts-selfbot";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("Set DISCORD_TOKEN before running this example.");
}

const client = new Client();

client.once(Events.CLIENT_READY, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}.`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id === client.user?.id) {
    return;
  }

  if (message.content === "!ping") {
    await message.reply("Pong!");
  }
});

client.on(Events.Error, (error) => {
  console.error("Client error:", error);
});

await client.login(token);
