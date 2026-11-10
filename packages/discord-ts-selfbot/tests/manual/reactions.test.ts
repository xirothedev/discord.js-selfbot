import { test, describe } from "bun:test";

import {
  channelId,
  skip,
  makeClient,
  login,
  makeStepRecorder,
} from "./_helpers";

describe.skipIf(skip)("manual: reactions", () => {
  test("reaction operations", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    let messageId: string | null = null;
    try {
      await login(client);
      if (!channelId) {
        console.log("[SKIP] no TEST_CHANNEL_ID");
        return;
      }
      await step("send + react", async () => {
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).send("manual: react target");
        messageId = msg.id;
        await msg.react("👍");
      });
      await step("fetch reaction users", async () => {
        if (!messageId) {
          throw new Error("no msg");
        }
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).messages.fetch(messageId);
        const reaction = msg.reactions.cache.get("👍");
        if (!reaction) {
          throw new Error("reaction missing");
        }
        await reaction.users.fetch();
      });
      await step("remove reaction", async () => {
        if (!messageId) {
          throw new Error("no msg");
        }
        const ch = await client.channels.fetch(channelId!);
        const msg = await (ch as any).messages.fetch(messageId);
        const reaction = msg.reactions.cache.get("👍");
        if (reaction) {
          await reaction.users.remove(client.user!.id);
        }
      });
      await step("cleanup", async () => {
        if (messageId) {
          const ch = await client.channels.fetch(channelId!);
          const msg = await (ch as any).messages.fetch(messageId);
          await msg.delete();
        }
      });
    } finally {
      client.destroy();
    }
    summary("manual: reactions");
    await writeArtifact("manual-reactions-results");
  }, 180_000);
});
