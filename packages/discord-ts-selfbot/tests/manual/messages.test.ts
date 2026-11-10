import { test, describe } from "bun:test";

import { EmbedBuilder } from "../../src/index";
import {
  channelId,
  skip,
  makeClient,
  login,
  makeStepRecorder,
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
      await step("send message", async () => {
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).send("manual: hello");
        if (typeof msg.id !== "string") {
          throw new TypeError("no id");
        }
        createdMessageId = msg.id;
      });
      await step("edit message", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).messages.fetch(createdMessageId);
        const edited = await msg.edit("manual: edited");
        if (edited.content !== "manual: edited") {
          throw new Error("content mismatch");
        }
      });
      await step(
        "send embed (best-effort, may be restricted for user accounts)",
        async () => {
          const ch = await client.channels.fetch(channelId!);
          const embed = new EmbedBuilder().setTitle("t").setDescription("d");
          try {
            const msg = await (ch as any).send({ embeds: [embed] });
            console.log("  embeds:", msg.embeds.length);
            await msg.delete().catch(() => {});
          } catch (error: any) {
            console.log("  (restricted/unsupported):", error?.message);
          }
        }
      );
      await step("reply", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).messages.fetch(createdMessageId);
        const reply = await msg.reply("manual: reply");
        if (typeof reply.id !== "string") {
          throw new TypeError("no reply id");
        }
        await reply.delete();
      });
      await step("react", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).messages.fetch(createdMessageId);
        await msg.react("👍");
      });
      await step("pin/unpin", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).messages.fetch(createdMessageId);
        await msg.pin();
        await msg.unpin();
      });
      await step("fetch message", async () => {
        if (!createdMessageId) {
          throw new Error("no id");
        }
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).messages.fetch(createdMessageId);
        if (msg.id !== createdMessageId) {
          throw new Error("id mismatch");
        }
      });
      await step("cleanup", async () => {
        if (createdMessageId) {
          const ch = await client.channels.fetch(channelId!);
          const msg = await (ch as any).messages.fetch(createdMessageId);
          await msg.delete();
        }
      });
    } finally {
      client.destroy();
    }
    summary("manual: messages");
    await writeArtifact("manual-messages-results");
  }, 180_000);
});
