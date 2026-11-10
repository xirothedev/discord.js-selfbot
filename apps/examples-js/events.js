/**
 * Events and partials example (JavaScript)
 *
 * Run from the repo root:
 *   bun run --cwd apps/examples-js events
 *
 * Set DISCORD_TOKEN in the environment before you start the example.
 */

import { Client, Events, Partials, Status } from "discord-ts-selfbot";

const client = new Client({
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

const announceReady = (readyClient) => {
  const gatewayStatus = Status[readyClient.ws.status] ?? "unknown";
  console.log(
    `${readyClient.user.tag} is ready (gateway status: ${gatewayStatus}).`
  );
};

// discord.js v14 names this event `clientReady`. The current gateway also
// emits the legacy `ready` name, so register both handlers.
client.once(Events.ClientReady, announceReady);
client.once(Events.CLIENT_READY, announceReady);

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id === client.user?.id) {
    return;
  }

  if (message.content === "!hello") {
    await message.reply("Hello from the events example!");
  }
});

client.on(Events.Error, (error) => {
  console.error("Client error:", error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("Set DISCORD_TOKEN before running this example.");
}

await client.login(token);
