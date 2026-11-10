import { test, describe } from "bun:test";

import { EmbedBuilder } from "../../src/index";
import {
  channelId,
  errorMessage,
  fetchGuildTextChannel,
  login,
  makeClient,
  makeStepRecorder,
  skip,
} from "./_helpers";

describe.skipIf(skip)("manual: messages", () => {
  test("message operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let createdMessageId: string | null = null;
    try {
      await login(client);
      if (!channelId) {
        console.log("[SKIP] no TEST_CHANNEL_ID");
        return;
      }
      const targetChannelId = channelId;
      await step("send message", async () => {
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.send("manual: hello");
        if (typeof message.id !== "string") {
          throw new TypeError("no id");
        }
        createdMessageId = message.id;
      });
      await step("edit message", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.messages.fetch(createdMessageId);
        const edited = await message.edit("manual: edited");
        if (edited.content !== "manual: edited") {
          throw new Error("content mismatch");
        }
      });
      await step(
        "send embed (best-effort, may be restricted for user accounts)",
        async () => {
          const channel = await fetchGuildTextChannel(client, targetChannelId);
          const embed = new EmbedBuilder().setTitle("t").setDescription("d");
          try {
            const message = await channel.send({ embeds: [embed] });
            console.log("  embeds:", message.embeds.length);
            await message.delete().catch(() => {});
          } catch (error) {
            console.log("  (restricted/unsupported):", errorMessage(error));
          }
        }
      );
      await step("reply", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.messages.fetch(createdMessageId);
        const reply = await message.reply("manual: reply");
        if (typeof reply.id !== "string") {
          throw new TypeError("no reply id");
        }
        await reply.delete();
      });
      await step("react", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.messages.fetch(createdMessageId);
        await message.react("👍");
      });
      await step("pin/unpin", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.messages.fetch(createdMessageId);
        await message.pin();
        await message.unpin();
      });
      await step("fetch message", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const channel = await fetchGuildTextChannel(client, targetChannelId);
        const message = await channel.messages.fetch(createdMessageId);
        if (message.id !== createdMessageId) {
          throw new Error("id mismatch");
        }
      });
      await step("cleanup", async () => {
        if (createdMessageId) {
          const channel = await fetchGuildTextChannel(client, targetChannelId);
          const message = await channel.messages.fetch(createdMessageId);
          await message.delete();
        }
      });
    } finally {
      client.destroy();
    }
    summary("manual: messages");
    await writeArtifact("manual-messages-results");
  }, 180_000);
});
